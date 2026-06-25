import React, { useEffect, useState } from 'react';
import MindfulSlideshow from '../../components/MindfulSlideshow';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import { 
  TrendingUp, 
  Flame, 
  Droplet, 
  Scale, 
  Calculator,
  Calendar,
  Sparkles,
  Download
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function UserDashboard() {
  const { profile, user, fetchProfile, updateProfile } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [weightLogs, setWeightLogs] = useState([]);
  
  // Profile editing mode states
  const [editMode, setEditMode] = useState(false);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [goal, setGoal] = useState('lifestyle');
  const [activity, setActivity] = useState('sedentary');
  const [dietPreference, setDietPreference] = useState('anything');

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await client.get('tracking/today-summary/');
      setSummary(summaryRes.data);

      const weightRes = await client.get('tracking/weight/');
      setWeightLogs(weightRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchDashboardData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const success = await updateProfile({
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      gender,
      goal,
      activity_level: activity,
      diet_preference: dietPreference
    });
    if (success) {
      toast.success('Stats updated! Recalculating requirements...');
      setEditMode(false);
      fetchDashboardData();
    } else {
      toast.error('Failed to update stats.');
    }
  };

  const startEdit = () => {
    if (profile) {
      setAge(profile.age || '');
      setWeight(profile.weight || '');
      setHeight(profile.height || '');
      setGender(profile.gender || 'male');
      setGoal(profile.goal || 'lifestyle');
      setActivity(profile.activity_level || 'sedentary');
      setDietPreference(profile.diet_preference || 'anything');
    }
    setEditMode(true);
  };

  const handleExport = async (type) => {
    try {
      toast.loading(`Downloading ${type.toUpperCase()} report...`);
      const response = await client.get(`reports/${type}/`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Progress_Report.${type === 'excel' ? 'xlsx' : type}`;
      link.click();
      toast.dismiss();
      toast.success('Report downloaded!');
    } catch (e) {
      toast.dismiss();
      toast.error('Export failed.');
    }
  };

  // Setup charts data
  const weightChartData = {
    labels: weightLogs.map(l => l.logged_at),
    datasets: [{
      label: 'Weight (kg)',
      data: weightLogs.map(l => l.weight),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 3,
      tension: 0.3,
      fill: true
    }]
  };

  const consumed = summary?.consumed || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const target = summary?.target || { calories: 2000 };

  const macroChartData = {
    labels: ['Protein (g)', 'Carbs (g)', 'Fats (g)'],
    datasets: [{
      data: [consumed.protein, consumed.carbs, consumed.fats],
      backgroundColor: ['#10b981', '#6366f1', '#f59e0b'],
      borderWidth: 0
    }]
  };

  const caloriePercentage = target.calories > 0 ? Math.min(Math.round((consumed.calories / target.calories) * 100), 100) : 0;

  return (
    <div className="animate-fade-in">
      <div className="header-bar">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Nutrition Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.username}!</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => handleExport('pdf')} style={{ display: 'flex', gap: '8px' }}>
            <Download size={16} /> PDF Report
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('excel')} style={{ display: 'flex', gap: '8px' }}>
            <Download size={16} /> Excel Export
          </button>
          <button className="btn btn-primary" onClick={startEdit}>Update Body Stats</button>
        </div>
      </div>

      {/* Profile Edit Overlay */}
      {editMode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass" style={{ width: '450px', padding: '32px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>Update Personal Stats</h3>
            <form onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Age (years)</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>Goal</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="lifestyle">Healthy Lifestyle</option>
                  <option value="maintenance">Weight Maintenance</option>
                  <option value="loss">Weight Loss</option>
                  <option value="gain">Muscle Gain</option>
                </select>
              </div>

              <div className="form-group">
                <label>Activity Level</label>
                <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                  <option value="sedentary">Sedentary (No exercise)</option>
                  <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                  <option value="very_active">Very Active (6-7 days/week)</option>
                  <option value="extra_active">Extra Active (Very high physical job)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Diet Preference</label>
                <select value={dietPreference} onChange={(e) => setDietPreference(e.target.value)}>
                  <option value="anything">Anything (No restrictions)</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Ketogenic (Keto)</option>
                  <option value="pescatarian">Pescatarian</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mindful Slideshow */}
      <MindfulSlideshow />

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card glass">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Daily Target</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame color="var(--primary)" size={24} />
            {consumed.calories} / {target.calories} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kcal</span>
          </h3>
          <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '9999px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${caloriePercentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '9999px', transition: 'width 0.4s' }} />
          </div>
        </div>

        <div className="card glass">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>BMI Metric</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator color="var(--accent)" size={24} />
            {profile?.bmi || 'N/A'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            BMR: {profile?.bmr ? `${profile.bmr} kcal` : 'N/A'}
          </p>
        </div>

        <div className="card glass">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Water Target</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplet color="var(--info)" size={24} />
            {summary?.water_ml || 0} / {summary?.target?.water || 3000} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ml</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Status: {Math.round(((summary?.water_ml || 0) / (summary?.target?.water || 3000)) * 100)}% complete
          </p>
        </div>

        <div className="card glass">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Current Weight</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale color="var(--warning)" size={24} />
            {profile?.weight || 'N/A'} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Goal: {profile?.goal?.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Graphs/Analysis section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card glass">
          <div className="card-title">
            <TrendingUp size={20} color="var(--primary)" />
            Weight Trend History
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {weightLogs.length > 0 ? (
              <Line data={weightChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Please log your weight inside Daily Tracking to see charts.</p>
            )}
          </div>
        </div>

        <div className="card glass">
          <div className="card-title">
            Macronutrient Ratios
          </div>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {consumed.protein || consumed.carbs || consumed.fats ? (
              <Doughnut data={macroChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No food logged today.<br/>Log foods to view ratios.
              </div>
            )}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem' }}>
            <div>🟢 Protein: {consumed.protein}g</div>
            <div>🔵 Carbs: {consumed.carbs}g</div>
            <div>🟡 Fats: {consumed.fats}g</div>
          </div>
        </div>
      </div>
    </div>
  );
}
