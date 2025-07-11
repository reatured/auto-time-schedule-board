import React from 'react';

export default function LoginForm({ username, setUsername, password, setPassword, onLogin, error, isLoading }) {
  return (
    <form onSubmit={onLogin} className="auth-form">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        disabled={isLoading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
    </form>
  );
} 