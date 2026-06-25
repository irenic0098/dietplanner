import React, { useState } from 'react';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Salad,
  Flame,
  Dumbbell,
  Droplets,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Download,
  Apple,
  CheckCircle,
} from 'lucide-react';

const GOAL_LABELS = {
  loss: { label: 'Weight Loss', emoji: '🔥', color: '#ef4444' },
  gain: { label: 'Muscle Gain', emoji: '💪', color: '#6366f1' },
  maintenance: { label: 'Maintenance', emoji: '⚖️', color: '#0ea5e9' },
  lifestyle: { label: 'Healthy Lifestyle', emoji: '🌿', color: '#10b981' },
};

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary (little/no exercise)',
  lightly_active: 'Lightly Active (1–3 days/week)',
  moderately_active: 'Moderately Active (3–5 days/week)',
  very_active: 'Very Active (6–7 days/week)',
  extra_active: 'Extra Active (hard job/exercise)',
};

export default function DietPlanGenerator() {
  const { profile } = useAuthStore();

  const [form, setForm] = useState({
    age: profile?.age || '',
    weight: profile?.weight || '',
    height: profile?.height || '',
    gender: profile?.gender || 'male',
    goal: profile?.goal || 'lifestyle',
    activity_level: profile?.activity_level || 'sedentary',
    diet_preference: profile?.diet_preference || 'anything',
  });

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDay, setOpenDay] = useState(0);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);
    try {
      const res = await client.post('auth/generate-diet-plan/', form);
      setPlan(res.data);
      setOpenDay(0);
      toast.success('Diet plan generated! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  };

  const goalInfo = GOAL_LABELS[form.goal] || GOAL_LABELS.lifestyle;

  return (
    <div className="animate-fade-in">
      <style>{`
        /* ─── Page header ─── */
        .dp-hero {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          padding: 44px 48px;
          margin-bottom: 32px;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }
        .dp-hero::before {
          content: '';
          position: absolute;
          top: -50px; right: -80px;
          width: 320px; height: 320px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
          pointer-events: none;
        }
        .dp-hero::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 200px;
          width: 200px; height: 200px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
          pointer-events: none;
        }
        .dp-hero-text { position: relative; z-index: 1; color: #fff; }
        .dp-hero-text h1 { font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800; margin-bottom: 10px; }
        .dp-hero-text p  { font-size: 1rem; opacity: 0.85; max-width: 520px; line-height: 1.6; }
        .dp-hero-icon {
          position: relative; z-index: 1;
          font-size: 6rem; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.2));
          animation: heroFloat 3s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes heroFloat {
          0%,100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }

        /* ─── Form card ─── */
        .dp-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }
        .dp-field label {
          font-size: 0.82rem; font-weight: 700;
          color: var(--text-secondary); margin-bottom: 6px; display: block;
        }

        /* ─── Targets row ─── */
        .dp-targets {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .dp-target-card {
          border-radius: 18px;
          padding: 22px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .dp-target-card::before {
          content: '';
          position: absolute; inset: 0;
          background: var(--card-accent);
          opacity: 0.08;
          border-radius: 18px;
        }
        .dp-target-num {
          font-size: 2rem; font-weight: 800;
          color: var(--card-accent);
          line-height: 1;
        }
        .dp-target-label {
          font-size: 0.78rem; font-weight: 600;
          color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em;
        }
        .dp-target-icon { font-size: 1.8rem; }

        /* ─── Accordion day cards ─── */
        .dp-day-card {
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 12px;
          border: 1px solid var(--border);
          transition: box-shadow 0.3s ease;
        }
        .dp-day-card.open {
          box-shadow: 0 8px 32px rgba(16,185,129,0.15);
          border-color: var(--primary);
        }
        .dp-day-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          cursor: pointer;
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          user-select: none;
        }
        .dp-day-header:hover { background: var(--primary-light); }
        .dp-day-name {
          font-size: 1rem; font-weight: 800; color: var(--text-primary);
          display: flex; align-items: center; gap: 10px;
        }
        .dp-day-pill {
          font-size: 0.72rem; font-weight: 700;
          background: var(--primary-light); color: var(--primary);
          padding: 3px 10px; border-radius: 99px;
        }
        .dp-meals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          padding: 20px 24px 24px;
          background: var(--bg-secondary);
        }
        .dp-meal-tile {
          border-radius: 14px;
          padding: 18px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .dp-meal-tile:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }
        .dp-meal-name {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 6px;
        }
        .dp-meal-emoji { font-size: 1.8rem; margin-bottom: 8px; display: block; }
        .dp-meal-foods {
          font-size: 0.88rem; color: var(--text-primary); font-weight: 500;
          line-height: 1.5; margin-bottom: 10px;
        }
        .dp-meal-kcal {
          font-size: 0.8rem; font-weight: 700; color: var(--primary);
          display: flex; align-items: center; gap: 4px;
        }

        /* ─── Tips section ─── */
        .dp-tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 14px;
          margin-top: 8px;
        }
        .dp-tip {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 16px 18px;
          border-radius: 14px;
          background: var(--primary-light);
          border: 1px solid rgba(16,185,129,0.2);
        }
        .dp-tip-icon { color: var(--primary); flex-shrink: 0; margin-top: 2px; }
        .dp-tip p { font-size: 0.88rem; color: var(--text-primary); line-height: 1.5; font-weight: 500; }

        /* ─── BMI badge ─── */
        .dp-bmi-row {
          display: flex; align-items: center; gap: 16px;
          flex-wrap: wrap;
          padding: 18px 24px;
          border-radius: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }
        .dp-bmi-val {
          font-size: 2.2rem; font-weight: 900; color: var(--primary);
        }
        .dp-bmi-cat {
          font-size: 0.85rem; font-weight: 700;
          padding: 4px 14px; border-radius: 99px;
          background: var(--primary-light); color: var(--primary);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .dp-hero { flex-direction: column; padding: 30px 24px; }
          .dp-hero-icon { font-size: 4rem; }
        }
      `}</style>

      {/* ── Hero banner ── */}
      <div className="dp-hero">
        <div className="dp-hero-text">
          <h1>🥦 Personalised Diet Plan</h1>
          <p>
            Enter your body stats and goal below to instantly generate a
            custom 7-day meal plan with calorie &amp; macro targets — built just for you.
          </p>
        </div>
        <div className="dp-hero-icon">🥗</div>
      </div>

      {/* ── Input form ── */}
      <div className="card glass" style={{ marginBottom: '28px' }}>
        <div className="card-title">
          <Sparkles size={20} color="var(--primary)" />
          Your Body Stats
        </div>

        <form onSubmit={handleGenerate}>
          <div className="dp-form-grid">
            {/* Age */}
            <div className="dp-field form-group" style={{ margin: 0 }}>
              <label>Age (years)</label>
              <input type="number" min="10" max="100" value={form.age}
                onChange={set('age')} required placeholder="e.g. 25" />
            </div>

            {/* Weight */}
            <div className="dp-field form-group" style={{ margin: 0 }}>
              <label>Weight (kg)</label>
              <input type="number" step="0.1" min="30" max="300" value={form.weight}
                onChange={set('weight')} required placeholder="e.g. 70" />
            </div>

            {/* Height */}
            <div className="dp-field form-group" style={{ margin: 0 }}>
              <label>Height (cm)</label>
              <input type="number" min="100" max="250" value={form.height}
                onChange={set('height')} required placeholder="e.g. 175" />
            </div>

            {/* Gender */}
            <div className="dp-field form-group" style={{ margin: 0 }}>
              <label>Gender</label>
              <select value={form.gender} onChange={set('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Goal */}
            <div className="dp-field form-group" style={{ margin: 0 }}>
              <label>Goal</label>
              <select value={form.goal} onChange={set('goal')}>
                <option value="lifestyle">Healthy Lifestyle 🌿</option>
                <option value="loss">Weight Loss 🔥</option>
                <option value="gain">Muscle Gain 💪</option>
                <option value="maintenance">Maintenance ⚖️</option>
              </select>
            </div>

            {/* Activity */}
            <div className="dp-field form-group" style={{ margin: 0 }}>
              <label>Activity Level</label>
              <select value={form.activity_level} onChange={set('activity_level')}>
                {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Diet Preference */}
            <div className="dp-field form-group" style={{ margin: 0 }}>
              <label>Diet Preference</label>
              <select value={form.diet_preference} onChange={set('diet_preference')}>
                <option value="anything">Anything 🥩</option>
                <option value="vegetarian">Vegetarian 🧀</option>
                <option value="vegan">Vegan 🌿</option>
                <option value="keto">Ketogenic (Keto) 🥑</option>
                <option value="pescatarian">Pescatarian 🐟</option>
              </select>
            </div>
          </div>

          {/* Goal tag preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current goal:</span>
            <span style={{
              padding: '5px 16px', borderRadius: '99px', fontWeight: '700', fontSize: '0.85rem',
              background: goalInfo.color + '18', color: goalInfo.color, border: `1px solid ${goalInfo.color}40`
            }}>
              {goalInfo.emoji} {goalInfo.label}
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ gap: '10px', minWidth: '200px', fontSize: '1rem' }}>
            {loading
              ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
              : <><Sparkles size={18} /> Generate My Plan</>}
          </button>
        </form>
      </div>

      {/* ── Results ── */}
      {plan && (
        <>
          {/* BMI row */}
          <div className="dp-bmi-row">
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Your BMI</div>
              <div className="dp-bmi-val">{plan.bmi}</div>
            </div>
            <span className="dp-bmi-cat">{plan.bmi_category}</span>
            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 300 }}>
              BMR: <strong>{plan.targets.bmr} kcal</strong> &nbsp;|&nbsp;
              TDEE: <strong>{plan.targets.tdee} kcal</strong>
            </div>
          </div>

          {/* Calorie & macro targets */}
          <div style={{ marginBottom: '8px' }}>
            <div className="card-title" style={{ marginBottom: '16px' }}>
              <Flame size={20} color="var(--primary)" /> Daily Nutrition Targets
            </div>
          </div>
          <div className="dp-targets" style={{ marginBottom: '28px' }}>
            {[
              { label: 'Calories', value: plan.targets.calories, unit: 'kcal', icon: '🔥', color: '#ef4444' },
              { label: 'Protein',  value: plan.targets.protein_g, unit: 'g', icon: '🥩', color: '#6366f1' },
              { label: 'Carbs',    value: plan.targets.carbs_g,   unit: 'g', icon: '🍚', color: '#f59e0b' },
              { label: 'Fats',     value: plan.targets.fats_g,    unit: 'g', icon: '🥑', color: '#10b981' },
            ].map((t) => (
              <div key={t.label} className="dp-target-card card glass" style={{ '--card-accent': t.color }}>
                <span className="dp-target-icon">{t.icon}</span>
                <div className="dp-target-num" style={{ color: t.color }}>
                  {t.value}<span style={{ fontSize: '1rem', fontWeight: 600 }}> {t.unit}</span>
                </div>
                <div className="dp-target-label">{t.label}</div>
              </div>
            ))}
          </div>

          {/* 7-day accordion */}
          <div className="card-title" style={{ marginBottom: '16px' }}>
            <Salad size={20} color="var(--primary)" /> 7-Day Meal Plan
          </div>

          {plan.meal_plan.map((day, idx) => {
            const dayTotal = day.meals.reduce((s, m) => s + m.calories, 0);
            const isOpen = openDay === idx;
            return (
              <div key={day.day} className={`dp-day-card ${isOpen ? 'open' : ''}`}>
                <div className="dp-day-header" onClick={() => setOpenDay(isOpen ? -1 : idx)}>
                  <div className="dp-day-name">
                    <span style={{ fontSize: '1.4rem' }}>
                      {['📅','📅','📅','📅','📅','🗓️','🌅'][idx]}
                    </span>
                    {day.day}
                    <span className="dp-day-pill">{dayTotal} kcal</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </div>

                {isOpen && (
                  <div className="dp-meals-grid">
                    {day.meals.map((meal) => (
                      <div key={meal.name} className="dp-meal-tile">
                        <div className="dp-meal-name">{meal.name}</div>
                        <span className="dp-meal-emoji">{meal.emoji}</span>
                        <div className="dp-meal-foods">{meal.foods}</div>
                        <div className="dp-meal-kcal">
                          <Flame size={13} /> {meal.calories} kcal
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Tips */}
          <div className="card glass" style={{ marginTop: '28px' }}>
            <div className="card-title">
              <Apple size={20} color="var(--primary)" /> Nutrition Tips for Your Goal
            </div>
            <div className="dp-tips-grid">
              {plan.tips.map((tip, i) => (
                <div key={i} className="dp-tip">
                  <CheckCircle size={18} className="dp-tip-icon" />
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
