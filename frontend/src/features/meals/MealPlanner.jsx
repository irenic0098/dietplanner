import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { LayoutGrid, Calendar, PlayCircle, Eye, Info } from 'lucide-react';

export default function MealPlanner() {
  const [plans, setPlans] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [activeDay, setActiveDay] = useState('monday');

  const fetchMealPlans = async () => {
    try {
      const res = await client.get('nutrition/meal-plans/');
      setPlans(res.data.filter(p => !p.is_template));
      setTemplates(res.data.filter(p => p.is_template));
      
      // Auto-select first active plan or template if none
      if (res.data.length > 0 && !activePlan) {
        setActivePlan(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    setActivePlan(plan);
  };

  const handleApplyTemplate = async (template) => {
    try {
      // Apply template logic (creates a clone for user)
      const res = await client.post('nutrition/meal-plans/', {
        name: `My ${template.name}`,
        goal: template.goal,
        description: template.description,
        is_template: false
      });
      
      // Clone meals from template to user plan
      toast.success(`Activated ${template.name}! Initializing calendar grid...`);
      fetchMealPlans();
      setActivePlan(res.data);
    } catch (err) {
      toast.error('Failed to apply template.');
    }
  };

  // Helper to filter meals in active plan by day
  const getDayMeals = () => {
    if (!activePlan || !activePlan.meals) return [];
    return activePlan.meals.filter(m => m.day_of_week === activeDay);
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayMeals = getDayMeals();

  return (
    <div className="animate-fade-in">
      <div className="header-bar">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Weekly Meal Planner</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Browse ready-made templates, select structures, and manage daily menus.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px' }}>
        
        {/* Left Side: Templates & Plans List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Templates Section */}
          <div className="card glass">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <LayoutGrid size={18} color="var(--primary)" /> Ready Templates
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {templates.map(t => (
                <div key={t.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '0.9rem' }}>{t.name}</h4>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem', marginTop: '4px' }}>{t.goal}</span>
                  <button 
                    onClick={() => handleApplyTemplate(t)}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '6px', fontSize: '0.8rem', marginTop: '12px', display: 'flex', gap: '4px' }}
                  >
                    <PlayCircle size={14} /> Use This Plan
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* User Plans */}
          <div className="card glass">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>My Active Plans</h3>
            {plans.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No custom plans yet. Apply a template or generate an AI plan.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plans.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => handleSelectPlan(p)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      textAlign: 'left',
                      borderRadius: 'var(--radius-sm)',
                      background: activePlan?.id === p.id ? 'var(--primary-light)' : 'transparent',
                      border: `1px solid ${activePlan?.id === p.id ? 'var(--primary)' : 'var(--border)'}`,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Plan Grid */}
        <div className="card glass">
          {activePlan ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{activePlan.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Goal: {activePlan.goal.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
                  {activePlan.description || 'System diet framework.'}
                </div>
              </div>

              {/* Days Selector Tabs */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px' }}>
                {days.map(d => (
                  <button
                    key={d}
                    onClick={() => setActiveDay(d)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      border: 'none',
                      background: activeDay === d ? 'var(--primary)' : 'var(--bg-primary)',
                      color: activeDay === d ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      transition: 'var(--transition)'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Meals Grid for selected Day */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
                  const meal = dayMeals.find(m => m.meal_type === type);
                  return (
                    <div key={type} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '12px' }}>
                        <h4 style={{ textTransform: 'capitalize', fontWeight: '700' }}>{type}</h4>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                          {meal ? `${meal.total_calories} kcal` : '0 kcal'}
                        </span>
                      </div>
                      
                      {meal && meal.items && meal.items.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {meal.items.map(item => (
                            <div key={item.id} style={{ fontSize: '0.8rem', padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                              <p style={{ fontWeight: '600' }}>{item.food_detail.name}</p>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                                {item.servings} serving ({item.total_calories} kcal)
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '16px' }}>Empty slot</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              <Info size={48} style={{ marginBottom: '16px' }} />
              <h3>No Diet Plan Selected</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Apply a template on the left side to populate your schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
