import httpx
from models.restaurant import Restaurant

JET_API_BASE = "https://uk.api.just-eat.io/discovery/uk/restaurants/enriched/bypostcode"



def parse_restaurant(raw: dict) -> Restaurant:
    name = raw.get("name", "Unknown")
    cuisines = [c["name"] for c in raw.get("cuisines", []) if "name" in c]
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