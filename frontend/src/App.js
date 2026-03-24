import { useState } from 'react';
import './App.css';

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
            placeholder="Enter a UK postcode e.g. EC4M 7RF"
          />
          <button className="search-button" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

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
              <div className="card-rating">{r.rating ?? 'No rating'}</div>
              <div className="card-address">{r.address}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;