import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock leaflet to avoid canvas/DOM errors in jsdom
vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: { _getIconUrl: vi.fn() },
        mergeOptions: vi.fn(),
      },
    },
  },
}));

vi.mock('leaflet/dist/leaflet.css', () => ({}));
vi.mock('leaflet/dist/images/marker-icon-2x.png', () => ({ default: '' }));
vi.mock('leaflet/dist/images/marker-icon.png', () => ({ default: '' }));
vi.mock('leaflet/dist/images/marker-shadow.png', () => ({ default: '' }));

const TEST_RESTAURANTS = [
  {
    name: 'Papa Johns - Ware',
    cuisines: ['Pizza', 'American', 'Freebies'],
    rating: 3.0,
    address: '13 Baldock St, Ware, SG12 9DH',
    latitude: 51.81243,
    longitude: -0.034839,
  },
  {
    name: 'Secret Pizza',
    cuisines: ['Pizza', 'Burgers', 'Freebies'],
    rating: 5.0,
    address: '373 Ware Road\nHoddesdon, Hertford, SG13 7PE',
    latitude: 51.78004,
    longitude: -0.014573,
  },
];

function mockFetchSuccess(data) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchError(detail) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve({ detail }),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});


describe('App', () => {
  // Check that the search form is rendered
  it('renders the search form on initial load', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/enter a uk postcode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });
  // Check that when the website is loaded, no restaurant cards are listed
  it('shows no restaurant cards on initial load', () => {
    render(<App />);
    expect(screen.queryByText('Papa Johns - Ware')).not.toBeInTheDocument();
  });
  // Check that the calls are using the correct URL when the form is submitted
  it('calls fetch with the correct URL on form submission', async () => {
    mockFetchSuccess(TEST_RESTAURANTS);
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText(/enter a uk postcode/i), 'SG13 7GH');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/restaurants/SG137GH'
    );
  });
  // Check that the restaurant cards are being listed
  it('renders restaurant cards after a successful fetch', async () => {
    mockFetchSuccess(TEST_RESTAURANTS);
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText(/enter a uk postcode/i), 'SG137GH');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Papa Johns - Ware')).toBeInTheDocument();
      expect(screen.getByText('Secret Pizza')).toBeInTheDocument();
    });
  });
  // Check that error handling is working as expected
  it('shows an error message on a failed fetch', async () => {
    mockFetchError('No restaurants found');
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText(/enter a uk postcode/i), 'ZZ99ZZ');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('No restaurants found')).toBeInTheDocument();
    });
  });
  // Check that the searching behaviour is as expected
  it('disables the button and shows "Searching..." while loading', async () => {
    // Use a promise to keep the request pending
    let resolve;
    global.fetch = vi.fn().mockReturnValue(
      new Promise(r => { resolve = r; })
    );

    render(<App />);
    await userEvent.type(screen.getByPlaceholderText(/enter a uk postcode/i), 'SG137GH');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();

    // Resolve promise so the component can clean up
    resolve({ ok: true, json: () => Promise.resolve([]) });
  });
});
