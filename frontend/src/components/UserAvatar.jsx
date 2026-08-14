import React from 'react';
import { API_BASE_URL } from '../config/api';

export default function UserAvatar({ user, profile, size = 40, className = '' }) {
  const letter = user?.username?.[0]?.toUpperCase() || 'U';
  const avatarPath = profile?.avatar;
  const avatarUrl = avatarPath
    ? avatarPath.startsWith('http')
      ? avatarPath
      : `${API_BASE_URL}${avatarPath}`
    : null;

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--accent-light), var(--primary-light))',
        color: 'var(--accent)',
        fontWeight: 700,
        fontSize: size * 0.38,
        lineHeight: 1,
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.username ? `${user.username}'s profile` : 'Profile'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span aria-hidden="true">{letter}</span>
      )}
    </div>
  );
}
