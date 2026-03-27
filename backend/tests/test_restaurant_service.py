import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from services.restaurant_service import parse_restaurant, get_restaurants_by_postcode

# Test restaurant
TEST_RESTAURANT = {
    "name": "Papa Johns - Ware",
    "cuisines": [{"name": "Pizza"}, {"name": "American"}],
    "rating": {"starRating": 3.0},
    "address": {
        "firstLine": "13 Baldock St",
        "city": "Ware",
        "postalCode": "SG12 9DH",
        "location": {"coordinates": [-0.034839, 51.81243]},
    },
}

# -- Testing parse_restaurant --

# Check that the restaurant fields are being parsed correctly
def test_parse_restaurant_full():
    r = parse_restaurant(TEST_RESTAURANT)
    assert r.name == "Papa Johns - Ware"
    assert r.cuisines == ["Pizza", "American"]
    assert r.rating == 3.0
    assert r.address == "13 Baldock St, Ware, SG12 9DH"
    assert r.latitude == 51.81243
    assert r.longitude == -0.034839

# Check that missing ratings are handled correctly
def test_parse_restaurant_missing_rating():
    raw = {**TEST_RESTAURANT, "rating": None}
    assert parse_restaurant(raw).rating is None

# Check that missing ratings are handled correctly
def test_parse_restaurant_missing_star_rating():
    raw = {**TEST_RESTAURANT, "rating": {}}
    assert parse_restaurant(raw).rating is None

# Check that missing coordinates are handled correctly
def test_parse_restaurant_missing_coordinates():
    raw = {
        **TEST_RESTAURANT,
        "address": {**TEST_RESTAURANT["address"], "location": {}},
    }
    r = parse_restaurant(raw)
    assert r.latitude is None
    assert r.longitude is None

# Check that non cuisine tags are being left out correctly
def test_parse_restaurant_filters_non_cuisine_tags():
    raw = {
        **TEST_RESTAURANT,
        "cuisines": [
            {"name": "Pizza"},
            {"name": "Deals"},
            {"name": "Collect stamps"},
            {"name": "Cheeky Tuesday"},
        ],
    }
    assert parse_restaurant(raw).cuisines == ["Pizza"]

# Check that missing address parts are handled correctly.
def test_parse_restaurant_missing_address_parts():
    raw = {
        **TEST_RESTAURANT,
        "address": {
            "firstLine": "",
            "city": "London",
            "postalCode": "",
            "location": {},
        },
    }
    assert parse_restaurant(raw).address == "London"


def test_parse_restaurant_missing_name():
    raw = {**TEST_RESTAURANT}
    del raw["name"]
    assert parse_restaurant(raw).name == "Unknown"



# -- Testing get_restaurants_by_postcode --


SAMPLE_API_RESPONSE = {
    "restaurants": [TEST_RESTAURANT] * 3
}


def _make_mock_response(status_code=200, json_data=None):
    mock_resp = MagicMock()
    mock_resp.status_code = status_code
    mock_resp.json.return_value = json_data or SAMPLE_API_RESPONSE
    mock_resp.raise_for_status = MagicMock()
    return mock_resp

# Check for the correct response for a valid postcode without a space
@pytest.mark.asyncio
async def test_valid_postcode_no_space():
    mock_resp = _make_mock_response()
    with patch("services.restaurant_service.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_resp
        mock_client_cls.return_value.__aenter__.return_value = mock_client

        restaurants = await get_restaurants_by_postcode("SG137GH")

    assert len(restaurants) == 3
    assert restaurants[0].name == "Papa Johns - Ware"


# Check for the correct response for a valid postcode with a space
@pytest.mark.asyncio
async def test_valid_postcode_with_space():
    mock_resp = _make_mock_response()
    with patch("services.restaurant_service.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_resp
        mock_client_cls.return_value.__aenter__.return_value = mock_client

        restaurants = await get_restaurants_by_postcode("SG13 7GH")

    assert len(restaurants) == 3

# Check that invalid postcodes are being handled correctly
@pytest.mark.asyncio
async def test_invalid_postcode_raises():
    with pytest.raises(ValueError, match="not a valid UK postcode"):
        await get_restaurants_by_postcode("NOTAPOSTCODE")

# Check that jet API raising a 404 is being handled correctly
@pytest.mark.asyncio
async def test_jet_api_404_raises():
    mock_resp = _make_mock_response(status_code=404)
    with patch("services.restaurant_service.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_resp
        mock_client_cls.return_value.__aenter__.return_value = mock_client

        with pytest.raises(ValueError, match="No restaurants found"):
            await get_restaurants_by_postcode("SG13 7GH")

# Check that no restaurants being returned is handled correctly
@pytest.mark.asyncio
async def test_empty_restaurants_list_raises():
    mock_resp = _make_mock_response(json_data={"restaurants": []})
    with patch("services.restaurant_service.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_resp
        mock_client_cls.return_value.__aenter__.return_value = mock_client

        with pytest.raises(ValueError, match="No restaurants found"):
            await get_restaurants_by_postcode("SG13 7GH")
