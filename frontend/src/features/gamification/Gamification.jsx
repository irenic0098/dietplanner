import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Award, Trophy, Play, CheckCircle, Calendar, ShieldCheck, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Gamification() {
  const { profile, fetchProfile } = useAuthStore();
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchGamificationData = async () => {
    try {
      const chalRes = await client.get('gamification/challenges/');
      setChallenges(chalRes.data);

      const uChalRes = await client.get('gamification/user-challenges/');
      setUserChallenges(uChalRes.data);

      const badgeRes = await client.get('gamification/badges/');
      setBadges(badgeRes.data);

      const uBadgeRes = await client.get('gamification/user-badges/');
      setUserBadges(uBadgeRes.data);

      const leadRes = await client.get('gamification/leaderboard/');
      setLeaderboard(leadRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const handleJoinChallenge = async (challengeId) => {
    try {
      await client.post('gamification/user-challenges/', { challenge: challengeId });
      toast.success('Joined challenge! Log progress daily.');
      fetchGamificationData();
    } catch (err) {
      toast.error('Already joined this challenge.');
    }
  };

  const handleLogProgress = async (userChallengeId) => {
    try {
      const res = await client.post(`gamification/user-challenges/${userChallengeId}/log_progress/`);
      if (res.data.completed) {
        toast.success('🎉 Milestone reached! Challenge completed! Points awarded.');
      } else {
        toast.success(`Logged day ${res.data.progress_days}!`);
      }
      fetchGamificationData();
      fetchProfile();
    } catch (err) {
      toast.error('Failed to log progress.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="header-bar">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Streaks & Challenges</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Compete with friends, join healthy habit challenges, and collect premium badges.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* Left Side: Challenges & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Challenges Section */}
          <div className="card glass">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="var(--primary)" /> Active Habits Challenges
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {challenges.map(c => {
                const joined = userChallenges.find(uc => uc.challenge === c.id);
                return (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{c.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '450px' }}>{c.description}</p>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem', marginTop: '8px' }}>{c.duration_days} Days | Reward: {c.points_reward} XP</span>
                    </div>

                    <div>
                      {joined ? (
                        joined.completed ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            <CheckCircle size={18} /> Completed
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Progress: {joined.progress_days} / {c.duration_days} d</span>
                            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleLogProgress(joined.id)}>
                              Log Day
                            </button>
                          </div>
                        )
                      ) : (
                        <button className="btn btn-secondary" onClick={() => handleJoinChallenge(c.id)} style={{ display: 'flex', gap: '6px', fontSize: '0.8rem' }}>
                          <Play size={12} /> Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges Section */}
          <div className="card glass">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--accent)" /> Achievement Showcase
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              {badges.map(b => {
                const earned = userBadges.some(ub => ub.badge === b.id);
                return (
                  <div 
                    key={b.id} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      textAlign: 'center', 
                      padding: '16px', 
                      background: 'var(--bg-primary)', 
                      borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${earned ? 'var(--primary)' : 'var(--border)'}`,
                      opacity: earned ? 1 : 0.55
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: earned ? 'var(--primary-light)' : 'var(--border)', color: earned ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Award size={24} />
                    </div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700' }}>{b.name}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{b.description}</p>
                    {earned && (
                      <span className="badge badge-success" style={{ fontSize: '0.55rem', marginTop: '8px', padding: '1px 6px' }}>Earned</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Leaderboards */}
        <div className="card glass">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} color="var(--warning)" /> Global Leaderboard
          </h3>
          
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, i) => (
                <tr key={u.username} style={{ background: i === 0 ? 'var(--primary-light)' : 'transparent' }}>
                  <td style={{ fontWeight: 'bold' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u.username}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>🔥 {u.streak}d streak</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{u.points} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
