import React, { useState, useEffect, useCallback } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Search, Bookmark, BookmarkCheck, Play, X, CheckCircle,
  Flame, Zap, Wind, Dumbbell, Star, ChevronRight, Filter,
  Clock, Award, BarChart3, Trophy, Calendar, TrendingUp,
  Heart, Loader, RefreshCw,
} from 'lucide-react';

/* ─── Static Data ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'all',          label: 'All',                    emoji: '🧘' },
  { id: 'weight_loss',  label: 'Weight Loss Yoga',       emoji: '🔥' },
  { id: 'weight_gain',  label: 'Weight Gain Yoga',       emoji: '💪' },
  { id: 'belly_fat',    label: 'Belly Fat Reduction',    emoji: '🏋️' },
  { id: 'stress_relief',label: 'Stress Relief Meditation',emoji: '🌿' },
  { id: 'morning',      label: 'Morning Yoga Routine',   emoji: '🌅' },
  { id: 'beginner',     label: 'Beginner Classes',       emoji: '⭐' },
];

const DIFFICULTY_COLOR = {
  beginner:     { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
  intermediate: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
  advanced:     { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
};

const BENEFIT_ICONS = {
  calorie_burn: { icon: Flame,    color: '#ef4444', label: 'kcal' },
  flexibility:  { icon: Wind,     color: '#6366f1', label: 'Flex' },
  relaxation:   { icon: Heart,    color: '#ec4899', label: 'Relax' },
  strength:     { icon: Dumbbell, color: '#f59e0b', label: 'Strength' },
};

const LEVEL_TO_NUM = { Low: 1, Medium: 2, High: 3 };
const LEVEL_DOTS   = (level) => Array.from({ length: 3 }, (_, i) => i < LEVEL_TO_NUM[level]);

/* ─── Video Card ────────────────────────────────────────────────────────────── */
function VideoCard({ video, onPlay, onBookmark, onComplete }) {
  const diff = DIFFICULTY_COLOR[video.difficulty] || DIFFICULTY_COLOR.beginner;
  const bookmarked = video.is_bookmarked;
  const completed  = video.is_completed_today;

  return (
    <div className="yoga-card" style={{
      background: 'var(--bg-card)',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Thumbnail */}
      <div
        onClick={() => onPlay(video)}
        style={{
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          aspectRatio: '16/9',
          background: '#0f0f0f',
        }}
      >
        <img
          src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
          alt={video.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onError={e => {
            const img = e.currentTarget;
            if (video.thumbnail_url && img.src === video.thumbnail_url) {
              img.src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
            } else if (img.src.includes('hqdefault')) {
              img.src = `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`;
            } else {
              img.style.display = 'none';
            }
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Play overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.25s',
        }}
          className="yoga-play-overlay"
        >
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <Play size={26} color="#10b981" fill="#10b981" style={{ marginLeft: 4 }} />
          </div>
        </div>

        {/* Duration badge */}
        <span style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(0,0,0,0.75)',
          color: '#fff', fontSize: '0.72rem', fontWeight: '700',
          padding: '3px 8px', borderRadius: '6px',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Clock size={11} />{video.duration_mins} min
        </span>

        {/* Completed badge */}
        {completed && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: '#10b981', color: '#fff',
            fontSize: '0.65rem', fontWeight: '800',
            padding: '3px 8px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <CheckCircle size={10} /> Done Today
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '10px' }}>
        {/* Title + bookmark */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', lineHeight: 1.35, flexGrow: 1 }}>{video.title}</h4>
          <button onClick={() => onBookmark(video.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: bookmarked ? '#f59e0b' : 'var(--text-muted)',
            padding: '4px', flexShrink: 0, transition: 'color 0.2s, transform 0.2s',
          }}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {bookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>

        {/* Instructor + Difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>👤 {video.instructor}</span>
          <span style={{
            fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px',
            background: diff.bg, color: diff.text, textTransform: 'capitalize',
          }}>{video.difficulty}</span>
        </div>

        {/* Benefits */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          {/* Calorie burn */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>
            <Flame size={13} /> {video.calorie_burn} kcal
          </div>
          {['flexibility', 'relaxation', 'strength'].map(key => {
            const level = video[key];
            const meta  = BENEFIT_ICONS[key];
            const Icon  = meta.icon;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }} title={`${key}: ${level}`}>
                <Icon size={13} color={meta.color} />
                <span style={{ color: meta.color, fontWeight: '600' }}>{level}</span>
              </div>
            );
          })}
        </div>

        {/* Complete button */}
        <button
          onClick={() => onComplete(video.id)}
          disabled={completed}
          style={{
            marginTop: 'auto',
            paddingTop: 10,
            padding: '9px 14px',
            borderRadius: '10px',
            border: 'none',
            background: completed ? 'var(--bg-secondary)' : 'var(--primary)',
            color: completed ? 'var(--text-muted)' : '#fff',
            fontWeight: '700', fontSize: '0.82rem',
            cursor: completed ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'opacity 0.2s',
            opacity: completed ? 0.6 : 1,
          }}
        >
          {completed ? <><CheckCircle size={15} /> Completed Today</> : <><Play size={15} fill="#fff" /> Mark Complete</>}
        </button>
      </div>
    </div>
  );
}

/* ─── Video Modal ───────────────────────────────────────────────────────────── */
function VideoModal({ video, onClose }) {
  if (!video) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: '900px',
        borderRadius: '24px', overflow: 'hidden',
        background: 'var(--bg-secondary)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>
        {/* Video */}
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {/* Info bar */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: '800', fontSize: '1.05rem' }}>{video.title}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              👤 {video.instructor} &nbsp;·&nbsp; <Clock size={12} style={{ display: 'inline' }} /> {video.duration_mins} min
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '50%', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
          }}><X size={18} /></button>
        </div>
      </div>
    </div>
  );
}

/* ─── Challenge Tracker ─────────────────────────────────────────────────────── */
function ChallengeTracker({ challenge, stats }) {
  if (!challenge) return null;
  const pct = Math.min(100, (challenge.progress_days / challenge.target_days) * 100);

  return (
    <div style={{
      borderRadius: '24px', padding: '28px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)',
      position: 'relative', overflow: 'hidden',
      marginBottom: 32,
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -50, left: 100, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
              🏆 Daily Yoga Challenge
            </div>
            <h3 style={{ color: '#fff', fontWeight: '800', fontSize: '1.3rem', marginBottom: 6 }}>{challenge.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', maxWidth: 500 }}>{challenge.description}</p>
          </div>

          {/* Streak ring */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.4)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
                {stats?.streak_days || 0}
              </span>
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 2 }}>STREAK</span>
            </div>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Day Streak 🔥</p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: '700' }}>
            <span>{challenge.progress_days} / {challenge.target_days} days completed</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.2)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
              borderRadius: '99px',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Day dots */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: challenge.target_days }, (_, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: i < challenge.progress_days ? '#fff' : 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: '700',
              color: i < challenge.progress_days ? '#10b981' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.3s',
            }}>
              {i < challenge.progress_days ? '✓' : i + 1}
            </div>
          ))}
        </div>

        {challenge.is_completed && (
          <div style={{
            marginTop: 16, padding: '10px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#fff', fontWeight: '700', fontSize: '0.9rem',
          }}>
            <Trophy size={18} /> 🎉 Challenge Completed! You earned 50 XP!
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Stats Row ─────────────────────────────────────────────────────────────── */
function StatsRow({ stats }) {
  if (!stats) return null;
  const items = [
    { icon: Calendar,   label: 'Total Sessions',  value: stats.total_sessions,      color: '#6366f1' },
    { icon: TrendingUp, label: 'Day Streak',       value: `${stats.streak_days} 🔥`, color: '#f59e0b' },
    { icon: Award,      label: 'Last Practice',    value: stats.last_completed_date || 'Not yet', color: '#10b981' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
      {items.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="card glass" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: `${s.color}18`, margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} color={s.color} />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function YogaMeditation() {
  const { profile } = useAuthStore();

  const [videos,          setVideos]          = useState([]);
  const [filteredVideos,  setFilteredVideos]  = useState([]);
  const [recommended,     setRecommended]     = useState([]);
  const [bookmarked,      setBookmarked]      = useState([]);
  const [challengeData,   setChallengeData]   = useState(null);
  const [yogaStats,       setYogaStats]       = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [loadingStats,    setLoadingStats]    = useState(true);
  const [youtubeVideos,   setYoutubeVideos]   = useState([]);
  const [loadingYoutube,  setLoadingYoutube]  = useState(false);
  const [searchSource,    setSearchSource]    = useState('local'); // 'local' | 'youtube' | 'all'

  const [activeCategory,  setActiveCategory]  = useState('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [activeTab,       setActiveTab]       = useState('discover'); // 'discover' | 'bookmarks' | 'progress'
  const [playingVideo,    setPlayingVideo]    = useState(null);

  /* ── Fetch ── */
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery.trim())       params.set('search', searchQuery.trim());

      const [videosRes, recRes, bmRes] = await Promise.all([
        client.get(`yoga/videos/?${params}`),
        client.get('yoga/videos/?recommended=true'),
        client.get('yoga/videos/bookmarked/'),
      ]);
      setVideos(videosRes.data);
      setFilteredVideos(videosRes.data);
      setRecommended(recRes.data.slice(0, 4));
      setBookmarked(bmRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load yoga videos.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  const fetchYoutubeVideos = useCallback(async () => {
    if (!searchQuery.trim()) {
      setYoutubeVideos([]);
      return;
    }
    
    setLoadingYoutube(true);
    try {
      const params = new URLSearchParams();
      params.set('query', searchQuery.trim());
      if (activeCategory !== 'all') params.set('category', activeCategory);
      params.set('max_results', '20');

      const res = await client.get(`yoga/videos/youtube_search/?${params}`);
      setYoutubeVideos(res.data.results || []);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message;
      if (errorMsg.includes('API key') || errorMsg.includes('not configured')) {
        toast.error('YouTube API key not configured. Please add YOUTUBE_API_KEY to backend .env file.');
      } else {
        toast.error('Could not search YouTube videos.');
      }
      setYoutubeVideos([]);
    } finally {
      setLoadingYoutube(false);
    }
  }, [searchQuery, activeCategory]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await client.get('yoga/stats/');
      setYogaStats(res.data.stats);
      setChallengeData(res.data.challenge);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  
  // Fetch YouTube videos when search query changes and source is YouTube
  useEffect(() => {
    if (searchSource === 'youtube' && searchQuery.trim()) {
      fetchYoutubeVideos();
    } else if (searchSource === 'local') {
      setYoutubeVideos([]);
    }
  }, [searchQuery, searchSource, fetchYoutubeVideos]);

  /* ── Handlers ── */
  const handleBookmark = async (videoId) => {
    try {
      const res = await client.post(`yoga/videos/${videoId}/bookmark/`);
      toast.success(res.data.status === 'bookmarked' ? '🔖 Bookmarked!' : 'Bookmark removed');
      fetchVideos();
    } catch (err) {
      toast.error('Failed to update bookmark.');
    }
  };

  const handleComplete = async (videoId) => {
    try {
      await client.post(`yoga/videos/${videoId}/complete/`);
      toast.success('🎉 Session logged! +20 XP earned!');
      fetchVideos();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to log session.';
      toast.error(msg);
    }
  };

  const handlePlay = (video) => setPlayingVideo(video);

  /* ── Render ── */
  return (
    <>
      {/* Scoped styles */}
      <style>{`
        .yoga-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.14);
        }
        .yoga-card:hover .yoga-play-overlay {
          opacity: 1 !important;
        }
        .yoga-tab-btn {
          padding: 9px 20px;
          border-radius: 99px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .yoga-tab-btn.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }
        .yoga-cat-btn {
          padding: 8px 16px;
          border-radius: 99px;
          border: 1.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .yoga-cat-btn.active {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }
        .yoga-cat-btn:hover:not(.active) {
          border-color: var(--primary);
          color: var(--primary);
        }
        .yoga-videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .yoga-section-title {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .yoga-rec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 640px) {
          .yoga-videos-grid { grid-template-columns: 1fr; }
          .yoga-rec-grid    { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="animate-fade-in">
        {/* ── Hero Header ── */}
        <div style={{
          borderRadius: 28, padding: '40px 44px', marginBottom: 32,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: 180, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
              MIND · BODY · SOUL
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: '900', marginBottom: 10 }}>
              🧘 Yoga & Meditation
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.98rem', maxWidth: 500, lineHeight: 1.65 }}>
              Transform your body and calm your mind. Choose from weight-loss flows, strength-building sequences, belly-fat burners, meditations, and more.
            </p>
          </div>
          <div style={{
            fontSize: '5.5rem',
            position: 'relative', zIndex: 1, flexShrink: 0,
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
            animation: 'heroFloat 3.5s ease-in-out infinite',
          }}>
            🧘‍♀️
          </div>
        </div>
        <style>{`@keyframes heroFloat { 0%,100%{transform:translateY(0) rotate(-2deg);} 50%{transform:translateY(-12px) rotate(2deg);} }`}</style>

        {/* ── Progress Stats ── */}
        {!loadingStats && <StatsRow stats={yogaStats} />}

        {/* ── Challenge Tracker ── */}
        {!loadingStats && <ChallengeTracker challenge={challengeData} stats={yogaStats} />}

        {/* ── Main Tabs ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'discover',  label: '🎥 Discover',   },
            { id: 'recommended', label: '⭐ For You',   },
            { id: 'bookmarks', label: '🔖 Saved',       },
          ].map(tab => (
            <button
              key={tab.id}
              className={`yoga-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB: DISCOVER ══════════════ */}
        {activeTab === 'discover' && (
          <>
            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexGrow: 1, minWidth: 220 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder={searchSource === 'youtube' ? 'Search YouTube for yoga & meditation videos…' : 'Search videos or instructors…'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (searchSource === 'youtube' ? fetchYoutubeVideos() : fetchVideos())}
                  style={{
                    width: '100%', padding: '10px 14px 10px 40px',
                    borderRadius: '12px', border: '1px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setYoutubeVideos([]); }}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  ><X size={14} /></button>
                )}
              </div>
              
              {/* Search Source Toggle */}
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
                <button
                  onClick={() => { setSearchSource('local'); setYoutubeVideos([]); fetchVideos(); }}
                  style={{
                    padding: '8px 14px', borderRadius: 8, border: 'none',
                    background: searchSource === 'local' ? 'var(--primary)' : 'transparent',
                    color: searchSource === 'local' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  📚 Library
                </button>
                <button
                  onClick={() => { setSearchSource('youtube'); }}
                  style={{
                    padding: '8px 14px', borderRadius: 8, border: 'none',
                    background: searchSource === 'youtube' ? '#ff0000' : 'transparent',
                    color: searchSource === 'youtube' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  YouTube
                </button>
              </div>
              
              <button 
                onClick={searchSource === 'youtube' ? fetchYoutubeVideos : fetchVideos} 
                className="btn btn-secondary" 
                style={{ padding: '10px 16px', display: 'flex', gap: 6, fontSize: '0.85rem' }}
              >
                <RefreshCw size={15} /> Search
              </button>
            </div>

            {/* Category chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`yoga-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span>{cat.emoji}</span> {cat.label}
                </button>
              ))}
            </div>

            {/* Videos grid */}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <Loader size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Loading yoga sessions…</p>
                </div>
              </div>
            ) : searchSource === 'youtube' ? (
              <>
                {loadingYoutube ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                      <Loader size={36} color="#ff0000" style={{ animation: 'spin 1s linear infinite' }} />
                      <p style={{ color: 'var(--text-muted)' }}>Searching YouTube…</p>
                    </div>
                  </div>
                ) : youtubeVideos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🔍</div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>No YouTube videos found</h3>
                    <p>Try a different search term or switch to Library mode.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.2rem' }}>📺</span>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {youtubeVideos.length} videos from YouTube
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {youtubeVideos.length > 0 && youtubeVideos[0].is_from_youtube ? 
                            'Results are fetched live from YouTube based on your search' : 
                            'Showing curated yoga & meditation videos (add YouTube API key for live search)'}
                        </p>
                      </div>
                    </div>
                    <div className="yoga-videos-grid">
                      {youtubeVideos.map((v, index) => (
                        <VideoCard 
                          key={`youtube-${index}`} 
                          video={{...v, id: `youtube-${index}`, is_bookmarked: false, is_completed_today: false}} 
                          onPlay={handlePlay} 
                          onBookmark={() => toast.info('Bookmarking YouTube videos is not available yet')} 
                          onComplete={() => toast.info('Completing YouTube videos is not available yet')} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : videos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🧘</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>No videos found</h3>
                <p>Try changing the category or search query.</p>
              </div>
            ) : (
              <div className="yoga-videos-grid">
                {videos.map(v => (
                  <VideoCard key={v.id} video={v} onPlay={handlePlay} onBookmark={handleBookmark} onComplete={handleComplete} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════ TAB: RECOMMENDED ══════════════ */}
        {activeTab === 'recommended' && (
          <>
            <div style={{
              borderRadius: 16, padding: '18px 22px', marginBottom: 24,
              background: 'var(--primary-light)', border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Star size={20} color="var(--primary)" />
              <div>
                <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Personalised for Your Goal
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  These sessions are tailored to your profile goal: <strong>{profile?.goal ? profile.goal.replace('_', ' ').toUpperCase() : 'LIFESTYLE'}</strong>
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Loader size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : recommended.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>⭐</div>
                <p>No recommendations yet. Update your profile goal to personalise.</p>
              </div>
            ) : (
              <div className="yoga-rec-grid">
                {recommended.map(v => (
                  <VideoCard key={v.id} video={v} onPlay={handlePlay} onBookmark={handleBookmark} onComplete={handleComplete} />
                ))}
              </div>
            )}

            {/* Category overview cards */}
            <div className="yoga-section-title" style={{ marginTop: 16 }}>
              <BarChart3 size={20} color="var(--primary)" /> Explore All Categories
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setActiveTab('discover'); }}
                  style={{
                    padding: '18px 20px', borderRadius: '16px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                >
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{cat.emoji}</div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{cat.label}</div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* ══════════════ TAB: BOOKMARKS ══════════════ */}
        {activeTab === 'bookmarks' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                🔖 Your saved yoga sessions — practice them anytime.
              </p>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Loader size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : bookmarked.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🔖</div>
                <h3 style={{ fontWeight: '700', marginBottom: 8 }}>No saved sessions yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                  Tap the bookmark icon on any video to save it for later.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('discover')}
                  style={{ display: 'inline-flex', gap: 8 }}
                >
                  <Search size={16} /> Browse Videos
                </button>
              </div>
            ) : (
              <div className="yoga-videos-grid">
                {bookmarked.map(v => (
                  <VideoCard key={v.id} video={v} onPlay={handlePlay} onBookmark={handleBookmark} onComplete={handleComplete} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Video Modal ── */}
      {playingVideo && <VideoModal video={playingVideo} onClose={() => setPlayingVideo(null)} />}

      {/* Shared animation keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
