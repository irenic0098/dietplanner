import React, { useState } from 'react';
import { Sparkles, ChefHat, Loader } from 'lucide-react';
import { GOAL_FILTERS, CUISINE_OPTIONS } from './mockData';

const AI_GOAL_OPTIONS = GOAL_FILTERS.map(g => g.label);
const CUISINES = CUISINE_OPTIONS.filter(c => c !== 'All Cuisines');

const TIME_OPTIONS = ['Under 15 min', '15–30 min', '30–60 min', 'Over 1 hour'];

function generateAIRecipe(ingredients, time, goal, cuisine) {
  const ing = ingredients.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  const mainIng = ing[0] || 'Mixed Vegetables';
  return {
    id: 'ai-gen-' + Date.now(),
    title: `${cuisine} ${goal} ${mainIng} Bowl`,
    description: `AI-generated recipe using ${ing.slice(0, 3).join(', ')} — optimised for ${goal} goals. Ready in ${time}.`,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    prep_time: 10, cook_time: 20,
    calories: Math.round(280 + Math.random() * 200),
    protein: Math.round(18 + Math.random() * 22),
    carbs: Math.round(25 + Math.random() * 30),
    fats: Math.round(8 + Math.random() * 14),
    fiber: Math.round(4 + Math.random() * 6),
    sugar: Math.round(3 + Math.random() * 8),
    sodium: Math.round(300 + Math.random() * 250),
    vitamins: { A: '30%', C: '45%', D: '10%', B12: '20%' },
    minerals: { Iron: '18%', Calcium: '12%', Potassium: '25%' },
    is_favorite: false, favorites_count: 0,
    difficulty: 'Easy', servings: 2, yield_unit: 'servings',
    cuisine, meal_type: 'Lunch',
    diet_tags: [goal, cuisine, 'AI Generated'],
    goal_tags: [goal],
    health_score: Math.round(82 + Math.random() * 15),
    glycemic_index: 'Low (40)',
    estimated_cost: `₹${Math.round(60 + Math.random() * 120)}`,
    shelf_life: '2 days',
    storage: 'Refrigerate in airtight container.',
    rating: null, reviews_count: 0,
    video_url: null,
    chef: '🤖 AI Chef',
    ingredients: ing.map(i => `1 cup ${i}`).join('\n') + '\n2 tbsp olive oil\nSalt, pepper, and herbs to taste',
    instructions: `Prepare all ingredients: wash, chop, and measure.\nHeat oil in a pan over medium heat.\nSauté aromatics for 2 minutes.\nAdd main ingredients in order of cooking time.\nSeason with salt, pepper and spices.\nCook until everything is tender and fragrant.\nPlate and garnish with fresh herbs.\nServe hot with your choice of grain or bread.`,
    substitutions: [],
    ai_tips: [
      `This recipe is optimised for ${goal} — adjust portion size to match your calorie target.`,
      'Add a squeeze of lemon for extra vitamin C and brightness.',
      'Use an air fryer for a crispy version with 40% less oil.',
    ],
  };
}

export default function AIRecipeGenerator({ onGenerated }) {
  const [ingredients, setIngredients] = useState('');
  const [time, setTime] = useState(TIME_OPTIONS[1]);
  const [goal, setGoal] = useState(AI_GOAL_OPTIONS[0]);
  const [cuisine, setCuisine] = useState(CUISINES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1800)); // simulate AI
    const recipe = generateAIRecipe(ingredients, time, goal, cuisine);
    setResult(recipe);
    setLoading(false);
  };

  if (!open) {
    return (
      <div style={{ marginBottom: 32 }}>
        <button
          className="btn btn-accent"
          style={{ width: '100%', padding: '16px', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          onClick={() => setOpen(true)}
        >
          <Sparkles size={18} />
          🤖 Generate AI Recipe from Your Ingredients
        </button>
      </div>
    );
  }

  return (
    <div className="rcp-ai-gen-panel" style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 className="rcp-section-title" style={{ marginBottom: 4 }}>
            <Sparkles size={18} color="var(--accent)" /> AI Recipe Generator
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Enter ingredients you have → get a personalised recipe with full nutrition
          </p>
        </div>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          onClick={() => { setOpen(false); setResult(null); }}
        >
          ✕ Close
        </button>
      </div>

      <div className="rcp-ai-gen-grid">
        <div className="form-group">
          <label>🥕 Available Ingredients</label>
          <textarea
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            placeholder="e.g. chicken, spinach, tomatoes, oats (comma or line separated)"
            rows={3}
            style={{ resize: 'vertical', minHeight: 80 }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>⏱ Time Available</label>
            <select value={time} onChange={e => setTime(e.target.value)}>
              {TIME_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>🎯 Health Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)}>
              {AI_GOAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>🌍 Cuisine</label>
            <select value={cuisine} onChange={e => setCuisine(e.target.value)}>
              {CUISINES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', height: 50, background: 'linear-gradient(135deg, #10b981, #059669)' }}
              onClick={handleGenerate}
              disabled={loading || !ingredients.trim()}
            >
              {loading ? <Loader size={16} style={{ animation: 'rcp-spin-slow 0.8s linear infinite' }} /> : <ChefHat size={16} />}
              {loading ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rcp-ai-loading">
          <div className="rcp-ai-spinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>AI is crafting your personalised recipe…</p>
        </div>
      )}

      {result && !loading && (
        <div className="rcp-ai-result">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '1.2rem' }}>🤖</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{result.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI-generated · {result.calories} kcal · {result.protein}g protein</div>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '0.8rem' }}
              onClick={() => onGenerated(result)}
            >
              View Full Recipe →
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{result.description}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="rcp-macro-chip badge" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>{result.calories} kcal</span>
            <span className="rcp-macro-chip badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--primary)' }}>{result.protein}g protein</span>
            <span className="rcp-macro-chip badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent)' }}>{result.carbs}g carbs</span>
            <span className="rcp-macro-chip badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>{result.fats}g fats</span>
            <span className="rcp-macro-chip badge badge-success">Health Score: {result.health_score}</span>
          </div>
        </div>
      )}
    </div>
  );
}
