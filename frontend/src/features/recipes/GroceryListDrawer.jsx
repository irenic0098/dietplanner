import React, { useState } from 'react';
import { X, ShoppingCart, Trash2, Download, Check } from 'lucide-react';
import { GROCERY_CATEGORIES, categorizeIngredient } from './mockData';
import toast from 'react-hot-toast';

function buildCategorized(items) {
  const map = {};
  GROCERY_CATEGORIES.forEach(c => { map[c] = []; });
  items.forEach(item => {
    const cat = categorizeIngredient(item.name);
    if (map[cat]) map[cat].push(item);
  });
  return map;
}

export default function GroceryListDrawer({ items, onClose, onRemove, onClear }) {
  const [checked, setChecked] = useState([]);
  const toggleCheck = (id) => setChecked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const categorized = buildCategorized(items);
  const nonEmpty = Object.entries(categorized).filter(([, v]) => v.length > 0);

  // Rough cost estimate (₹20-120 per item)
  const estimatedCost = items.reduce((acc, item) => acc + (Math.round(20 + Math.random() * 100)), 0);

  const handleExport = () => {
    const text = items.map(i => `- ${i.name} (from ${i.recipeName})`).join('\n');
    const blob = new Blob([`Grocery List\n============\n${text}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'grocery-list.txt';
    a.click();
    toast.success('Grocery list exported!');
  };

  return (
    <>
      <div className="rcp-grocery-backdrop" onClick={onClose} />
      <div className="rcp-grocery-drawer">
        {/* Header */}
        <div className="rcp-grocery-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Grocery List</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{items.length} items · {checked.length} checked</div>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="rcp-grocery-body">
          {items.length === 0 ? (
            <div className="rcp-empty" style={{ padding: 40 }}>
              <div className="rcp-empty-icon">🛒</div>
              <div className="rcp-empty-title">List is empty</div>
              <div className="rcp-empty-sub">Add ingredients from any recipe</div>
            </div>
          ) : (
            nonEmpty.map(([cat, catItems]) => (
              <div key={cat} className="rcp-grocery-category">
                <div className="rcp-grocery-cat-label">{cat}</div>
                {catItems.map(item => (
                  <div key={item.id} className={`rcp-grocery-item ${checked.includes(item.id) ? 'checked' : ''}`}>
                    <div
                      className="rcp-grocery-check"
                      onClick={() => toggleCheck(item.id)}
                    >
                      {checked.includes(item.id) && <Check size={11} color="white" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="rcp-grocery-item-name" style={{ textDecoration: checked.includes(item.id) ? 'line-through' : 'none' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>From: {item.recipeName}</div>
                    </div>
                    <button className="rcp-grocery-remove" onClick={() => onRemove(item.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="rcp-grocery-footer">
            <div className="rcp-grocery-total">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Estimated Total</span>
              <span className="rcp-grocery-cost">~₹{estimatedCost}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.82rem', padding: '10px' }}
                onClick={handleExport}
              >
                <Download size={13} /> Export
              </button>
              <button
                className="btn"
                style={{ flex: 1, fontSize: '0.82rem', padding: '10px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
                onClick={() => { onClear(); toast.success('List cleared'); }}
              >
                <Trash2 size={13} /> Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
