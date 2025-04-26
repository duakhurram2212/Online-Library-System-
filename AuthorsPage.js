import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthorsPage.css';

function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [userSubscription, setUserSubscription] = useState(0); // 0 = Member, 1 = VIP
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

        // Fetch authors
        const authorsRes = await fetch('http://localhost:5000/Authors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (authorsRes.ok) {
          setAuthors(await authorsRes.json());
        } else {
          setError('Failed to load authors');
        }
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSearchError(null);
  };

  const fetchEbooksByAuthor = async (authorName) => {
    try {
      setLoading(true);
      setSearchError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/ebooks-by-author/${encodeURIComponent(authorName)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      
      if (response.ok) {
        if (data.ebooks && data.ebooks.length > 0) {
          setEbooks(data.ebooks);
        } else {
          setEbooks([]);
          setSearchError(`No books found for author "${authorName}"`);
        }
      } else {
        setEbooks([]);
        setSearchError(data.message || 'No books found for this author');
      }
    } catch (err) {
      setEbooks([]);
      setSearchError('Error fetching ebooks');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorClick = (authorName) => {
    setSelectedAuthor(authorName);
    fetchEbooksByAuthor(authorName);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const foundAuthor = authors.find(author => 
        author.Author_Name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (foundAuthor) {
        handleAuthorClick(foundAuthor.Author_Name);
      } else {
        setSearchError(`No author found matching "${searchTerm}"`);
        setEbooks([]);
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate('/user');
  };

  const handleUpgrade = () => {
    navigate('/user/settings');
  };

  const isBookAccessible = (book) => {
    return userSubscription === 1 || book.Subscription_Type === 0;
  };

  return (
    <div className="authors-page-container">
      <div className="top-bar">
        <h2 className="page-title">🖋️ Authors Collection</h2>
        <div>
          {userSubscription === 0 && (
            <button className="upgrade-button" onClick={handleUpgrade}>
              ⭐ Upgrade to VIP
            </button>
          )}
          <button className="back-button" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="search-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search for an author..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {searchError && <div className="search-error">{searchError}</div>}

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          <div className="authors-list">
            {authors
              .filter(author => 
                author.Author_Name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((author) => (
                <div
                  key={author.Author_Id}
                  className={`author-card ${
                    selectedAuthor === author.Author_Name ? 'active' : ''
                  }`}
                  onClick={() => handleAuthorClick(author.Author_Name)}
                >
                  <h3 className="author-name">{author.Author_Name}</h3>
                  <p className="author-meta">
                    <span className="nationality">{author.Nationality}</span>
                    {author.Birth_Year && (
                      <span className="birth-year">• {author.Birth_Year}</span>
                    )}
                  </p>
                </div>
              ))}
          </div>

          {ebooks.length > 0 ? (
            <div className="ebooks-section">
              <h3 className="section-title">
                Books by <span className="highlight">{selectedAuthor}</span>
              </h3>
              <div className="ebooks-grid">
                {ebooks.map((ebook) => (
                  <div 
                    key={ebook.Ebook_Id} 
                    className={`ebook-card ${!isBookAccessible(ebook) ? 'locked' : ''}`}
                  >
                    <img
                      src={ebook.Image || 'https://via.placeholder.com/150'}
                      alt={ebook.Title}
                      className="ebook-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    {!isBookAccessible(ebook) && (
                      <div className="lock-overlay">
                        <div className="lock-icon">🔒</div>
                        <p>VIP Content</p>
                        <button 
                          className="upgrade-button-small"
                          onClick={handleUpgrade}
                        >
                          Upgrade to Access
                        </button>
                      </div>
                    )}
                    <div className="ebook-info">
                      <h3 className="ebook-title">{ebook.Title}</h3>
                      <div className="ebook-meta">
                        <span className="year">{ebook.Publication_Year}</span>
                        <span className="format">{ebook.File_Format}</span>
                      </div>
                      {isBookAccessible(ebook) ? (
                        <a
                          href={ebook.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="read-button"
                        >
                          Read Now
                        </a>
                      ) : (
                        <button 
                          className="upgrade-button"
                          onClick={handleUpgrade}
                        >
                          Upgrade to VIP
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedAuthor && !searchError ? (
            <p className="no-books-message">
              No books available for {selectedAuthor}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

export default AuthorsPage;