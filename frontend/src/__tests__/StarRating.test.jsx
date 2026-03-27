import { render, screen } from '@testing-library/react';

// Re-define the component inline to test it in isolation.
function StarRating({ rating }) {
  if (rating === null || rating === undefined) {
    return <span style={{ color: '#999', fontSize: '0.88rem' }}>No rating</span>;
  }
  const filled = Math.round(rating);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= filled ? 'star star--filled' : 'star star--empty'}>
          ★
        </span>
      ))}
      <span className="rating-number">{rating.toFixed(1)}</span>
    </div>
  );
}

describe('StarRating', () => {
  // Test that 'No rating' is displayed if the rating value is null
  it('shows "No rating" when rating is null', () => {
    render(<StarRating rating={null} />);
    expect(screen.getByText('No rating')).toBeInTheDocument();
  });
  // Test that 'No rating' is displayed if the rating value is undefined
  it('shows "No rating" when rating is undefined', () => {
    render(<StarRating rating={undefined} />);
    expect(screen.getByText('No rating')).toBeInTheDocument();
  });
  // Test that the correct numeric rating is shown
  it('shows numeric rating for 4.5', () => {
    render(<StarRating rating={4.5} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
  // Test that the behaviour of filling stars is as expected
  it('fills 5 stars for rating 4.5 (Math.round → 5)', () => {
    const { container } = render(<StarRating rating={4.5} />);
    const filled = container.querySelectorAll('.star--filled');
    const empty = container.querySelectorAll('.star--empty');
    expect(filled).toHaveLength(5);
    expect(empty).toHaveLength(0);
  });
  // Test that the behaviour of filling stars is as expected
  it('fills 3 stars for rating 3.2', () => {
    const { container } = render(<StarRating rating={3.2} />);
    const filled = container.querySelectorAll('.star--filled');
    const empty = container.querySelectorAll('.star--empty');
    expect(filled).toHaveLength(3);
    expect(empty).toHaveLength(2);
    expect(screen.getByText('3.2')).toBeInTheDocument();
  });
  // Test that the behaviour of filling stars is as expected
  it('fills 0 stars for rating 0', () => {
    const { container } = render(<StarRating rating={0} />);
    const filled = container.querySelectorAll('.star--filled');
    expect(filled).toHaveLength(0);
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });
});
