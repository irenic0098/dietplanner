import React from 'react';
import { SEASONAL_DATA, getCurrentSeason } from './mockData';
import toast from 'react-hot-toast';

export default function SeasonalRecommendations({ onTagClick }) {
  const season = getCurrentSeason();
  const data = SEASONAL_DATA[season];

  return (
    <div className="rcp-seasonal" style={{ '--season-color': data.color }}>
      <div className="rcp-seasonal-bg" />
      <div className="rcp-seasonal-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: '2rem' }}>{data.icon}</span>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {data.label} · In Season Now
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{data.tip}</p>
            </div>
          </div>
          <div className="rcp-seasonal-tags">
            {data.ingredients.map(ing => (
              <span
                key={ing}
                className="rcp-seasonal-tag"
                onClick={() => onTagClick(ing)}
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.85rem', flexShrink: 0 }}
          onClick={() => toast.success(`Showing ${season} seasonal recipes!`)}
        >
          {data.icon} See Seasonal Recipes
        </button>
      </div>
    </div>
  );
}
