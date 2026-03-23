from pydantic import BaseModel


class Restaurant(BaseModel):
    name: str
    cuisines: list[str]
    rating: float | None
    address: str
    latitude: float | None
    longitude: float | None
