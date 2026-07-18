import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Mic, Camera, Clock, TrendingUp, X } from 'lucide-react';
import { MOCK_FOODS, TRENDING_FOODS, POPULAR_SEARCHES } from './foodMockData';
import toast from 'react-hot-toast';

const RECENT_KEY = 'fs_recent_searches';

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
}
function saveRecent(query) {
  const prev = getRecent().filter(q => q !== query);
  localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...prev].slice(0, 6)));
}
function clearRecent() {
  localStorage.removeItem(RECENT_KEY);
}

export default function FoodHeroSearch({ search, onSearch, onSubmit }) {
  const [inputVal, setInputVal] = useState(search || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecent);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!inputVal.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => {
      const q = inputVal.toLowerCase();
      const matched = MOCK_FOODS.filter(f =>
        f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      ).slice(0, 5);
      setSuggestions(matched);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [inputVal]);

  const handleInput = (e) => {
    setInputVal(e.target.value);
    onSearch(e.target.value);
    setShowDrop(true);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;
    saveRecent(inputVal.trim());
    setRecentSearches(getRecent());
    setShowDrop(false);
    onSubmit?.(inputVal.trim());
  };

  const handleSuggestionClick = (name) => {
    setInputVal(name);
    onSearch(name);
    saveRecent(name);
    setRecentSearches(getRecent());
    setShowDrop(false);
  };

  const handleTrendClick = (t) => {
    setInputVal(t);
    onSearch(t);
    setShowDrop(false);
  };

  // Voice Search
  const handleVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice search not supported in this browser.'); return; }
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    setIsListening(true);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputVal(transcript);
      onSearch(transcript);
      setIsListening(false);
    };
    rec.onerror = () => { setIsListening(false); toast.error('Voice search failed. Try again.'); };
    rec.onend = () => setIsListening(false);
    rec.start();
  }, [onSearch]);

  // Barcode Scanner
  const handleBarcode = () => {
    toast('Barcode scanner: Point camera at a food barcode', { icon: '📸', duration: 3000 });
    // In production, integrate ZXing or QuaggaJS here
    setTimeout(() => {
      toast.success('Scanned: Amul Butter (100g) — 717 kcal detected!');
      setInputVal('Amul Butter');
      onSearch('Amul Butter');
    }, 2000);
  };

  const showDropdown = showDrop && (suggestions.length > 0 || recentSearches.length > 0 || !inputVal);

  return (
    <div className="fs-hero">
      <h1 className="fs-hero-title">🔍 Nutrition Database</h1>
      <p className="fs-hero-sub">Search 1M+ foods · Track macros · Scan barcodes · Voice search</p>

      <form onSubmit={handleSubmit} className="fs-search-wrap">
        <div className="fs-search-input-wrap" style={{ position: 'relative' }}>
          <Search size={20} color="rgba(255,255,255,0.5)" className="fs-search-icon" />
          <input
            ref={inputRef}
            className="fs-search-input"
            type="text"
            placeholder="Search chicken, oats, dal tadka..."
            value={inputVal}
            onChange={handleInput}
            onFocus={() => setShowDrop(true)}
            autoComplete="off"
          />
          <div className="fs-search-actions">
            <button
              type="button"
              className={`fs-search-btn ${isListening ? 'active' : ''}`}
              onClick={handleVoice}
              title="Voice search"
            >
              <Mic size={14} />
            </button>
            <button
              type="button"
              className="fs-search-btn"
              onClick={handleBarcode}
              title="Barcode scanner"
            >
              <Camera size={14} />
            </button>
            {inputVal && (
              <button
                type="button"
                className="fs-search-btn"
                onClick={() => { setInputVal(''); onSearch(''); setShowDrop(false); }}
                title="Clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="fs-autocomplete" ref={dropRef}>
              {/* Autocomplete results */}
              {suggestions.length > 0 && (
                <>
                  <div className="fs-autocomplete-section-label">🔍 Suggestions</div>
                  {suggestions.map(food => (
                    <div
                      key={food.id}
                      className="fs-autocomplete-item"
                      onClick={() => handleSuggestionClick(food.name)}
                    >
                      <Search size={13} className="fs-autocomplete-item-icon" />
                      <span>{food.name}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 6 }}>{food.category}</span>
                      <span className="fs-autocomplete-item-calories">{food.calories} kcal / {food.serving_size}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Recent searches */}
              {recentSearches.length > 0 && !inputVal && (
                <>
                  <div className="fs-autocomplete-section-label" style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 16 }}>
                    <span>🕐 Recent</span>
                    <button
                      onClick={() => { clearRecent(); setRecentSearches([]); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--danger)' }}
                    >Clear</button>
                  </div>
                  {recentSearches.map(q => (
                    <div key={q} className="fs-autocomplete-item" onClick={() => handleSuggestionClick(q)}>
                      <Clock size={13} className="fs-autocomplete-item-icon" />
                      <span>{q}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Popular when empty */}
              {!inputVal && (
                <>
                  <div className="fs-autocomplete-section-label">🔥 Popular</div>
                  {POPULAR_SEARCHES.map(p => (
                    <div key={p.query} className="fs-autocomplete-item" onClick={() => handleSuggestionClick(p.query)}>
                      <TrendingUp size={13} className="fs-autocomplete-item-icon" />
                      <span>{p.emoji} {p.query}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        <button type="submit" className="fs-submit-btn">Search</button>
      </form>

      {/* Trending chips */}
      <div className="fs-hero-chips">
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', alignSelf: 'center' }}>🔥 Trending:</span>
        {TRENDING_FOODS.slice(0, 8).map(t => (
          <button key={t} className="fs-chip" onClick={() => handleTrendClick(t)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
