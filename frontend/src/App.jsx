// Imports
import { useState } from 'react';
import './App.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// When leaflet is used with Vite, the images used can get broken.
// This fixes it with explicit imports of the icon images.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Function to display the location of a given restaurant on an OpenStreetMap Map. Also includes a link to get directions directly through Google Maps.
function RestaurantMap({ latitude, longitude, name }) {
  if (latitude == null || longitude == null) return null;
  return (
    <div className="card-map">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '180px', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
      <a
        className="gmaps-link"
        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get directions on Google Maps →
      </a>
    </div>
  );
}
// Function to determine how many stars should be shown /5.
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
// Main App function
function App() {
  const [postcode, setPostcode] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle the search bar interaction
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
    // Layout of the page
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
              <RestaurantMap latitude={r.latitude} longitude={r.longitude} name={r.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;