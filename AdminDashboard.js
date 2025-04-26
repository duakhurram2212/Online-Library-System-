import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './AdminDashboard.css';

function AdminDashboard() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [uploadedBooks, setUploadedBooks] = useState([]); // Ensure it's initialized as an empty array
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [adminMsg, setAdminMsg] = useState('');
  const [adminsList, setAdminsList] = useState([]); // State for admins list
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      const adminEmail = localStorage.getItem('adminEmail');
      const token = localStorage.getItem('token');

      if (!adminEmail || !token) {
        setError('No email or token found in localStorage');
        navigate('/login');
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/admin-info/email/${adminEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setAdminInfo(data);

          const booksRes = await fetch(`http://localhost:5000/admin/${adminEmail}/books`);
          const books = await booksRes.json();
          setUploadedBooks(Array.isArray(books) ? books : []); // Ensure books is an array

          const statsRes = await fetch(`http://localhost:5000/admin/${data.Admin_Id}/upload-stats`);
          const statsData = await statsRes.json();
          setStats(statsData);

          // Fetch all admins
          const adminsRes = await fetch('http://localhost:5000/Admins', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const adminsData = await adminsRes.json();
          setAdminsList(adminsData);
        } else {
          setError(data.message || 'Admin not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleDeleteAdmin = async (adminId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/Admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Filter out the deleted admin from the state
        setAdminsList(adminsList.filter(admin => admin.Admin_Id !== adminId));
        setAdminMsg('✅ Admin deleted successfully!');
      } else {
        const data = await res.json();
        setAdminMsg(`❌ ${data.message || 'Failed to delete admin.'}`);
      }
    } catch (err) {
      console.error(err);
      setAdminMsg('❌ Server error while deleting admin.');
    }
  };

  // Only call reduce if uploadedBooks is a valid array
  const categoryChartData = Array.isArray(uploadedBooks) && uploadedBooks.length > 0
    ? Object.entries(
        uploadedBooks.reduce((acc, book) => {
          acc[book.Category_Id] = (acc[book.Category_Id] || 0) + 1;
          return acc;
        }, {})
      ).map(([category, count]) => ({
        category,
        count,
      }))
    : [];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>👋 Welcome, {adminInfo?.Name}!</h1>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div className="tabs">
        <button className={activeTab === 'personal' ? 'active-tab' : ''} onClick={() => setActiveTab('personal')}>📄 Personal Info</button>
        <button className={activeTab === 'books' ? 'active-tab' : ''} onClick={() => navigate('/admin/manage-books')}>📚 Manage Books</button>
        <button className={activeTab === 'users' ? 'active-tab' : ''} onClick={() => navigate('/admin/manage-users')}>👥 Manage Users</button>
        <button className={activeTab === 'add-admin' ? 'active-tab' : ''} onClick={() => setActiveTab('add-admin')}>➕ Add Admin</button>
      </div>

      {activeTab === 'personal' && (
        <>
          <div className="card">
            <h2>📄 Personal Information</h2>
            <p><strong>📧 Email:</strong> {adminInfo?.Email}</p>
          
            <p><strong>🛡️ Role:</strong> Admin</p>
            <p><strong>🕐 Created At:</strong> {new Date(adminInfo?.Created_At).toLocaleDateString()}</p>
          </div>

          <div className="card">
            <h2>📚 Admin Arsenal: Books Edition</h2>
            {uploadedBooks.length > 0 ? (
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author ID</th>
                    <th>Category ID</th>
                    <th>ISBN</th>
                    <th>Year</th>
                    <th>Format</th>
                    <th>Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedBooks.map((book, index) => (
                    <tr key={index}>
                      <td>{book.Title}</td>
                      <td>{book.Author_Id}</td>
                      <td>{book.Category_Id}</td>
                      <td>{book.ISBN}</td>
                      <td>{book.Publication_Year}</td>
                      <td>{book.File_Format}</td>
                      <td>{book.Subscription_Type === 1 ? 'Premium' : 'Free'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No books uploaded yet.</p>
            )}
          </div>

          <div className="card stats-card">
            <h2>📈 Upload Statistics</h2>
            <ul>
              <li><strong>Total Books:</strong> {stats?.TotalBooks || 0}</li>
              <li><strong>Top Category ID:</strong> {stats?.TopCategory || 'N/A'}</li>
            </ul>
          </div>

          {uploadedBooks.length > 0 && (
            <div className="card chart-card">
              <h2>📊 Books Per Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Books Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {activeTab === 'add-admin' && (
        <div className="card">
          <h2>➕ Add New Admin</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: newAdmin.name,
                  email: newAdmin.email,
                  password: newAdmin.password,
                  role: 'admin'
                })
              });

              const result = await response.json();

              if (response.ok) {
                setAdminMsg(`✅ Admin ${newAdmin.email} created successfully!`);
                setNewAdmin({ name: '', email: '', password: '' });
              } else {
                setAdminMsg(`❌ ${result.message || 'Failed to create admin.'}`);
              }
            } catch (err) {
              console.error(err);
              setAdminMsg('❌ Server error while adding admin.');
            }
          }}>
            <input
              type="text"
              placeholder="Name"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              required
            />
            <button type="submit">Create Admin</button>
            {adminMsg && <p style={{ marginTop: '10px' }}>{adminMsg}</p>}
          </form>
        </div>
      )}

      {activeTab === 'add-admin' && (
        <div className="card">
          <h2>🧑‍💻 Admins List</h2>
          <table className="admins-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminsList.map((admin) => (
                <tr key={admin.Admin_Id}>
                  <td>{admin.Name}</td>
                  <td>{admin.Email}</td>
                  <td>{new Date(admin.Created_At).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDeleteAdmin(admin.Admin_Id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
