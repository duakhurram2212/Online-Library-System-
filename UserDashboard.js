import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

function UserDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [fines, setFines] = useState(0);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');

      if (!userEmail || !token) {
        setError('No user data found');
        navigate('/login');
        return;
      }

      try {
        // Fetch user info
        const userRes = await fetch(`http://localhost:5000/user/full-info/email/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Fetch fines
        const finesRes = await fetch(`http://localhost:5000/user/fine/email/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Fetch borrow history
        const historyRes = await fetch(`http://localhost:5000/user/borrowing-history/email/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const userData = await userRes.json();
        const finesData = await finesRes.json();
        const historyData = await historyRes.json();

        if (userRes.ok) setUserInfo(userData);
        if (finesRes.ok) setFines(finesData.fineAmount || 0);
        if (historyRes.ok) setBorrowHistory(historyData.history || []);

      } catch (err) {
        console.error(err);
        setError('Something went wrong while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) return 'Not Available';
    return new Date(date).toLocaleDateString();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const goToSettings = () => {
    navigate('/user/settings');
  };

  const goToFullHistory = () => {
    navigate('/user/borrowing-history');
  };

  const goToFinesDetails = () => {
    navigate('/user/fines-details');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="profile-section">
          <h2>👤👤 {userInfo?.Name}</h2>
          <p>{userInfo?.Email}</p>
        </div>
        <nav className="nav-links">
          <ul>
            <li onClick={() => navigate('/user/books')}>📚 Books</li>
            <li onClick={() => navigate('/user/categories')}>📂 Categories</li>
            <li onClick={() => navigate('/user/authors')}>👨‍💻 Authors</li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-navbar">
          <h2>📚 INKVERSE 📚</h2>
          <div className="nav-buttons">   
            <button onClick={goToSettings}>Settings</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>

        <h1>🏠 LIBRARY DASHBOARD </h1>

        <div className="dashboard-cards-container">
          <div className="dashboard-card">
            <h2>👤 Personal Information</h2>
            <p><strong>🆔 User ID:</strong> {userInfo?.User_Id}</p>
            <p><strong>📛 Name:</strong> {userInfo?.Name}</p>
            <p><strong>📧 Email:</strong> {userInfo?.Email}</p>
            <p><strong>📞 Phone:</strong> {userInfo?.Phone || 'Not Available'}</p>
          </div>

          <div className="dashboard-card">
            <h2>💳 Subscription Details</h2>
            <p><strong>Subscription Type:</strong> {userInfo?.Subscription_Type === 1 ? 'VIP' : 'Member'}</p>
            <p><strong>Expiry Date:</strong> {formatDate(userInfo?.Expiry_Date)}</p>
          </div>

          {/* New Fines Card */}
          <div className="dashboard-card" onClick={goToFinesDetails} style={{cursor: 'pointer'}}>
            <h2>💰 Fines Summary</h2>
            <p><strong>Total Due:</strong> ₹{fines}</p>
            <p><small>Click to view details</small></p>
          </div>

          {/* New Borrow History Card */}
          <div className="dashboard-card" onClick={goToFullHistory} style={{cursor: 'pointer'}}>
            <h2>📖 Recent Borrows</h2>
            {borrowHistory.slice(0, 2).map((item, index) => (
              <p key={index}>
                <strong>{item.BookTitle}</strong> - {formatDate(item.BorrowDate)}
              </p>
            ))}
            {borrowHistory.length > 2 && (
              <p><small>+{borrowHistory.length - 2} more... (Click to view all)</small></p>
            )}
            {borrowHistory.length === 0 && (
              <p>No borrowing history found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;