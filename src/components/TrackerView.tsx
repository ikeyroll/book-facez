import React, { useState } from 'react';
import { ChecklistCategory, ChecklistItem } from '../types/book';
import {
  ArrowLeft,
  Plus,
  Minus,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  BookOpen,
} from 'lucide-react';

interface TrackerViewProps {
  items: ChecklistItem[];
  onUpdateItems: (items: ChecklistItem[]) => void;
  onBackToLibrary: () => void;
}

const CATEGORIES: ChecklistCategory[] = ['Manhwa', 'Manhua', 'Manga', 'Novels', 'Books', 'Others'];

export const TrackerView: React.FC<TrackerViewProps> = ({
  items,
  onUpdateItems,
  onBackToLibrary,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Add Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('Manhwa');
  const [newLastChapter, setNewLastChapter] = useState('');

  // Inline Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<ChecklistCategory>('Manhwa');
  const [editLastChapter, setEditLastChapter] = useState('');

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<ChecklistItem | null>(null);

  // Helper to parse chapter number
  const parseChapterNum = (chStr?: string): number => {
    if (!chStr) return 0;
    const match = chStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ChecklistItem = {
      id: `ck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim(),
      category: newCategory,
      lastChapter: newLastChapter.trim() || '1',
      completed: false,
      createdAt: Date.now(),
    };

    onUpdateItems([newItem, ...items]);
    setNewTitle('');
    setNewLastChapter('');
  };

  const handleIncrementChapter = (id: string, delta: number) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const currentNum = parseChapterNum(item.lastChapter);
        const nextNum = Math.max(0, currentNum + delta);
        
        let newCh = String(nextNum);
        if (item.lastChapter && item.lastChapter.toLowerCase().includes('ch')) {
          newCh = `Ch. ${nextNum}`;
        }

        return {
          ...item,
          lastChapter: newCh,
        };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    onUpdateItems(updated);
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditLastChapter(item.lastChapter || '1');
  };

  const saveEdit = (id: string) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          title: editTitle.trim() || item.title,
          category: editCategory,
          lastChapter: editLastChapter.trim() || item.lastChapter,
        };
      }
      return item;
    });
    onUpdateItems(updated);
    setEditingId(null);
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  return (
    <div className="simple-tracker-container">
      {/* Top Header */}
      <div className="simple-tracker-header">
        <div className="header-left">
          <button className="btn btn-secondary back-btn" onClick={onBackToLibrary} title="Back to Library">
            <ArrowLeft size={16} />
            <span>Library</span>
          </button>

          <div className="title-area">
            <h1 className="simple-title">Reading List</h1>
            <span className="count-badge">{items.length} titles</span>
          </div>
        </div>

        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Add New Row Form */}
      <form className="simple-add-bar" onSubmit={handleAddItem}>
        <div className="add-input-wrapper title-field">
          <input
            type="text"
            placeholder="Enter book or manhwa title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
        </div>

        <div className="mobile-add-row">
          <div className="add-input-wrapper cat-field">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ChecklistCategory)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="add-input-wrapper ch-field">
            <input
              type="text"
              placeholder="Ch. #"
              value={newLastChapter}
              onChange={(e) => setNewLastChapter(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary add-submit-btn">
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Simple Clean Table */}
      <div className="table-responsive-wrapper">
        <table className="simple-tracker-table">
          <thead>
            <tr>
              <th className="col-title">Title</th>
              <th className="col-type">Type</th>
              <th className="col-chapter">
                <span className="desktop-header-text">Last Chapter Read</span>
                <span className="mobile-header-text">Chapter</span>
              </th>
              <th className="col-actions">
                <span className="desktop-header-text">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isEditing = editingId === item.id;

                if (isEditing) {
                  return (
                    <tr key={item.id} className="editing-row">
                      <td className="col-title">
                        <input
                          type="text"
                          className="table-input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                        />
                      </td>
                      <td className="col-type">
                        <select
                          className="table-select"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as ChecklistCategory)}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="col-chapter">
                        <input
                          type="text"
                          className="table-input ch-input"
                          value={editLastChapter}
                          onChange={(e) => setEditLastChapter(e.target.value)}
                        />
                      </td>
                      <td className="col-actions">
                        <div className="row-actions">
                          <button
                            className="btn-icon-save"
                            onClick={() => saveEdit(item.id)}
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="btn-icon-cancel"
                            onClick={() => setEditingId(null)}
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={item.id}>
                    <td className="col-title">
                      <span className="item-title-text">{item.title}</span>
                    </td>
                    <td className="col-type">
                      <span className="type-tag">{item.category}</span>
                    </td>
                    <td className="col-chapter">
                      <div className="stepper-group">
                        <button
                          className="stepper-btn"
                          onClick={() => handleIncrementChapter(item.id, -1)}
                          title="Previous chapter"
                        >
                          <Minus size={13} />
                        </button>
                        
                        <span
                          className="chapter-badge"
                          onClick={() => startEdit(item)}
                          title="Click to edit chapter"
                        >
                          {item.lastChapter
                            ? item.lastChapter.toLowerCase().includes('ch')
                              ? item.lastChapter
                              : `Ch. ${item.lastChapter}`
                            : 'Ch. 1'}
                        </span>

                        <button
                          className="stepper-btn stepper-btn-plus"
                          onClick={() => handleIncrementChapter(item.id, 1)}
                          title="Next chapter (+1)"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="col-actions">
                      <div className="row-actions">
                        <button
                          className="row-action-btn"
                          onClick={() => startEdit(item)}
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="row-action-btn delete"
                          onClick={() => setDeletingItem(item)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="empty-table-cell">
                  <BookOpen size={28} opacity={0.3} style={{ marginBottom: 6 }} />
                  <p>No titles found. Add a manhwa or book above!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="confirm-modal-overlay" onClick={() => setDeletingItem(null)}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="warning-icon-wrapper">
                <Trash2 size={20} color="#ef4444" />
              </div>
              <div>
                <h3 className="confirm-title">Delete Title</h3>
                <p className="confirm-subtitle">
                  Are you sure you want to delete <strong style={{ color: '#ffffff' }}>"{deletingItem.title}"</strong> from your reading list?
                </p>
              </div>
            </div>

            <div className="confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingItem(null)}
              >
                Cancel
              </button>
              <button
                className="btn delete-confirm-btn"
                onClick={() => {
                  handleDeleteItem(deletingItem.id);
                  setDeletingItem(null);
                }}
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
