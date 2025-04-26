import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoriesPage.css';

function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [userSubscription, setUserSubscription] = useState(0); // 0 = Member, 1 = VIP

  useEffect(() => {
    const fetchUserAndCategories = async () => {
      try {
        setIsLoading(true);
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

        // Fetch categories
        const categoriesRes = await fetch('http://localhost:5000/Categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        } else {
          setError('Failed to load categories');
        }
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndCategories();
  }, []);

  const fetchEbooksByCategory = async (categoryId) => {
    try {
      setIsLoading(true);
      setHasFetched(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/ebooks/category/${categoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        setEbooks(data.ebooks || []);
        setActiveCategory(categoryId);
        setError(null);
      } else {
        setEbooks([]);
        setError(data.message || 'No ebooks found for this category');
      }
    } catch (err) {
      setEbooks([]);
      setError('Error fetching ebooks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId !== activeCategory) {
      fetchEbooksByCategory(categoryId);
    }
  };

  const handleUpgrade = () => {
    navigate('/user/settings');
  };

  const isBookAccessible = (book) => {
    return userSubscription === 1 || book.Subscription_Type === 0;
  };

  return (
    <div className="categories-page-container">
      <div className="top-bar">
        <h2 className="page-title">📚 Categories</h2>
        <div>
          {userSubscription === 0 && (
            <button className="upgrade-button" onClick={handleUpgrade}>
              ⭐ Upgrade to VIP
            </button>
          )}
          <button className="back-button" onClick={() => navigate('/user')}>
            🔙 Back to Dashboard
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="categories-grid">
        {categories.length === 0 ? (
          <p className="no-categories">No categories available</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.Category_Id}
              className={`category-card ${activeCategory === category.Category_Id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.Category_Id)}
            >
              <h3 className="category-name">{category.Category_Name}</h3>
              <p className="category-description">
                {category.Description || 'Explore this collection'}
              </p>
            </div>
          ))
        )}
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : hasFetched && ebooks.length > 0 ? (
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
                <p className="ebook-author">{ebook.Author_Name}</p>
                <p className="ebook-year">
                  <strong>Published:</strong> {ebook.Publication_Year}
                </p>
                {isBookAccessible(ebook) ? (
                  <a
                    href={ebook.URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="read-button"
                  >
                    Read Ebook
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
      ) : hasFetched && ebooks.length === 0 ? (
        <p className="no-ebooks">No ebooks available in this category.</p>
      ) : null}
    </div>
  );
}

export default CategoriesPage;