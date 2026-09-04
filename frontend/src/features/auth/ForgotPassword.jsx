import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import AuthLayout from './AuthLayout';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { requestPasswordReset, loading, error, clearAuthError } = useAuthStore();
  const [identity, setIdentity] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devData, setDevData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();

    if (!identity.trim()) {
      return toast.error('Please enter your email or username.');
    }

    const result = await requestPasswordReset(identity);

    if (result.success) {
      setIsSubmitted(true);
      if (result.data?.reset_url) {
        setDevData(result.data);
      }
      toast.success('Password reset instructions generated!');
      return;
    }

    toast.error(result.message || 'Unable to process request. Please try again.');
  };

  const handleResetDevNavigate = () => {
    if (devData?.dev_uid && devData?.dev_token) {
      navigate(`/reset-password/${devData.dev_uid}/${devData.dev_token}`);
    }
  };

  return (
    <AuthLayout
      title={isSubmitted ? 'Check your email' : 'Forgot password?'}
      subtitle={
        isSubmitted
          ? "We've sent password reset instructions to your registered address."
          : 'Enter your username or email address and we will help you reset your password.'
      }
    >
      {error && !isSubmitted && <div className="auth-alert">{error}</div>}

      {isSubmitted ? (
        <div className="auth-success-card">
          <div className="auth-success-icon">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="auth-success-title">Instructions Sent</h2>
          <p className="auth-success-desc">
            If an account matches <strong>{identity}</strong>, an email with a secure link to reset your password is on its way.
          </p>

          {devData?.reset_url && (
            <div className="auth-dev-box animate-fade-in">
              <div className="auth-dev-box-title">
                <ExternalLink size={14} /> Local Dev Shortcut
              </div>
              <p>
                In development mode, you can jump straight to the reset page without checking email logs:
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                onClick={handleResetDevNavigate}
              >
                Proceed to Reset Password &rarr;
              </button>
            </div>
          )}

          <div style={{ width: '100%', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                setIsSubmitted(false);
                setDevData(null);
              }}
            >
              Try another email or username
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
