import React, { useState } from 'react';
import { Heart, ThumbsUp } from 'lucide-react';
import { COMMUNITY_FOODS, getMacroColor, FALLBACK_IMAGE } from './foodMockData';
import toast from 'react-hot-toast';

const COMMUNITY_TABS = ['Most Popular', 'Recently Added', 'Verified'];

function StarRow({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`fs-star ${s <= Math.round(rating) ? '' : 'empty'}`} style={{ fontSize: '0.7rem' }}>★</span>
      ))}
    </span>
  );
}

export default function FoodCommunitySection({ onOpenDetail }) {
  const [activeTab, setActiveTab] = useState('Most Popular');
  const [likedIds, setLikedIds] = useState([]);

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLikedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    toast(likedIds.includes(id) ? '💔 Unliked' : '👍 Liked!');
  };

  let displayed = [...COMMUNITY_FOODS];
  if (activeTab === 'Verified') displayed = displayed.filter(f => f.is_verified);
  else if (activeTab === 'Recently Added') displayed = [...displayed].reverse();
  else displayed = [...displayed].sort((a, b) => b.likes - a.likes);

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            👥 Community Foods
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            User-submitted recipes & whole foods with community ratings
          </p>
        </div>
        <button
          onClick={() => toast('Submit your custom food to the community!', { icon: '🎉' })}
          style={{ padding: '8px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}
        >
          + Submit Food
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="fs-tabs" style={{ marginBottom: 20 }}>
        {COMMUNITY_TABS.map(t => (
          <button key={t} className={`fs-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="fs-community-grid">
        {displayed.map((food) => (
          <div
            key={food.id}
            className="fs-community-card"
            onClick={() => onOpenDetail && onOpenDetail(food)}
          >
            <div style={{ position: 'relative' }}>
              <img
                className="fs-community-img"
                src={food.image || FALLBACK_IMAGE}
                alt={food.name}
                onError={e => { e.target.src = FALLBACK_IMAGE; }}
              />
              {food.is_verified && (
                <span style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: 50, background: 'rgba(16,185,129,0.9)', color: '#fff', fontSize: '0.62rem', fontWeight: 800 }}>
                  ✓ Verified
                </span>
              )}
            </div>
            <div className="fs-community-body">
              <div className="fs-community-user">
                <div className="fs-community-avatar">{food.avatar}</div>
                <div>
                  <div className="fs-community-uname">@{food.user}</div>
                  <div className="fs-community-time">{food.timeAgo}</div>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 6 }}>{food.name}</div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {food.tags.map(t => (
                  <span key={t} className="fs-diet-tag">{t}</span>
                ))}
              </div>

              {/* Macros mini */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {[
                  { label: 'Kcal', val: food.calories, color: getMacroColor('calories') },
                  { label: 'Protein', val: food.protein + 'g', color: getMacroColor('protein') },
                  { label: 'Carbs', val: food.carbs + 'g', color: getMacroColor('carbs') },
                ].map(m => (
                  <div key={m.label} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-primary)', borderRadius: 6, padding: '6px 4px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 900, fontSize: '0.85rem', color: m.color }}>{m.val}</div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <StarRow rating={food.rating} />
                  <span>{food.rating} ({food.reviews})</span>
                </div>
                <button
                  onClick={(e) => toggleLike(food.id, e)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 50, border: '1px solid var(--border)', background: likedIds.includes(food.id) ? 'var(--primary-light)' : 'var(--bg-primary)', color: likedIds.includes(food.id) ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}
                >
                  <ThumbsUp size={11} />
                  {food.likes + (likedIds.includes(food.id) ? 1 : 0)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
