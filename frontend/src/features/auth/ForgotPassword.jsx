import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import AuthLayout from './AuthLayout';

export default function ForgotPassword() {
  const { requestPasswordReset, loading, error, clearAuthError } = useAuthStore();
  const [identity, setIdentity] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();

    if (!identity.trim()) {
      return toast.error('Please enter your email or username.');
    }

    const result = await requestPasswordReset(identity);

    if (result.success) {
      setIsSubmitted(true);
      setSentToEmail(result.data?.email || identity.trim());
      toast.success('Password reset instructions sent to your email!');
      return;
    }

    toast.error(result.message || 'Unable to process request. Please try again.');
  };

  return (
    <AuthLayout
      title={isSubmitted ? 'Check your email' : 'Forgot password?'}
      subtitle={
        isSubmitted
          ? "We've sent password reset instructions to your registered email address."
          : 'Enter your username or email address and we will send you a reset link.'
      }
    >
      {error && !isSubmitted && <div className="auth-alert">{error}</div>}

      {isSubmitted ? (
        <div className="auth-success-card animate-fade-in">
          <div className="auth-success-icon">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="auth-success-title">Instructions Sent</h2>
          <p className="auth-success-desc">
            An email with a secure link to reset your password has been sent to{' '}
            <strong>{sentToEmail || identity}</strong>.
          </p>
          <p className="auth-success-desc" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', opacity: 0.85 }}>
            Please check your Gmail inbox (and Spam or Promotions folders). Click the link in that email to set a new password.
          </p>

          <div style={{ width: '100%', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => {
                setIsSubmitted(false);
                setIdentity('');
              }}
            >
              Send to another email or username
            </button>
            <Link to="/login" className="auth-back-link" style={{ justifyContent: 'center' }}>
              <ArrowLeft size={16} /> Back to Sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="identity">Email or Username</label>
            <div className="auth-input-wrap">
              <input
                id="identity"
                type="text"
                autoComplete="username email"
                placeholder="e.g. yourname@example.com"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <span className="auth-hint">
              Enter the username or email you registered with.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Sending instructions...' : 'Send reset instructions'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/login" className="auth-back-link">
              <ArrowLeft size={16} /> Back to Sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
