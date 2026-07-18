import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { GOAL_FILTERS } from './mockData';

const FOOD_ORBS = [
  { emoji: '🥗', top: '12%', left: '75%', size: '3rem', dur: '7s', delay: '0s' },
  { emoji: '🥑', top: '65%', left: '82%', size: '2.4rem', dur: '9s', delay: '1.5s' },
  { emoji: '🍗', top: '30%', left: '91%', size: '2.8rem', dur: '6s', delay: '0.8s' },
  { emoji: '🫐', top: '78%', left: '68%', size: '2rem', dur: '8s', delay: '2s' },
  { emoji: '🥦', top: '15%', left: '60%', size: '2.2rem', dur: '10s', delay: '0.3s' },
  { emoji: '🍋', top: '50%', left: '88%', size: '1.9rem', dur: '7.5s', delay: '1s' },
];

export default function HeroSearchBar({ search, onSearch, activeGoal, onGoalClick }) {
  return (
    <div className="rcp-hero">
      {/* Floating food orbs */}
      {FOOD_ORBS.map((orb, i) => (
        <span
          key={i}
          className="rcp-hero-orb"
          style={{ top: orb.top, left: orb.left, fontSize: orb.size, '--dur': orb.dur, '--delay': orb.delay }}
        >
          {orb.emoji}
        </span>
      ))}

      <div className="rcp-hero-content">
        <div className="rcp-hero-eyebrow">
          <Sparkles size={12} />
          AI-Powered Nutrition Recipes
        </div>

        <h1 className="rcp-hero-title">
          Cook Smarter,<br />
          <span>Eat Healthier 🌿</span>
        </h1>
        <p className="rcp-hero-subtitle">
          Discover thousands of personalised, nutrition-verified recipes matched to your health goals, allergies, and taste preferences.
        </p>

        {/* Search Input */}
        <div className="rcp-search-wrap">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} className="rcp-search-icon" />
            <input
              type="text"
              className="rcp-search-input"
              placeholder="Search by recipe, ingredient, cuisine, chef…"
              value={search}
              onChange={e => onSearch(e.target.value)}
            />
          </div>
          <button className="rcp-search-btn">
            <Search size={16} />
            Search
          </button>
        </div>

        {/* Goal Pills */}
        <div className="rcp-goal-row">
          <span style={{ color: 'rgba(248,250,252,0.5)', fontSize: '0.8rem', fontWeight: 600, alignSelf: 'center', flexShrink: 0 }}>
            Your Goal:
          </span>
          {GOAL_FILTERS.map(g => (
            <button
              key={g.id}
              className={`rcp-goal-pill ${activeGoal === g.id ? 'active' : ''}`}
              onClick={() => onGoalClick(g.id)}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
