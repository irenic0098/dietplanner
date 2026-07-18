import React from 'react';
import { Heart, Clock, Star, ShoppingCart, CalendarPlus, Flame } from 'lucide-react';

function MacroBar({ protein, carbs, fats }) {
  const total = protein + carbs + fats || 1;
  return (
    <div className="rcp-macro-bar" title={`P:${protein}g C:${carbs}g F:${fats}g`}>
      <div className="rcp-macro-seg" style={{ width: `${(protein / total) * 100}%`, background: 'var(--primary)', '--delay': '0.2s' }} />
      <div className="rcp-macro-seg" style={{ width: `${(carbs / total) * 100}%`, background: 'var(--accent)', '--delay': '0.3s' }} />
      <div className="rcp-macro-seg" style={{ width: `${(fats / total) * 100}%`, background: 'var(--warning)', '--delay': '0.4s' }} />
    </div>
  );
}

export default function RecipeCard({ recipe, onOpen, onFavorite, onAddGrocery, onAddMeal, delay = 0 }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const healthColor = recipe.health_score >= 90 ? '#10b981' : recipe.health_score >= 75 ? '#f59e0b' : '#ef4444';

  const handleFav = (e) => { e.stopPropagation(); onFavorite(recipe); };
  const handleGrocery = (e) => { e.stopPropagation(); onAddGrocery(recipe); };
  const handleMeal = (e) => { e.stopPropagation(); onAddMeal(recipe); };

  return (
    <div
      className="rcp-card"
      onClick={() => onOpen(recipe)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div className="rcp-card-img-wrap">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="rcp-card-img"
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'; }}
        />
        <div className="rcp-card-img-overlay" />

        {/* Diet tags */}
        <div className="rcp-card-img-tags">
          {recipe.diet_tags?.slice(0, 2).map(t => (
            <span key={t} className="rcp-img-tag">{t}</span>
          ))}
        </div>

        {/* Health score badge */}
        {recipe.health_score && (
          <div className="rcp-health-badge">
            <span className="score" style={{ color: healthColor }}>{recipe.health_score}</span>
            <span className="label">Score</span>
          </div>
        )}

        {/* Bottom meta overlay */}
        <div className="rcp-card-bottom-meta">
          <span className="rcp-card-time">
            <Clock size={13} />
            {totalTime} min
          </span>
          {recipe.rating && (
            <span className="rcp-card-rating">
              <Star size={13} fill="#fbbf24" />
              {recipe.rating}
            </span>
          )}
        </div>

        {/* Hover action tray */}
        <div className="rcp-card-actions">
          <button
            className="rcp-action-btn"
            style={{ background: recipe.is_favorite ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.15)' }}
            onClick={handleFav}
            title="Favourite"
          >
            <Heart size={13} fill={recipe.is_favorite ? 'white' : 'transparent'} />
            Save
          </button>
          <button
            className="rcp-action-btn"
            style={{ background: 'rgba(16,185,129,0.7)' }}
            onClick={handleGrocery}
            title="Add to Grocery List"
          >
            <ShoppingCart size={13} />
            Grocery
          </button>
          <button
            className="rcp-action-btn"
            style={{ background: 'rgba(99,102,241,0.7)' }}
            onClick={handleMeal}
            title="Add to Meal Plan"
          >
            <CalendarPlus size={13} />
            Plan
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="rcp-card-body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 className="rcp-card-title">{recipe.title}</h3>
          <button
            onClick={handleFav}
            style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px', marginTop: 2 }}
          >
            <Heart
              size={18}
              fill={recipe.is_favorite ? 'var(--danger)' : 'transparent'}
              color={recipe.is_favorite ? 'var(--danger)' : 'var(--text-muted)'}
            />
          </button>
        </div>

        <p className="rcp-card-desc">{recipe.description}</p>

        {/* Macro bar */}
        <MacroBar protein={recipe.protein} carbs={recipe.carbs} fats={recipe.fats} />

        {/* Footer stats */}
        <div className="rcp-card-meta-row">
          <div className="rcp-macro-chips">
            <span className="rcp-macro-chip" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
              <Flame size={10} style={{ display: 'inline', marginRight: 3 }} />{recipe.calories} kcal
            </span>
            <span className="rcp-macro-chip" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--primary)' }}>
              {recipe.protein}g P
            </span>
            <span className="rcp-macro-chip" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent)' }}>
              {recipe.carbs}g C
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {recipe.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}
