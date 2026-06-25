import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin, error, loading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return toast.error('Please enter all fields');
    }
    const success = await login(username, password);
    if (success) {
      toast.success('Successfully logged in!');
      navigate('/');
    } else {
      toast.error('Login failed. Check credentials.');
    }
  };

  const handleGoogleMock = async () => {
    const success = await googleLogin({
      email: `${username || 'googleuser'}@gmail.com`,
      username: username || 'google_user',
      token: 'mock_token_12345'
    });
    if (success) {
      toast.success('Signed in via Google Mock!');
      navigate('/');
    } else {
      toast.error('Google Mock Login failed.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle, var(--accent-light) 0%, var(--bg-primary) 100%)' }}>
      <div className="glass animate-fade-in" style={{ width: '400px', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Log in to track your healthy journey</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger)', color: 'white', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ margin: '24px 0', textAlign: 'center', position: 'relative' }}>
          <span style={{ background: 'var(--bg-secondary)', padding: '0 8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)', zIndex: -1 }} />
        </div>

        <button 
          onClick={handleGoogleMock}
          className="btn btn-secondary" 
          style={{ width: '100%', display: 'flex', gap: '8px' }}
        >
          <Globe size={18} />
          Sign in with Google
        </button>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '24px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
