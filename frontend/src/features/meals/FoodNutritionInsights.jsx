import React from 'react';
import { DAILY_GOAL, TODAY_CONSUMED, getMacroColor } from './foodMockData';

function Ring({ value, max, color, size = 80, strokeW = 7, label, sub }) {
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const dash = pct * circ;

  return (
    <div className="fs-ring-wrap">
      <svg width={size} height={size} className="fs-ring-svg">
        <circle className="fs-ring-bg" cx={size / 2} cy={size / 2} r={r} />
        <circle
          className="fs-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={0}
        />
        <text
          x="50%" y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="var(--text-primary)"
          style={{ fontSize: size * 0.18, fontWeight: 900, fontFamily: 'var(--font-sans)' }}
          transform={`rotate(90, ${size / 2}, ${size / 2})`}
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div className="fs-ring-label">{label}</div>
      <div className="fs-ring-sub">{value} / {max}</div>
    </div>
  );
}

const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fats', label: 'Fats', unit: 'g' },
  { key: 'fiber', label: 'Fiber', unit: 'g' },
];

const HEALTH_TIPS = [
  { emoji: '💧', tip: 'You\'re 700ml away from your daily water goal. Drink a glass now!' },
  { emoji: '🥦', tip: 'Fiber intake is below target. Add a serving of leafy greens to your next meal.' },
  { emoji: '🥩', tip: 'Protein is on track! Keep it up for optimal muscle maintenance.' },
];

export default function FoodNutritionInsights({ addedFoods = [] }) {
  // Combine today's consumed + foods added in this session
  const consumed = { ...TODAY_CONSUMED };
  addedFoods.forEach(f => {
    consumed.calories += f.calories || 0;
    consumed.protein += f.protein || 0;
    consumed.carbs += f.carbs || 0;
    consumed.fats += f.fats || 0;
    consumed.fiber += f.fiber || 0;
  });

  return (
    <div className="fs-insights">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>
            📊 Today's Nutrition Progress
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Based on your diary + foods added this session
          </p>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
            {consumed.calories} / {DAILY_GOAL.calories} kcal
          </div>
          {DAILY_GOAL.calories - consumed.calories > 0
            ? `${DAILY_GOAL.calories - consumed.calories} kcal remaining`
            : `${consumed.calories - DAILY_GOAL.calories} kcal over goal`}
        </div>
      </div>

      {/* Progress rings */}
      <div className="fs-insight-rings">
        {MACROS.map(m => (
          <Ring
            key={m.key}
            value={consumed[m.key]}
            max={DAILY_GOAL[m.key]}
            color={getMacroColor(m.key)}
            label={m.label}
            sub={`${m.unit}`}
            size={76}
          />
        ))}
      </div>

      {/* Macro bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {MACROS.map(m => {
          const pct = Math.min(100, Math.round((consumed[m.key] / DAILY_GOAL[m.key]) * 100));
          const over = consumed[m.key] > DAILY_GOAL[m.key];
          return (
            <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', width: 64, flexShrink: 0 }}>
                {m.label}
              </span>
              <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: over ? 'var(--danger)' : getMacroColor(m.key),
                  borderRadius: 3,
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: over ? 'var(--danger)' : 'var(--text-muted)', fontWeight: over ? 700 : 400, width: 80, textAlign: 'right', flexShrink: 0 }}>
                {consumed[m.key]}{m.unit} / {DAILY_GOAL[m.key]}{m.unit}
              </span>
            </div>
          );
        })}
      </div>

      {/* Health Tips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {HEALTH_TIPS.map((t, i) => (
          <div key={i} style={{ flex: '1 1 240px', padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span style={{ marginRight: 6, fontSize: '1rem' }}>{t.emoji}</span>
            {t.tip}
          </div>
        ))}
      </div>
    </div>
  );
}
