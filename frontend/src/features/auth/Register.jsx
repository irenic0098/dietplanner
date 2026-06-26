import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import AuthLayout from './AuthLayout';

const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
  const navigate = useNavigate();
  const { register, error, fieldErrors, loading, clearAuthError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  const validateForm = () => {
    const nextErrors = {};

    if (username.trim().length < 3) {
      nextErrors.username = 'Username must be at least 3 characters.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (password !== passwordConfirm) {
      nextErrors.password_confirm = 'Passwords do not match.';
    }

    setLocalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    setLocalErrors({});

    if (!validateForm()) {
      return toast.error('Please fix the highlighted fields.');
    }

    const result = await register({
      username,
      email,
      password,
      passwordConfirm,
    });

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
      return;
    }

    toast.error(result.message || 'Registration failed.');
  };

  const getFieldError = (field) => localErrors[field] || fieldErrors[field];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join DietPlanner to track meals, goals, and progress in one place."
    >
      {error && !Object.keys(fieldErrors).length && (
        <div className="auth-alert">{error}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={getFieldError('username') ? 'input-error' : ''}
            required
            disabled={loading}
          />
          {getFieldError('username') && (
            <span className="auth-field-error">{getFieldError('username')}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={getFieldError('email') ? 'input-error' : ''}
            required
            disabled={loading}
          />
          {getFieldError('email') && (
            <span className="auth-field-error">{getFieldError('email')}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={getFieldError('password') ? 'input-error' : ''}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <span className="auth-hint">At least {MIN_PASSWORD_LENGTH} characters</span>
          {getFieldError('password') && (
            <span className="auth-field-error">{getFieldError('password')}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="passwordConfirm">Confirm password</label>
          <input
            id="passwordConfirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={getFieldError('password_confirm') ? 'input-error' : ''}
            required
            disabled={loading}
          />
          {getFieldError('password_confirm') && (
            <span className="auth-field-error">{getFieldError('password_confirm')}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '8px' }}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
