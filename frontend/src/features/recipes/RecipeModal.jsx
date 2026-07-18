import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Heart, Clock, Star, Flame, Play, ChevronLeft, ChevronRight,
  ShoppingCart, CalendarPlus, Check, Pause, RotateCcw, Maximize2, Volume2
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Nutrition Ring ─────────────────────────────────────────────────────────────
function NutritionRing({ value, unit, name, color, max, delay = 0 }) {
  const r = 45, c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = c - pct * c;
  return (
    <div className="rcp-nut-ring-wrap">
      <svg width="100" height="100" className="rcp-nut-ring">
        <circle className="track" cx="50" cy="50" r={r} strokeWidth="7" />
        <circle
          className="fill" cx="50" cy="50" r={r} strokeWidth="7"
          stroke={color} strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ '--delay': `${delay}s` }}
        />
      </svg>
      <div style={{ textAlign: 'center', marginTop: -8 }}>
        <div className="rcp-nut-val" style={{ color }}>{value}{unit}</div>
        <div className="rcp-nut-name">{name}</div>
      </div>
    </div>
  );
}

// ── Cooking Mode Overlay ──────────────────────────────────────────────────────
function CookingMode({ recipe, onClose }) {
  const steps = recipe.instructions.split('\n').filter(s => s.trim());
  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning || timeLeft === null) return;
    if (timeLeft === 0) { setTimerRunning(false); toast.success('⏰ Timer done!'); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timeLeft]);

  const startTimer = (secs) => { setTimeLeft(secs); setTimerRunning(true); };
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const progress = ((stepIdx + 1) / steps.length) * 100;

  return (
    <div className="rcp-cooking-overlay">
      <div className="rcp-cooking-header">
        <span className="rcp-cooking-title">🍳 Cooking Mode — {recipe.title}</span>
        <button className="rcp-cooking-close" onClick={onClose}>✕ Exit</button>
      </div>

      <div className="rcp-cooking-progress" style={{ width: '100%', maxWidth: 640, marginTop: 80 }}>
        <div className="rcp-cooking-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', textAlign: 'right', width: '100%', maxWidth: 640, marginBottom: 24, marginTop: 6 }}>
        Step {stepIdx + 1} of {steps.length}
      </p>

      <div className="rcp-cooking-step-card">
        <div className="rcp-cooking-step-num">Step {stepIdx + 1}</div>
        <div className="rcp-cooking-step-text">{steps[stepIdx]}</div>

        {/* Timer */}
        <div className="rcp-cooking-timer">
          {timeLeft !== null ? fmt(timeLeft) : '--:--'}
        </div>
        <div className="rcp-cooking-timer-label">Built-in Timer</div>

        <div className="rcp-timer-btns" style={{ justifyContent: 'center', marginTop: 14 }}>
          {[60, 120, 180, 300, 600].map(s => (
            <button key={s} className={`rcp-timer-btn ${timeLeft === s && timerRunning ? 'active' : ''}`} onClick={() => startTimer(s)}>
              {s / 60 < 1 ? `${s}s` : `${s / 60}m`}
            </button>
          ))}
          {timeLeft !== null && (
            <>
              <button className="rcp-timer-btn" onClick={() => setTimerRunning(p => !p)}>
                {timerRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button className="rcp-timer-btn" onClick={() => { setTimeLeft(null); setTimerRunning(false); }}>
                <RotateCcw size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rcp-cooking-nav">
        <button className="rcp-cooking-nav-btn prev" onClick={() => setStepIdx(p => Math.max(0, p - 1))} disabled={stepIdx === 0}>
          <ChevronLeft size={18} /> Previous
        </button>
        {stepIdx < steps.length - 1 ? (
          <button className="rcp-cooking-nav-btn next" onClick={() => setStepIdx(p => p + 1)}>
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button className="rcp-cooking-nav-btn next" onClick={onClose} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            🎉 Finished!
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Ingredients', 'Instructions', 'Nutrition', 'Substitutions', 'AI Tips', 'Meal Plan'];

export default function RecipeModal({ recipe, onClose, onFavorite, onAddGrocery }) {
  const [tab, setTab] = useState('Overview');
  const [servings, setServings] = useState(recipe.servings || 2);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [activeStep, setActiveStep] = useState(null);
  const [cookingMode, setCookingMode] = useState(false);
  const [addedMeals, setAddedMeals] = useState([]);

  const scaleFactor = servings / (recipe.servings || 2);

  const scaleValue = (val) => {
    if (!val) return val;
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    const scaled = (num * scaleFactor).toFixed(num < 1 ? 2 : 1);
    return val.replace(/[\d.]+/, scaled);
  };

  const ingredients = recipe.ingredients
    ? recipe.ingredients.split('\n').filter(s => s.trim()).map(s => scaleValue(s))
    : [];
  const steps = recipe.instructions
    ? recipe.instructions.split('\n').filter(s => s.trim())
    : [];

  const toggleIngredient = (i) => setCheckedIngredients(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);
  const addMealSlot = (slot) => {
    setAddedMeals(p => p.includes(slot) ? p.filter(s => s !== slot) : [...p, slot]);
    toast.success(`Added to ${slot}!`);
  };

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (cookingMode) return <CookingMode recipe={recipe} onClose={() => setCookingMode(false)} />;

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="rcp-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rcp-modal" role="dialog" aria-label={recipe.title}>
        {/* Header Image */}
        <div className="rcp-modal-header-img">
          <img src={recipe.image} alt={recipe.title} />
          <div className="rcp-modal-header-overlay" />
          <button className="rcp-modal-close" onClick={onClose}><X size={16} /></button>
          <div className="rcp-modal-header-info">
            <div>
              <div className="rcp-modal-title">{recipe.title}</div>
              <div className="rcp-modal-chef">By {recipe.chef || 'Community Chef'} · {recipe.cuisine}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => onFavorite(recipe)}
                style={{
                  padding: '8px 16px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.3)',
                  background: recipe.is_favorite ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.15)',
                  color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)',
                }}
              >
                <Heart size={14} fill={recipe.is_favorite ? 'white' : 'transparent'} />
                {recipe.is_favorite ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => setCookingMode(true)}
                style={{
                  padding: '8px 16px', borderRadius: 999, border: 'none',
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Maximize2 size={14} /> Cook Now
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rcp-modal-quick-stats">
          <div className="rcp-qs-item"><Clock size={14} /> {recipe.prep_time}m prep</div>
          <div className="rcp-qs-sep" />
          <div className="rcp-qs-item"><Flame size={14} color="var(--danger)" /> {recipe.cook_time}m cook</div>
          <div className="rcp-qs-sep" />
          <div className="rcp-qs-item">⏱ {totalTime}m total</div>
          <div className="rcp-qs-sep" />
          <div className="rcp-qs-item">📊 {recipe.difficulty}</div>
          <div className="rcp-qs-sep" />
          <div className="rcp-qs-item"><Star size={13} color="#fbbf24" fill="#fbbf24" /> {recipe.rating} ({recipe.reviews_count})</div>
          <div className="rcp-qs-sep" />
          <div className="rcp-qs-item">💰 {recipe.estimated_cost}</div>
          <div className="rcp-qs-sep" />
          <div className="rcp-qs-item">🏥 GI: {recipe.glycemic_index}</div>
        </div>

        {/* Tabs */}
        <div className="rcp-modal-tabs">
          {TABS.map(t => (
            <button key={t} className={`rcp-modal-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="rcp-modal-body">
          {/* ── Overview ── */}
          {tab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>{recipe.description}</p>

              {/* Video */}
              {recipe.video_url && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Play size={16} color="var(--danger)" /> Video Tutorial
                  </h4>
                  <div className="rcp-video-wrap">
                    <iframe src={recipe.video_url} title="Recipe tutorial" allowFullScreen />
                  </div>
                </div>
              )}

              {/* Diet Tags */}
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: 10 }}>Diet Tags</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {recipe.diet_tags?.map(t => (
                    <span key={t} className="badge badge-success">{t}</span>
                  ))}
                  {recipe.goal_tags?.map(t => (
                    <span key={t} className="badge badge-info">{t}</span>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div style={{ background: 'var(--bg-primary)', padding: '16px 20px', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem' }}>📦</span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Storage & Shelf Life</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{recipe.storage}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Shelf life: {recipe.shelf_life}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Ingredients ── */}
          {tab === 'Ingredients' && (
            <div>
              {/* Scaling */}
              <div className="rcp-scale-row">
                <span style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>🍽 Servings:</span>
                <input
                  type="range" min={1} max={12} value={servings}
                  onChange={e => setServings(Number(e.target.value))}
                  className="rcp-slider"
                />
                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--primary)', minWidth: 28, textAlign: 'center' }}>{servings}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{recipe.yield_unit || 'servings'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontWeight: 700 }}>Ingredients <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>({ingredients.length} items)</span></h4>
                <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => onAddGrocery(recipe)}>
                  <ShoppingCart size={13} /> Add All to Grocery
                </button>
              </div>

              <div className="rcp-ingredient-list">
                {ingredients.map((item, i) => (
                  <div
                    key={i}
                    className={`rcp-ingredient-item ${checkedIngredients.includes(i) ? 'checked' : ''}`}
                    onClick={() => toggleIngredient(i)}
                  >
                    <div className="rcp-ingredient-check">
                      {checkedIngredients.includes(i) && <Check size={11} color="white" strokeWidth={3} />}
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Instructions ── */}
          {tab === 'Instructions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontWeight: 700 }}>Step-by-Step Instructions</h4>
                <button
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                  onClick={() => setCookingMode(true)}
                >
                  <Maximize2 size={13} /> Interactive Mode
                </button>
              </div>
              <div className="rcp-step-list">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={`rcp-step ${activeStep === i ? 'active' : ''}`}
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                  >
                    <div className="rcp-step-num">{i + 1}</div>
                    <div className="rcp-step-text">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Nutrition ── */}
          {tab === 'Nutrition' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 6 }}>Macronutrients per serving</h4>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span className="rcp-macro-chip badge" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '6px 14px', fontSize: '0.85rem' }}>
                    <Flame size={12} style={{ marginRight: 4 }} />{recipe.calories} kcal
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>GI: {recipe.glycemic_index} · Health Score: </span>
                  <span style={{ fontWeight: 900, color: '#10b981', alignSelf: 'center' }}>{recipe.health_score}/100</span>
                </div>
              </div>
              <div className="rcp-nutrition-grid">
                <NutritionRing value={recipe.protein} unit="g" name="Protein" color="#10b981" max={60} delay={0.1} />
                <NutritionRing value={recipe.carbs} unit="g" name="Carbs" color="#6366f1" max={100} delay={0.2} />
                <NutritionRing value={recipe.fats} unit="g" name="Fats" color="#f59e0b" max={50} delay={0.3} />
                <NutritionRing value={recipe.fiber} unit="g" name="Fiber" color="#84cc16" max={30} delay={0.4} />
                <NutritionRing value={recipe.sugar} unit="g" name="Sugar" color="#ec4899" max={50} delay={0.5} />
                <NutritionRing value={recipe.sodium} unit="mg" name="Sodium" color="#0ea5e9" max={2300} delay={0.6} />
              </div>

              {/* Vitamins & Minerals */}
              {recipe.vitamins && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Vitamins & Minerals (% Daily Value)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                    {Object.entries({ ...recipe.vitamins, ...recipe.minerals }).map(([name, val]) => (
                      <div key={name} style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: val, background: 'var(--primary)', borderRadius: 999 }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>{val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Substitutions ── */}
          {tab === 'Substitutions' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.88rem' }}>
                Smart ingredient swaps to match your dietary needs, allergies, or pantry availability.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recipe.substitutions?.map((sub, i) => (
                  <div key={i} className="rcp-sub-card">
                    <div>
                      <div className="rcp-sub-name">{sub.original}</div>
                    </div>
                    <div className="rcp-sub-arrow">→</div>
                    <div style={{ flex: 1 }}>
                      <div className="rcp-sub-name" style={{ color: 'var(--primary)' }}>{sub.substitute}</div>
                      <div className="rcp-sub-reason">{sub.reason}</div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Swap</span>
                  </div>
                ))}
              </div>
              {(!recipe.substitutions || recipe.substitutions.length === 0) && (
                <div className="rcp-empty">
                  <div className="rcp-empty-icon">🔄</div>
                  <div className="rcp-empty-title">No substitutions listed</div>
                </div>
              )}
            </div>
          )}

          {/* ── AI Tips ── */}
          {tab === 'AI Tips' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.88rem' }}>
                🤖 AI-powered nutrition tips personalised for this recipe.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recipe.ai_tips?.map((tip, i) => (
                  <div key={i} className="rcp-ai-tip" style={{ '--delay': `${i * 0.1}s` }}>
                    <span className="rcp-ai-tip-icon">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
              {/* Leftover suggestion */}
              <div style={{ marginTop: 24, background: 'var(--bg-primary)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ♻️ Leftover Suggestion
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Leftover {recipe.title.split(' ')[0]}? Chop and toss into a salad, wrap it in a whole wheat roti, or blend into a soup for zero food waste!
                </p>
              </div>
            </div>
          )}

          {/* ── Meal Plan ── */}
          {tab === 'Meal Plan' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.88rem' }}>
                Add this recipe to your weekly meal plan. Nutrition goals will update automatically.
              </p>
              <div className="rcp-meal-btns">
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(slot => (
                  <button
                    key={slot}
                    className={`rcp-meal-btn ${addedMeals.includes(slot) ? 'added' : ''}`}
                    onClick={() => addMealSlot(slot)}
                  >
                    <span style={{ fontSize: '1.4rem' }}>
                      {slot === 'Breakfast' ? '🌅' : slot === 'Lunch' ? '☀️' : slot === 'Dinner' ? '🌙' : '🍎'}
                    </span>
                    {slot}
                    {addedMeals.includes(slot) && <Check size={12} />}
                  </button>
                ))}
              </div>

              {addedMeals.length > 0 && (
                <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)' }}>
                    ✅ Added to {addedMeals.join(', ')} — nutrition goals updated!
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    This recipe contributes {recipe.calories} kcal and {recipe.protein}g protein to your daily goal.
                  </p>
                </div>
              )}

              {/* Weekly planner mini */}
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Quick Week Planner</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '8px 6px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', transition: 'all 0.2s' }}
                      onClick={() => toast.success(`Added to ${d}!`)}
                    >
                      {d}<div style={{ fontSize: '0.9rem', marginTop: 4 }}>+</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
