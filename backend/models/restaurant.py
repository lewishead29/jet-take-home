from pydantic import BaseModel

# Pydantic Model for a restaurant
class Restaurant(BaseModel):
    name: str
    cuisines: list[str]
    rating: float | None
    address: str
    latitude: float | None
    longitude: float | None
