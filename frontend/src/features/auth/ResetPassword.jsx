import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import AuthLayout from './AuthLayout';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPassword() {
  const { uid: paramUid, token: paramToken } = useParams();
  const navigate = useNavigate();
  const { confirmPasswordReset, loading, error, clearAuthError } = useAuthStore();

  const [uid, setUid] = useState(paramUid || '');
  const [token, setToken] = useState(paramToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();

    const activeUid = (uid || paramUid || '').trim();
    const activeToken = (token || paramToken || '').trim();

    if (!activeUid || !activeToken) {
      return toast.error('Missing reset token or user id. Please check your reset link.');
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }

    if (newPassword !== newPasswordConfirm) {
      return toast.error('Passwords do not match.');
    }

    const result = await confirmPasswordReset({
      uid: activeUid,
      token: activeToken,
      newPassword,
      newPasswordConfirm,
    });

    if (result.success) {
      setIsSuccess(true);
      toast.success('Password updated successfully!');
      return;
    }

    toast.error(result.message || 'Failed to reset password. The link may have expired.');
  };

  return (
    <AuthLayout
      title={isSuccess ? 'Password Reset!' : 'Set New Password'}
      subtitle={
        isSuccess
          ? 'Your password has been changed. You can now log in with your new credentials.'
          : 'Please enter a strong new password for your account.'
      }
    >
      {error && !isSuccess && <div className="auth-alert">{error}</div>}

      {isSuccess ? (
        <div className="auth-success-card">
          <div className="auth-success-icon">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="auth-success-title">All Done!</h2>
          <p className="auth-success-desc">
            Your account security has been updated with your new password.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            onClick={() => navigate('/login', { replace: true })}
          >
            Sign in now &rarr;
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {(!paramUid || !paramToken) && (
            <>
              <div className="form-group">
                <label htmlFor="uid">User ID / Code</label>
                <input
                  id="uid"
                  type="text"
                  placeholder="Reset UID"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="token">Security Token</label>
                <input
                  id="token"
                  type="text"
                  placeholder="Security token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="auth-input-wrap">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Enter new password (min. 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                autoFocus
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
            <span className="auth-hint">
              Minimum 8 characters with letters & numbers.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="newPasswordConfirm">Confirm New Password</label>
            <div className="auth-input-wrap">
              <input
                id="newPasswordConfirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat new password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Updating password...' : 'Update password'}
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
