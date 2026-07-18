import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIET_TYPES = ['Vegetarian', 'Vegan', 'Keto', 'High Protein', 'Gluten-Free', 'Dairy-Free', 'Low Carb', 'High Fiber'];
const ALLERGENS = ['Eggs', 'Dairy', 'Gluten', 'Nuts', 'Fish', 'Soy'];
const CUISINES = ['Indian', 'Continental', 'Asian', 'Mediterranean', 'Mexican'];
const CATEGORIES = ['Protein', 'Grains', 'Fruits', 'Vegetables', 'Nuts', 'Dairy', 'Fats', 'General'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Relevance' },
  { value: 'calories_asc', label: 'Calories ↑' },
  { value: 'calories_desc', label: 'Calories ↓' },
  { value: 'protein_desc', label: 'Protein ↓' },
  { value: 'health_desc', label: 'Health Score ↓' },
  { value: 'rating_desc', label: 'Top Rated' },
];

export default function FoodFilters({
  filters, onChange, onClear, sortBy, onSortChange, resultCount,
}) {
  const {
    mealTypes = [], dietTypes = [], allergens = [], cuisines = [], category = '',
    maxCalories = 1200, minProtein = 0, maxFat = 100,
  } = filters;

  const toggle = (key, val) => {
    const current = filters[key] || [];
    onChange({ ...filters, [key]: current.includes(val) ? current.filter(x => x !== val) : [...current, val] });
  };
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const hasActiveFilters = mealTypes.length || dietTypes.length || allergens.length ||
    cuisines.length || category || maxCalories < 1200 || minProtein > 0 || maxFat < 100;

  return (
    <div className="fs-filters">
      <div className="fs-filters-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={15} color="var(--primary)" />
          <span className="fs-filter-title">Advanced Filters</span>
          {hasActiveFilters && (
            <span style={{ padding: '2px 8px', borderRadius: 50, background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>
              Active
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select className="fs-sort-select" value={sortBy} onChange={e => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {hasActiveFilters && (
            <button
              onClick={onClear}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 50, border: '1px solid var(--danger)', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              <X size={12} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="fs-filter-row">
        <span className="fs-filter-label">Category</span>
        {CATEGORIES.map(c => (
          <button key={c} className={`fs-filter-pill ${category === c ? 'active' : ''}`}
            onClick={() => set('category', category === c ? '' : c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Meal Type */}
      <div className="fs-filter-row">
        <span className="fs-filter-label">Meal Type</span>
        {MEAL_TYPES.map(m => (
          <button key={m} className={`fs-filter-pill ${mealTypes.includes(m) ? 'active' : ''}`}
            onClick={() => toggle('mealTypes', m)}>
            {m}
          </button>
        ))}
      </div>

      {/* Diet Type */}
      <div className="fs-filter-row">
        <span className="fs-filter-label">Diet Type</span>
        {DIET_TYPES.map(d => (
          <button key={d} className={`fs-filter-pill ${dietTypes.includes(d) ? 'active' : ''}`}
            onClick={() => toggle('dietTypes', d)}>
            {d}
          </button>
        ))}
      </div>

      {/* Cuisine */}
      <div className="fs-filter-row">
        <span className="fs-filter-label">Cuisine</span>
        {CUISINES.map(c => (
          <button key={c} className={`fs-filter-pill ${cuisines.includes(c) ? 'active' : ''}`}
            onClick={() => toggle('cuisines', c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Allergens */}
      <div className="fs-filter-row">
        <span className="fs-filter-label">Exclude Allergens</span>
        {ALLERGENS.map(a => (
          <button key={a} className={`fs-filter-pill ${allergens.includes(a) ? 'active' : ''}`}
            style={allergens.includes(a) ? { background: 'rgba(239,68,68,0.1)', borderColor: 'var(--danger)', color: 'var(--danger)' } : {}}
            onClick={() => toggle('allergens', a)}>
            ⚠️ {a}-Free
          </button>
        ))}
      </div>

      {/* Ranges */}
      <div className="fs-filter-row" style={{ gap: 24 }}>
        <span className="fs-filter-label">Ranges</span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Max Calories</span>
          <div className="fs-range-wrap">
            <input
              type="range" className="fs-range-input" min={0} max={1200} step={50}
              value={maxCalories}
              style={{ '--pct': `${(maxCalories / 1200) * 100}%` }}
              onChange={e => set('maxCalories', Number(e.target.value))}
            />
            <span className="fs-range-val">{maxCalories === 1200 ? 'Any' : `≤${maxCalories} kcal`}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Min Protein</span>
          <div className="fs-range-wrap">
            <input
              type="range" className="fs-range-input" min={0} max={50} step={5}
              value={minProtein}
              style={{ '--pct': `${(minProtein / 50) * 100}%` }}
              onChange={e => set('minProtein', Number(e.target.value))}
            />
            <span className="fs-range-val">{minProtein === 0 ? 'Any' : `≥${minProtein}g`}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Max Fat</span>
          <div className="fs-range-wrap">
            <input
              type="range" className="fs-range-input" min={0} max={100} step={5}
              value={maxFat}
              style={{ '--pct': `${(maxFat / 100) * 100}%` }}
              onChange={e => set('maxFat', Number(e.target.value))}
            />
            <span className="fs-range-val">{maxFat === 100 ? 'Any' : `≤${maxFat}g`}</span>
          </div>
        </div>
      </div>

      {resultCount !== undefined && (
        <div style={{ marginTop: 6, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--primary)' }}>{resultCount}</strong> foods
        </div>
      )}
    </div>
  );
}
