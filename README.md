# JET Restaurant Finder

A web application as my submission for the Just Eat Early Careers Software Engineering program. Uses the provided API to search for and return 10 restaurants near a UK postcode.

---

## Architecture

The project is split into two services:

- **Backend** — A Python/FastAPI REST API that acts as a proxy to the JET API, validates the postcode, parses the response, and returns a clean validated data structure to the frontend.
- **Frontend** — A React (Create React App) single-page application that provides the user interface.

The decision to use a backend proxy rather than calling the JET API directly from the browser was done as it avoids CORS issues, keeps API consumption server-side, and provides somewhere to enforce data validation via Pydantic models.

---
## Design Choices

Although no guidance was given on how the data should be displayed, the styling/design was completed based off of JET's brand guidelines, found at:
https://brand-box.marketing.just-eat.com/

---
## Running the Application


---

## Testing


---

## Assumptions



---

## Improvements I Would Make

