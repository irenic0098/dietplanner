import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Sparkles, 
  Calculator, 
  Flame, 
  Droplet, 
  Scale, 
  ArrowRight, 
  ShieldCheck, 
  ChefHat, 
  TrendingUp, 
  Award,
  Sun,
  Moon,
  Check
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Interactive Calorie preview state
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('sedentary');
  const [calculatedStats, setCalculatedStats] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleQuickCalculate = (e) => {
    e.preventDefault();
    if (!age || !weight || !height) return;

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    // Calculate BMI
    const heightM = h / 100;
    const bmi = (w / (heightM * heightM)).toFixed(1);

    // Calculate BMR
    let bmrVal = 0;
    if (gender === 'male') {
      bmrVal = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      bmrVal = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }

    // TDEE Multipliers
    const multipliers = {
      sedentary: 1.2,
      lightly: 1.375,
      moderately: 1.55,
      very: 1.725,
      extra: 1.9
    };
    const tdee = Math.round(bmrVal * (multipliers[activity] || 1.2));

    setCalculatedStats({
      bmi,
      bmr: Math.round(bmrVal),
      tdee
    });
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', transition: 'var(--transition)' }}>
      
      {/* Landing Navigation Header */}
      <header className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '1.2rem' }}>
            NP
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>NUTRIPLATE</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Health Ecosystem</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={toggleTheme}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Log In</Link>
              <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero animate-fade-in">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
          <span className="badge badge-success" style={{ width: 'fit-content', display: 'flex', gap: '6px' }}>
            <Sparkles size={12} /> Powered by Advanced Gemini AI
          </span>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', color: 'var(--text-primary)' }}>
            Your Complete <span style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nutrition</span> & Wellness Platform
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '540px' }}>
            Calculate personalized macros, build custom AI-powered meal plans, analyze food logs dynamically, and join gamified fitness streaks in one premium interface.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            {isAuthenticated ? (
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                Enter Dashboard <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  Start Free Account <ArrowRight size={18} />
                </Link>
                <a href="#calculator" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  Test BMI Calculator
                </a>
              </>
            )}
          </div>
        </div>

        {/* Visual Graphics Hero Element */}
        <div className="animate-float" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-lg)', padding: '32px', position: 'relative', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Daily Progress Preview</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Today</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
                    <Flame size={20} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calorie Intake</p>
                    <p style={{ fontWeight: '800', fontSize: '1.2rem' }}>1,680 / 2,200 kcal</p>
                  </div>
                </div>
                <span className="badge badge-success">76%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ background: 'var(--accent-light)', padding: '8px', borderRadius: '8px', color: 'var(--accent)' }}>
                    <Droplet size={20} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hydration</p>
                    <p style={{ fontWeight: '800', fontSize: '1.2rem' }}>2,250 / 3,000 ml</p>
                  </div>
                </div>
                <span className="badge badge-info">75%</span>
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '24px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <div>🟢 Pro: 124g</div>
              <div>🔵 Carb: 180g</div>
              <div>🟡 Fat: 54g</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Estimator Calculator */}
      <section id="calculator" className="landing-section" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Check Your Requirement Instantly</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Input your metrics below to run BMR & caloric deficit estimations.</p>
        </div>

        <div className="calculator-preview-container">
          {/* Form */}
          <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
            <form onSubmit={handleQuickCalculate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Age (years)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 26" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 74" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 176" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Weekly Activity Level</label>
                <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                  <option value="sedentary">Sedentary (No exercise)</option>
                  <option value="lightly">Lightly Active (1-3 days/week)</option>
                  <option value="moderately">Moderately Active (3-5 days/week)</option>
                  <option value="very">Very Active (6-7 days/week)</option>
                  <option value="extra">Extra Active (Hard training)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                Calculate Requirement <Calculator size={18} style={{ marginLeft: '4px' }} />
              </button>
            </form>
          </div>

          {/* Results Graphic Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
            {calculatedStats ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--primary)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estimated Body Mass Index (BMI)</p>
                  <h4 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
                    {calculatedStats.bmi}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {calculatedStats.bmi < 18.5 ? "Underweight range" : calculatedStats.bmi < 25 ? "Normal weight range" : "Overweight range"}
                  </p>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--accent)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Daily Target Energy Expenditure (TDEE)</p>
                  <h4 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
                    {calculatedStats.tdee} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>kcal/day</span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    BMR: {calculatedStats.bmr} kcal. Log in to get high/low macro breakdowns!
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Calculator size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
                <h4>No calculations run yet</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Input weight, height and age on the left to see live metrics.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section className="landing-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="badge badge-info">Eco Features</span>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '12px' }}>Complete Diet & Gym Management</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Everything you need for an ultimate fitness lifecycle.</p>
        </div>

        <div className="landing-grid">
          <div className="card glass glass-interactive">
            <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Sparkles size={32} /></div>
            <h4 style={{ fontWeight: '800', marginBottom: '12px' }}>AI Recommender Engine</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Create breakfast, lunch, and dinner menus instantly parsed from target calories using Google Gemini LLM logic.
            </p>
          </div>

          <div className="card glass glass-interactive">
            <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><Calculator size={32} /></div>
            <h4 style={{ fontWeight: '800', marginBottom: '12px' }}>Macro & Fluid Loggers</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Interact with custom animations to log glasses of water, record weight trends, and update meal milestones.
            </p>
          </div>

          <div className="card glass glass-interactive">
            <div style={{ color: 'var(--warning)', marginBottom: '16px' }}><ChefHat size={32} /></div>
            <h4 style={{ fontWeight: '800', marginBottom: '12px' }}>Dietitian Integration</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Connect with registered dietitians via custom chat systems, book appointments, and get approved plans.
            </p>
          </div>

          <div className="card glass glass-interactive">
            <div style={{ color: 'var(--info)', marginBottom: '16px' }}><Award size={32} /></div>
            <h4 style={{ fontWeight: '800', marginBottom: '12px' }}>Gamified Community</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Gain points and streaks by logging healthy routines, unlocking achievement medals, and climbing the leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing comparison section */}
      <section className="landing-section" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Choose Your Health Plan</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Flexible pricing models suited to users, athletes, and nutrition professionals.</p>
        </div>

        <div className="landing-grid" style={{ maxWidth: '1000px', margin: '50px auto 0 auto' }}>
          <div className="card glass" style={{ border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Basic Tier</h4>
            <p style={{ fontSize: '2.2rem', fontWeight: '800', margin: '16px 0' }}>$0 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ month</span></p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Perfect to get started tracking calories and water logs.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> Calorie & macro tracking</div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> Daily water tracker</div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> Access recipes</div>
            </div>
            <Link to="/register" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>Register Free</Link>
          </div>

          <div className="card glass" style={{ border: '2px solid var(--primary)' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px' }} className="badge badge-success">Most Popular</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Premium Plan</h4>
            <p style={{ fontSize: '2.2rem', fontWeight: '800', margin: '16px 0', color: 'var(--primary)' }}>$9.99 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ month</span></p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Unlock full AI coaching potential, food scans, and exports.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> Everything in Free</div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> Google Gemini Coach assistant</div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> Food Vision scan upload</div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> PDF & Excel progress reports</div>
            </div>
            <Link to="/register" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>Get Premium</Link>
          </div>

          <div className="card glass" style={{ border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Dietitian Professional</h4>
            <p style={{ fontSize: '2.2rem', fontWeight: '800', margin: '16px 0' }}>$29.99 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ month</span></p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>For clinical nutritionists managing patients' calendars.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> Custom dietitian workspace</div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> Client calendar planner</div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}><Check size={16} color="var(--primary)" /> Real-time in-app direct messaging</div>
            </div>
            <Link to="/register" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>Upgrade Account</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 8%', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <p>© 2026 NUTRIPLATE Nutrition Platform. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#calculator" style={{ color: 'inherit', textDecoration: 'none' }}>BMR Calculator</a>
        </div>
      </footer>

    </div>
  );
}
