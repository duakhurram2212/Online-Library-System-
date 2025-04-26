import React, { useState, useEffect } from 'react';
import './ManageUsers.css';

function ManageUsers() {
  const [activeTab, setActiveTab] = useState('addUser');
  const [users, setUsers] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userData, setUserData] = useState({});
  const [newUser, setNewUser] = useState({
    Name: '',
    Email: '',
    Password: '',
    Phone: '',
  });
  const [borrowData, setBorrowData] = useState({
    User_Id: '',
    Ebook_Id: '',
    Borrowed_On: '',
    Returned_On: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchEbooks();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/Users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      alert('Error fetching users 😢');
    }
  };

  const fetchEbooks = async () => {
    try {
      const res = await fetch('http://localhost:5000/Ebooks');
      const data = await res.json();
      setEbooks(data);
    } catch (error) {
      alert('Error fetching eBooks 😢');
    }
  };

  const fetchTabData = async (endpoint, key) => {
    if (!selectedUserId) {
      alert('Please select a user first 🙏');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/${endpoint}/${selectedUserId}`);
      const data = await res.json();
      setUserData((prev) => ({ ...prev, [key]: data }));

      if (key === 'fines') fetchFines(selectedUserId);
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
    }
  };

  const fetchFines = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/fines/${userId}`);
      const data = await res.json();
      setUserData((prev) => ({ ...prev, fines: data }));
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/Users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        alert('User added successfully!');
        setNewUser({ Name: '', Email: '', Password: '', Phone: '' });
        fetchUsers();
      } else {
        alert('Failed to add user ❌');
      }
    } catch (error) {
      alert('Server error while adding user ❌');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:5000/Users/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        alert('User deleted!');
        fetchUsers();
      } else {
        alert('Failed to delete user ❌');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleBorrowChange = (e) => {
    const { name, value } = e.target;
    setBorrowData((prev) => ({ ...prev, [name]: value }));
  };

  const addBorrowing = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...borrowData, Returned_On: borrowData.Returned_On || null };
      const res = await fetch('http://localhost:5000/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        alert('Borrow record added!');
        setBorrowData({ User_Id: '', Ebook_Id: '', Borrowed_On: '', Returned_On: '' });
      } else {
        alert('Failed to add borrow ❌');
      }
    } catch (error) {
      console.error('Borrow error:', error);
    }
  };

  const payFine = async (fineId) => {
    try {
      const res = await fetch(`http://localhost:5000/fines/pay/${fineId}`, {
        method: 'PUT',
      });

      if (res.ok) {
        alert('Fine paid successfully! ✅');
        fetchTabData('fines', 'fines');
      } else {
        alert('Error paying fine ❌');
      }
    } catch (error) {
      console.error('Pay fine error:', error);
    }
  };

  const returnBook = async (borrowId) => {
    try {
      const res = await fetch(`http://localhost:5000/return-book/${borrowId}`, {
        method: 'PUT',
      });

      if (res.ok) {
        alert('Book returned successfully! ✅');
        fetchTabData('borrowing-history', 'borrowingHistory');
      } else {
        alert('Error returning book ❌');
      }
    } catch (error) {
      console.error('Return error:', error);
    }
  };

  const tabs = [
    { key: 'addUser', label: '➕ Add New User' },
    { key: 'deleteUser', label: '🗑️ Delete User' },
    { key: 'downloadHistory', label: '⬇️ Download History' },
    { key: 'accessLogs', label: '🕵️ Access Logs' },
    { key: 'borrowingHistory', label: '📚 Borrowing History' },
    { key: 'borrowBook', label: '📖 Borrow Book' },
    { key: 'fines', label: '💰 Fines' },
  ];

  return (
    <div className="manage-users-container">
      <h2>👥 Manage Users Dashboard</h2>

      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="tabs-content">
        {['downloadHistory', 'accessLogs', 'borrowingHistory', 'fines'].includes(activeTab) && (
          <div style={{ marginBottom: '15px' }}>
            <select onChange={(e) => setSelectedUserId(e.target.value)} value={selectedUserId}>
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.User_Id} value={user.User_Id}>
                  {user.Name} ({user.Email})
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                fetchTabData(
                  {
                    downloadHistory: 'download-history',
                    accessLogs: 'access-logs',
                    borrowingHistory: 'borrowing-history',
                    fines: 'fines',
                  }[activeTab],
                  activeTab
                )
              }
            >
              🔍 Load
            </button>
          </div>
        )}

        {activeTab === 'addUser' && (
          <form onSubmit={addUser} className="user-form">
            {Object.entries(newUser).map(([key, val]) => (
              <input
                key={key}
                name={key}
                placeholder={key}
                value={val}
                onChange={handleInputChange}
                required
              />
            ))}
            <button type="submit">➕ Add User</button>
          </form>
        )}

        {activeTab === 'deleteUser' && (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.User_Id}>
                  <td>{user.Name}</td>
                  <td>{user.Email}</td>
                  <td>{user.Phone}</td>
                  <td>
                    <button onClick={() => deleteUser(user.User_Id)}>❌ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

{activeTab === 'borrowingHistory' && userData.borrowingHistory && (
  <table className="users-table">
    <thead>
      <tr>
        <th>Borrow ID</th>
        <th>Ebook ID</th> {/* 👈 Added column */}
        <th>Borrowed On</th>
        <th>Returned On</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {userData.borrowingHistory.map((entry) => (
        <tr key={entry.Borrow_Id}>
          <td>{entry.Borrow_Id}</td>
          <td>{entry.Ebook_Id}</td> {/* 👈 Displaying Ebook_Id */}
          <td>{entry.Borrowed_On}</td>
          <td>{entry.Returned_On || '⏳ Not returned'}</td>
          <td>
            {!entry.Returned_On && (
              <button onClick={() => returnBook(entry.Borrow_Id)}>📥 Return</button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}


        {activeTab === 'borrowBook' && (
          <form onSubmit={addBorrowing} className="user-form">
            <select name="User_Id" value={borrowData.User_Id} onChange={handleBorrowChange} required>
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.User_Id} value={user.User_Id}>
                  {user.Name} ({user.Email})
                </option>
              ))}
            </select>

            <select name="Ebook_Id" value={borrowData.Ebook_Id} onChange={handleBorrowChange} required>
              <option value="">Select eBook</option>
              {ebooks.map((ebook) => (
                <option key={ebook.Ebook_Id} value={ebook.Ebook_Id}>
                  {ebook.Title}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="Borrowed_On"
              value={borrowData.Borrowed_On}
              onChange={handleBorrowChange}
              required
            />
         
            <button type="submit">📚 Borrow Book</button>
          </form>
        )}

{activeTab === 'accessLogs' && userData.accessLogs && (
  <table className="users-table">
    <thead>
      <tr>
        <th>Access ID</th>
        <th>Access Time</th>
        <th>Ebook ID</th>
      </tr>
    </thead>
    <tbody>
      {userData.accessLogs.map((log) => (
        <tr key={log.Access_Id}>
          <td>{log.Access_Id}</td>
          <td>{new Date(log.Access_Time).toLocaleString()}</td>
          <td>{log.Ebook_Id}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}

{activeTab === 'downloadHistory' && userData.downloadHistory && (
  <table className="users-table">
    <thead>
      <tr>
        <th>Download ID</th>
        <th>Download Time</th>
        <th>Ebook ID</th>
      </tr>
    </thead>
    <tbody>
      {userData.downloadHistory.map((download) => (
        <tr key={download.Download_Id}>
          <td>{download.Download_Id}</td>
          <td>{new Date(download.Download_Time).toLocaleString()}</td>
          <td>{download.Ebook_Id}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}

{activeTab === 'fines' && Array.isArray(userData.fines) && userData.fines.length > 0 ? (
  <table className="users-table">
    <thead>
      <tr>
        <th>Fine ID</th>
        <th>Amount</th>
        <th>Paid</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {userData.fines.map((fine) => (
        <tr key={fine.Fine_Id}>
          <td>{fine.Fine_Id}</td>
          <td>{fine.Fine_Amount}</td>
          <td>{fine.Paid ? '✅ Paid' : '❌ Not Paid'}</td>
          <td>
            {!fine.Paid && (
              <button onClick={() => payFine(fine.Fine_Id)}>💵 Pay</button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
) : activeTab === 'fines' && (!userData.fines || userData.fines.length === 0) ? (
  <p>No fines found for this user.</p>
) : null}


      </div>
    </div>
  );
}

export default ManageUsers;
