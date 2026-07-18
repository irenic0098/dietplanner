import React, { useState } from 'react';
import { X, Heart, Plus, Share2, Lightbulb, GitCompare } from 'lucide-react';
import { getHealthScoreColor, getHealthScoreLabel, getMacroColor, getGIColor, FALLBACK_IMAGE } from './foodMockData';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Nutrition', 'Glycemic', 'Ingredients', 'Reviews', 'AI Insights', 'Alternatives'];

function NutrientBar({ name, value, max = 100, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="fs-nutrient-bar-item">
      <div className="fs-nutrient-bar-label">
        <span className="fs-nutrient-bar-name">{name}</span>
        <span className="fs-nutrient-bar-pct">{value}% RDA</span>
      </div>
      <div className="fs-nutrient-track">
        <div className="fs-nutrient-fill" style={{ width: `${pct}%`, background: color || 'var(--primary)' }} />
      </div>
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`fs-star ${s <= Math.round(rating) ? '' : 'empty'}`}>★</span>
      ))}
    </span>
  );
}

export default function FoodDetailModal({ food, onClose, onFavorite, isFavorite, onAddDiary, onCompare }) {
  const [tab, setTab] = useState('Overview');
  const [servings, setServings] = useState(1);

  const scoreColor = getHealthScoreColor(food.health_score);
  const scoreLabel = getHealthScoreLabel(food.health_score);

  const scaled = (val) => Math.round((val || 0) * servings * 10) / 10;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fs-modal-backdrop" onClick={handleBackdropClick}>
      <div className="fs-modal">
        {/* Hero image */}
        <div className="fs-modal-hero">
          <img
            className="fs-modal-hero-img"
            src={food.image || FALLBACK_IMAGE}
            alt={food.name}
            onError={e => { e.target.src = FALLBACK_IMAGE; }}
          />
          <div className="fs-modal-hero-overlay">
            <div className="fs-modal-hero-info">
              <div className="fs-modal-name">{food.name}</div>
              <div className="fs-modal-serving">Per {food.serving_size} · {food.category} · {food.cuisine}</div>
            </div>
            <div className="fs-modal-health-score" style={{ background: `${scoreColor}cc` }}>
              <span className="fs-modal-score-num">{food.health_score}</span>
              <span className="fs-modal-score-lbl">{scoreLabel}</span>
            </div>
          </div>
          <button className="fs-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="fs-modal-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`fs-modal-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
        </div>

        {/* Body */}
        <div className="fs-modal-body">

          {/* ── Overview ─────────────────────────────────────────────────────── */}
          {tab === 'Overview' && (
            <div>
              {/* Serving scaler */}
              <div className="fs-scaler">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Servings:</span>
                <button className="fs-scaler-btn" onClick={() => setServings(s => Math.max(0.5, s - 0.5))}>−</button>
                <span className="fs-scaler-val">{servings}</span>
                <button className="fs-scaler-btn" onClick={() => setServings(s => Math.min(10, s + 0.5))}>+</button>
                <span className="fs-scaler-unit">× {food.serving_size}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 900, color: getMacroColor('calories'), fontSize: '1.1rem' }}>
                  {scaled(food.calories)} kcal
                </span>
              </div>

              {/* Macro cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { key: 'calories', label: 'Calories', unit: 'kcal' },
                  { key: 'protein', label: 'Protein', unit: 'g' },
                  { key: 'carbs', label: 'Carbs', unit: 'g' },
                  { key: 'fats', label: 'Fats', unit: 'g' },
                ].map(m => (
                  <div key={m.key} style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '14px 12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: getMacroColor(m.key) }}>{scaled(food[m.key])}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>{m.unit} {m.label}</div>
                  </div>
                ))}
              </div>

              {/* More macros row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Fiber', val: scaled(food.fiber), unit: 'g', color: getMacroColor('fiber') },
                  { label: 'Sugar', val: scaled(food.sugar), unit: 'g', color: getMacroColor('sugar') },
                  { label: 'Sodium', val: scaled(food.sodium), unit: 'mg', color: getMacroColor('sodium') },
                ].map(m => (
                  <div key={m.label} style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: m.color }}>{m.val}<span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{m.unit}</span></div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Health explanation */}
              <div className="fs-ai-card">
                <div className="fs-ai-title">🏥 Health Assessment</div>
                <div className="fs-ai-content">
                  {food.name} scores <strong style={{ color: scoreColor }}>{food.health_score}/100</strong> ({scoreLabel}).{' '}
                  {food.health_score >= 85
                    ? `This food is an excellent choice — high in nutrients, low in harmful components.`
                    : food.health_score >= 70
                    ? `A good choice for most diets. Consume in appropriate portions.`
                    : `Moderate choice — watch portion sizes and pair with more nutritious foods.`}
                </div>
              </div>

              {/* Allergen info */}
              {food.allergens && food.allergens.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>⚠️ Allergen Information</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {food.allergens.map(a => <span key={a} className="fs-allergen-chip">⚠️ Contains {a}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Nutrition ─────────────────────────────────────────────────────── */}
          {tab === 'Nutrition' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 16, color: 'var(--text-primary)' }}>
                Vitamins (% Daily Value per serving)
              </div>
              <div className="fs-nutrient-bar-row" style={{ marginBottom: 24 }}>
                {Object.entries(food.vitamins || {}).map(([k, v]) => (
                  <NutrientBar key={k} name={`Vitamin ${k}`} value={v} color="var(--accent)" />
                ))}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 16, color: 'var(--text-primary)' }}>
                Minerals (% Daily Value per serving)
              </div>
              <div className="fs-nutrient-bar-row" style={{ marginBottom: 24 }}>
                {Object.entries(food.minerals || {}).map(([k, v]) => (
                  <NutrientBar key={k} name={k} value={v} color="var(--primary)" />
                ))}
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['Cholesterol', `${food.cholesterol || 0}mg`],
                    ['Saturated Fat', `${food.saturated_fat || 0}g`],
                    ['Potassium', `${food.potassium || 0}mg`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', gridColumn: '1/-1' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{k}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Glycemic ─────────────────────────────────────────────────────── */}
          {tab === 'Glycemic' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 6, color: 'var(--text-primary)' }}>
                Glycemic Index (GI): <span style={{ color: getGIColor(food.glycemic_index) }}>{food.gi_label}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                GI measures how quickly a food raises blood sugar. Lower is better for sustained energy.
              </div>
              <div className="fs-gi-bar">
                <div
                  className="fs-gi-pointer"
                  style={{
                    left: food.glycemic_index === 0
                      ? '0%'
                      : `${Math.min(98, (food.glycemic_index / 100) * 100)}%`
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                <span>0 — Very Low</span><span>55 — Low</span><span>70 — Medium</span><span>100+ — High</span>
              </div>
              <div className="fs-ai-card">
                <div className="fs-ai-title">🩺 GI Explanation</div>
                <div className="fs-ai-content">
                  {food.glycemic_index === 0
                    ? `${food.name} has no glycemic index (N/A) — it's a protein/fat food with negligible carbs.`
                    : food.glycemic_index <= 55
                    ? `GI of ${food.glycemic_index} is LOW — excellent for diabetics, PCOS, and sustained energy. Blood sugar rises slowly.`
                    : food.glycemic_index <= 70
                    ? `GI of ${food.glycemic_index} is MEDIUM — suitable for most people, watch portions if managing blood sugar.`
                    : `GI of ${food.glycemic_index} is HIGH — can cause rapid blood sugar spikes. Pair with protein and fiber to reduce impact.`}
                </div>
              </div>
            </div>
          )}

          {/* ── Ingredients ─────────────────────────────────────────────────── */}
          {tab === 'Ingredients' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 14, color: 'var(--text-primary)' }}>
                🧾 Ingredient List
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(food.ingredients || []).map((ing, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{ing}</span>
                    {food.allergens?.some(a => ing.toLowerCase().includes(a.toLowerCase())) && (
                      <span className="fs-allergen-chip" style={{ marginLeft: 'auto' }}>⚠️ Allergen</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Reviews ─────────────────────────────────────────────────────── */}
          {tab === 'Reviews' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{food.rating}</div>
                  <StarRating rating={food.rating} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{food.reviews_count} reviews</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const pct = star === 5 ? 65 : star === 4 ? 20 : star === 3 ? 10 : 3;
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 20 }}>{star}★</span>
                        <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 28 }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {(food.reviews || []).map((rev, i) => (
                <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: '1.2rem' }}>{rev.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{rev.user}</div>
                      <StarRating rating={rev.rating} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{rev.comment}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── AI Insights ─────────────────────────────────────────────────── */}
          {tab === 'AI Insights' && (
            <div>
              <div className="fs-ai-card">
                <div className="fs-ai-title"><span>🤖</span> AI Nutrition Summary</div>
                <div className="fs-ai-content">{food.ai_tips?.[0]}</div>
              </div>
              <div className="fs-ai-card">
                <div className="fs-ai-title"><span>💡</span> AI Portion Recommendation</div>
                <div className="fs-ai-content">{food.ai_portion}</div>
              </div>
              <div className="fs-ai-card">
                <div className="fs-ai-title"><span>🌿</span> AI Healthy Alternative</div>
                <div className="fs-ai-content">{food.ai_alternative}</div>
              </div>
              {food.ai_tips?.slice(1).map((tip, i) => (
                <div key={i} className="fs-ai-card">
                  <div className="fs-ai-title"><span>✨</span> AI Tip {i + 2}</div>
                  <div className="fs-ai-content">{tip}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Alternatives ────────────────────────────────────────────────── */}
          {tab === 'Alternatives' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 14, color: 'var(--text-primary)' }}>
                🔄 Similar Foods & Alternatives
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { name: food.ai_alternative?.split('(')[0]?.trim() || 'Alternative', note: food.ai_alternative || '' },
                ].map((alt, i) => (
                  <div key={i} style={{ padding: '14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>{alt.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alt.note}</div>
                    <button
                      className="btn btn-secondary"
                      style={{ marginTop: 10, width: '100%', padding: '7px', fontSize: '0.75rem' }}
                      onClick={() => toast(`Searching for ${alt.name}...`)}
                    >
                      Search →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="fs-modal-actions">
          <button
            className="fs-modal-action-btn primary"
            onClick={() => { onAddDiary?.(food); toast.success(`✅ Added ${food.name} to Today's Diary!`); }}
          >
            <Plus size={13} /> Add to Diary
          </button>
          <button
            className={`fs-modal-action-btn ${isFavorite ? 'primary' : ''}`}
            onClick={() => { onFavorite?.(food.id); toast(isFavorite ? '💔 Removed from favorites' : '❤️ Saved to favorites!'); }}
          >
            <Heart size={13} fill={isFavorite ? '#fff' : 'transparent'} /> {isFavorite ? 'Saved' : 'Save'}
          </button>
          <button
            className="fs-modal-action-btn"
            onClick={() => { onCompare?.(food); toast(`Added ${food.name} to comparison!`); }}
          >
            <GitCompare size={13} /> Compare
          </button>
          <button
            className="fs-modal-action-btn"
            onClick={() => { navigator.clipboard?.writeText(food.name); toast.success('Copied food name!'); }}
          >
            <Share2 size={13} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
