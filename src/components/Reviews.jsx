import { useState } from 'react';
import './Reviews.css';

const Reviews = ({ productId, reviews = [], onAddReview }) => {
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddReview && newReview.comment.trim()) {
      onAddReview({
        ...newReview,
        productId,
        createdAt: new Date().toISOString()
      });
      setNewReview({ rating: 5, comment: '' });
      setShowForm(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === star).length / reviews.length * 100).toFixed(0)
      : 0
  }));

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h3>Customer Reviews</h3>
        <button 
          className="write-review-btn"
          onClick={() => setShowForm(!showForm)}
        >
          Write a Review
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-select">
            <label>Your Rating</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= newReview.rating ? 'active' : ''}`}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="comment-input">
            <label>Your Review</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience with this product..."
              rows="4"
              required
            />
          </div>
          <button type="submit" className="submit-review-btn">
            Submit Review
          </button>
        </form>
      )}

      <div className="reviews-summary">
        <div className="average-rating">
          <span className="rating-number">{averageRating}</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className={star <= Math.round(averageRating) ? 'star filled' : 'star'}>
                ★
              </span>
            ))}
          </div>
          <span className="review-count">{reviews.length} reviews</span>
        </div>

        <div className="rating-bars">
          {ratingCounts.map(({ star, count, percentage }) => (
            <div key={star} className="rating-bar">
              <span className="bar-label">{star} ★</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
              </div>
              <span className="bar-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.reviewerName || 'Anonymous'}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="review-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= review.rating ? 'star filled' : 'star'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
