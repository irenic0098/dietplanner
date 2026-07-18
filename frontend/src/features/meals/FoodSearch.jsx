import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import './foodSearch.css';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Plus, GitCompare, Utensils, Users, BarChart3, Loader2 } from 'lucide-react';

import { MOCK_FOODS, getFoodPage, PAGE_SIZE } from './foodMockData';
import FoodHeroSearch from './FoodHeroSearch';
import FoodFilters from './FoodFilters';
import FoodCard from './FoodCard';
import FoodDetailModal from './FoodDetailModal';
import FoodComparison from './FoodComparison';
import FoodNutritionInsights from './FoodNutritionInsights';
import FoodCommunitySection from './FoodCommunitySection';

const PAGE_TABS = ['Discover', 'Community', 'Insights', 'My Foods'];

const DEFAULT_FILTERS = {
  mealTypes: [], dietTypes: [], allergens: [], cuisines: [], category: '',
  maxCalories: 1200, minProtein: 0, maxFat: 100,
};

function applyFilters(foods, search, filters, sortBy) {
  let results = [...foods];

  // Search
  if (search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.cuisine?.toLowerCase().includes(q) ||
      f.diet_tags?.some(t => t.toLowerCase().includes(q)) ||
      f.meal_types?.some(m => m.toLowerCase().includes(q)) ||
      f.ingredients?.some(i => i.toLowerCase().includes(q))
    );
  }

  // Category
  if (filters.category) {
    results = results.filter(f => f.category === filters.category);
  }

  // Meal types
  if (filters.mealTypes?.length) {
    results = results.filter(f => f.meal_types?.some(m => filters.mealTypes.includes(m)));
  }

  // Diet types
  if (filters.dietTypes?.length) {
    results = results.filter(f => filters.dietTypes.every(d => f.diet_tags?.includes(d)));
  }

  // Cuisines
  if (filters.cuisines?.length) {
    results = results.filter(f => filters.cuisines.includes(f.cuisine));
  }

  // Allergen exclusion
  if (filters.allergens?.length) {
    results = results.filter(f => !f.allergens?.some(a => filters.allergens.includes(a)));
  }

  // Ranges
  if (filters.maxCalories < 1200) {
    results = results.filter(f => f.calories <= filters.maxCalories);
  }
  if (filters.minProtein > 0) {
    results = results.filter(f => f.protein >= filters.minProtein);
  }
  if (filters.maxFat < 100) {
    results = results.filter(f => f.fats <= filters.maxFat);
  }

  // Sort
  switch (sortBy) {
    case 'calories_asc': results.sort((a, b) => a.calories - b.calories); break;
    case 'calories_desc': results.sort((a, b) => b.calories - a.calories); break;
    case 'protein_desc': results.sort((a, b) => b.protein - a.protein); break;
    case 'health_desc': results.sort((a, b) => b.health_score - a.health_score); break;
    case 'rating_desc': results.sort((a, b) => b.rating - a.rating); break;
    default: break;
  }

  return results;
}

// Custom food form
function CustomFoodModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', category: 'General', serving_size: '100g',
    calories: '', protein: '', carbs: '', fats: '', fiber: '',
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await client.post('nutrition/foods/', {
        name: form.name, category: form.category, serving_size: form.serving_size,
        calories: parseFloat(form.calories || 0), protein: parseFloat(form.protein || 0),
        carbs: parseFloat(form.carbs || 0), fats: parseFloat(form.fats || 0),
        fiber: parseFloat(form.fiber || 0),
      });
      toast.success(`✅ "${form.name}" added to database!`);
      onSave?.();
      onClose();
    } catch {
      toast.error('Failed to save food. Try again.');
    }
  };

  const CATS = ['Protein', 'Grains', 'Fruits', 'Vegetables', 'Nuts', 'Dairy', 'Fats', 'General'];

  return (
    <div className="fs-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fs-modal" style={{ maxWidth: 520 }}>
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 16, flexShrink: 0 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>📝 Add Custom Food</h3>
          <button className="fs-modal-close" style={{ position: 'static', background: 'var(--bg-primary)' }} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSave} className="fs-modal-body">
          <div className="form-group">
            <label>Food Name *</label>
            <input type="text" placeholder="e.g. Moong Dal Chilla" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Serving Size</label>
              <input type="text" placeholder="e.g. 100g, 1 plate" value={form.serving_size} onChange={e => set('serving_size', e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { key: 'calories', label: 'Calories (kcal)' }, { key: 'protein', label: 'Protein (g)' },
              { key: 'carbs', label: 'Carbs (g)' }, { key: 'fats', label: 'Fats (g)' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label>{f.label}</label>
                <input type="number" step="0.1" value={form[f.key]} onChange={e => set(f.key, e.target.value)} required />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label>Fiber (g) — optional</label>
            <input type="number" step="0.1" value={form.fiber} onChange={e => set('fiber', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Food</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Skeleton card
function SkeletonCard() {
  return (
    <div className="fs-card" style={{ cursor: 'default', pointerEvents: 'none' }}>
      <div className="fs-skeleton" style={{ height: 160 }} />
      <div className="fs-card-body">
        <div className="fs-skeleton" style={{ height: 18, width: '70%', borderRadius: 6, marginBottom: 8 }} />
        <div className="fs-skeleton" style={{ height: 12, width: '40%', borderRadius: 6, marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[1, 2].map(i => <div key={i} className="fs-skeleton" style={{ height: 20, width: 60, borderRadius: 50 }} />)}
        </div>
        <div className="fs-card-macros">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="fs-macro-box">
              <div className="fs-skeleton" style={{ height: 22, width: 36, borderRadius: 4, margin: '0 auto 4px' }} />
              <div className="fs-skeleton" style={{ height: 9, width: 24, borderRadius: 4, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FoodSearch() {
  const [pageTab, setPageTab] = useState('Discover');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('default');
  const [backendFoods, setBackendFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Infinite scroll state
  const [genPage, setGenPage] = useState(0);         // next generated page to load
  const [genFoods, setGenFoods] = useState([]);      // accumulated generated foods
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  // Modals & state
  const [selectedFood, setSelectedFood] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [compareList, setCompareList] = useState([]); // array of food objects
  const [showCompareFab, setShowCompareFab] = useState(false);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addedToDiary, setAddedToDiary] = useState([]);

  // Fetch backend foods once
  useEffect(() => {
    setLoading(true);
    client.get('nutrition/foods/')
      .then(res => setBackendFoods(res.data || []))
      .catch(() => {})
      .finally(() => setTimeout(() => setLoading(false), 600));
  }, []);

  // IntersectionObserver – loads next page when sentinel scrolls into view
  useEffect(() => {
    if (pageTab !== 'Discover') return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageTab, hasMore, loadingMore, loading, genPage]);

  const loadNextPage = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    // Simulate a small async delay so skeleton is visible
    setTimeout(() => {
      const newPage = getFoodPage(genPage);
      setGenFoods(prev => [...prev, ...newPage]);
      setGenPage(prev => prev + 1);
      // We never truly run out — generate up to 500 pages
      setHasMore(genPage < 500);
      setLoadingMore(false);
    }, 400);
  }, [genPage, loadingMore]);

  // Reset infinite scroll when filters / search change
  useEffect(() => {
    setGenFoods([]);
    setGenPage(0);
    setHasMore(true);
  }, [search, filters, sortBy]);

  // Merge curated + generated + backend foods for the full searchable pool
  const allFoods = useMemo(() => {
    const backendNorm = backendFoods.map(f => ({
      ...f,
      health_score: f.health_score || 70,
      diet_tags: f.diet_tags || [],
      meal_types: f.meal_types || [],
      allergens: f.allergens || [],
      cuisine: f.cuisine || 'General',
      rating: f.rating || 4.0,
      reviews_count: f.reviews_count || 0,
      is_verified: f.is_verified || false,
      is_trending: false,
    }));
    return [...MOCK_FOODS, ...backendNorm];
  }, [backendFoods]);

  // Displayed foods = curated/backend (filtered) + lazy-loaded generated (filtered)
  const filteredCurated = useMemo(
    () => applyFilters(allFoods, search, filters, sortBy),
    [allFoods, search, filters, sortBy]
  );
  const filteredGenerated = useMemo(
    () => applyFilters(genFoods, search, filters, sortBy),
    [genFoods, search, filters, sortBy]
  );
  const displayedFoods = useMemo(
    () => [...filteredCurated, ...filteredGenerated],
    [filteredCurated, filteredGenerated]
  );
  const totalCount = filteredCurated.length + filteredGenerated.length;

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleCompare = (food) => {
    setCompareList(prev => {
      const exists = prev.find(f => f.id === food.id);
      if (exists) return prev.filter(f => f.id !== food.id);
      if (prev.length >= 3) { toast('Max 3 foods for comparison', { icon: '⚠️' }); return prev; }
      return [...prev, food];
    });
    setShowCompareFab(true);
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => {
      const next = prev.filter(f => f.id !== id);
      if (!next.length) { setShowCompareFab(false); setShowComparePanel(false); }
      return next;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    setShowCompareFab(false);
    setShowComparePanel(false);
  };

  const addToDiary = (food) => {
    setAddedToDiary(prev => [...prev, food]);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortBy('default');
  };

  const compareIds = compareList.map(f => f.id);

  return (
    <div className="animate-fade-in fs-page">
      {/* ── Hero Search ─────────────────────────────────────────────── */}
      <FoodHeroSearch
        search={search}
        onSearch={setSearch}
        onSubmit={setSearch}
      />

      {/* ── Page Tabs ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div className="fs-tabs">
          {PAGE_TABS.map(t => (
            <button key={t} className={`fs-tab ${pageTab === t ? 'active' : ''}`} onClick={() => setPageTab(t)}>
              {t === 'Discover' && <><Utensils size={13} style={{ marginRight: 5 }} />{t}</>}
              {t === 'Community' && <><Users size={13} style={{ marginRight: 5 }} />{t}</>}
              {t === 'Insights' && <><BarChart3 size={13} style={{ marginRight: 5 }} />{t}</>}
              {t === 'My Foods' && <><Plus size={13} style={{ marginRight: 5 }} />{t}</>}
            </button>
          ))}
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setShowAddForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
        >
          <Plus size={14} /> Add Custom Food
        </button>
      </div>

      {/* ── Discover Tab ────────────────────────────────────────────── */}
      {pageTab === 'Discover' && (
        <>
          {/* Filters */}
          <FoodFilters
            filters={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={totalCount}
          />

          {/* Compare panel (inline when active) */}
          {showComparePanel && compareList.length > 0 && (
            <FoodComparison
              foods={compareList}
              onRemove={removeFromCompare}
              onClear={clearCompare}
            />
          )}

          {/* Foods Grid */}
          {loading ? (
            <div className="fs-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayedFoods.length === 0 ? (
            <div className="fs-empty">
              <div className="fs-empty-icon">🔍</div>
              <div className="fs-empty-title">No foods found</div>
              <div className="fs-empty-sub">Try different keywords or clear some filters.</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="fs-grid">
                {displayedFoods.map((food, i) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    animDelay={Math.min(i, 11) * 40}
                    onOpen={setSelectedFood}
                    onFavorite={toggleFavorite}
                    favorites={favorites}
                    onCompare={toggleCompare}
                    compareList={compareIds}
                    onAddDiary={addToDiary}
                  />
                ))}
              </div>

              {/* Loading more skeletons */}
              {loadingMore && (
                <div className="fs-grid" style={{ marginTop: 20 }}>
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
                </div>
              )}

              {/* Infinite scroll sentinel */}
              <div
                ref={sentinelRef}
                style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}
              >
                {loadingMore ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Loading more foods...
                  </div>
                ) : hasMore ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Scroll for more</div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>You've seen all foods</div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Community Tab ───────────────────────────────────────────── */}
      {pageTab === 'Community' && (
        <FoodCommunitySection onOpenDetail={setSelectedFood} />
      )}

      {/* ── Insights Tab ────────────────────────────────────────────── */}
      {pageTab === 'Insights' && (
        <div>
          <FoodNutritionInsights addedFoods={addedToDiary} />

          {/* Favorites list */}
          {favorites.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                ❤️ My Saved Foods
              </h3>
              <div className="fs-grid">
                {allFoods.filter(f => favorites.includes(f.id)).map((food, i) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    animDelay={i * 40}
                    onOpen={setSelectedFood}
                    onFavorite={toggleFavorite}
                    favorites={favorites}
                    onCompare={toggleCompare}
                    compareList={compareIds}
                    onAddDiary={addToDiary}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Diary added */}
          {addedToDiary.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                📋 Added to Today's Diary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {addedToDiary.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <img src={f.image} alt={f.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&q=80'; }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.serving_size}</div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--danger)' }}>{f.calories} kcal</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{f.protein}g protein</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {favorites.length === 0 && addedToDiary.length === 0 && (
            <div className="fs-empty" style={{ marginTop: 32 }}>
              <div className="fs-empty-icon">📊</div>
              <div className="fs-empty-title">Your Insights Await</div>
              <div className="fs-empty-sub">Save foods to favorites or add them to your diary to see your personalized insights here.</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setPageTab('Discover')}>
                Explore Foods
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── My Foods Tab ────────────────────────────────────────────── */}
      {pageTab === 'My Foods' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>📝 My Custom Foods</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Foods you've contributed to the database
              </p>
            </div>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowAddForm(true)}>
              <Plus size={14} /> Add New Food
            </button>
          </div>

          {backendFoods.length === 0 ? (
            <div className="fs-empty">
              <div className="fs-empty-icon">🍽️</div>
              <div className="fs-empty-title">No custom foods yet</div>
              <div className="fs-empty-sub">Add your first custom food to the database and track its nutrition perfectly.</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddForm(true)}>
                + Add Custom Food
              </button>
            </div>
          ) : (
            <div className="fs-grid">
              {backendFoods.map((food, i) => (
                <FoodCard
                  key={food.id}
                  food={{ ...food, health_score: 70, diet_tags: [], meal_types: [], allergens: [], cuisine: 'General', rating: 4.0, reviews_count: 0 }}
                  animDelay={i * 40}
                  onOpen={setSelectedFood}
                  onFavorite={toggleFavorite}
                  favorites={favorites}
                  onCompare={toggleCompare}
                  compareList={compareIds}
                  onAddDiary={addToDiary}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Compare FAB ─────────────────────────────────────────────── */}
      {showCompareFab && compareList.length > 0 && (
        <button
          className="fs-compare-fab"
          onClick={() => { setShowComparePanel(prev => !prev); setPageTab('Discover'); }}
        >
          <GitCompare size={16} />
          <span>{showComparePanel ? 'Hide' : 'View'} Comparison</span>
          <span className="fs-compare-badge">{compareList.length}</span>
        </button>
      )}

      {/* ── Detail Modal ────────────────────────────────────────────── */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          onFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedFood?.id)}
          onAddDiary={addToDiary}
          onCompare={toggleCompare}
        />
      )}

      {/* ── Add Custom Food Modal ────────────────────────────────────── */}
      {showAddForm && (
        <CustomFoodModal
          onClose={() => setShowAddForm(false)}
          onSave={() => {
            // Re-fetch backend foods
            client.get('nutrition/foods/').then(res => setBackendFoods(res.data || [])).catch(() => {});
          }}
        />
      )}
    </div>
  );
}
