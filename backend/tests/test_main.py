from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from main import app
from models.restaurant import Restaurant

client = TestClient(app)

# Two restaurants near me, selected for testing.
TEST_RESTAURANTS = [
    Restaurant(
        name="Papa Johns - Ware",
        cuisines=["Pizza", "American"],
        rating=3.0,
        address="13 Baldock St, Ware, SG12 9DH",
        latitude=51.81243,
        longitude=-0.034839,
    ),
    Restaurant(
        name="Secret Pizza",
        cuisines=["Pizza", "Burgers"],
        rating=5.0,
        address="373 Ware Road\nHoddesdon, Hertford, SG13 7PE",
        latitude=51.78004,
        longitude=-0.014573,
    ),
]

SERVICE_PATH = "main.get_restaurants_by_postcode"

# Test to check if the get_restaurants function works as expected.
def test_get_restaurants_success():
    with patch(SERVICE_PATH, new=AsyncMock(return_value=TEST_RESTAURANTS)):
        response = client.get("/restaurants/SG137GH")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Papa Johns - Ware"
    assert data[1]["name"] == "Secret Pizza"
    assert data[0]["rating"] == 3.0
    assert data[0]["cuisines"] == ["Pizza", "American"]


# Test to check expected behaviour when an invalid postcode is entered
def test_get_restaurants_invalid_postcode():
    with patch(SERVICE_PATH, new=AsyncMock(side_effect=ValueError("not a valid UK postcode"))):
        response = client.get("/restaurants/NOTVALID")

    assert response.status_code == 404
    assert "not a valid UK postcode" in response.json()["detail"]

# Test to check expected behaviour when no restaurants are found near the entered postcode.
def test_get_restaurants_not_found():
    with patch(SERVICE_PATH, new=AsyncMock(side_effect=ValueError("No restaurants found"))):
        response = client.get("/restaurants/ZZ99ZZ")

    assert response.status_code == 404
    assert "No restaurants found" in response.json()["detail"]

# Test to check expected behaviour if the API is not reachable.
def test_get_restaurants_upstream_error():
    with patch(SERVICE_PATH, new=AsyncMock(side_effect=Exception("connection error"))):
        response = client.get("/restaurants/SG137GH")

    assert response.status_code == 502
    assert response.json()["detail"] == "Failed to reach JET API"
