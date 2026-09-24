import React, { useState } from 'react';
import { ChecklistCategory, ChecklistItem } from '../types/book';
import { X, CheckSquare, Plus, Trash2, CheckCircle2, Square } from 'lucide-react';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ChecklistItem[];
  onUpdateItems: (items: ChecklistItem[]) => void;
}

type FilterCategory = 'All' | ChecklistCategory;

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItems,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('All');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('Manhwa');

  if (!isOpen) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ChecklistItem = {
      id: `ck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
      createdAt: Date.now(),
    };

    onUpdateItems([newItem, ...items]);
    setNewTitle('');
  };

  const handleToggleComplete = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    onUpdateItems(updated);
  };

  const filteredItems = items.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.category === selectedFilter;
  });

  const completedCount = items.filter((i) => i.completed).length;

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'Manhwa':
        return { background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' };
      case 'Manhua':
        return { background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.4)' };
      case 'Manga':
        return { background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.4)' };
      default:
        return { background: 'rgba(255, 255, 255, 0.1)', color: '#9ca3af', border: '1px solid rgba(255, 255, 255, 0.2)' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '1.25rem 1rem',
          position: 'relative',
          background: '#11131c',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          borderRadius: '16px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                flexShrink: 0,
              }}
            >
              <CheckSquare size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Wishlist & Checklist
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {completedCount} of {items.length} completed
              </p>
            </div>
          </div>

          <button className="btn btn-icon" onClick={onClose} style={{ width: 30, height: 30, flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="filter-pills" style={{ marginBottom: '0.85rem', display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {(['All', 'Manhwa', 'Manhua', 'Manga', 'Others'] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              className={`pill-btn ${selectedFilter === cat ? 'active' : ''}`}
              onClick={() => setSelectedFilter(cat)}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add Item Form (Mobile Responsive Layout) */}
        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', width: '100%', boxSizing: 'border-box' }}>
            <input
              type="text"
              placeholder="Add manhwa, manga or title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                flex: 1,
                minWidth: '110px',
                padding: '0.45rem 0.65rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />

            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ChecklistCategory)}
              style={{
                padding: '0.45rem 0.5rem',
                background: '#1f2233',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <option value="Manhwa">Manhwa</option>
              <option value="Manhua">Manhua</option>
              <option value="Manga">Manga</option>
              <option value="Others">Others</option>
            </select>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem 0.75rem', flexShrink: 0, fontSize: '0.82rem' }}>
              <Plus size={15} />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Checklist Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingRight: '2px' }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '10px',
                  background: item.completed ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${item.completed ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.1)'}`,
                  opacity: item.completed ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  gap: '8px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, cursor: 'pointer' }}
                  onClick={() => handleToggleComplete(item.id)}
                >
                  {item.completed ? (
                    <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                  ) : (
                    <Square size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
                  )}

                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '100px',
                      ...getCategoryBadgeStyle(item.category),
                    }}
                  >
                    {item.category}
                  </span>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '2px',
                      opacity: 0.7,
                    }}
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>
              <CheckSquare size={28} opacity={0.3} style={{ margin: '0 auto 6px auto' }} />
              <p style={{ fontSize: '0.82rem' }}>No items in "{selectedFilter}" category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
