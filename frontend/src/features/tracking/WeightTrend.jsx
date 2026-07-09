import React, { useEffect, useState, useCallback } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import {
  TrendingDown, TrendingUp, Minus, Scale, Target, Trophy,
  PlusCircle, Trash2, RefreshCw, ChevronDown, ChevronUp,
  Calendar, Award, Activity, Ruler, StickyNote, BarChart2,
  Download, FileText, Sparkles, Percent
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// ── Helpers ──────────────────────────────────────────────────
const bmiCategory = (bmi) => {
  if (!bmi) return { label: '—', color: '#94a3b8' };
  if (bmi < 18.5) return { label: 'Underweight', color: '#f59e0b' };
  if (bmi < 25)   return { label: 'Normal ✓', color: '#10b981' };
  if (bmi < 30)   return { label: 'Overweight', color: '#f59e0b' };
  return { label: 'Obese', color: '#ef4444' };
};

const trendIcon = (change) => {
  if (change === null || change === undefined) return <Minus size={14} color="#94a3b8" />;
  if (change < 0) return <TrendingDown size={14} color="#10b981" />;
  if (change > 0) return <TrendingUp size={14} color="#ef4444" />;
  return <Minus size={14} color="#94a3b8" />;
};

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
};

// ── Period filter ─────────────────────────────────────────────
const filterByPeriod = (logs, period) => {
  if (!logs?.length) return [];
  const cutoff = new Date();
  if (period === 'weekly') cutoff.setDate(cutoff.getDate() - 7);
  else if (period === 'monthly') cutoff.setDate(cutoff.getDate() - 30);
  else if (period === '3m') cutoff.setDate(cutoff.getDate() - 90);
  else if (period === '1y') cutoff.setDate(cutoff.getDate() - 365);
  else return logs; // all
  return logs.filter(l => new Date(l.date) >= cutoff);
};

export default function WeightTrend() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [activeSection, setActiveSection] = useState('chart');
  const [chartType, setChartType] = useState('weight'); // 'weight' or 'bmi'

  // Weight entry
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

  // Goal weight
  const [goalWeight, setGoalWeight] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  // Note form
  const [noteDate, setNoteDate] = useState(new Date().toISOString().slice(0, 10));
  const [noteText, setNoteText] = useState('');

  // Body measurements
  const [mDate, setMDate] = useState(new Date().toISOString().slice(0, 10));
  const [mWaist, setMWaist] = useState('');
  const [mChest, setMChest] = useState('');
  const [mHips, setMHips] = useState('');
  const [mArms, setMArms] = useState('');
  const [mThighs, setMThighs] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('tracking/weight-stats/');
      setData(res.data);
      if (res.data.stats?.goal_weight) setGoalWeight(res.data.stats.goal_weight);
    } catch (err) {
      toast.error('Failed to load weight stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    try {
      await client.post('tracking/weight/', { weight: parseFloat(newWeight), logged_at: newDate });
      toast.success(`Weight ${newWeight} kg logged! ⚖️`);
      setNewWeight('');
      fetchData();
    } catch { toast.error('Failed to log weight.'); }
  };

  const handleDeleteWeight = async (id) => {
    try {
      await client.delete(`tracking/weight/${id}/`);
      toast.success('Entry deleted.');
      fetchData();
    } catch { toast.error('Failed to delete.'); }
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!goalWeight) return;
    setSavingGoal(true);
    try {
      await client.put('auth/profile/', { goal_weight: parseFloat(goalWeight) });
      toast.success(`Goal weight set to ${goalWeight} kg 🎯`);
      fetchData();
    } catch { toast.error('Failed to save goal.'); }
    finally { setSavingGoal(false); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await client.post('tracking/weight-notes/', { date: noteDate, note: noteText });
      toast.success('Note saved! 📝');
      setNoteText('');
      fetchData();
    } catch { toast.error('Failed to save note.'); }
  };

  const handleDeleteNote = async (id) => {
    try {
      await client.delete(`tracking/weight-notes/${id}/`);
      toast.success('Note deleted.');
      fetchData();
    } catch { toast.error('Failed to delete note.'); }
  };

  const handleSaveMeasurements = async (e) => {
    e.preventDefault();
    try {
      await client.post('tracking/body-measurements/', {
        date: mDate,
        waist_cm: mWaist || null,
        chest_cm: mChest || null,
        hips_cm: mHips || null,
        arms_cm: mArms || null,
        thighs_cm: mThighs || null,
      });
      toast.success('Measurements saved! 📏');
      setMWaist(''); setMChest(''); setMHips(''); setMArms(''); setMThighs('');
      fetchData();
    } catch { toast.error('Failed to save measurements.'); }
  };

  // ── Export Functions ──────────────────────────────────────
  const exportCSV = () => {
    if (!data?.table?.length) return toast.error('No weight data to export.');
    const headers = ['Date', 'Weight (kg)', 'Change from Previous (kg)', 'BMI'];
    const rows = (data.table || []).map(row => {
      const rowBmi = data.stats?.height ? (row.weight / ((data.stats.height / 100) ** 2)).toFixed(1) : '—';
      return `"${fmtDate(row.date)}",${row.weight},${row.change != null ? row.change : 0},${rowBmi}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `weight_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Download started! 📥');
  };

  const exportPDF = () => {
    if (!data?.table?.length) return toast.error('No weight data to export.');
    const printWindow = window.open('', '_blank');
    const tableRowsHtml = (data.table || []).map(row => {
      const rowBmi = data.stats?.height ? (row.weight / ((data.stats.height / 100) ** 2)).toFixed(1) : '—';
      const changeClass = row.change < 0 ? 'text-success' : row.change > 0 ? 'text-danger' : 'text-muted';
      const changeSign = row.change > 0 ? '+' : '';
      return `
        <tr>
          <td>${fmtDate(row.date)}</td>
          <td><strong>${row.weight} kg</strong></td>
          <td class="${changeClass}">${row.change != null ? `${changeSign}${row.change} kg` : '—'}</td>
          <td>${rowBmi}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html>
      <head>
        <title>Weight History Report - DietPlanner</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { color: #4f46e5; margin: 0; font-size: 1.75rem; font-weight: 800; }
          .date { color: #64748b; font-size: 0.88rem; margin-top: 4px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 35px; }
          .summary-card { padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
          .summary-card label { font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block; }
          .summary-card span { font-size: 1.3rem; font-weight: 800; color: #0f172a; display: block; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.9rem; }
          th { background-color: #f1f5f9; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
          .text-success { color: #10b981; font-weight: 700; }
          .text-danger { color: #ef4444; font-weight: 700; }
          .text-muted { color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>⚖️ DietPlanner Weight Report</h1>
            <div class="date">Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
        
        <div class="summary-grid">
          <div class="summary-card">
            <label>Starting Weight</label>
            <span>${data.stats?.starting_weight} kg</span>
          </div>
          <div class="summary-card">
            <label>Current Weight</label>
            <span>${data.stats?.current_weight} kg</span>
          </div>
          <div class="summary-card">
            <label>Goal Weight</label>
            <span>${data.stats?.goal_weight ? `${data.stats.goal_weight} kg` : '—'}</span>
          </div>
          <div class="summary-card">
            <label>Total Progress</label>
            <span class="${data.stats?.weight_change <= 0 ? 'text-success' : 'text-danger'}">
              ${data.stats?.weight_change > 0 ? '+' : ''}${data.stats?.weight_change} kg
            </span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Change</th>
              <th>BMI</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // ── Chart data ────────────────────────────────────────────
  const filtered = filterByPeriod(data?.logs?.map((l, i) => ({ ...l, id: i })), period);
  const chartLabels = filtered.map(l => fmtDate(l.date));
  const chartWeights = filtered.map(l => l.weight);

  // Prediction trendline overlay
  const predLabels = [...chartLabels];
  const predWeights = [...chartWeights];
  const pred = data?.prediction;
  if (pred?.in_1_month) {
    predLabels.push('+ 1 Month');
    predWeights.push(pred.in_1_month);
  }

  const heightM = data?.stats?.height ? data.stats.height / 100 : null;
  const isWeightChart = chartType === 'weight';

  const chartData = {
    labels: predLabels,
    datasets: isWeightChart ? [
      {
        label: 'Weight (kg)',
        data: predWeights,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointRadius: (ctx) => ctx.dataIndex < chartWeights.length ? 5 : 8,
        pointStyle: (ctx) => ctx.dataIndex < chartWeights.length ? 'circle' : 'star',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      data?.stats?.goal_weight ? {
        label: 'Goal Weight (kg)',
        data: predLabels.map(() => data.stats.goal_weight),
        borderColor: '#10b981',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      } : null
    ].filter(Boolean) : [
      {
        label: 'BMI',
        data: heightM ? predWeights.map(w => Math.round((w / (heightM ** 2)) * 10) / 10) : [],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236,72,153,0.08)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ec4899',
        pointRadius: (ctx) => ctx.dataIndex < chartWeights.length ? 5 : 8,
        pointStyle: (ctx) => ctx.dataIndex < chartWeights.length ? 'circle' : 'star',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Healthy Max (25)',
        data: predLabels.map(() => 25.0),
        borderColor: 'rgba(16, 185, 129, 0.4)',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Healthy Min (18.5)',
        data: predLabels.map(() => 18.5),
        borderColor: 'rgba(245, 158, 11, 0.4)',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: isWeightChart ? false : true, labels: { color: '#94a3b8' } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const isPredicted = ctx.dataIndex === predLabels.length - 1 && pred?.in_1_month;
            return ` ${ctx.raw} ${isWeightChart ? 'kg' : ''}${isPredicted ? ' (predicted)' : ''}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => isWeightChart ? `${v} kg` : v } },
    },
  };

  const { stats, milestones, badges, notes, measurements, table } = data || {};
  const bmi = stats?.bmi;
  const bmiInfo = bmiCategory(bmi);
  const progressPct = stats?.progress_pct;
  const scoreColor = stats?.weight_change <= 0 ? '#10b981' : '#ef4444';

  // ── Secondary Stats & Estimates ────────────────────────────
  const remainingWeight = stats?.goal_weight ? Math.abs(stats.current_weight - stats.goal_weight) : null;
  const isLossGoal = stats?.starting_weight > stats?.goal_weight;

  let estimatedWeeksText = "";
  if (remainingWeight === 0) {
    estimatedWeeksText = "🎉 Goal reached!";
  } else if (stats?.avg_weekly_change != null && stats.avg_weekly_change !== 0) {
    const weeklyRate = stats.avg_weekly_change;
    const isMovingTowardsGoal = (isLossGoal && weeklyRate < 0) || (!isLossGoal && weeklyRate > 0);
    if (isMovingTowardsGoal) {
      const weeks = Math.ceil(remainingWeight / Math.abs(weeklyRate));
      estimatedWeeksText = `⏱️ Est. time to reach goal: ${weeks} weeks (at ${Math.abs(weeklyRate).toFixed(2)} kg/weekly)`;
    } else {
      estimatedWeeksText = "⚠️ Move trend towards goal to estimate arrival.";
    }
  } else if (stats?.goal_weight) {
    estimatedWeeksText = "⏱️ Log more weekly entries to estimate timeline.";
  } else {
    estimatedWeeksText = "🎯 Set a goal weight to estimate time.";
  }

  const generateInsights = () => {
    const list = [];
    if (stats?.weight_change != null) {
      if (stats.weight_change < 0) {
        list.push(`🎉 You lost ${Math.abs(stats.weight_change)} kg total since starting.`);
      } else if (stats.weight_change > 0) {
        list.push(`📈 You gained ${stats.weight_change} kg total since starting.`);
      }
    }
    if (data?.summary_30d?.change != null && data.summary_30d.change !== 0) {
      if (data.summary_30d.change < 0) {
        list.push(`📉 You lost ${Math.abs(data.summary_30d.change)} kg this month.`);
      } else {
        list.push(`📈 You gained ${data.summary_30d.change} kg this month.`);
      }
    }
    if (stats?.avg_weekly_change != null && stats.avg_weekly_change !== 0) {
      list.push(`Your average weekly change is ${stats.avg_weekly_change} kg.`);
    }
    if (stats?.goal_weight) {
      const weeklyRate = stats.avg_weekly_change || 0;
      const isMoving = (isLossGoal && weeklyRate < 0) || (!isLossGoal && weeklyRate > 0);
      if (isMoving) {
        list.push("🏆 You're on track to reach your goal!");
      }
    }
    if (!list.length) list.push("⚖️ Consistent logging builds better weight insights!");
    return list;
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)' }}>Loading weight history...</p>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .wt-section { background: var(--bg-card); border: 1px solid var(--glass-border);
          backdrop-filter: blur(20px); border-radius: 18px; padding: 24px; margin-bottom: 24px; }
        .wt-tab { padding: 10px 20px; border: none; background: transparent; cursor: pointer;
          color: var(--text-secondary); font-weight: 700; font-size: 0.85rem; border-bottom: 3px solid transparent;
          transition: all 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .wt-tab.active { color: var(--primary); border-bottom-color: var(--primary); background: var(--primary-light); border-radius: 10px 10px 0 0; }
        .wt-tab:hover:not(.active) { color: var(--primary); background: var(--primary-light); border-radius: 10px 10px 0 0; }
        .stat-card { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 14px;
          padding: 18px 20px; display: flex; flex-direction: column; gap: 6px; }
        .milestone-line { display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; }
        .milestone-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
        .badge-card { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 12px;
          padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
        .measure-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
        .period-btn { padding: 6px 16px; border-radius: 99px; border: 1px solid var(--border);
          background: transparent; color: var(--text-secondary); font-weight: 700; cursor: pointer;
          font-size: 0.82rem; transition: all 0.2s; }
        .period-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
        .entry-row { display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 10px; background: var(--bg-primary);
          border: 1px solid var(--border); font-size: 0.88rem; }
        .prediction-box { background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.06));
          border: 1px solid rgba(99,102,241,0.2); border-radius: 14px; padding: 20px 24px; }
      `}</style>

      {/* ── Header ── */}
      <div className="header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>⚖️ Weight Trend History</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Track your progress, predict your path, celebrate every milestone.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10 }}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-secondary" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10 }}>
            <FileText size={15} /> Export PDF
          </button>
          <button className="btn btn-secondary" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10 }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {!data?.has_data ? (
        /* ── Empty State ── */
        <div className="wt-section" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Scale size={56} color="var(--primary)" style={{ opacity: 0.4, marginBottom: 16 }} />
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>No weight data yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Log your first weight entry below to start tracking!</p>
          <form onSubmit={handleLogWeight} style={{ maxWidth: 320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="number" step="0.1" placeholder="Weight in kg" value={newWeight} onChange={e => setNewWeight(e.target.value)} required />
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
            <button type="submit" className="btn btn-primary">Log First Entry ⚖️</button>
          </form>
        </div>
      ) : (
        <>
          {/* ── Statistics Cards (Progress Summary) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Current Weight', val: `${stats?.current_weight} kg`, color: '#6366f1', emoji: '⚖️' },
              { label: 'Starting Weight', val: `${stats?.starting_weight} kg`, color: '#94a3b8', emoji: '🏁' },
              { label: 'Goal Weight', val: stats?.goal_weight ? `${stats.goal_weight} kg` : 'Not set', color: '#10b981', emoji: '🎯' },
              {
                label: 'Total Change',
                val: `${stats?.weight_change > 0 ? '+' : ''}${stats?.weight_change} kg`,
                color: scoreColor, emoji: stats?.weight_change <= 0 ? '📉' : '📈'
              },
              {
                label: 'Remaining to Goal',
                val: remainingWeight != null ? `${remainingWeight.toFixed(1)} kg` : '—',
                color: '#6366f1', emoji: '🏁',
                sub: stats?.current_weight > stats?.goal_weight ? 'To Lose' : (stats?.current_weight < stats?.goal_weight ? 'To Gain' : '')
              },
              { label: 'BMI', val: bmi ?? '—', color: bmiInfo.color, emoji: '💚', sub: bmiInfo.label },
            ].map(({ label, val, color, emoji, sub }) => (
              <div key={label} className="stat-card">
                <div style={{ fontSize: '1.6rem' }}>{emoji}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color }}>{val}</div>
                {sub && <div style={{ fontSize: '0.7rem', color, fontWeight: 600 }}>{sub}</div>}
              </div>
            ))}
          </div>

          {/* ── Goal Progress & BMI Gauge ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
            {/* Goal Progress Panel */}
            <div className="wt-section" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Percent size={18} color="var(--primary)" /> Goal Progress
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{progressPct != null ? `${progressPct}%` : '—'}</div>
                </div>
                {progressPct != null ? (
                  <div style={{ background: 'var(--border)', borderRadius: 99, height: 12, overflow: 'hidden', position: 'relative', marginBottom: 10 }}>
                    <div style={{
                      width: `${progressPct}%`, height: '100%', borderRadius: 99,
                      background: 'linear-gradient(90deg, #6366f1, #10b981)',
                      transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                      boxShadow: '0 0 10px rgba(99,102,241,0.3)',
                    }} />
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '10px 0' }}>Define a target weight to enable progress indicators.</p>
                )}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
                {estimatedWeeksText}
              </div>
            </div>

            {/* BMI Trend Gauge */}
            <div className="wt-section" style={{ margin: 0 }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                💚 BMI Trend Gauge
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: bmiInfo.color }}>{bmi || '—'}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: bmiInfo.color, background: `${bmiInfo.color}15`, padding: '4px 10px', borderRadius: 6 }}>
                  {bmiInfo.label}
                </span>
              </div>
              <div style={{ position: 'relative', height: 8, background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 35%, #f59e0b 70%, #ef4444 100%)', borderRadius: 99, marginTop: 14 }}>
                {bmi && (
                  <div style={{
                    position: 'absolute',
                    left: `${Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100))}%`,
                    top: -6,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    border: `4px solid ${bmiInfo.color}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transform: 'translateX(-50%)',
                    transition: 'left 0.5s'
                  }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>
                <span>15.0 (Under)</span>
                <span>18.5 (Healthy)</span>
                <span>25.0 (Over)</span>
                <span>30.0+ (Obese)</span>
              </div>
            </div>
          </div>

          {/* ── Weekly & Monthly Summaries ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
            {/* 7-Day Summary */}
            <div className="wt-section" style={{ margin: 0, padding: 20 }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 14, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                📅 7-Day Weekly Summary
              </h4>
              {data?.summary_7d && Object.keys(data.summary_7d).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Average Weight</span>
                    <strong style={{ fontSize: '1.05rem' }}>{data.summary_7d.avg} kg</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Weight Change</span>
                    <strong style={{ fontSize: '1.05rem', color: data.summary_7d.change < 0 ? '#10b981' : data.summary_7d.change > 0 ? '#ef4444' : '#94a3b8' }}>
                      {data.summary_7d.change > 0 ? '+' : ''}{data.summary_7d.change} kg
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Highest Weight</span>
                    <strong style={{ fontSize: '1.05rem' }}>{data.summary_7d.highest} kg</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Lowest Weight</span>
                    <strong style={{ fontSize: '1.05rem' }}>{data.summary_7d.lowest} kg</strong>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>No entries logged in the last 7 days.</p>
              )}
            </div>

            {/* 30-Day Summary */}
            <div className="wt-section" style={{ margin: 0, padding: 20 }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 14, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                📅 30-Day Monthly Summary
              </h4>
              {data?.summary_30d && Object.keys(data.summary_30d).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Average Weight</span>
                    <strong style={{ fontSize: '1.05rem' }}>{data.summary_30d.avg} kg</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Weight Change</span>
                    <strong style={{ fontSize: '1.05rem', color: data.summary_30d.change < 0 ? '#10b981' : data.summary_30d.change > 0 ? '#ef4444' : '#94a3b8' }}>
                      {data.summary_30d.change > 0 ? '+' : ''}{data.summary_30d.change} kg
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Highest Weight</span>
                    <strong style={{ fontSize: '1.05rem' }}>{data.summary_30d.highest} kg</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Lowest Weight</span>
                    <strong style={{ fontSize: '1.05rem' }}>{data.summary_30d.lowest} kg</strong>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>No entries logged in the last 30 days.</p>
              )}
            </div>
          </div>

          {/* ── Weight Insights Panel ── */}
          <div className="wt-section" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(16,185,129,0.04))', border: '1px solid rgba(99,102,241,0.15)' }}>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#6366f1" /> Personal Weight Insights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {generateInsights().map((insight, idx) => (
                <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* ── Section Tabs ── */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 24, gap: 2, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[
              { key: 'chart', icon: <BarChart2 size={15} />, label: 'Graph' },
              { key: 'history', icon: <Calendar size={15} />, label: 'History Table' },
              { key: 'milestones', icon: <Trophy size={15} />, label: 'Milestones' },
              { key: 'prediction', icon: <TrendingDown size={15} />, label: 'Prediction' },
              { key: 'badges', icon: <Award size={15} />, label: 'Badges' },
              { key: 'notes', icon: <StickyNote size={15} />, label: 'Notes' },
              { key: 'measurements', icon: <Ruler size={15} />, label: 'Body Measurements' },
              { key: 'log', icon: <PlusCircle size={15} />, label: 'Log Weight' },
            ].map(tab => (
              <button key={tab.key} className={`wt-tab ${activeSection === tab.key ? 'active' : ''}`} onClick={() => setActiveSection(tab.key)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ══ Chart ══ */}
          {activeSection === 'chart' && (
            <div className="animate-fade-in">
              <div className="wt-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>📈 Weight Progress Graph</h3>
                    <div style={{ display: 'flex', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
                      <button
                        onClick={() => setChartType('weight')}
                        style={{
                          border: 'none', background: isWeightChart ? 'var(--primary)' : 'transparent',
                          color: isWeightChart ? '#fff' : 'var(--text-secondary)', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600
                        }}
                      >
                        Weight
                      </button>
                      <button
                        onClick={() => setChartType('bmi')}
                        style={{
                          border: 'none', background: !isWeightChart ? '#ec4899' : 'transparent',
                          color: !isWeightChart ? '#fff' : 'var(--text-secondary)', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600
                        }}
                      >
                        BMI
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['weekly', 'monthly', '3m', '1y', 'all'].map(p => (
                      <button key={p} className={`period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                        {p === 'weekly' ? '7D' : p === 'monthly' ? '30D' : p === '3m' ? '3M' : p === '1y' ? '1Y' : 'All'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: 320 }}>
                  {filtered.length > 1 ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', flexDirection: 'column', gap: 8 }}>
                      <Scale size={36} />
                      <p>Log at least 2 entries to see your trend graph.</p>
                    </div>
                  )}
                </div>
                {pred?.trend && isWeightChart && (
                  <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 14px', borderRadius: 99, fontWeight: 700 }}>
                      Trend: {pred.trend === 'losing' ? '📉 Losing' : pred.trend === 'gaining' ? '📈 Gaining' : '➡️ Stable'} ({pred.kg_per_week > 0 ? '+' : ''}{pred.kg_per_week} kg/week)
                    </span>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '4px 14px', borderRadius: 99, fontWeight: 700 }}>
                      {stats?.total_entries} entries logged
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ History Table ══ */}
          {activeSection === 'history' && (
            <div className="animate-fade-in wt-section">
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 18 }}>📅 Weight Entry History</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['Date', 'Weight', 'Change', 'BMI', 'Action'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(table || []).map((row, i) => {
                      const rowBmi = stats?.height ? (row.weight / ((stats.height / 100) ** 2)).toFixed(1) : '—';
                      return (
                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{fmtDate(row.date)}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: '1rem' }}>{row.weight} kg</td>
                          <td style={{ padding: '12px 14px' }}>
                            {row.change != null ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: row.change < 0 ? '#10b981' : row.change > 0 ? '#ef4444' : '#94a3b8' }}>
                                {trendIcon(row.change)} {row.change > 0 ? '+' : ''}{row.change} kg
                              </span>
                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: bmiCategory(parseFloat(rowBmi)).color }}>{rowBmi}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <button onClick={() => handleDeleteWeight(row.id)} style={{ background: 'none', border: '1px solid var(--danger)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: 'var(--danger)' }}>
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(!table || table.length === 0) && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No entries yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ══ Milestones ══ */}
          {activeSection === 'milestones' && (
            <div className="animate-fade-in wt-section">
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>🏁 Milestone Timeline</h3>
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 2, background: 'var(--border)', borderRadius: 2 }} />
                {(milestones || []).map((m, i) => (
                  <div key={i} className="milestone-line">
                    <div className="milestone-dot" style={{
                      background: m.achieved ? (i === 0 ? '#10b981' : '#6366f1') : 'var(--border)',
                      boxShadow: m.achieved ? `0 0 10px ${i === 0 ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)'}` : 'none',
                      marginLeft: -21,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: m.achieved ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {m.label}
                      </div>
                      {m.date && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{fmtDate(m.date)}</div>
                      )}
                    </div>
                    {m.achieved && (
                      <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '3px 10px', borderRadius: 99, fontWeight: 700, flexShrink: 0 }}>✓ Done</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ Prediction ══ */}
          {activeSection === 'prediction' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {pred && Object.keys(pred).length > 0 ? (
                <>
                  <div className="prediction-box">
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                      🔮 Weight Prediction (Linear Trend)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                      Based on your <strong>{stats?.total_entries} logged entries</strong>, we calculated a trend of <strong style={{ color: pred.kg_per_week < 0 ? '#10b981' : '#ef4444' }}>{pred.kg_per_week > 0 ? '+' : ''}{pred.kg_per_week} kg/week</strong>.
                      Below is where you'll be if you continue at the same pace.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                      {[
                        { label: 'Current Weight', val: `${stats?.current_weight} kg`, color: '#6366f1', emoji: '⚖️' },
                        { label: 'In 1 Month', val: `${pred.in_1_month} kg`, color: pred.in_1_month < stats?.current_weight ? '#10b981' : '#ef4444', emoji: '📅' },
                        { label: 'In 3 Months', val: `${pred.in_3_months} kg`, color: pred.in_3_months < stats?.current_weight ? '#10b981' : '#ef4444', emoji: '📆' },
                      ].map(({ label, val, color, emoji }) => (
                        <div key={label} className="stat-card" style={{ textAlign: 'center', alignItems: 'center' }}>
                          <div style={{ fontSize: '2rem' }}>{emoji}</div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {stats?.goal_weight && (
                      <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                          🎯 At current pace, you'll reach your goal of <strong>{stats.goal_weight} kg</strong>{' '}
                          {pred.kg_per_week < 0 ? (
                            <>in approximately <strong style={{ color: '#10b981' }}>{Math.ceil((stats.current_weight - stats.goal_weight) / Math.abs(pred.kg_per_week))} weeks</strong>.</>
                          ) : (
                            <span style={{ color: '#ef4444' }}>— you're currently gaining. Adjust your diet to start losing.</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Set Goal Weight */}
                  <div className="wt-section">
                    <h3 style={{ fontWeight: 800, marginBottom: 16 }}>🎯 Set Goal Weight</h3>
                    <form onSubmit={handleSaveGoal} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
                        <label>Goal Weight (kg)</label>
                        <input type="number" step="0.1" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} placeholder="e.g. 70" required />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={savingGoal}>
                        {savingGoal ? 'Saving...' : 'Save Goal 🎯'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="wt-section" style={{ textAlign: 'center', padding: 40 }}>
                  <TrendingDown size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ color: 'var(--text-muted)' }}>Log at least 3 weight entries to see predictions.</p>
                </div>
              )}
            </div>
          )}

          {/* ══ Badges ══ */}
          {activeSection === 'badges' && (
            <div className="animate-fade-in wt-section">
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>🏅 Achievement Badges</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                {[
                  { id: 'first_entry', name: '🏅 First Weight Entry', desc: 'Logged your very first weight' },
                  { id: 'lost_2', name: '🥈 Lost 2 kg', desc: 'Lost your first 2 kilograms' },
                  { id: 'lost_5', name: '🥇 Lost 5 kg', desc: 'Lost 5 kilograms total' },
                  { id: 'lost_10', name: '💎 Lost 10 kg', desc: 'Lost an incredible 10 kilograms!' },
                  { id: 'goal', name: '🏆 Goal Achieved', desc: 'Reached your target weight!' },
                  { id: 'consistent', name: '📅 Weekly Tracker', desc: 'Logged weight for 7+ days' },
                  { id: 'streak_30', name: '🔥 30-Day Streak', desc: '30+ weight entries logged' },
                  { id: 'healthy_bmi', name: '💚 Healthy BMI', desc: 'BMI is within healthy range (18.5–25)' },
                ].map(b => {
                  const earned = (badges || []).find(e => e.id === b.id);
                  return (
                    <div key={b.id} className="badge-card" style={{
                      opacity: earned ? 1 : 0.4,
                      background: earned ? 'rgba(99,102,241,0.06)' : 'var(--bg-primary)',
                      border: `1px solid ${earned ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                    }}>
                      <div style={{ fontSize: '2rem' }}>{b.name.split(' ')[0]}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{b.name.substring(b.name.indexOf(' ') + 1)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{b.desc}</div>
                        {earned && <span style={{ fontSize: '0.68rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '2px 8px', borderRadius: 99, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>Earned ✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ Notes ══ */}
          {activeSection === 'notes' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, alignItems: 'start' }}>
              <div className="wt-section">
                <h3 style={{ fontWeight: 800, marginBottom: 16 }}>📝 Progress Notes</h3>
                {(notes || []).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notes yet. Add your first note!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(notes || []).map(n => (
                      <div key={n.id} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>📅 {fmtDate(n.date)}</div>
                            <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{n.note}</div>
                          </div>
                          <button onClick={() => handleDeleteNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="wt-section">
                <h3 style={{ fontWeight: 800, marginBottom: 16 }}>+ Add Note</h3>
                <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Date</label>
                    <input type="date" value={noteDate} onChange={e => setNoteDate(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Note (e.g. "Started gym")</label>
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4} placeholder='e.g. "Reduced sugar intake", "Cheat meal weekend"' style={{ resize: 'vertical' }} required />
                  </div>
                  <button type="submit" className="btn btn-primary">Save Note 📝</button>
                </form>
              </div>
            </div>
          )}

          {/* ══ Body Measurements ══ */}
          {activeSection === 'measurements' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, alignItems: 'start' }}>
              <div className="wt-section">
                <h3 style={{ fontWeight: 800, marginBottom: 16 }}>📏 Body Measurement History</h3>
                {(measurements || []).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No measurements yet. Log your first below!</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                          {['Date', 'Waist', 'Chest', 'Hips', 'Arms', 'Thighs'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(measurements || []).map((m, i) => (
                          <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>{fmtDate(m.date)}</td>
                            {['waist_cm', 'chest_cm', 'hips_cm', 'arms_cm', 'thighs_cm'].map(f => (
                              <td key={f} style={{ padding: '10px 12px' }}>{m[f] != null ? `${m[f]} cm` : '—'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="wt-section">
                <h3 style={{ fontWeight: 800, marginBottom: 16 }}>+ Log Measurements</h3>
                <form onSubmit={handleSaveMeasurements} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Date</label>
                    <input type="date" value={mDate} onChange={e => setMDate(e.target.value)} />
                  </div>
                  <div className="measure-grid">
                    {[['Waist (cm)', mWaist, setMWaist], ['Chest (cm)', mChest, setMChest], ['Hips (cm)', mHips, setMHips], ['Arms (cm)', mArms, setMArms], ['Thighs (cm)', mThighs, setMThighs]].map(([label, val, setter]) => (
                      <div key={label} className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem' }}>{label}</label>
                        <input type="number" step="0.1" value={val} onChange={e => setter(e.target.value)} placeholder="0.0" />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>Save Measurements 📏</button>
                </form>
              </div>
            </div>
          )}

          {/* ══ Log Weight ══ */}
          {activeSection === 'log' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="wt-section">
                <h3 style={{ fontWeight: 800, marginBottom: 20 }}>⚖️ Log New Weight Entry</h3>
                <form onSubmit={handleLogWeight} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Weight (kg)</label>
                    <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="e.g. 72.5" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Date</label>
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary">Log Weight ⚖️</button>
                </form>
              </div>
              <div className="wt-section">
                <h3 style={{ fontWeight: 800, marginBottom: 16 }}>🎯 Goal Weight</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                  Current goal: <strong>{stats?.goal_weight ? `${stats.goal_weight} kg` : 'Not set'}</strong>
                </p>
                <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Goal Weight (kg)</label>
                    <input type="number" step="0.1" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} placeholder="e.g. 68" required />
                  </div>
                  <button type="submit" className="btn btn-accent" disabled={savingGoal}>
                    {savingGoal ? 'Saving...' : 'Save Goal 🎯'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
