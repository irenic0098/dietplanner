import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { DIET_FILTERS, CUISINE_OPTIONS, MEAL_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from './mockData';

export default function AdvancedFilters({
  activeFilter, onFilterClick,
  cuisine, onCuisine,
  mealType, onMealType,
  difficulty, onDifficulty,
  maxTime, onMaxTime,
  onClear,
}) {
  const hasActive = activeFilter !== 'all' || cuisine !== 'All Cuisines' || mealType !== 'All Meals' || difficulty !== 'Any Level' || maxTime < 120;

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Diet Chips */}
      <div className="rcp-filters-row">
        {DIET_FILTERS.map(f => (
          <button
            key={f.id}
            className={`rcp-filter-chip ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => onFilterClick(f.id)}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Advanced Dropdowns Row */}
      <div className="rcp-adv-row">
        <SlidersHorizontal size={16} color="var(--text-muted)" />

        <select className="rcp-adv-select" value={cuisine} onChange={e => onCuisine(e.target.value)}>
          {CUISINE_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>

        <select className="rcp-adv-select" value={mealType} onChange={e => onMealType(e.target.value)}>
          {MEAL_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>

        <select className="rcp-adv-select" value={difficulty} onChange={e => onDifficulty(e.target.value)}>
          {DIFFICULTY_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <span style={{ whiteSpace: 'nowrap' }}>⏱ Max {maxTime === 120 ? '∞' : `${maxTime} min`}</span>
          <input
            type="range" min={5} max={120} step={5} value={maxTime}
            onChange={e => onMaxTime(Number(e.target.value))}
            className="rcp-slider" style={{ width: 80 }}
          />
        </div>

        {hasActive && (
          <button className="rcp-filter-chip-clear" onClick={onClear}>
            <X size={12} /> Clear All
          </button>
        )}
      </div>
    </div>
  );
}
