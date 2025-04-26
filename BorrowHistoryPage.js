import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BorrowHistoryPage.css'; // Import the CSS file

function BorrowHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      try {
        const res = await fetch(`http://localhost:5000/user/borrowing-history/email/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your borrowing history...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="header-content">
          <h1>Your Reading Journey</h1>
          <p className="subtitle">Every book tells a story, and so does your borrowing history</p>
        </div>
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          &larr; Back to Dashboard
        </button>
      </div>
      
      <div className="history-list">
        {history.length > 0 ? (
          history.map((item, index) => {
            const isOverdue = item.Due_Date && !item.ReturnDate && new Date(item.Due_Date) < new Date();
            
            return (
              <div key={index} className="history-card">
                <div className="book-cover">
                  {item.Image ? (
                    <img src={item.Image} alt={item.BookTitle} />
                  ) : (
                    <div className="cover-placeholder">
                      <span>{item.BookTitle.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="book-info">
                  <h3>{item.BookTitle}</h3>
                  <div className="details">
                    <p><strong>Borrowed on:</strong> {new Date(item.BorrowDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    
                    {item.Due_Date && !item.ReturnDate && (
                      <p className={isOverdue ? 'due-date overdue' : 'due-date'}>
                        <strong>Due date:</strong> {new Date(item.Due_Date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })}
                        {isOverdue && <span className="overdue-badge">OVERDUE</span>}
                      </p>
                    )}
                    
                    {item.ReturnDate ? (
                      <p><strong>Returned on:</strong> {new Date(item.ReturnDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    ) : null}
                  </div>
                </div>
                <div className={`status ${item.ReturnDate ? 'returned' : isOverdue ? 'overdue' : 'borrowed'}`}>
                  {item.ReturnDate ? 'Returned' : isOverdue ? 'Overdue' : 'Currently Borrowed'}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-history">
            <img src="/images/no-history.svg" alt="No history" className="empty-image" />
            <h3>Your reading adventure begins here</h3>
            <p>No borrowing history found. Start exploring our collection!</p>
            <button 
              className="browse-button"
              onClick={() => navigate('/books')}
            >
              Discover Books
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BorrowHistoryPage;