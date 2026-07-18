import React from 'react';
import { ChevronRight } from 'lucide-react';
import { RECIPE_COLLECTIONS } from './mockData';
import toast from 'react-hot-toast';

export default function RecipeCollections() {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 className="rcp-section-title">📚 Recipe Collections</h2>
          <p className="rcp-section-sub">Curated by our nutrition experts for every goal</p>
        </div>
        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
          View All <ChevronRight size={14} />
        </button>
      </div>

      <div className="rcp-collections-scroll">
        {RECIPE_COLLECTIONS.map(col => (
          <div
            key={col.id}
            className="rcp-collection-card"
            style={{ background: col.gradient }}
            onClick={() => toast.success(`Opening "${col.name}" collection…`)}
          >
            <span className="rcp-collection-badge">{col.count} recipes</span>
            <div className="rcp-collection-icon">{col.icon}</div>
            <div className="rcp-collection-name">{col.name}</div>
            <div className="rcp-collection-desc">{col.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
