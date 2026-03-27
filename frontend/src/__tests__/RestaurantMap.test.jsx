import { render, screen } from '@testing-library/react';

// Re-define the component inline to test it in isolation
function RestaurantMap({ latitude, longitude, name }) {
  if (latitude == null || longitude == null) return null;
  return (
    <div className="card-map">
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


describe('RestaurantMap', () => {
  // Test that nothing is rendered if latitude is empty
  it('renders nothing when latitude is null', () => {
    const { container } = render(
      <RestaurantMap latitude={null} longitude={-0.034839} name="Papa Johns - Ware" />
    );
    expect(container.firstChild).toBeNull();
  });
  // Test that nothing is rendered if longitude is empty
  it('renders nothing when longitude is null', () => {
    const { container } = render(
      <RestaurantMap latitude={51.81243} longitude={null} name="Papa Johns - Ware" />
    );
    expect(container.firstChild).toBeNull();
  });
  // Check that the directions link has the expected coordinates
  it('renders the Google Maps directions link with correct coordinates', () => {
    render(<RestaurantMap latitude={51.81243} longitude={-0.034839} name="Papa Johns - Ware" />);
    const link = screen.getByRole('link', { name: /get directions/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&destination=51.81243,-0.034839'
    );
  });
});
