import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { getHealthScoreColor, getMacroColor, FALLBACK_IMAGE } from './foodMockData';
import toast from 'react-hot-toast';

const METRICS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', higherIsBad: true },
  { key: 'protein', label: 'Protein', unit: 'g', higherIsBad: false },
  { key: 'carbs', label: 'Carbs', unit: 'g', higherIsBad: null },
  { key: 'fats', label: 'Fats', unit: 'g', higherIsBad: null },
  { key: 'fiber', label: 'Fiber', unit: 'g', higherIsBad: false },
  { key: 'sugar', label: 'Sugar', unit: 'g', higherIsBad: true },
  { key: 'sodium', label: 'Sodium', unit: 'mg', higherIsBad: true },
  { key: 'health_score', label: 'Health Score', unit: '', higherIsBad: false },
];

function getWinner(foods, metric) {
  if (foods.length < 2) return null;
  const vals = foods.map(f => f[metric.key] ?? 0);
  const best = metric.higherIsBad === false
    ? Math.max(...vals)
    : metric.higherIsBad === true
    ? Math.min(...vals)
    : null;
  if (best === null) return null;
  const winnerIdx = vals.indexOf(best);
  return winnerIdx;
}

export default function FoodComparison({ foods, onRemove, onClear }) {
  if (!foods.length) return null;

  return (
    <div className="fs-compare-modal" style={{ marginBottom: 32 }}>
      <div className="fs-compare-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem' }}>🔄</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Food Comparison</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {foods.length} food{foods.length > 1 ? 's' : ''} selected · Add up to 3
            </div>
          </div>
        </div>
        <button
          onClick={onClear}
          style={{ padding: '6px 14px', borderRadius: 50, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Trash2 size={12} /> Clear All
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="fs-compare-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Metric</th>
              {foods.map((f, i) => (
                <th key={f.id}>
                  <div className="fs-compare-food-header">
                    <img
                      className="fs-compare-food-img"
                      src={f.image || FALLBACK_IMAGE}
                      alt={f.name}
                      onError={e => { e.target.src = FALLBACK_IMAGE; }}
                    />
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', maxWidth: 100 }}>{f.name}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{f.serving_size}</div>
                    <button
                      onClick={() => onRemove(f.id)}
                      style={{ marginTop: 4, padding: '2px 8px', borderRadius: 50, background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: '0.62rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </th>
              ))}
              {/* Empty slot placeholders */}
              {foods.length < 2 && (
                <th>
                  <div className="fs-compare-food-header" style={{ opacity: 0.35 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 10, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>+</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Add food</div>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {METRICS.map(metric => {
              const winnerIdx = getWinner(foods, metric);
              return (
                <tr key={metric.key}>
                  <td style={{ textAlign: 'left', paddingLeft: 16 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{metric.label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{metric.unit}</div>
                  </td>
                  {foods.map((f, i) => {
                    const val = f[metric.key] ?? '—';
                    const isWinner = i === winnerIdx;
                    const color = metric.key === 'health_score' ? getHealthScoreColor(val) :
                      metric.key === 'calories' ? getMacroColor('calories') :
                      metric.key === 'protein' ? getMacroColor('protein') :
                      metric.key === 'carbs' ? getMacroColor('carbs') :
                      metric.key === 'fats' ? getMacroColor('fats') :
                      metric.key === 'fiber' ? getMacroColor('fiber') :
                      metric.key === 'sugar' ? getMacroColor('sugar') :
                      metric.key === 'sodium' ? getMacroColor('sodium') :
                      'var(--text-primary)';
                    return (
                      <td key={f.id} className={foods.length > 1 ? (isWinner ? 'winner' : 'loser') : ''}>
                        <span style={{ fontWeight: isWinner ? 900 : 600, color: isWinner ? color : 'var(--text-muted)', fontSize: isWinner ? '1rem' : '0.88rem' }}>
                          {val}{metric.unit && val !== '—' ? metric.unit : ''}
                          {isWinner && foods.length > 1 && (
                            <span style={{ marginLeft: 4, fontSize: '0.65rem' }}>
                              {metric.higherIsBad === false ? '🏆' : metric.higherIsBad === true ? '✓' : ''}
                            </span>
                          )}
                        </span>
                      </td>
                    );
                  })}
                  {foods.length < 2 && <td style={{ color: 'var(--border)' }}>—</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
