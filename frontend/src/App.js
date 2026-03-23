import { useState } from 'react';

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
      if (!res.ok) throw new Error('No restaurants found');
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
      <h1>Restaurant Finder</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={postcode}
          onChange={e => setPostcode(e.target.value)}
          placeholder="Enter UK postcode"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p>Error: {error}</p>}

      {restaurants.map((r, i) => (
        <div key={i}>
          <h2>{i + 1}. {r.name}</h2>
          <p><strong>Cuisines:</strong> {r.cuisines.join(', ')}</p>
          <p><strong>Rating:</strong> {r.rating ?? 'No rating'}</p>
          <p><strong>Address:</strong> {r.address}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;