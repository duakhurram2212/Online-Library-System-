import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./LoginPage.css";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const roleFromState = location.state?.role || 'user'; // default to user
  const [role, setRole] = useState(roleFromState);
  const [isLogin, setIsLogin] = useState(true); // login by default
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setRole(roleFromState);
    setIsLogin(true); // reset to login mode when role changes
  }, [roleFromState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isLogin
        ? 'http://localhost:5000/login'
        : 'http://localhost:5000/signup';

      const body = isLogin
        ? JSON.stringify({ email, password, role })
        : JSON.stringify({ name, email, password, phone, role: 'user' });

      const response = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      // Save credentials in localStorage based on role
      if (data.role === "admin") {
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('token', data.token); // optional
        navigate("/admin");
      } else {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('token', data.token); // optional
        localStorage.setItem('subscriptionType', data.subscriptionType);
        navigate("/user");
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="login-page">
      <div className="image-container">
        <img src="/lms1.jpg" alt="LMS" className="lms-image" />
      </div>

      <h1>{isLogin ? `Login` : 'User Sign Up'}</h1>

      <form onSubmit={handleSubmit}>
        {/* Show extra fields only if it's user signup */}
        {!isLogin && role === 'user' && (
          <>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>

      {/* Only show Sign Up toggle for users */}
      {isLogin && role === 'user' && (
        <p>
          Don't have an account?{" "}
          <button onClick={() => setIsLogin(false)}>Sign Up</button>
        </p>
      )}

      {!isLogin && (
        <p>
          Already have an account?{" "}
          <button onClick={() => setIsLogin(true)}>Login</button>
        </p>
      )}
    </div>
  );
}

export default LoginPage;
