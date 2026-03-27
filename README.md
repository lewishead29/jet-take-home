# JET Restaurant Finder

A web application as my submission for the Just Eat Early Careers Software Engineering program. Uses the provided API to search for and return 10 restaurants near a UK postcode.

---

## Architecture

The project is split into two services:

- **Backend** — A Python/FastAPI REST API that acts as a proxy to the JET API, validates the postcode, parses the response, and returns a clean validated data structure to the frontend.
- **Frontend** — A React (Vite) single-page application that provides the user interface.

The decision to use a backend proxy rather than calling the JET API directly from the browser was done as it avoids CORS issues, keeps API consumption server-side, and provides somewhere to enforce data validation via Pydantic models.

---
## Design Choices

Although no guidance was given on how the data should be displayed, the styling/design was completed based off of JET's brand guidelines, found at:
https://brand-box.marketing.just-eat.com/

---
## How to build, compile, and run my solution

Both services need to be running simultaneously. Open two terminal windows from the project root.

### Prerequisites

- Python 3.12+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`.

---

## Testing

Testing was carried out on both frontend and backend. For the test data, I input a postcode near me and took the top two results to use as test restaurants.

### Backend

The backend uses pytest for testing.

There are two backend testing files:

- `tests/test_restaurant_service.py` — unit tests for the service layer
- `tests/test_main.py` — endpoint tests for the FastAPI routes

`test_restaurant_service.py` covers the `parse_restaurant` function, and verifies the correct parsing of full restaurant data, handling of missing fields, and filtering of non-cuisine tags. The async `get_restaurants_by_postcode` function is tested to verify postcode normalisation, invalid postcode rejection, and correct handling of 404 and empty-list responses from the JET API.

`test_main.py` verifies that the HTTP layer returns the correct status codes: `200` on success, `404` for invalid postcodes or no results, and `502` when the upstream JET API fails.

To run the backend tests, do the following:

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

### Frontend

The frontend uses Vitest and React Testing Library for testing.

There are three frontend testing files:

- `src/__tests__/App.test.jsx` — integration tests for the main App component
- `src/__tests__/StarRating.test.jsx` — unit tests for the star rating component
- `src/__tests__/RestaurantMap.test.jsx` — unit tests for the map/directions component

App.test.jsx covers the full user journey with a mocked `fetch`: checking the initial render state, correct URL construction (space stripping and uppercasing of the postcode), successful restaurant card rendering, error message display on failed requests, and the loading state.

StarRating.test.jx verifies the rendering logic: `null`/`undefined` ratings display "No rating", numeric values are shown to one decimal place, and the correct number of filled/empty stars are rendered based on `Math.round`.

RestaurantMap.test.jsx verifies that the component renders nothing when either coordinate is `null`, and that the Google Maps directions link is constructed with the correct latitude and longitude.


To run the frontend tests, do the following:

```bash
cd frontend
npm install
npm test
```

---

## Assumptions



---

## Improvements I Would Make

---

## Screenshots