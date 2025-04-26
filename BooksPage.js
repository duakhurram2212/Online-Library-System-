import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BooksPage.css';

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [successMessage, setSuccessMessage] = useState('');
  const [userSubscription, setUserSubscription] = useState(0); // 0 = Member, 1 = VIP
  const [showReviewForm, setShowReviewForm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');

        // Fetch user subscription status
        const userRes = await fetch(`http://localhost:5000/user/full-info/email/${email}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserSubscription(userData.Subscription_Type || 0);
        }

        // Fetch all books
        const booksRes = await fetch('http://localhost:5000/Ebooks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Fetch top recommended books
        const topRes = await fetch('http://localhost:5000/top-3-recommended-books', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const booksData = await booksRes.json();
        const topData = await topRes.json();

        if (booksRes.ok) setBooks(booksData);
        if (topRes.ok) setTopBooks(topData);

      } catch (err) {
        setError('Error fetching books data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredBooks = books.filter(book =>
    book.Title.toLowerCase().includes(searchTerm) ||
    book.Author_Name?.toLowerCase().includes(searchTerm) ||
    book.Category_Name?.toLowerCase().includes(searchTerm)
  );

  const handleBookmark = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      const pageNumber = prompt('Enter page number to bookmark:') || 0;

      const response = await fetch(`http://localhost:5000/bookmark/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          pageNumber: parseInt(pageNumber)
        })
      });

      if (response.ok) {
        setSuccessMessage('Book added to bookmarks successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to bookmark');
      }
    } catch (err) {
      alert('Error adding bookmark');
    }
  };

  const handleReviewSubmit = async (bookId) => {
    if (!reviewText || !rating || !bookId) {
      alert("Please fill out the review form completely.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');

      const response = await fetch(`http://localhost:5000/review/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          reviewText: reviewText,
          rating: rating
        })
      });

      if (response.ok) {
        setSuccessMessage('Review submitted successfully!');
        setReviewText('');
        setRating(5);
        setShowReviewForm(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      alert('Error submitting review');
    }
  };

  const handleUpgradeSubscription = () => {
    navigate('/user/settings'); // Navigate to subscription page
  };

  const isBookAccessible = (book) => {
    // If user is VIP (1) or book is for members (0)
    return userSubscription === 1 || book.Subscription_Type === 0;
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewChange = (e) => {
    setReviewText(e.target.value);
  };

  const handleCloseReviewModal = () => {
    setShowReviewForm(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="books-page-container">
      {/* Back to Dashboard Button */}
      <div className="top-bar">
        <button className="back-button" onClick={() => navigate('/user')}>
          🔙 Back to Dashboard
        </button>
        {userSubscription === 0 && (
          <button className="upgrade-button" onClick={handleUpgradeSubscription}>
            ⭐ Upgrade to VIP
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Top Recommended Books Section */}
      <section className="top-books-section">
        <h2>🌟 Top Recommended Books</h2>
        <div className="top-books-grid">
          {topBooks.length > 0 ? (
            topBooks.map(book => (
              <div key={book.Ebook_Id} className="top-book-card">
                <div className="top-book-info">
                  <h3>{book.Book_Title}</h3>
                  {!isBookAccessible(book) && (
                    <div className="premium-badge">VIP Only</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No recommended books available</p>
          )}
        </div>
      </section>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search books by title..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={() => navigate('/bookmarks')}>View My Bookmarks</button>
      </div>

      {/* All Books Section */}
      <section className="all-books-section">
        <h2>📚 All Available Books</h2>
        <div className="books-grid">
          {filteredBooks.length === 0 ? (
            <p className="no-books">No books found matching your search.</p>
          ) : (
            filteredBooks.map(book => (
              <div key={book.Ebook_Id} className={`book-card ${!isBookAccessible(book) ? 'locked' : ''}`}>
                <img src={book.Image} alt={book.Title} />
                {!isBookAccessible(book) && (
                  <div className="lock-overlay">
                    <div className="lock-icon">🔒</div>
                    <p>VIP Content</p>
                    <button
                      className="upgrade-button-small"
                      onClick={handleUpgradeSubscription}
                    >
                      Upgrade to Access
                    </button>
                  </div>
                )}
                <div className="book-info">
                  <h3>{book.Title}</h3>
                  <p><strong>Published:</strong> {book.Publication_Year}</p>
                  <div className="book-actions">
                    {isBookAccessible(book) ? (
                      <>
                        <button onClick={() => window.open(book.URL, '_blank')}>Read</button>
                        <button onClick={() => handleBookmark(book.Ebook_Id)}>Bookmark</button>
                        <button onClick={() => setShowReviewForm(book.Ebook_Id)}>Review</button>
                      </>
                    ) : (
                      <button
                        className="upgrade-button"
                        onClick={handleUpgradeSubscription}
                      >
                        Upgrade to VIP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="review-modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseReviewModal}>&times;</span>
            <h3>Write a Review</h3>
            <div className="rating-input">
              <label>Rating:</label>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'filled' : ''}`}
                  onClick={() => handleRatingChange(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Write your review here..."
              value={reviewText}
              onChange={handleReviewChange}
            />
            <button onClick={() => handleReviewSubmit(showReviewForm)}>Submit Review</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BooksPage;
