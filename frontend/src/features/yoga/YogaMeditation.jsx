import React, { useState, useEffect, useCallback, useRef } from 'react';
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
          src={video.thumbnail_url || (
            video.video_source === 'dailymotion' || video.is_from_dailymotion
              ? `https://www.dailymotion.com/thumbnail/video/${video.youtube_id}`
              : `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`
          )}
          alt={video.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onError={e => {
            const img = e.currentTarget;
            if (video.thumbnail_url && img.src === video.thumbnail_url) {
              img.src = video.video_source === 'dailymotion' || video.is_from_dailymotion
                ? `https://www.dailymotion.com/thumbnail/video/${video.youtube_id}`
                : `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
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
            src={video.video_source === 'dailymotion' || video.is_from_dailymotion
              ? `https://www.dailymotion.com/embed/video/${video.youtube_id}?autoplay=1`
              : `https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&rel=0`
            }
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

  const [videos,            setVideos]            = useState([]);
  const [filteredVideos,    setFilteredVideos]    = useState([]);
  const [recommended,       setRecommended]       = useState([]);
  const [bookmarked,        setBookmarked]        = useState([]);
  const [challengeData,     setChallengeData]     = useState(null);
  const [yogaStats,         setYogaStats]         = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [loadingStats,      setLoadingStats]      = useState(true);
  const [youtubeVideos,     setYoutubeVideos]     = useState([]);
  const [loadingYoutube,    setLoadingYoutube]    = useState(false);
  const [loadingMore,       setLoadingMore]       = useState(false);
  const [ytPage,            setYtPage]            = useState(1);
  const [ytHasMore,         setYtHasMore]         = useState(false);
  const [searchSource,      setSearchSource]      = useState('youtube');
  const [completedTodayIds, setCompletedTodayIds] = useState([]);

  const [activeCategory,  setActiveCategory]  = useState('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [activeTab,       setActiveTab]       = useState('discover');
  const [playingVideo,    setPlayingVideo]    = useState(null);

  // Refs for infinite scroll
  const sentinelRef    = useRef(null);
  const currentQueryRef = useRef({ query: '', category: 'all' }); // track what we're paginating

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

  // Core fetch — page 1 (replaces results), or page N (appends)
  const fetchYoutubeVideos = useCallback(async (overrideQuery, overrideCategory, page = 1, append = false) => {
    const query = overrideQuery !== undefined ? overrideQuery : searchQuery.trim();
    const cat   = overrideCategory !== undefined ? overrideCategory : activeCategory;

    if (!query && cat === 'all') {
      setYoutubeVideos([]);
      setYtHasMore(false);
      return;
    }

    // Track what search we're currently serving (for stale response detection)
    currentQueryRef.current = { query, category: cat };
    const thisSearch = { query, category: cat };

    if (append) setLoadingMore(true);
    else        setLoadingYoutube(true);

    try {
      const params = new URLSearchParams();
      const effectiveQuery = query || cat.replace(/_/g, ' ');
      params.set('query', effectiveQuery);
      if (cat !== 'all') params.set('category', cat);
      params.set('max_results', '20');
      params.set('page', page);

      const res = await client.get(`yoga/videos/youtube_search/?${params}`);

      // Ignore stale responses (user may have changed search while request was in flight)
      if (currentQueryRef.current.query !== thisSearch.query ||
          currentQueryRef.current.category !== thisSearch.category) return;

      const newVideos = res.data.results || [];
      const hasMore   = res.data.has_more ?? (newVideos.length >= 20);

      if (append) {
        setYoutubeVideos(prev => {
          // Deduplicate by youtube_id
          const existingIds = new Set(prev.map(v => v.youtube_id));
          return [...prev, ...newVideos.filter(v => !existingIds.has(v.youtube_id))];
        });
      } else {
        setYoutubeVideos(newVideos);
      }
      setYtPage(page);
      setYtHasMore(hasMore);
    } catch (err) {
      console.error(err);
      if (!append) toast.error('Could not load videos. Please try again.');
    } finally {
      if (append) setLoadingMore(false);
      else        setLoadingYoutube(false);
    }
  }, [searchQuery, activeCategory]);

  // Load next page
  const loadMoreVideos = useCallback(() => {
    if (loadingMore || loadingYoutube || !ytHasMore) return;
    const q   = currentQueryRef.current.query;
    const cat = currentQueryRef.current.category;
    fetchYoutubeVideos(q, cat, ytPage + 1, true);
  }, [loadingMore, loadingYoutube, ytHasMore, ytPage, fetchYoutubeVideos]);

  // IntersectionObserver — fires when sentinel enters viewport
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMoreVideos(); },
      { rootMargin: '300px' }  // start loading 300px before visible
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMoreVideos]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await client.get('yoga/stats/');
      setYogaStats(res.data.stats);
      setChallengeData(res.data.challenge);
      
      // Parse today's completed youtube_ids
      const todayStr = new Date().toISOString().split('T')[0];
      const completedToday = (res.data.logs || [])
        .filter(log => log.completed_at === todayStr)
        .map(log => log.video_details?.youtube_id)
        .filter(Boolean);
      setCompletedTodayIds(completedToday);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  
  // Auto-search when category changes — reset to page 1
  useEffect(() => {
    setYtPage(1);
    if (activeCategory !== 'all') {
      fetchYoutubeVideos('', activeCategory, 1, false);
    } else if (!searchQuery.trim()) {
      setYoutubeVideos([]);
      setYtHasMore(false);
    }
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleYoutubeInteract = async (video, actionType) => {
    try {
      const res = await client.post('yoga/videos/youtube_interact/', {
        youtube_id: video.youtube_id,
        action: actionType,
        title: video.title,
        instructor: video.instructor,
        thumbnail_url: video.thumbnail_url,
        duration_mins: video.duration_mins,
        category: video.category,
        difficulty: video.difficulty,
        calorie_burn: video.calorie_burn,
        flexibility: video.flexibility,
        relaxation: video.relaxation,
        strength: video.strength,
        video_source: video.video_source || 'youtube',
      });
      
      if (actionType === 'bookmark') {
        toast.success(res.data.status === 'bookmarked' ? '🔖 Bookmarked!' : 'Bookmark removed');
      } else {
        toast.success('🎉 Session logged! +20 XP earned!');
      }
      
      fetchVideos();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.error || `Failed to ${actionType} video.`;
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
            {/* YouTube-style Search Bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 0,
                background: 'var(--bg-card)',
                border: '2px solid var(--border)',
                borderRadius: '28px',
                overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.15)'; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
              >
                <Search size={18} style={{ flexShrink: 0, marginLeft: 20, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search for yoga, meditation, wellness videos…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setYtPage(1); setActiveCategory('all'); fetchYoutubeVideos(undefined, 'all', 1, false); } }}
                  style={{
                    flex: 1, padding: '14px 16px',
                    border: 'none', background: 'transparent',
                    color: 'var(--text-primary)', fontSize: '1rem',
                    outline: 'none',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setYoutubeVideos([]); setActiveCategory('all'); setYtPage(1); setYtHasMore(false); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 12px', flexShrink: 0 }}
                  ><X size={16} /></button>
                )}
                <button
                  onClick={() => { setYtPage(1); setActiveCategory('all'); fetchYoutubeVideos(undefined, 'all', 1, false); }}
                  disabled={!searchQuery.trim()}
                  style={{
                    padding: '14px 24px', border: 'none', flexShrink: 0,
                    background: searchQuery.trim() ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: searchQuery.trim() ? '#fff' : 'var(--text-muted)',
                    fontWeight: '700', fontSize: '0.9rem', cursor: searchQuery.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                  }}
                >
                  <Search size={16} /> Search
                </button>
              </div>
            </div>

            {/* Category chips — clicking auto-searches */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`yoga-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id !== 'all') {
                      setSearchQuery('');
                    }
                  }}
                >
                  <span>{cat.emoji}</span> {cat.label}
                </button>
              ))}
            </div>

            {/* Videos grid */}
            {loadingYoutube ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <Loader size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Loading videos…</p>
                </div>
              </div>
            ) : searchQuery.trim() || activeCategory !== 'all' ? (
              /* Search/category active state */
              youtubeVideos.length > 0 ? (
                <>
                  <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.2rem' }}>📺</span>
                      <div>
                        <h3 style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          Search Results
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          {youtubeVideos[0]?.is_from_youtube ? 'Live results from YouTube' :
                           youtubeVideos[0]?.is_from_dailymotion ? 'Results from Dailymotion' :
                           'Curated yoga & meditation videos'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setYtPage(1); fetchYoutubeVideos(currentQueryRef.current.query, currentQueryRef.current.category, 1, false); }}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <RefreshCw size={13} /> Refresh
                    </button>
                  </div>
                  <div className="yoga-videos-grid">
                    {youtubeVideos.map((v, index) => {
                      const isBookmarked = bookmarked.some(b => b.youtube_id === v.youtube_id);
                      const isCompleted = completedTodayIds.includes(v.youtube_id);
                      return (
                        <VideoCard
                          key={`yt-${index}`}
                          video={{ ...v, id: v.youtube_id, is_bookmarked: isBookmarked, is_completed_today: isCompleted }}
                          onPlay={handlePlay}
                          onBookmark={() => handleYoutubeInteract(v, 'bookmark')}
                          onComplete={() => handleYoutubeInteract(v, 'complete')}
                        />
                      );
                    })}
                  </div>

                  {/* Sentinel div — IntersectionObserver watches this to trigger next page */}
                  <div ref={sentinelRef} style={{ height: 1, marginTop: 8 }} />

                  {/* Load more spinner */}
                  {loadingMore && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600' }}>Loading more videos…</span>
                    </div>
                  )}

                  {/* End of results */}
                  {!loadingMore && !ytHasMore && youtubeVideos.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      <div style={{ width: 40, height: 1, background: 'var(--border)', display: 'inline-block', marginRight: 12, verticalAlign: 'middle' }} />
                      You've reached the end
                      <div style={{ width: 40, height: 1, background: 'var(--border)', display: 'inline-block', marginLeft: 12, verticalAlign: 'middle' }} />
                    </div>
                  )}
                </>
              ) : (
                /* No results state */
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔍</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: 8 }}>No videos found</h3>
                  <p style={{ marginBottom: 20 }}>Try a different search term or browse a category below.</p>
                  <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setYoutubeVideos([]); setActiveCategory('all'); }}>Clear Search</button>
                </div>
              )
            ) : (
              /* Idle state — show library or prompt to search */
              <>
                {videos.length > 0 ? (
                  <>
                    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>📚 Your Library</h3>
                      <span style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 99, fontWeight: '700' }}>{videos.length} videos</span>
                    </div>
                    <div className="yoga-videos-grid">
                      {videos.map(v => (
                        <VideoCard key={v.id} video={v} onPlay={handlePlay} onBookmark={handleBookmark} onComplete={handleComplete} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔍</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: 8 }}>Search for videos</h3>
                    <p style={{ fontSize: '0.88rem' }}>Type anything above — yoga, meditation, breathing, sleep…</p>
                  </div>
                )}
              </>
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
