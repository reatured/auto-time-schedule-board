import React, { useState, useEffect } from 'react';
import './App.css';

// API URL configuration for Railway deployment
const API_URL = 'https://web-production-02aca.up.railway.app';

// Add a comment to force cache refresh
// Updated: 2025-01-07 - Fixed API URL
// Force deployment: 2025-01-07 12:00

function App() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  // Debug: Log API URL on component mount
  useEffect(() => {
    console.log('App mounted - API_URL:', API_URL);
    console.log('Current window location:', window.location.href);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    // Debug: Log the actual URL being called
    const signupUrl = `${API_URL}/signup`;
    console.log('Calling signup URL:', signupUrl);
    
    try {
      const res = await fetch(signupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, full_name: fullName }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Signup failed');
      setMode('login');
      setUsername('');
      setPassword('');
      setFullName('');
      alert('Signup successful! Please log in.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Debug: Log the actual URL being called
    const loginUrl = `${API_URL}/login`;
    console.log('Calling login URL:', loginUrl);
    
    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
      const data = await res.json();
      setToken(data.access_token);
      fetchMe(data.access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMe = async (accessToken) => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user info');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setUsername('');
    setPassword('');
    setFullName('');
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>FastAPI Auth Demo</h2>
        <p style={{ fontSize: '0.8rem', marginBottom: '20px', opacity: 0.7 }}>
          Backend: {API_URL}
        </p>
        {user ? (
          <div>
            <p>Welcome, <b>{user.full_name || user.username}</b>!</p>
            <button onClick={handleLogout}>Log out</button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setMode('login')} disabled={mode === 'login'}>Log In</button>
              <button onClick={() => setMode('signup')} disabled={mode === 'signup'}>Sign Up</button>
            </div>
            {mode === 'signup' ? (
              <form onSubmit={handleSignup} className="auth-form">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                <button type="submit">Sign Up</button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="auth-form">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="submit">Log In</button>
              </form>
            )}
            {error && <p style={{ color: 'salmon' }}>{error}</p>}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
