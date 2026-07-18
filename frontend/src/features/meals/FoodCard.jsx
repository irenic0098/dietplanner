import React, { useState } from 'react';
import { Heart, Plus, GitCompare, BarChart3, Share2 } from 'lucide-react';
import { getHealthScoreColor, getHealthScoreLabel, getMacroColor, FALLBACK_IMAGE } from './foodMockData';
import toast from 'react-hot-toast';

function StarRow({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`fs-star ${s <= Math.round(rating) ? '' : 'empty'}`}>★</span>
      ))}
    </span>
  );
}

function MacroBadge({ label, value, unit, color }) {
  return (
    <div className="fs-macro-box">
      <span className="fs-macro-val" style={{ color }}>{value}{unit || ''}</span>
      <span className="fs-macro-lbl">{label}</span>
    </div>
  );
}

export default function FoodCard({ food, onOpen, onFavorite, favorites, onCompare, compareList, onAddDiary, animDelay = 0 }) {
  const [imgError, setImgError] = useState(false);
  const isFav = favorites?.includes(food.id);
  const isComparing = compareList?.includes(food.id);
  const compareDisabled = !isComparing && compareList?.length >= 3;

  const scoreColor = getHealthScoreColor(food.health_score);

  return (
    <div
      className="fs-card"
      style={{ animationDelay: `${animDelay}ms` }}
      onClick={() => onOpen(food)}
    >
      {/* Image */}
      <div className="fs-card-img-wrap">
        <img
          className="fs-card-img"
          src={imgError ? FALLBACK_IMAGE : (food.image || FALLBACK_IMAGE)}
          alt={food.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />

        {/* Badges */}
        <div className="fs-card-badges">
          {food.is_trending && <span className="fs-badge fs-badge-trending">🔥 Trending</span>}
          {food.is_verified && <span className="fs-badge fs-badge-verified">✓ Verified</span>}
          {food.community_submitted && <span className="fs-badge fs-badge-community">👥 Community</span>}
        </div>

        {/* Health Score */}
        <div className="fs-health-badge" style={{ background: scoreColor }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>{food.health_score}</span>
          <span style={{ fontSize: '0.5rem', opacity: 0.85, textTransform: 'uppercase' }}>Score</span>
        </div>

        {/* Actions overlay on hover */}
        <div className="fs-card-actions-overlay" onClick={e => e.stopPropagation()}>
          <button
            className="fs-overlay-btn primary"
            onClick={() => { onAddDiary?.(food); toast.success(`✅ Added ${food.name} to diary!`); }}
          >
            ➕ Diary
          </button>
          <button
            className="fs-overlay-btn"
            onClick={() => onOpen(food)}
          >
            📋 Details
          </button>
          <button
            className={`fs-overlay-btn ${isComparing ? 'primary' : ''} ${compareDisabled ? '' : ''}`}
            style={compareDisabled ? { opacity: 0.4 } : {}}
            onClick={() => {
              if (compareDisabled) { toast('Select up to 3 foods to compare', { icon: '⚠️' }); return; }
              onCompare?.(food);
            }}
          >
            🔄 Compare
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="fs-card-body">
        <div className="fs-card-name">{food.name}</div>
        <div className="fs-card-serving">Per {food.serving_size}</div>

        {/* Diet tags */}
        <div className="fs-card-diet-tags">
          {(food.diet_tags || []).slice(0, 3).map(t => (
            <span key={t} className="fs-diet-tag">{t}</span>
          ))}
          {food.gi_label && food.gi_label !== 'N/A' && (
            <span className="fs-diet-tag" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', borderColor: 'rgba(99,102,241,0.2)' }}>
              GI: {food.gi_label}
            </span>
          )}
        </div>

        {/* Macros */}
        <div className="fs-card-macros">
          <MacroBadge label="KCAL" value={food.calories} color={getMacroColor('calories')} />
          <MacroBadge label="PRO" value={food.protein} unit="g" color={getMacroColor('protein')} />
          <MacroBadge label="CARB" value={food.carbs} unit="g" color={getMacroColor('carbs')} />
          <MacroBadge label="FAT" value={food.fats} unit="g" color={getMacroColor('fats')} />
        </div>
      </div>

      {/* Footer */}
      <div className="fs-card-footer" onClick={e => e.stopPropagation()}>
        <div className="fs-card-rating">
          <StarRow rating={food.rating} />
          <span style={{ marginLeft: 4 }}>{food.rating} ({food.reviews_count})</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            className={`fs-compare-check-btn ${isComparing ? 'active' : ''}`}
            onClick={() => {
              if (compareDisabled) { toast('Max 3 foods for comparison', { icon: '⚠️' }); return; }
              onCompare?.(food);
            }}
          >
            <GitCompare size={12} /> {isComparing ? 'Comparing' : 'Compare'}
          </button>
          <button
            className={`fs-favorite-btn ${isFav ? 'active' : ''}`}
            onClick={() => { onFavorite?.(food.id); toast(isFav ? '💔 Removed from favorites' : '❤️ Saved to favorites!'); }}
            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart size={15} fill={isFav ? 'var(--danger)' : 'transparent'} />
          </button>
        </div>
      </div>
    </div>
  );
}
