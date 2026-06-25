import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Search, Plus, Filter, Salad } from 'lucide-react';

export default function FoodSearch() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  // Custom Food Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [foodCategory, setFoodCategory] = useState('General');
  const [serving, setServing] = useState('100g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [fiber, setFiber] = useState('');

  const fetchFoods = async () => {
    try {
      const res = await client.get(`nutrition/foods/?search=${search}&category=${category}`);
      setFoods(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [search, category]);

  const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      await client.post('nutrition/foods/', {
        name,
        category: foodCategory,
        serving_size: serving,
        calories: parseFloat(calories || 0),
        protein: parseFloat(protein || 0),
        carbs: parseFloat(carbs || 0),
        fats: parseFloat(fats || 0),
        fiber: parseFloat(fiber || 0)
      });
      toast.success('Food added to ecosystem database!');
      setShowAddForm(false);
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      setFiber('');
      fetchFoods();
    } catch (err) {
      toast.error('Failed to add food.');
    }
  };

  const categories = ['Protein', 'Grains', 'Fruits', 'Vegetables', 'Nuts', 'Dairy', 'Fats', 'General'];

  return (
    <div className="animate-fade-in">
      <div className="header-bar">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Nutrition Database</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Search calories, check macros, and contribute foods to the community.</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> Add Custom Food
        </button>
      </div>

      {/* Add Custom Food Modal */}
      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass" style={{ width: '450px', padding: '32px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>Add Food Item</h3>
            <form onSubmit={handleAddFood}>
              <div className="form-group">
                <label>Food Item Name</label>
                <input type="text" placeholder="e.g. Greek Salad" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={foodCategory} onChange={(e) => setFoodCategory(e.target.value)}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Serving Unit</label>
                  <input type="text" placeholder="e.g. 100g, 1 plate" value={serving} onChange={(e) => setServing(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Calories (kcal)</label>
                  <input type="number" step="0.1" value={calories} onChange={(e) => setCalories(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Protein (g)</label>
                  <input type="number" step="0.1" value={protein} onChange={(e) => setProtein(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Carbohydrates (g)</label>
                  <input type="number" step="0.1" value={carbs} onChange={(e) => setCarbs(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Fats (g)</label>
                  <input type="number" step="0.1" value={fats} onChange={(e) => setFats(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>Fiber (g)</label>
                <input type="number" step="0.1" value={fiber} onChange={(e) => setFiber(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Food</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <input 
            type="text" 
            placeholder="Search name, category..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={16} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '180px' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Foods Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {foods.map(f => (
          <div key={f.id} className="card glass glass-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{f.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Serving: {f.serving_size}</span>
              </div>
              <span className="badge badge-info">{f.category}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '800', color: 'var(--danger)' }}>{f.calories}</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>KCAL</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '800', color: 'var(--primary)' }}>{f.protein}g</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PRO</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '800', color: 'var(--accent)' }}>{f.carbs}g</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CARB</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '800', color: 'var(--warning)' }}>{f.fats}g</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>FAT</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
