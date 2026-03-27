import httpx
from models.restaurant import Restaurant
import re

JET_API_BASE = "https://uk.api.just-eat.io/discovery/uk/restaurants/enriched/bypostcode"

# UK Gov regex for postcodes, sourced from https://github.com/stemount/gov-uk-official-postcode-regex-helper
UK_POSTCODE_REGEX = re.compile(
    r'^([Gg][Ii][Rr] 0[Aa]{2})|'
    r'((([A-Za-z][0-9]{1,2})|'
    r'(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|'
    r'(([A-Za-z][0-9][A-Za-z])|'
    r'([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))'
    r' [0-9][A-Za-z]{2})$'
)
# Define the tags that are showing up as a cuisine when they are clearly not, for exclusion.
NON_CUISINE_TAGS = {"Collect stamps", "Deals", "Cheeky Tuesday", "Freebies"}

def parse_restaurant(raw: dict) -> Restaurant:
    name = raw.get("name", "Unknown")
    cuisines = [c["name"] for c in raw.get("cuisines", []) if "name" in c and c["name"] not in NON_CUISINE_TAGS]
    rating_data = raw.get("rating", {})
    rating = rating_data.get("starRating") if rating_data else None
    address_data = raw.get("address", {})
    address_parts = [
        address_data.get("firstLine", ""),
        address_data.get("city", ""),
        address_data.get("postalCode", ""),
    ]
    address = ", ".join(part for part in address_parts if part)
    coords = address_data.get("location", {}).get("coordinates")
    latitude = coords[1] if coords and len(coords) == 2 else None
    longitude = coords[0] if coords and len(coords) == 2 else None
    return Restaurant(
        name=name,
        cuisines=cuisines,
        rating=rating,
        address=address,
        latitude=latitude,
        longitude=longitude,
    )


async def get_restaurants_by_postcode(postcode: str) -> list[Restaurant]:
    # Normalise to uppercase with a space before validating
    postcode = postcode.strip().upper()
    
    # Re-insert space if missing to match with the Gov.uk regex
    if ' ' not in postcode and len(postcode) > 3:
        postcode = postcode[:-3] + ' ' + postcode[-3:]

    if not UK_POSTCODE_REGEX.match(postcode):
        raise ValueError(f"'{postcode}' is not a valid UK postcode")

    clean_postcode = postcode.replace(" ", "").upper()
    url = f"{JET_API_BASE}/{clean_postcode}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10.0)
    if response.status_code == 404:
        raise ValueError(f"No restaurants found for postcode: {postcode}")
    response.raise_for_status()
    data = response.json()
    raw_restaurants = data.get("restaurants", [])
    if not raw_restaurants:
        raise ValueError(f"No restaurants found for postcode: {postcode}")
    return [parse_restaurant(r) for r in raw_restaurants[:10]]