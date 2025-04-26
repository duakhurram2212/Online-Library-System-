// UserSettings.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation
import './UserSettings.css';

function UserSettings() {
  const navigate = useNavigate(); // Initialize navigate function
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editPassword, setEditPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [editSubscription, setEditSubscription] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');

        const response = await fetch(`http://localhost:5000/user/full-info/email/${email}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
          setUserInfo(data);
          setSubscriptionType(data.Subscription_Type || 0);
        } else {
          showError(data.message || 'Failed to load user data');
        }
      } catch {
        showError('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setSuccess('');
    setTimeout(() => setError(''), 3000);
  };

  const refreshUserData = async () => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');

    const response = await fetch(`http://localhost:5000/user/full-info/email/${email}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    setUserInfo(data);
  };

  const handlePasswordUpdate = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      return showError('All fields are required');
    }

    if (newPass !== confirmPass) {
      return showError('Passwords do not match');
    }

    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');

      const response = await fetch(`http://localhost:5000/change-password/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass
        })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Password updated successfully!');
        setEditPassword(false);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        showError(data.message || 'Failed to update password');
      }
    } catch {
      showError('Error updating password');
    }
  };

  const handleSubscriptionUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');

      const response = await fetch(`http://localhost:5000/change-subscription/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscriptionType })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Subscription updated successfully!');
        setEditSubscription(false);
        refreshUserData();
      } else {
        showError(data.message || 'Failed to update subscription');
      }
    } catch {
      showError('Error updating subscription');
    }
  };

  const handleExtendSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');

      const response = await fetch(`http://localhost:5000/extend-expiry/${email}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Subscription extended by 1 year!');
        refreshUserData();
      } else {
        showError(data.message || 'Failed to extend subscription');
      }
    } catch {
      showError('Error extending subscription');
    }
  };

  const goBackToDashboard = () => {
    navigate('/user'); // Redirect to /user page
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-settings-container">
      <div className="header-section">
        <h1 className="title">User Settings</h1>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="profile-section">
        <h2 className="section-title">Profile Information</h2>
        <div className="profile-grid">
          <div className="profile-item"><span className="label">Name:</span> <span className="value">{userInfo.Name}</span></div>
          <div className="profile-item"><span className="label">Email:</span> <span className="value">{userInfo.Email}</span></div>
          <div className="profile-item"><span className="label">Phone:</span> <span className="value">{userInfo.Phone || 'Not provided'}</span></div>
        </div>
      </div>

      <div className="password-section">
        <h2 className="section-title">Password Settings</h2>
        {!editPassword ? (
          <div className="password-display">
            <p>Password: ••••••••</p>
            <button className="edit-button" onClick={() => setEditPassword(true)}>Change Password</button>
          </div>
        ) : (
          <div className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
            </div>
            <div className="form-actions">
              <button className="save-button" onClick={handlePasswordUpdate}>Save</button>
              <button className="cancel-button" onClick={() => { setEditPassword(false); setError(''); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="subscription-section">
        <h2 className="section-title">Subscription</h2>
        <div className="subscription-info">
          <p><span className="label">Status:</span> <span className={`value ${userInfo.Subscription_Type === 1 ? 'vip' : 'member'}`}>{userInfo.Subscription_Type === 1 ? 'VIP Member' : 'Standard Member'}</span></p>
          <p><span className="label">Expiry Date:</span> <span className="value">{userInfo.Expiry_Date || 'No expiry date set'}</span></p>
        </div>

        {!editSubscription ? (
          <div className="subscription-actions">
            <button className="edit-button" onClick={() => setEditSubscription(true)}>Change Subscription</button>
            <button className="extend-button" onClick={handleExtendSubscription}>Extend by 1 Year</button>
          </div>
        ) : (
          <div className="subscription-form">
            <div className="form-group">
              <label>Subscription Type</label>
              <select value={subscriptionType} onChange={(e) => setSubscriptionType(Number(e.target.value))}>
                <option value={0}>Standard Member</option>
                <option value={1}>VIP Member</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="save-button" onClick={handleSubscriptionUpdate}>Update</button>
              <button className="cancel-button" onClick={() => setEditSubscription(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <button className="back-button" onClick={goBackToDashboard}>Back to Dashboard</button> {/* Back to Dashboard Button */}
    </div>
  );
}

export default UserSettings;
