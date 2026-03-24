import { useState } from 'react';
import './App.css';

function StarRating({ rating }) {
  if (rating === null || rating === undefined) {
    return <span style={{ color: '#999', fontSize: '0.88rem' }}>No rating</span>;
  }

  const filled = Math.round(rating);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={star <= filled ? 'star star--filled' : 'star star--empty'}
        >
          ★
        </span>
      ))}
      <span className="rating-number">{rating.toFixed(1)}</span>
    </div>
  );
}

function App() {
  const [postcode, setPostcode] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRestaurants([]);

    try {
      const res = await fetch(`http://localhost:8000/restaurants/${postcode.replace(/\s/g, '').toUpperCase()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'No restaurants found');
      }
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="header">
        <h1>Restaurant Finder</h1>
      </div>

      <div className="container">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            type="text"
            value={postcode}
            onChange={e => setPostcode(e.target.value)}
            placeholder="Enter a UK postcode..."
          />
          <button className="search-button" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {loading && <div className="spinner" />}

        {restaurants.map((r, i) => (
          <div className="restaurant-card" key={i}>
            <div className="card-number">{i + 1}</div>
            <div className="card-content">
              <div className="card-name">{r.name}</div>
              <div className="card-cuisines">
                {r.cuisines.map(c => (
                  <span className="cuisine-tag" key={c}>{c}</span>
                ))}
              </div>
              <StarRating rating={r.rating} />
              <div className="card-address">{r.address}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;