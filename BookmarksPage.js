// BookmarksPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookmarksPage.css'; // Make sure to create and style this CSS file

function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');

      if (!email || !token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/user/bookmarks/email/${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookmarks');
        }

        const data = await response.json();
        setBookmarks(data.bookmarks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your bookmarks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-header">
        <div className="header-content">
          <h1>Your Saved Stories</h1>
          <p className="subtitle">Where you left off, ready to dive back in</p>
        </div>
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <img src="/images/no-bookmarks.svg" alt="No bookmarks" className="empty-image" />
          <h3>No bookmarks yet</h3>
          <p>Start reading and save your favorite moments!</p>
          <button onClick={() => navigate('/books')} className="browse-button">
            Browse Books
          </button>
        </div>
      ) : (
        <div className="bookmarks-list">
          {bookmarks.map((bookmark, index) => (
            <div key={`${bookmark.BookTitle}-${index}`} className="bookmark-card">
              <div className="book-cover">
                {bookmark.Image ? (
                  <img src={bookmark.Image} alt={bookmark.BookTitle} />
                ) : (
                  <div className="cover-placeholder">
                    <span>{bookmark.BookTitle.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="bookmark-info">
                <h3>{bookmark.BookTitle}</h3>
                <p><strong>Page:</strong> {bookmark.Page_Number}</p>
                <p><strong>Saved on:</strong> {formatDate(bookmark.Created_At)}</p>
                <button 
                  className="action-button"
                  onClick={() => window.open(bookmark.URL, '_blank')}
                >
                  Continue Reading
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookmarksPage;
