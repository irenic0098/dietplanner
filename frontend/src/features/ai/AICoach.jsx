import React, { useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  MessageSquare, 
  Camera, 
  Lightbulb, 
  Send, 
  Brain,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function AICoach() {
  const [activeTab, setActiveTab] = useState('chat');
  
  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: "Hello! I am your AI Nutrition Coach. Ask me anything about calories, macros, or recipes!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Vision States
  const [visionImage, setVisionImage] = useState(null);
  const [visionResult, setVisionResult] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);

  // Diet Plan Generation States
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [genLoading, setGenLoading] = useState(false);

  // Healthy Alternatives States
  const [altInput, setAltInput] = useState('');
  const [altResults, setAltResults] = useState([]);
  const [altLoading, setAltLoading] = useState(false);

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await client.post('ai/chat/', {
        message: userMsg.text,
        history: chatHistory
      });
      setChatHistory(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      toast.error('AI chat failed. Try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleVisionUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVisionImage(URL.createObjectURL(file));
    setVisionLoading(true);
    setVisionResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await client.post('ai/food-recognition/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setVisionResult(res.data);
      toast.success('Food items analyzed successfully!');
    } catch (err) {
      toast.error('Failed to parse food image.');
    } finally {
      setVisionLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenLoading(true);
    setGeneratedPlan(null);
    try {
      const res = await client.post('ai/diet-plan/', { save: true });
      setGeneratedPlan(res.data);
      toast.success('Diet plan generated and initialized in your dashboard!');
    } catch (err) {
      toast.error('BBody stats missing in profile.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleAlternatives = async (e) => {
    e.preventDefault();
    if (!altInput) return;
    setAltLoading(true);
    try {
      const res = await client.get(`ai/alternatives/?food=${altInput}`);
      setAltResults(res.data.alternatives);
    } catch (err) {
      toast.error('Alternative lookup failed.');
    } finally {
      setAltLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="header-bar">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>AI Nutrition Coach</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Automate plans, look up health alternatives, and use vision food detection.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '30px', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('chat')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'chat' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'chat' ? '2px solid var(--primary)' : 'none' }}
        >
          <MessageSquare size={16} style={{ marginRight: '6px' }} /> AI Chatbot
        </button>
        <button 
          onClick={() => setActiveTab('vision')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'vision' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'vision' ? '2px solid var(--primary)' : 'none' }}
        >
          <Camera size={16} style={{ marginRight: '6px' }} /> Food Recognition
        </button>
        <button 
          onClick={() => setActiveTab('recommender')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'recommender' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'recommender' ? '2px solid var(--primary)' : 'none' }}
        >
          <Brain size={16} style={{ marginRight: '6px' }} /> AI Meal Builder
        </button>
        <button 
          onClick={() => setActiveTab('alternatives')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'alternatives' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 'alternatives' ? '2px solid var(--primary)' : 'none' }}
        >
          <Lightbulb size={16} style={{ marginRight: '6px' }} /> Health Swaps
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        
        {/* Chatbot Tab */}
        {activeTab === 'chat' && (
          <div className="card glass" style={{ height: '550px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-title">
              <Sparkles size={20} color="var(--primary)" />
              Nutrition AI Assistant
            </div>
            
            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
              {chatHistory.map((c, i) => (
                <div 
                  key={i} 
                  style={{ 
                    alignSelf: c.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: c.sender === 'user' ? 'var(--primary)' : 'var(--bg-primary)',
                    color: c.sender === 'user' ? 'white' : 'var(--text-primary)',
                    padding: '12px 18px', 
                    borderRadius: c.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    maxWidth: '70%',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}
                >
                  {c.text}
                </div>
              ))}
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--bg-primary)', padding: '12px 18px', borderRadius: '18px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Thinking...
                </div>
              )}
            </div>

            <form onSubmit={handleChatSend} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Ask me how to make low-calorie proteins, calculate macros, etc." 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
              <button type="submit" className="btn btn-primary" disabled={chatLoading}>
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Vision/Camera Tab */}
        {activeTab === 'vision' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', minHeight: '350px' }}>
              {visionImage ? (
                <img src={visionImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Camera size={48} style={{ marginBottom: '16px' }} />
                  <p>Upload a food image to analyze its calories and macros.</p>
                </div>
              )}
              
              <input type="file" accept="image/*" onChange={handleVisionUpload} id="vision-file" style={{ display: 'none' }} />
              <label htmlFor="vision-file" className="btn btn-secondary" style={{ marginTop: '24px', cursor: 'pointer' }}>
                Select Image File
              </label>
            </div>

            <div className="card glass">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px' }}>Vision Analysis Result</h3>
              {visionLoading && <p style={{ color: 'var(--text-muted)' }}>Analyzing food items using Gemini Vision API...</p>}
              
              {visionResult && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>{visionResult.food_detected}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Estimated portion weight: {visionResult.estimated_weight}</p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontWeight: '800' }}>{visionResult.nutrition.calories}</p>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>kcal</span>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontWeight: '800' }}>{visionResult.nutrition.protein}g</p>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>pro</span>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontWeight: '800' }}>{visionResult.nutrition.carbs}g</p>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>carb</span>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontWeight: '800' }}>{visionResult.nutrition.fats}g</p>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>fat</span>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontWeight: '800' }}>{visionResult.nutrition.fiber}g</p>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>fib</span>
                    </div>
                  </div>

                  <div>
                    <h5 style={{ fontWeight: '700', fontSize: '0.9rem' }}>Description</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{visionResult.description}</p>
                  </div>
                </div>
              )}
              
              {!visionLoading && !visionResult && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Waiting for image upload...</p>
              )}
            </div>
          </div>
        )}

        {/* Meal Builder/Recommender Tab */}
        {activeTab === 'recommender' && (
          <div className="card glass" style={{ textAlign: 'center', padding: '48px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Build Diet Plan with AI</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '12px auto 24px auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Our AI algorithm automatically reads your BMR, target calorie requirements, and health goals from your profile to design a custom 1-day template.
            </p>

            <button onClick={handleGeneratePlan} className="btn btn-primary" disabled={genLoading}>
              {genLoading ? 'Building Meals...' : 'Generate AI Diet Plan'}
            </button>

            {generatedPlan && (
              <div className="animate-fade-in" style={{ marginTop: '36px', textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>{generatedPlan.plan_name} ({generatedPlan.target_calories} kcal)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {Object.entries(generatedPlan.meals).map(([mealType, mealData]) => (
                    <div key={mealType} style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      <h5 style={{ textTransform: 'capitalize', fontWeight: '700', marginBottom: '8px' }}>{mealType}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mealData.name}</span>
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {mealData.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.food}</span>
                            <span style={{ fontWeight: '600' }}>{item.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Health Alternatives Swaps Tab */}
        {activeTab === 'alternatives' && (
          <div className="card glass">
            <div className="card-title">
              <TrendingDown size={20} color="var(--primary)" />
              Calorie Cut Swaps
            </div>
            
            <form onSubmit={handleAlternatives} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Enter food (e.g. White Rice, Burger, Soda)" 
                value={altInput} 
                onChange={(e) => setAltInput(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={altLoading}>
                {altLoading ? 'Searching...' : 'Find Healthier Alternatives'}
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {altResults.map((alt, idx) => (
                <div 
                  key={idx} 
                  className="animate-fade-in"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)' 
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {alt.food} <ArrowRight size={14} /> <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Swap Selected</span>
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{alt.reason}</p>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    Saved {alt.calories_saved} kcal
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
