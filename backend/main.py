from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.restaurant_service import get_restaurants_by_postcode

app = FastAPI(title="JET Restaurant Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/restaurants/{postcode}")
async def get_restaurants(postcode: str):
    """
    Returns first 10 restaurants for a given UK postcode.
    """
    try:
        restaurants = await get_restaurants_by_postcode(postcode)
        return restaurants
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail="Failed to reach JET API")