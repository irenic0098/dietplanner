import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import {
  Check,
  Droplets,
  Scale,
  PlusCircle,
  Activity,
  Flame,
  Smile,
  Trophy,
  Brain,
  Trash2,
  Apple,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MOOD_EMOJIS = {
  happy: { emoji: '😊', label: 'Happy' },
  neutral: { emoji: '😐', label: 'Neutral' },
  energetic: { emoji: '⚡', label: 'Energetic' },
  tired: { emoji: '😴', label: 'Tired' },
  stressed: { emoji: '😰', label: 'Stressed' },
  sad: { emoji: '😢', label: 'Sad' },
};

const CHALLENGES = [
  { id: 1, title: 'Hydration Hero', desc: 'Drink 3L of water daily for 5 days', progress: '3/5 days', reward: '+100 XP' },
  { id: 2, title: 'Macro Master', desc: 'Stay within 10% of protein target', progress: 'Completed', reward: '+150 XP', done: true },
  { id: 3, title: 'Step Challenger', desc: 'Walk 10,000 steps daily for a week', progress: '0/7 days', reward: '+200 XP' },
];

/* ─── 3D Cylinder Component ─── */
function Cylinder3D({ percent, label, value, colorClass, icon }) {
  const fillHeight = Math.max(4, Math.min(percent, 100));
  return (
    <div className={`cylinder-container ${colorClass}`}>
      <div className="cyl-icon">{icon}</div>
      <div className="cylinder-3d">
        <div className="cylinder-top" />
        <div className="cylinder-fill" style={{ height: `${fillHeight}%` }}>
          <div className="fill-shimmer" />
        </div>
        <div className="cylinder-bottom" />
      </div>
      <div className="cyl-percent">{percent}%</div>
      <div className="cyl-label">{label}</div>
      <div className="cyl-val">{value}</div>
    </div>
  );
}

export default function DailyTracking() {
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weight, setWeight] = useState('');
  const [weightLogs, setWeightLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Custom meal input
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFats, setMealFats] = useState('');
  const [mealFiber, setMealFiber] = useState('');
  const [mealSugar, setMealSugar] = useState('');

  // Workout/Activity log input
  const [actType, setActType] = useState('walking');
  const [actDuration, setActDuration] = useState('');
  const [actCalories, setActCalories] = useState('');
  const [actSteps, setActSteps] = useState('');

  // Wellness input
  const [wellSleep, setWellSleep] = useState(7);
  const [wellMood, setWellMood] = useState('neutral');
  const [wellEnergy, setWellEnergy] = useState(5);
  const [wellStress, setWellStress] = useState(3);

  const fetchTrackingData = async () => {
    setLoading(true);
    try {
      const [summaryRes, weightRes] = await Promise.all([
        client.get('tracking/today-summary/'),
        client.get('tracking/weight/'),
      ]);
      setSummary(summaryRes.data);
      setWeightLogs(weightRes.data || []);
      if (summaryRes.data.wellness) {
        setWellSleep(summaryRes.data.wellness.sleep_hours || 7);
        setWellMood(summaryRes.data.wellness.mood || 'neutral');
        setWellEnergy(summaryRes.data.wellness.energy_level || 5);
        setWellStress(summaryRes.data.wellness.stress_level || 3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const handleWaterAdd = async (amount) => {
    try {
      await client.post('tracking/water/', { amount, action: 'add' });
      toast.success(`Logged ${amount}ml of water! 💧`);
      fetchTrackingData();
    } catch (err) {
      toast.error('Failed to log water.');
    }
  };

  const handleWeightLog = async (e) => {
    e.preventDefault();
    if (!weight) return;
    try {
      await client.post('tracking/weight/', { weight: parseFloat(weight) });
      toast.success(`Logged weight: ${weight} kg ⚖️`);
      setWeight('');
      fetchTrackingData();
    } catch (err) {
      toast.error('Failed to log weight.');
    }
  };

  const handleMealToggle = async (meal_type, macros, currentStatus) => {
    try {
      await client.post('tracking/meal-completions/', {
        meal_type,
        completed: !currentStatus,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
        fiber: macros.fiber || 0,
        sugar: macros.sugar || 0,
      });
      toast.success(`${meal_type.toUpperCase()} completion updated! 🍽️`);
      fetchTrackingData();
    } catch (err) {
      toast.error('Failed to update meal completion.');
    }
  };

  const handleCustomMealSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('tracking/meal-completions/', {
        meal_type: mealType,
        completed: true,
        calories: parseFloat(mealCalories || 0),
        protein: parseFloat(mealProtein || 0),
        carbs: parseFloat(mealCarbs || 0),
        fats: parseFloat(mealFats || 0),
        fiber: parseFloat(mealFiber || 0),
        sugar: parseFloat(mealSugar || 0),
      });
      toast.success(`Logged custom ${mealType}! 😋`);
      setShowMealModal(false);
      setMealName(''); setMealCalories(''); setMealProtein('');
      setMealCarbs(''); setMealFats(''); setMealFiber(''); setMealSugar('');
      fetchTrackingData();
    } catch (err) {
      toast.error('Failed to log custom meal.');
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('tracking/activity/', {
        activity_type: actType,
        duration: parseInt(actDuration || 0),
        calories_burned: parseFloat(actCalories || 0),
        steps: parseInt(actSteps || 0),
      });
      toast.success('Activity logged! 🏃');
      setActDuration(''); setActCalories(''); setActSteps('');
      fetchTrackingData();
    } catch (err) {
      toast.error('Failed to log activity.');
    }
  };

  const handleWellnessSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('tracking/wellness/', {
        sleep_hours: parseFloat(wellSleep),
        mood: wellMood,
        energy_level: parseInt(wellEnergy),
        stress_level: parseInt(wellStress),
      });
      toast.success('Health & Wellness stats updated! 😊');
      fetchTrackingData();
    } catch (err) {
      toast.error('Failed to update wellness.');
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await client.delete(`tracking/activity/${id}/`);
      toast.success('Activity deleted.');
      fetchTrackingData();
    } catch (err) {
      toast.error('Failed to delete activity.');
    }
  };

  // Data computations
  const consumed = summary?.consumed || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0 };
  const target = summary?.target || { calories: 2000, water: 3000, steps: 10000, sleep: 8 };
  const waterLogged = summary?.water_ml || 0;
  const stepsLogged = summary?.activities?.steps || 0;
  const activeCalories = summary?.activities?.calories_burned || 0;
  const dailyScore = summary?.daily_score || 0;

  const calPercent = target.calories > 0 ? Math.min(Math.round((consumed.calories / target.calories) * 100), 100) : 0;
  const waterPercent = target.water > 0 ? Math.min(Math.round((waterLogged / target.water) * 100), 100) : 0;
  const stepsPercent = target.steps > 0 ? Math.min(Math.round((stepsLogged / target.steps) * 100), 100) : 0;
  const sleepPercent = target.sleep > 0 ? Math.min(Math.round(((summary?.wellness?.sleep_hours || 0) / target.sleep) * 100), 100) : 0;

  // AI Tips
  const remainingCals = target.calories - consumed.calories;
  const isProteinLow = consumed.protein < (target.calories * 0.25 / 4) && consumed.calories > (target.calories * 0.7);

  const getAISuggestions = () => {
    if (consumed.calories === 0) return '💡 No stats logged yet. Start by logging your breakfast or first glass of water!';
    let tips = [];
    if (isProteinLow) tips.push('⚠️ Protein is low — try a whey shake or egg wrap.');
    if (remainingCals > 400) tips.push(`🔥 ${remainingCals} kcal remaining — a protein oat bowl would fit perfectly.`);
    else if (remainingCals < 0) tips.push('🚫 Calorie target exceeded — stick to herbal teas and hydration.');
    if (waterLogged < 1500) tips.push('💧 Under 1.5L water — drink a large glass now!');
    if (stepsLogged < 4000) tips.push('🚶 Low steps — a 15-min walk adds ~2,000 steps and burns ~70 kcal.');
    return tips.length > 0 ? tips.join(' · ') : '✨ Great balance! Keep following your meal plan consistently.';
  };

  // Weekly chart data from weight logs (last 7 entries)
  const recentWeightLogs = [...weightLogs].slice(-7);
  const weeklyWeightChart = {
    labels: recentWeightLogs.map(l => {
      const d = new Date(l.logged_at);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Weight (kg)',
      data: recentWeightLogs.map(l => l.weight),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#6366f1',
      pointRadius: 5,
    }]
  };

  // Daily macro breakdown bar chart
  const macroBarChart = {
    labels: ['Calories', 'Protein (g)', 'Carbs (g)', 'Fats (g)', 'Fiber (g)', 'Sugar (g)'],
    datasets: [
      {
        label: 'Consumed',
        data: [consumed.calories, consumed.protein, consumed.carbs, consumed.fats, consumed.fiber, consumed.sugar],
        backgroundColor: ['rgba(99,102,241,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(239,68,68,0.7)', 'rgba(168,85,247,0.7)', 'rgba(236,72,153,0.7)'],
        borderRadius: 8,
      },
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw}` } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
    },
  };

  const scoreColor = dailyScore >= 80 ? '#10b981' : dailyScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '48px' }}>
      <style>{`
        /* ─── Cylinder 3D ─── */
        @keyframes cylPulse {
          0%, 100% { box-shadow: 0 0 16px var(--cyl-glow); }
          50% { box-shadow: 0 0 28px var(--cyl-glow), 0 0 50px var(--cyl-glow); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
        @keyframes fillRise {
          from { height: 0% !important; }
          to { height: var(--fill-h); }
        }
        .isometric-viewport {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          background: radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.08) 0%, var(--bg-secondary) 70%);
          border-radius: 24px;
          padding: 40px 24px 28px;
          perspective: 900px;
          border: 1px solid var(--border);
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
          min-height: 280px;
        }
        .cylinder-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          transform-style: preserve-3d;
          transform: rotateX(22deg) rotateY(-12deg);
          transition: transform 0.4s ease;
          cursor: default;
        }
        .cylinder-container:hover {
          transform: rotateX(12deg) rotateY(-5deg) scale(1.06);
        }
        .cyl-icon {
          font-size: 1.3rem;
          margin-bottom: 4px;
        }
        .cylinder-3d {
          position: relative;
          width: 76px;
          height: 170px;
          background: rgba(255,255,255,0.04);
          border-radius: 38px / 16px;
          transform-style: preserve-3d;
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
          box-shadow: inset 0 -8px 20px rgba(0,0,0,0.18);
        }
        .cylinder-top {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 76px;
          height: 30px;
          background: var(--bg-card);
          border-radius: 50%;
          border: 1px solid var(--border);
          z-index: 10;
        }
        .cylinder-bottom {
          position: absolute;
          bottom: -14px;
          left: 50%;
          transform: translateX(-50%);
          width: 76px;
          height: 28px;
          background: rgba(0,0,0,0.2);
          border-radius: 50%;
          z-index: 0;
        }
        .cylinder-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          border-radius: 38px / 14px;
          transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          animation: cylPulse 3s ease-in-out infinite;
        }
        .fill-shimmer {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.18) 50%, transparent 80%);
          animation: shimmer 2.5s infinite;
          pointer-events: none;
        }
        .cyl-water { --cyl-glow: rgba(14,165,233,0.4); }
        .cyl-water .cylinder-fill { background: linear-gradient(180deg, #7dd3fc, #0284c7); }
        .cyl-calories { --cyl-glow: rgba(239,68,68,0.4); }
        .cyl-calories .cylinder-fill { background: linear-gradient(180deg, #fca5a5, #dc2626); }
        .cyl-steps { --cyl-glow: rgba(16,185,129,0.4); }
        .cyl-steps .cylinder-fill { background: linear-gradient(180deg, #6ee7b7, #059669); }
        .cyl-sleep { --cyl-glow: rgba(168,85,247,0.4); }
        .cyl-sleep .cylinder-fill { background: linear-gradient(180deg, #d8b4fe, #7c3aed); }
        .cyl-percent {
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--text-primary);
          margin-top: 8px;
        }
        .cyl-label {
          font-weight: 800;
          font-size: 0.78rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .cyl-val {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
        }
        /* Score dial */
        .score-dial-3d {
          position: relative;
          width: 148px;
          height: 148px;
          border-radius: 50%;
          transform: rotateX(18deg) rotateY(-10deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 16px 40px rgba(0,0,0,0.25);
        }
        .score-dial-inner {
          width: 114px;
          height: 114px;
          border-radius: 50%;
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        /* Tabs */
        .tracking-tabs {
          display: flex;
          border-bottom: 2px solid var(--border);
          margin-bottom: 28px;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tracking-tabs::-webkit-scrollbar { display: none; }
        .tab-btn {
          padding: 12px 22px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-weight: 700;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          font-size: 0.88rem;
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        }
        .tab-btn:hover { color: var(--primary); background: var(--primary-light); }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); background: var(--primary-light); }
        /* Progress bar row */
        .tracker-progress-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        /* Macro pill */
        .macro-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px 20px;
          flex: 1;
          min-width: 80px;
        }
        /* Stat mini card */
        .stat-mini {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="header-bar">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Daily Activity & Health Tracker</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Log meals, water, workouts & wellness to earn your daily health score.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchTrackingData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Sync
          </button>
          <button className="btn btn-primary" onClick={() => setShowMealModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} /> Log Meal
          </button>
        </div>
      </div>

      {/* ── AI Coach Banner ── */}
      <div className="card glass animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(99,102,241,0.07) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        padding: '16px 24px',
        borderRadius: '16px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <Brain size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--primary)' }}>Smart Coach:</strong> {getAISuggestions()}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tracking-tabs">
        {[
          { key: 'dashboard', icon: <Trophy size={16} />, label: '3D Progress' },
          { key: 'nutrition', icon: <Apple size={16} />, label: 'Food & Nutrition' },
          { key: 'activity', icon: <Activity size={16} />, label: 'Activity & Weight' },
          { key: 'wellness', icon: <Smile size={16} />, label: 'Health & Wellness' },
          { key: 'analytics', icon: <BarChart2 size={16} />, label: 'Analytics' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB: Dashboard / 3D ══════════════ */}
      {activeTab === 'dashboard' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '28px', flexWrap: 'wrap' }}>
            {/* 3D Cylinders */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📊</span> 3D Metric Visualizer
              </h3>
              <div className="isometric-viewport">
                <Cylinder3D percent={calPercent} label="Calories" value={`${consumed.calories} / ${target.calories} kcal`} colorClass="cyl-calories" icon="🔥" />
                <Cylinder3D percent={waterPercent} label="Hydration" value={`${waterLogged} / ${target.water} ml`} colorClass="cyl-water" icon="💧" />
                <Cylinder3D percent={stepsPercent} label="Steps" value={`${stepsLogged} / ${target.steps}`} colorClass="cyl-steps" icon="🚶" />
                <Cylinder3D percent={sleepPercent} label="Sleep" value={`${summary?.wellness?.sleep_hours || 0} / ${target.sleep} hrs`} colorClass="cyl-sleep" icon="😴" />
              </div>

              {/* Quick stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div className="stat-mini">
                  <span style={{ fontSize: '1.4rem' }}>🏃</span>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Calories</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{activeCalories} kcal</div>
                  </div>
                </div>
                <div className="stat-mini">
                  <span style={{ fontSize: '1.4rem' }}>🍽️</span>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Net Calories</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{Math.max(0, consumed.calories - activeCalories)} kcal</div>
                  </div>
                </div>
                <div className="stat-mini">
                  <span style={{ fontSize: '1.4rem' }}>💪</span>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Protein</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{consumed.protein}g</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Score + Streaks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Score Dial */}
              <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Daily Health Score
                </h3>
                <div className="score-dial-3d" style={{
                  background: `conic-gradient(${scoreColor} 0% ${dailyScore}%, rgba(255,255,255,0.06) ${dailyScore}% 100%)`
                }}>
                  <div className="score-dial-inner">
                    <span style={{ fontSize: '2.6rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{dailyScore}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>/ 100 pts</span>
                  </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {dailyScore >= 80 && <span style={{ fontSize: '0.78rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 12px', borderRadius: '99px', fontWeight: 700 }}>🌟 Excellent</span>}
                  {dailyScore >= 50 && dailyScore < 80 && <span style={{ fontSize: '0.78rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '4px 12px', borderRadius: '99px', fontWeight: 700 }}>👍 Good Progress</span>}
                  {dailyScore < 50 && <span style={{ fontSize: '0.78rem', background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '4px 12px', borderRadius: '99px', fontWeight: 700 }}>📈 Keep Going</span>}
                </div>
                <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  Calories (30pt) · Water (25pt) · Steps (25pt) · Sleep (20pt)
                </p>
              </div>

              {/* Streak card */}
              <div className="card glass">
                <div className="card-title"><Flame size={18} color="var(--warning)" /> Streaks</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '14px' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '14px 18px', borderRadius: '14px', textAlign: 'center', minWidth: '80px' }}>
                    <Flame color="var(--primary)" size={26} />
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '4px' }}>{summary?.streak || 0}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Day Streak</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['💧', '🍗', '😴', '🔥', '🏃', '⭐'].map((emoji, i) => (
                      <span key={i} style={{ fontSize: '1.4rem', opacity: i < Math.min(6, Math.ceil(dailyScore / 17)) ? 1 : 0.2, transition: 'opacity 0.3s' }} title="Achievement badge">{emoji}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Water Quick Log */}
          <div className="card glass" style={{ marginTop: '28px' }}>
            <div className="card-title"><Droplets size={20} color="var(--info)" /> Quick Water Log</div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              {[250, 500, 750, 1000].map(ml => (
                <button key={ml} className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => handleWaterAdd(ml)}>
                  💧 +{ml >= 1000 ? `${ml/1000}L` : `${ml}ml`}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1, height: '10px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${waterPercent}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #0284c7)', borderRadius: '99px', transition: 'width 0.6s' }} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--info)', whiteSpace: 'nowrap' }}>{waterLogged} / {target.water} ml</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TAB: Nutrition ══════════════ */}
      {activeTab === 'nutrition' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
          {/* Meal logs */}
          <div className="card glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>🍽️ Today's Meals</h3>
              <button className="btn btn-primary" onClick={() => setShowMealModal(true)}>+ Custom Meal</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {['breakfast', 'lunch', 'dinner', 'snack'].map(m => {
                const log = (summary?.meals_logged || []).find(l => l.meal_type === m);
                const completed = log ? log.completed : false;
                const defaultMacros = {
                  breakfast: { calories: 350, protein: 15, carbs: 50, fats: 8, fiber: 4, sugar: 5 },
                  lunch: { calories: 550, protein: 42, carbs: 45, fats: 12, fiber: 6, sugar: 2 },
                  dinner: { calories: 600, protein: 38, carbs: 40, fats: 14, fiber: 5, sugar: 3 },
                  snack: { calories: 200, protein: 8, carbs: 22, fats: 6, fiber: 2, sugar: 8 }
                }[m];
                const currentMacros = log ? {
                  calories: log.calories, protein: log.protein, carbs: log.carbs,
                  fats: log.fats, fiber: log.fiber, sugar: log.sugar
                } : defaultMacros;
                const mealEmoji = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }[m];
                return (
                  <div key={m} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px', borderRadius: '14px',
                    background: completed ? 'rgba(16,185,129,0.07)' : 'var(--bg-primary)',
                    border: `1px solid ${completed ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ textTransform: 'capitalize', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {mealEmoji} {m}
                        {completed && <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>LOGGED</span>}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                        {currentMacros.calories} kcal · P: {currentMacros.protein}g · C: {currentMacros.carbs}g · F: {currentMacros.fats}g · Fiber: {currentMacros.fiber}g · Sugar: {currentMacros.sugar}g
                      </p>
                    </div>
                    <button
                      onClick={() => handleMealToggle(m, currentMacros, completed)}
                      style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: completed ? 'var(--primary)' : 'transparent',
                        border: `2px solid ${completed ? 'var(--primary)' : 'var(--border)'}`,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {completed && <Check size={16} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Macro totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card glass">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '18px' }}>📊 Macro Totals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Calories', val: consumed.calories, max: target.calories, unit: 'kcal', color: 'var(--primary)' },
                  { label: 'Protein', val: consumed.protein, max: 120, unit: 'g', color: '#10b981' },
                  { label: 'Carbs', val: consumed.carbs, max: 200, unit: 'g', color: '#f59e0b' },
                  { label: 'Fats', val: consumed.fats, max: 70, unit: 'g', color: '#ef4444' },
                  { label: 'Fiber', val: consumed.fiber, max: 30, unit: 'g', color: '#a855f7' },
                  { label: 'Sugar', val: consumed.sugar, max: 50, unit: 'g', color: '#ec4899' },
                ].map(({ label, val, max, unit, color }) => (
                  <div key={label}>
                    <div className="tracker-progress-row">
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
                      <strong style={{ fontSize: '0.85rem' }}>{val}{unit !== 'kcal' ? `g` : ` kcal`}</strong>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (val / max) * 100)}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.6s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro summary pills */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'Protein', val: consumed.protein, color: '#10b981', unit: 'g' },
                { label: 'Carbs', val: consumed.carbs, color: '#f59e0b', unit: 'g' },
                { label: 'Fats', val: consumed.fats, color: '#ef4444', unit: 'g' },
              ].map(({ label, val, color, unit }) => (
                <div key={label} className="macro-pill">
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color }}>{val}{unit}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TAB: Activity & Weight ══════════════ */}
      {activeTab === 'activity' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Activity form */}
            <div className="card glass">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px' }}>🏃 Log Exercise</h3>
              <form onSubmit={handleActivitySubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Activity Type</label>
                  <select value={actType} onChange={(e) => setActType(e.target.value)}>
                    <option value="walking">Walking 🚶</option>
                    <option value="running">Running 🏃</option>
                    <option value="cycling">Cycling 🚴</option>
                    <option value="gym">Gym Workout 🏋️</option>
                    <option value="other">Other Exercise ⚡</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" value={actDuration} onChange={(e) => setActDuration(e.target.value)} required placeholder="e.g. 30" min="1" />
                </div>
                <div className="form-group">
                  <label>Calories Burned (kcal)</label>
                  <input type="number" value={actCalories} onChange={(e) => setActCalories(e.target.value)} required placeholder="e.g. 250" min="0" />
                </div>
                <div className="form-group">
                  <label>Steps Count (optional)</label>
                  <input type="number" value={actSteps} onChange={(e) => setActSteps(e.target.value)} placeholder="e.g. 5000" min="0" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                  Log Exercise 🏋️
                </button>
              </form>
            </div>

            {/* Activity history */}
            <div className="card glass">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Today's Logged Exercises</h3>
              {summary?.activities?.logs && summary.activities.logs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {summary.activities.logs.map(log => {
                    const typeEmoji = { walking: '🚶', running: '🏃', cycling: '🚴', gym: '🏋️', other: '⚡' }[log.activity_type] || '🏃';
                    return (
                      <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.5rem' }}>{typeEmoji}</span>
                          <div>
                            <h4 style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '0.95rem' }}>{log.activity_type}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {log.duration} min · {log.calories_burned} kcal burned{log.steps > 0 ? ` · ${log.steps} steps` : ''}
                            </span>
                          </div>
                        </div>
                        <button className="btn btn-secondary" onClick={() => handleDeleteActivity(log.id)} style={{ padding: '6px 8px', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {/* Totals row */}
                  <div style={{ padding: '12px 16px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', gap: '24px', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span>🔥 Total Burned: {activeCalories} kcal</span>
                    <span>🚶 Total Steps: {stepsLogged}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No exercise logged today. Go crush that workout! 💪</p>
              )}
            </div>
          </div>

          {/* Weight logger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card glass">
              <div className="card-title"><Scale size={20} color="var(--warning)" /> Weight Entry</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '10px 0 18px' }}>
                Today's Weight: <strong>{summary?.weight_kg ? `${summary.weight_kg} kg` : 'Not logged'}</strong>
              </p>
              <form onSubmit={handleWeightLog} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="number" step="0.1" placeholder="Weight in kg" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                <button type="submit" className="btn btn-primary">Log Weight ⚖️</button>
              </form>
            </div>

            {/* Recent weight entries */}
            {weightLogs.length > 0 && (
              <div className="card glass">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px' }}>Recent Entries</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {weightLogs.slice(-5).reverse().map(log => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.83rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{log.logged_at}</span>
                      <strong>{log.weight} kg</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ TAB: Wellness ══════════════ */}
      {activeTab === 'wellness' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
          <div className="card glass">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '24px' }}>😊 Today's Wellness Log</h3>
            <form onSubmit={handleWellnessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Mood selector */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>How are you feeling today?</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {Object.entries(MOOD_EMOJIS).map(([key, val]) => (
                    <button
                      key={key} type="button" onClick={() => setWellMood(key)}
                      style={{
                        padding: '12px 16px', borderRadius: '14px',
                        background: wellMood === key ? 'var(--primary-light)' : 'var(--bg-primary)',
                        border: `2px solid ${wellMood === key ? 'var(--primary)' : 'var(--border)'}`,
                        fontSize: '1.1rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s ease', transform: wellMood === key ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      <span>{val.emoji}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: wellMood === key ? 'var(--primary)' : 'var(--text-primary)' }}>{val.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Sleep Duration: <strong>{wellSleep} hours</strong></label>
                <input type="range" min="0" max="12" step="0.5" value={wellSleep} onChange={(e) => setWellSleep(e.target.value)} style={{ padding: 0 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>0h (None)</span><span>8h (Optimal)</span><span>12h (Oversleep)</span>
                </div>
              </div>

              <div className="form-group">
                <label>Energy Level: <strong style={{ color: wellEnergy >= 7 ? '#10b981' : wellEnergy >= 4 ? '#f59e0b' : '#ef4444' }}>{wellEnergy} / 10</strong></label>
                <input type="range" min="1" max="10" value={wellEnergy} onChange={(e) => setWellEnergy(e.target.value)} style={{ padding: 0 }} />
              </div>

              <div className="form-group">
                <label>Stress Level: <strong style={{ color: wellStress <= 3 ? '#10b981' : wellStress <= 6 ? '#f59e0b' : '#ef4444' }}>{wellStress} / 10</strong></label>
                <input type="range" min="1" max="10" value={wellStress} onChange={(e) => setWellStress(e.target.value)} style={{ padding: 0 }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>
                Save Wellness Log 💾
              </button>
            </form>
          </div>

          {/* Challenges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card glass">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px' }}>🏆 Weekly Challenges</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {CHALLENGES.map(ch => (
                  <div key={ch.id} style={{ padding: '14px 16px', borderRadius: '12px', background: ch.done ? 'rgba(16,185,129,0.06)' : 'var(--bg-primary)', border: `1px solid ${ch.done ? '#10b981' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.88rem', color: ch.done ? '#10b981' : 'var(--text-primary)' }}>{ch.title}</strong>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{ch.reward}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{ch.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{ch.progress}</span>
                      {ch.done && <span style={{ color: '#10b981' }}>✓ DONE</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wellness summary */}
            <div className="card glass">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '14px' }}>Current Wellness Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>😴 Sleep</span><strong>{summary?.wellness?.sleep_hours || 0}h</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>⚡ Energy</span><strong>{summary?.wellness?.energy_level || 5}/10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>😰 Stress</span><strong>{summary?.wellness?.stress_level || 5}/10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>😊 Mood</span><strong style={{ textTransform: 'capitalize' }}>{summary?.wellness?.mood || 'neutral'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TAB: Analytics ══════════════ */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Summary stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Daily Score', val: `${dailyScore}/100`, color: scoreColor, emoji: '🏆' },
              { label: 'Calories In', val: `${consumed.calories} kcal`, color: '#6366f1', emoji: '🍽️' },
              { label: 'Calories Burned', val: `${activeCalories} kcal`, color: '#ef4444', emoji: '🔥' },
              { label: 'Hydration', val: `${waterPercent}%`, color: '#0ea5e9', emoji: '💧' },
              { label: 'Steps Today', val: stepsLogged.toLocaleString(), color: '#10b981', emoji: '🚶' },
              { label: 'Sleep Score', val: `${sleepPercent}%`, color: '#a855f7', emoji: '😴' },
            ].map(({ label, val, color, emoji }) => (
              <div key={label} className="card glass" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '1.8rem' }}>{emoji}</span>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color, marginTop: '2px' }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '28px' }}>
            {/* Macro bar chart */}
            <div className="card glass">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>📊 Today's Nutrition Breakdown</h3>
              <div style={{ height: '260px' }}>
                <Bar data={macroBarChart} options={{
                  ...chartOptions,
                  plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} ${ctx.dataIndex === 0 ? 'kcal' : 'g'}` } }
                  }
                }} />
              </div>
            </div>

            {/* Net calorie balance */}
            <div className="card glass">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>⚖️ Calorie Balance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Calories Consumed', val: consumed.calories, max: target.calories, color: '#6366f1' },
                  { label: 'Calories Burned', val: activeCalories, max: target.calories, color: '#ef4444' },
                  { label: 'Remaining', val: Math.max(0, target.calories - consumed.calories), max: target.calories, color: '#10b981' },
                ].map(({ label, val, max, color }) => (
                  <div key={label}>
                    <div className="tracker-progress-row">
                      <span style={{ fontSize: '0.83rem', fontWeight: 600 }}>{label}</span>
                      <strong style={{ fontSize: '0.83rem', color }}>{val} kcal</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (val / max) * 100)}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.6s' }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '8px', padding: '14px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>NET CALORIES</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: (consumed.calories - activeCalories) > target.calories ? '#ef4444' : '#10b981', marginTop: '4px' }}>
                    {consumed.calories - activeCalories} kcal
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weight trend chart */}
          <div className="card glass">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>📈 Weight Trend (Last {recentWeightLogs.length} Entries)</h3>
            <div style={{ height: '220px' }}>
              {recentWeightLogs.length > 1 ? (
                <Line data={weeklyWeightChart} options={chartOptions} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                  <Scale size={32} />
                  <p style={{ fontSize: '0.9rem' }}>Log your weight daily to see the trend chart.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Custom Meal Modal ══════════════ */}
      {showMealModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass animate-fade-in" style={{ width: '480px', maxWidth: '95vw', padding: '32px', borderRadius: 'var(--radius-md)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>🍽️ Log Custom Meal</h3>
              <button onClick={() => setShowMealModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>
            <form onSubmit={handleCustomMealSubmit}>
              <div className="form-group">
                <label>Meal Type</label>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                  <option value="snack">🍎 Snack</option>
                </select>
              </div>
              <div className="form-group">
                <label>Food Item Name (optional)</label>
                <input type="text" placeholder="e.g. Scrambled eggs with toast" value={mealName} onChange={(e) => setMealName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Calories (kcal) *</label>
                <input type="number" value={mealCalories} onChange={(e) => setMealCalories(e.target.value)} required min="0" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Protein (g) *</label>
                  <input type="number" value={mealProtein} onChange={(e) => setMealProtein(e.target.value)} required min="0" />
                </div>
                <div className="form-group">
                  <label>Carbs (g) *</label>
                  <input type="number" value={mealCarbs} onChange={(e) => setMealCarbs(e.target.value)} required min="0" />
                </div>
                <div className="form-group">
                  <label>Fats (g) *</label>
                  <input type="number" value={mealFats} onChange={(e) => setMealFats(e.target.value)} required min="0" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Fiber (g)</label>
                  <input type="number" value={mealFiber} onChange={(e) => setMealFiber(e.target.value)} placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label>Sugar (g)</label>
                  <input type="number" value={mealSugar} onChange={(e) => setMealSugar(e.target.value)} placeholder="0" min="0" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Submit Log ✓</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMealModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
