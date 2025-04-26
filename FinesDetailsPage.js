import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FineDetailsPage.css'; // We'll create this CSS file

function FinesDetailsPage() {
  const [fineDetails, setFineDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFines = async () => {
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      try {
        const res = await fetch(`http://localhost:5000/user/fine/email/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setFineDetails(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your fines details...</p>
      </div>
    );
  }

  return (
    <div className="fines-page">
      <div className="fines-header">
        <div className="header-content">
          <h1>Your Fines Overview</h1>
          <p className="subtitle">Track and manage your library fines</p>
        </div>
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          &larr; Back to Dashboard
        </button>
      </div>
      
      <div className="fines-card">
        {fineDetails && fineDetails.fineAmount > 0 ? (
          <>
            <div className="fine-illustration overdue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="fine-details">
              <h3>Outstanding Balance</h3>
              <div className="fine-amount">₹{fineDetails.fineAmount.toFixed(2)}</div>
              <p className="fine-description">
                This amount reflects unpaid fines for overdue books or damaged items.
              </p>
            </div>
          </>
        ) : (
          <div className="no-fines">
            <div className="fine-illustration clean">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>No Outstanding Fines</h3>
            <p>You're all caught up! No fines currently due.</p>
            <button 
              className="browse-button"
              onClick={() => navigate('/user')}
            >
              Browse Books
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinesDetailsPage;