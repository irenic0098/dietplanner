import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Search, Heart, Clock, Play, X, Star } from 'lucide-react';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const fetchRecipes = async () => {
    try {
      const res = await client.get(`recipes/recipes/?search=${search}&favorites=${favoritesOnly}`);
      setRecipes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [search, favoritesOnly]);

  const handleFavoriteToggle = async (recipe, e) => {
    e.stopPropagation();
    try {
      const res = await client.post(`recipes/recipes/${recipe.id}/favorite/`);
      toast.success(res.data.status === 'favorited' ? 'Added to favorites!' : 'Removed from favorites.');
      fetchRecipes();
      
      // Update modal state if open
      if (selectedRecipe && selectedRecipe.id === recipe.id) {
        setSelectedRecipe(prev => ({
          ...prev,
          is_favorite: res.data.is_favorite,
          favorites_count: res.data.is_favorite ? prev.favorites_count + 1 : prev.favorites_count - 1
        }));
      }
    } catch (err) {
      toast.error('Could not update favorites.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="header-bar">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Healthy Recipes</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Cook nutritious meals, view video tutorials, and save your favorites.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <input 
            type="text" 
            placeholder="Search ingredients, titles..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <button 
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`btn ${favoritesOnly ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', gap: '8px' }}
        >
          <Heart size={16} fill={favoritesOnly ? 'white' : 'transparent'} />
          Favorites Only
        </button>
      </div>

      {/* Recipes Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {recipes.map(recipe => (
          <div 
            key={recipe.id} 
            className="card glass glass-interactive" 
            onClick={() => setSelectedRecipe(recipe)}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{recipe.title}</h3>
              <button 
                onClick={(e) => handleFavoriteToggle(recipe, e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: recipe.is_favorite ? 'var(--danger)' : 'var(--text-muted)' }}
              >
                <Heart size={20} fill={recipe.is_favorite ? 'var(--danger)' : 'transparent'} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flexGrow: 1, lineBreak: 'normal', lineHeight: '1.4' }}>
              {recipe.description}
            </p>

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {recipe.prep_time + recipe.cook_time} mins
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                {recipe.calories} kcal
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Recipe Modal */}
      {selectedRecipe && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="glass" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '40px', borderRadius: 'var(--radius-md)', position: 'relative' }}>
            <button 
              onClick={() => setSelectedRecipe(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{selectedRecipe.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Prep: {selectedRecipe.prep_time}m | Cook: {selectedRecipe.cook_time}m</p>
              </div>
              <button 
                onClick={(e) => handleFavoriteToggle(selectedRecipe, e)}
                className="btn btn-secondary"
                style={{ display: 'flex', gap: '8px', color: selectedRecipe.is_favorite ? 'var(--danger)' : 'var(--text-primary)' }}
              >
                <Heart size={16} fill={selectedRecipe.is_favorite ? 'var(--danger)' : 'transparent'} />
                {selectedRecipe.is_favorite ? 'Favorited' : 'Add to Favorites'}
              </button>
            </div>

            {/* Video Tutorial Panel */}
            {selectedRecipe.video_url && (
              <div style={{ marginBottom: '24px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '350px', background: '#000' }}>
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={selectedRecipe.video_url} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            )}

            {/* Split ingredients and instructions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
              <div>
                <h4 style={{ fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Ingredients</h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedRecipe.ingredients.split('\n').map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Instructions</h4>
                <ol style={{ paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedRecipe.instructions.split('\n').map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Recipe Macro Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '30px', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: '800', color: 'var(--danger)' }}>{selectedRecipe.calories}</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kcal</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: '800', color: 'var(--primary)' }}>{selectedRecipe.protein}g</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>protein</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: '800', color: 'var(--accent)' }}>{selectedRecipe.carbs}g</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>carbs</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: '800', color: 'var(--warning)' }}>{selectedRecipe.fats}g</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>fats</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: '800', color: 'var(--info)' }}>{selectedRecipe.fiber}g</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>fiber</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
