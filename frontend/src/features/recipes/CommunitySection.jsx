import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, UserPlus, Upload, Loader } from 'lucide-react';
import { COMMUNITY_RECIPES } from './mockData';
import toast from 'react-hot-toast';

// Helper lists to generate infinite unique recipes
const COMMUNITY_USERS = [
  { name: 'Sneha P.', avatar: '👩‍🍳' },
  { name: 'Arjun M.', avatar: '👨‍🍳' },
  { name: 'Priya K.', avatar: '🧑‍🍳' },
  { name: 'Rohan G.', avatar: '👨‍🍳' },
  { name: 'Ananya S.', avatar: '👩‍🍳' },
  { name: 'Vikram R.', avatar: '🧑‍🍳' },
  { name: 'Meera J.', avatar: '👩‍🍳' },
  { name: 'Kabir B.', avatar: '👨‍🍳' },
  { name: 'Neha Sharma', avatar: '👩‍🍳' },
  { name: 'Dev Patel', avatar: '👨‍🍳' },
];

const PREFIXES = ['Healthy', 'Organic', 'Spiced', 'Protein', 'Crispy', 'Classic', 'Baked', 'Steamed', 'Stir-Fried', 'Low-Carb', 'Superfood', 'Fitness', 'Easy'];
const BASES = ['Quinoa', 'Oats', 'Ragi', 'Bajra', 'Paneer', 'Tofu', 'Millet', 'Chicken', 'Egg', 'Broccoli', 'Avocado', 'Spinach', 'Mushroom', 'Moong Dal'];
const STYLES = ['Bowl', 'Pancake', 'Salad', 'Khichdi', 'Kabab', 'Tikka', 'Smoothie', 'Chilla', 'Wrap', 'Stir-fry', 'Soup', 'Curry'];

const IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  'https://images.unsplash.com/photo-1496116211227-7c3ccb8f583f?w=400&q=80'
];

const DIET_TAG_POOL = ['Vegetarian', 'Vegan', 'Jain', 'Gluten-Free', 'Dairy-Free', 'Keto', 'High Protein', 'Low Carb', 'Low Fat', 'High Fiber'];

function generateRandomRecipe(index) {
  const userObj = COMMUNITY_USERS[Math.floor(Math.random() * COMMUNITY_USERS.length)];
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const base = BASES[Math.floor(Math.random() * BASES.length)];
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];
  const title = `${prefix} ${base} ${style}`;
  const image = IMAGES[Math.floor(Math.random() * IMAGES.length)];
  
  // Dynamic tag picking
  const tagsCount = 1 + Math.floor(Math.random() * 2);
  const tags = [];
  while (tags.length < tagsCount) {
    const randomTag = DIET_TAG_POOL[Math.floor(Math.random() * DIET_TAG_POOL.length)];
    if (!tags.includes(randomTag)) {
      tags.push(randomTag);
    }
  }

  const hoursAgo = 1 + Math.floor(Math.random() * 23);

  return {
    id: `infinite-${index}-${Date.now()}`,
    title,
    user: userObj.name,
    avatar: userObj.avatar,
    rating: Number((4.2 + Math.random() * 0.8).toFixed(1)),
    reviews: 5 + Math.floor(Math.random() * 95),
    image,
    tags,
    calories: Math.round(150 + Math.random() * 250),
    likes: 10 + Math.floor(Math.random() * 300),
    timeAgo: `${hoursAgo} hours ago`,
  };
}

function StarRating({ rating }) {
  return (
    <div className="rcp-stars">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`rcp-star ${s <= Math.round(rating) ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function CommunitySection() {
  const [recipes, setRecipes] = useState(COMMUNITY_RECIPES);
  const [liked, setLiked] = useState([]);
  const [followed, setFollowed] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCuisine, setNewCuisine] = useState('Indian');
  const [newDesc, setNewDesc] = useState('');

  const observerRef = useRef(null);

  const toggleLike = (id) => setLiked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleFollow = (id) => {
    setFollowed(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    toast.success(followed.includes(id) ? 'Unfollowed' : 'Following!');
  };

  // Function to load more items infinitely
  const loadMoreRecipes = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setRecipes(prev => {
        const nextBatch = [];
        for (let i = 0; i < 6; i++) {
          nextBatch.push(generateRandomRecipe(prev.length + i));
        }
        return [...prev, ...nextBatch];
      });
      setLoading(false);
    }, 800); // Small delay to feel premium
  };

  // Intersection observer hook to trigger load
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRecipes();
        }
      },
      { threshold: 0.8 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [recipes, loading]);

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    // Add user recipe to the top of the feed
    const userRecipe = {
      id: `user-${Date.now()}`,
      title: newTitle,
      user: 'You',
      avatar: '👑',
      rating: 5.0,
      reviews: 1,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      tags: ['Vegetarian', newCuisine],
      calories: 210,
      likes: 1,
      timeAgo: 'Just now',
    };

    setRecipes(prev => [userRecipe, ...prev]);
    toast.success('Your recipe has been published to the community feed! 🎉');
    
    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setShowUpload(false);
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 className="rcp-section-title">👥 Community Recipes</h2>
          <p className="rcp-section-sub">User-uploaded recipes, rated and verified by the community (Infinite Scroll Enabled)</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.85rem' }} onClick={() => setShowUpload(p => !p)}>
          <Upload size={14} /> Share Recipe
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <form onSubmit={handleUploadSubmit} className="glass animate-fade-in" style={{ borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 20, border: '1px solid var(--glass-border)' }}>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>📤 Upload Your Recipe</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="recipe-title">Recipe Title</label>
              <input
                id="recipe-title"
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. My Special Dal Tadka"
              />
            </div>
            <div className="form-group">
              <label htmlFor="recipe-cuisine">Cuisine</label>
              <select
                id="recipe-cuisine"
                value={newCuisine}
                onChange={e => setNewCuisine(e.target.value)}
              >
                <option value="Indian">Indian</option>
                <option value="Continental">Continental</option>
                <option value="Asian">Asian</option>
                <option value="Mediterranean">Mediterranean</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label htmlFor="recipe-desc">Description</label>
              <textarea
                id="recipe-desc"
                rows={2}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Tell us about your recipe..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              Submit Recipe
            </button>
            <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }} onClick={() => setShowUpload(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rcp-community-grid">
        {recipes.map((recipe, index) => (
          <div key={recipe.id} className="rcp-community-card animate-fade-in" style={{ animationDelay: `${(index % 6) * 50}ms` }}>
            <img src={recipe.image} alt={recipe.title} className="rcp-community-img" loading="lazy" />
            <div className="rcp-community-body">
              <div className="rcp-community-user">
                <div className="rcp-avatar">{recipe.avatar}</div>
                <div>
                  <div className="rcp-community-name">{recipe.user}</div>
                  <div className="rcp-community-time">{recipe.timeAgo}</div>
                </div>
                {recipe.user !== 'You' && (
                  <button
                    className="btn"
                    style={{
                      marginLeft: 'auto', padding: '4px 12px', fontSize: '0.72rem',
                      background: followed.includes(recipe.id) ? 'var(--primary)' : 'var(--bg-primary)',
                      color: followed.includes(recipe.id) ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${followed.includes(recipe.id) ? 'var(--primary)' : 'var(--border)'}`,
                    }}
                    onClick={() => toggleFollow(recipe.id)}
                  >
                    <UserPlus size={11} /> {followed.includes(recipe.id) ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              <div className="rcp-community-title">{recipe.title}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <StarRating rating={recipe.rating} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{recipe.rating} ({recipe.reviews})</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {recipe.tags.map(t => <span key={t} className="rcp-img-tag" style={{ fontSize: '0.68rem', background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{t}</span>)}
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', alignSelf: 'center' }}>{recipe.calories} kcal</span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn"
                  style={{
                    flex: 1, padding: '7px 12px', fontSize: '0.78rem',
                    background: liked.includes(recipe.id) ? 'rgba(239,68,68,0.1)' : 'var(--bg-primary)',
                    color: liked.includes(recipe.id) ? 'var(--danger)' : 'var(--text-muted)',
                    border: `1px solid ${liked.includes(recipe.id) ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                  }}
                  onClick={() => toggleLike(recipe.id)}
                >
                  <Heart size={12} fill={liked.includes(recipe.id) ? 'var(--danger)' : 'transparent'} />
                  {recipe.likes + (liked.includes(recipe.id) ? 1 : 0)}
                </button>
                <button
                  className="btn"
                  style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem', background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  onClick={() => toast.success('Comments coming soon!')}
                >
                  <MessageCircle size={12} /> Comment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Trigger element */}
      <div
        ref={observerRef}
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px',
          visibility: loading ? 'visible' : 'hidden'
        }}
      >
        <Loader className="animate-spin" color="var(--primary)" size={24} style={{ animation: 'rcp-spin-slow 1s linear infinite' }} />
      </div>
    </div>
  );
}

