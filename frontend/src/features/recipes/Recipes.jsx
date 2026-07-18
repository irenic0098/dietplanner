import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { ShoppingCart, LayoutGrid, List, RefreshCw, TrendingUp, Loader } from 'lucide-react';
import toast from 'react-hot-toast';


import './recipes.css';

import client from '../../api/client';
import { MOCK_RECIPES } from './mockData';

import HeroSearchBar from './HeroSearchBar';
import AdvancedFilters from './AdvancedFilters';
import RecipeCard from './RecipeCard';
import RecipeModal from './RecipeModal';
import AIRecipeGenerator from './AIRecipeGenerator';
import RecipeCollections from './RecipeCollections';
import SeasonalRecommendations from './SeasonalRecommendations';
import CommunitySection from './CommunitySection';
import GroceryListDrawer from './GroceryListDrawer';

// ── Page Tabs ─────────────────────────────────────────────────────────────────
const PAGE_TABS = [
  { id: 'discover', label: '🔍 Discover' },
  { id: 'collections', label: '📚 Collections' },
  { id: 'ai', label: '🤖 AI Generator' },
  { id: 'community', label: '👥 Community' },
];

const DISCOVER_PREFIXES = ['Healthy', 'Organic', 'Spiced', 'Protein', 'Crispy', 'Classic', 'Baked', 'Steamed', 'Stir-Fried', 'Low-Carb', 'Superfood', 'Fitness', 'Easy'];
const DISCOVER_BASES = ['Quinoa', 'Oats', 'Ragi', 'Bajra', 'Paneer', 'Tofu', 'Millet', 'Chicken', 'Egg', 'Broccoli', 'Avocado', 'Spinach', 'Mushroom', 'Moong Dal'];
const DISCOVER_STYLES = ['Bowl', 'Pancake', 'Salad', 'Khichdi', 'Kabab', 'Tikka', 'Smoothie', 'Chilla', 'Wrap', 'Stir-fry', 'Soup', 'Curry'];
const DISCOVER_CHEFS = ['Chef Priya Sharma', 'Chef Ananya Mehta', 'Chef Rohan Kapoor', 'Chef Meena Iyer', 'Chef Arjun Nair', 'Chef Kavya Reddy'];
const DISCOVER_CUISINES = ['Indian', 'Mediterranean', 'Asian', 'Continental', 'Mexican', 'Middle Eastern'];
const DISCOVER_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
const DISCOVER_DIET_TAG_POOL = ['Vegetarian', 'Vegan', 'Jain', 'Gluten-Free', 'Dairy-Free', 'Keto', 'High Protein', 'Low Carb', 'Low Fat', 'High Fiber'];
const DISCOVER_GOALS = ['Weight Loss', 'Weight Gain', 'Muscle Gain', 'Diabetes', 'PCOS', 'Heart Health', 'Pregnancy', 'Kids', 'Seniors'];
const DISCOVER_DIFFICULTIES = ['Easy', 'Medium', 'Beginner', 'Advanced'];
const DISCOVER_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80'
];

function generateMockRecipe(index) {
  const prefix = DISCOVER_PREFIXES[Math.floor(Math.random() * DISCOVER_PREFIXES.length)];
  const base = DISCOVER_BASES[Math.floor(Math.random() * DISCOVER_BASES.length)];
  const style = DISCOVER_STYLES[Math.floor(Math.random() * DISCOVER_STYLES.length)];
  const title = `${prefix} ${base} ${style}`;
  const cuisine = DISCOVER_CUISINES[Math.floor(Math.random() * DISCOVER_CUISINES.length)];
  const meal_type = DISCOVER_MEAL_TYPES[Math.floor(Math.random() * DISCOVER_MEAL_TYPES.length)];
  const difficulty = DISCOVER_DIFFICULTIES[Math.floor(Math.random() * DISCOVER_DIFFICULTIES.length)];
  const chef = DISCOVER_CHEFS[Math.floor(Math.random() * DISCOVER_CHEFS.length)];
  
  const prep = 5 + Math.floor(Math.random() * 4) * 5;
  const cook = 5 + Math.floor(Math.random() * 8) * 5;
  const calories = Math.round(180 + Math.random() * 320);
  const protein = Math.round(8 + Math.random() * 34);
  const carbs = Math.round(15 + Math.random() * 60);
  const fats = Math.round(4 + Math.random() * 20);
  const fiber = Math.round(2 + Math.random() * 10);
  const health_score = Math.round(75 + Math.random() * 24);

  const diet_tags = [];
  while (diet_tags.length < 2) {
    const tag = DISCOVER_DIET_TAG_POOL[Math.floor(Math.random() * DISCOVER_DIET_TAG_POOL.length)];
    if (!diet_tags.includes(tag)) diet_tags.push(tag);
  }
  const goal_tags = [];
  while (goal_tags.length < 2) {
    const goal = DISCOVER_GOALS[Math.floor(Math.random() * DISCOVER_GOALS.length)];
    if (!goal_tags.includes(goal)) goal_tags.push(goal);
  }

  const image = DISCOVER_IMAGES[Math.floor(Math.random() * DISCOVER_IMAGES.length)];

  return {
    id: `discover-${index}-${Date.now()}`,
    title,
    description: `A delicious and nutrient-packed ${title} prepared in the traditional ${cuisine} style. Perfect for satisfying cravings while maintaining a healthy lifestyle.`,
    image,
    prep_time: prep,
    cook_time: cook,
    calories,
    protein,
    carbs,
    fats,
    fiber,
    sugar: Math.round(2 + Math.random() * 8),
    sodium: Math.round(200 + Math.random() * 400),
    vitamins: { A: `${Math.round(10 + Math.random() * 60)}%`, C: `${Math.round(15 + Math.random() * 70)}%` },
    minerals: { Iron: `${Math.round(5 + Math.random() * 30)}%`, Calcium: `${Math.round(5 + Math.random() * 30)}%` },
    is_favorite: false,
    favorites_count: Math.round(10 + Math.random() * 100),
    difficulty,
    servings: 2,
    yield_unit: 'servings',
    cuisine,
    meal_type,
    diet_tags,
    goal_tags,
    health_score,
    glycemic_index: health_score > 85 ? 'Low (35)' : 'Medium (52)',
    estimated_cost: `₹${Math.round(50 + Math.random() * 150)}`,
    shelf_life: '2 days',
    storage: 'Store in an airtight container inside the refrigerator.',
    rating: Number((4.1 + Math.random() * 0.9).toFixed(1)),
    reviews_count: 5 + Math.floor(Math.random() * 95),
    video_url: null,
    chef,
    ingredients: `2 cups ${base}\n1 tbsp olive oil\n1 pinch salt\nSpices to taste\n½ cup chopped vegetables`,
    instructions: `Clean and prepare the ${base}.\nHeat olive oil in a pan.\nAdd the ingredients and sauté for a few minutes.\nSeason to taste.\nServe warm and enjoy!`,
    substitutions: [
      { original: base, substitute: 'Tofu', reason: 'High-protein vegan alternative' }
    ],
    ai_tips: [
      `Boost the protein of this meal by adding 100g grilled protein.`,
      `Ideal for ${goal_tags[0]} diets.`
    ]
  };
}

export default function Recipes() {
  // ── API + Mock Data ────────────────────────────────────────────────────────
  const [apiRecipes, setApiRecipes] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);

  // ── Local State ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeGoal, setActiveGoal] = useState(null);
  const [cuisine, setCuisine] = useState('All Cuisines');
  const [mealType, setMealType] = useState('All Meals');
  const [difficulty, setDifficulty] = useState('Any Level');
  const [maxTime, setMaxTime] = useState(120);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [pageTab, setPageTab] = useState('discover');

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [localRecipes, setLocalRecipes] = useState(MOCK_RECIPES);

  // ── Grocery List ───────────────────────────────────────────────────────────
  const [groceryItems, setGroceryItems] = useState([]);
  const [groceryOpen, setGroceryOpen] = useState(false);

  // ── Infinite Scroll Discover ────────────────────────────────────────────────
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const discoverObserverRef = useRef(null);

  const loadMoreDiscoverRecipes = () => {
    if (discoverLoading) return;
    setDiscoverLoading(true);
    setTimeout(() => {
      setLocalRecipes(prev => {
        const nextBatch = [];
        for (let i = 0; i < 6; i++) {
          nextBatch.push(generateMockRecipe(prev.length + i));
        }
        return [...prev, ...nextBatch];
      });
      setDiscoverLoading(false);
    }, 800);
  };

  useEffect(() => {
    if (pageTab !== 'discover' || discoverLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreDiscoverRecipes();
        }
      },
      { threshold: 0.8 }
    );

    if (discoverObserverRef.current) {
      observer.observe(discoverObserverRef.current);
    }

    return () => {
      if (discoverObserverRef.current) {
        observer.unobserve(discoverObserverRef.current);
      }
    };
  }, [pageTab, localRecipes, discoverLoading]);


  // ── Fetch from API ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchFromAPI = async () => {
      try {
        setApiLoading(true);
        const res = await client.get(`recipes/recipes/?search=${search}&favorites=${favoritesOnly}`);
        if (res.data && res.data.length > 0) setApiRecipes(res.data);
      } catch {
        // silently fall back to mock data
      } finally {
        setApiLoading(false);
      }
    };
    fetchFromAPI();
  }, [search, favoritesOnly]);

  // ── Merged Recipes (API + Mock, deduplicated by id) ───────────────────────
  const allRecipes = useMemo(() => {
    const apiIds = new Set(apiRecipes.map(r => r.id));
    const extras = localRecipes.filter(r => !apiIds.has(r.id));
    return [...apiRecipes, ...extras];
  }, [apiRecipes, localRecipes]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allRecipes.filter(r => {
      if (search) {
        const q = search.toLowerCase();
        const inTitle = r.title?.toLowerCase().includes(q);
        const inDesc = r.description?.toLowerCase().includes(q);
        const inIngredients = r.ingredients?.toLowerCase().includes(q);
        const inCuisine = r.cuisine?.toLowerCase().includes(q);
        const inChef = r.chef?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inIngredients && !inCuisine && !inChef) return false;
      }
      if (favoritesOnly && !r.is_favorite) return false;
      if (activeFilter !== 'all') {
        const tags = [...(r.diet_tags || [])];
        if (!tags.includes(activeFilter)) return false;
      }
      if (activeGoal && !(r.goal_tags || []).includes(activeGoal)) return false;
      if (cuisine !== 'All Cuisines' && r.cuisine !== cuisine) return false;
      if (mealType !== 'All Meals' && r.meal_type !== mealType) return false;
      if (difficulty !== 'Any Level' && r.difficulty !== difficulty) return false;
      const totalTime = (r.prep_time || 0) + (r.cook_time || 0);
      if (maxTime < 120 && totalTime > maxTime) return false;
      return true;
    });
  }, [allRecipes, search, favoritesOnly, activeFilter, activeGoal, cuisine, mealType, difficulty, maxTime]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFavoriteToggle = useCallback(async (recipe) => {
    const updated = localRecipes.map(r =>
      r.id === recipe.id ? { ...r, is_favorite: !r.is_favorite } : r
    );
    setLocalRecipes(updated);
    if (selectedRecipe?.id === recipe.id) {
      setSelectedRecipe(p => ({ ...p, is_favorite: !p.is_favorite }));
    }
    // Try API
    try {
      const res = await client.post(`recipes/recipes/${recipe.id}/favorite/`);
      toast.success(res.data.status === 'favorited' ? '❤️ Added to favorites!' : '💔 Removed from favorites.');
    } catch {
      toast.success(!recipe.is_favorite ? '❤️ Saved to favorites!' : 'Removed from favorites.');
    }
  }, [localRecipes, selectedRecipe]);

  const handleAddGrocery = useCallback((recipe) => {
    if (!recipe.ingredients) return;
    const newItems = recipe.ingredients
      .split('\n')
      .filter(s => s.trim())
      .map((name, i) => ({
        id: `${recipe.id}-${i}-${Date.now()}`,
        name: name.trim(),
        recipeName: recipe.title,
      }));
    // Deduplicate by name (case-insensitive)
    setGroceryItems(prev => {
      const existingNames = new Set(prev.map(g => g.name.toLowerCase()));
      const deduped = newItems.filter(n => !existingNames.has(n.name.toLowerCase()));
      return [...prev, ...deduped];
    });
    toast.success(`🛒 Added ${newItems.length} items to grocery list!`);
  }, []);

  const handleRemoveGrocery = useCallback((id) => {
    setGroceryItems(p => p.filter(g => g.id !== id));
  }, []);

  const handleAIGenerated = useCallback((recipe) => {
    setLocalRecipes(p => [recipe, ...p]);
    setSelectedRecipe(recipe);
    setPageTab('discover');
    toast.success('🤖 AI Recipe added! Tap to view full details.');
  }, []);

  const handleGoalClick = (goal) => {
    setActiveGoal(p => p === goal ? null : goal);
  };

  const handleClearFilters = () => {
    setActiveFilter('all');
    setActiveGoal(null);
    setCuisine('All Cuisines');
    setMealType('All Meals');
    setDifficulty('Any Level');
    setMaxTime(120);
  };

  const handleSeasonalTag = (ing) => {
    setSearch(ing);
    setPageTab('discover');
    toast(`Showing recipes with "${ing}"`, { icon: '🌿' });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="rcp-page">
      {/* Hero */}
      <HeroSearchBar
        search={search}
        onSearch={setSearch}
        activeGoal={activeGoal}
        onGoalClick={handleGoalClick}
      />

      {/* Page Tabs */}
      <div className="rcp-page-tabs">
        {PAGE_TABS.map(t => (
          <button
            key={t.id}
            className={`rcp-page-tab ${pageTab === t.id ? 'active' : ''}`}
            onClick={() => setPageTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Discover Tab ──────────────────────────────────────────────────── */}
      {pageTab === 'discover' && (
        <>
          {/* Seasonal banner */}
          <SeasonalRecommendations onTagClick={handleSeasonalTag} />

          {/* Filters */}
          <AdvancedFilters
            activeFilter={activeFilter} onFilterClick={setActiveFilter}
            cuisine={cuisine} onCuisine={setCuisine}
            mealType={mealType} onMealType={setMealType}
            difficulty={difficulty} onDifficulty={setDifficulty}
            maxTime={maxTime} onMaxTime={setMaxTime}
            onClear={handleClearFilters}
          />

          {/* Toolbar */}
          <div className="rcp-toolbar">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="rcp-stat-chip"><TrendingUp size={13} color="var(--primary)" />{filtered.length} recipes found</span>
              <button
                className={`rcp-stat-chip ${favoritesOnly ? 'active' : ''}`}
                style={{ cursor: 'pointer', border: `1px solid ${favoritesOnly ? 'var(--primary)' : 'var(--border)'}`, color: favoritesOnly ? 'var(--primary)' : 'var(--text-secondary)', background: favoritesOnly ? 'var(--primary-light)' : 'var(--bg-secondary)' }}
                onClick={() => setFavoritesOnly(p => !p)}
              >
                ❤️ {favoritesOnly ? 'All Recipes' : 'Saved Only'}
              </button>
              {activeGoal && (
                <span className="rcp-stat-chip" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  Goal: {activeGoal}
                </span>
              )}
            </div>
            <div className="rcp-view-btns">
              <button className={`rcp-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view"><LayoutGrid size={15} /></button>
              <button className={`rcp-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view"><List size={15} /></button>
            </div>
          </div>

          {/* Recipe Grid */}
          {apiLoading && localRecipes.length === 0 ? (
            <div className="rcp-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 360 }}>
                  <div className="rcp-skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="rcp-skeleton" style={{ height: 20, width: '70%' }} />
                    <div className="rcp-skeleton" style={{ height: 14, width: '90%' }} />
                    <div className="rcp-skeleton" style={{ height: 14, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rcp-empty">
              <div className="rcp-empty-icon">🍽️</div>
              <div className="rcp-empty-title">No recipes found</div>
              <div className="rcp-empty-sub">Try adjusting your filters or search term</div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleClearFilters}>
                <RefreshCw size={14} /> Clear Filters
              </button>
            </div>
          ) : (
            <div className={`rcp-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {filtered.map((recipe, idx) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  delay={idx * 50}
                  onOpen={setSelectedRecipe}
                  onFavorite={handleFavoriteToggle}
                  onAddGrocery={handleAddGrocery}
                  onAddMeal={() => toast.success(`Added ${recipe.title} to Meal Plan!`)}
                />
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger element */}
          <div
            ref={discoverObserverRef}
            style={{
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '20px',
              visibility: discoverLoading ? 'visible' : 'hidden'
            }}
          >
            <Loader className="animate-spin" color="var(--primary)" size={24} style={{ animation: 'rcp-spin-slow 1s linear infinite' }} />
          </div>
        </>
      )}

      {/* ── Collections Tab ─────────────────────────────────────────────── */}
      {pageTab === 'collections' && (
        <RecipeCollections />
      )}

      {/* ── AI Generator Tab ────────────────────────────────────────────── */}
      {pageTab === 'ai' && (
        <AIRecipeGenerator onGenerated={handleAIGenerated} />
      )}

      {/* ── Community Tab ───────────────────────────────────────────────── */}
      {pageTab === 'community' && (
        <CommunitySection />
      )}

      {/* ── Recipe Detail Modal ──────────────────────────────────────────── */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onFavorite={handleFavoriteToggle}
          onAddGrocery={handleAddGrocery}
        />
      )}

      {/* ── Grocery List FAB ─────────────────────────────────────────────── */}
      <button
        className="rcp-grocery-fab"
        onClick={() => setGroceryOpen(true)}
        title="Open Grocery List"
      >
        <ShoppingCart size={22} />
        {groceryItems.length > 0 && (
          <span className="rcp-grocery-fab-badge">{groceryItems.length > 99 ? '99+' : groceryItems.length}</span>
        )}
      </button>

      {/* ── Grocery Drawer ───────────────────────────────────────────────── */}
      {groceryOpen && (
        <GroceryListDrawer
          items={groceryItems}
          onClose={() => setGroceryOpen(false)}
          onRemove={handleRemoveGrocery}
          onClear={() => setGroceryItems([])}
        />
      )}
    </div>
  );
}
