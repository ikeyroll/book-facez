import React, { useState } from 'react';
import { Bookmark } from '../types/book';
import { X, Bookmark as BookmarkIcon, Plus, Trash2, ArrowRight } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  currentPage: number;
  onAddBookmark: (pageNumber: number, label?: string, note?: string) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
  onSelectPage: (pageNum: number) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  currentPage,
  onAddBookmark,
  onRemoveBookmark,
  onSelectPage,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBookmark(currentPage, `Page ${currentPage}`, noteInput);
    setNoteInput('');
  };

  return (
    <div className="side-drawer drawer-right">
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookmarkIcon size={20} className="text-amber-400" style={{ color: '#f59e0b' }} />
          <h3 className="drawer-title">Bookmarks & Notes</h3>
        </div>
        <button className="btn btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
          <X size={16} />
        </button>
      </div>

      <div className="drawer-content">
        {/* Add Bookmark form */}
        <form
          onSubmit={handleAdd}
          style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            border: '1px solid var(--reader-border, rgba(255,255,255,0.1))',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Bookmark Page {currentPage}
            </span>
            {isCurrentPageBookmarked && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Already Bookmarked</span>
            )}
          </div>

          <input
            type="text"
            placeholder="Add note (optional)..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--reader-border, rgba(255,255,255,0.1))',
              borderRadius: '6px',
              color: 'inherit',
              fontSize: '0.85rem',
              marginBottom: '0.75rem',
            }}
          />

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem' }}>
            <Plus size={16} />
            <span>{isCurrentPageBookmarked ? 'Update Bookmark Note' : 'Add Bookmark'}</span>
          </button>
        </form>

        {/* Bookmarks List */}
        {bookmarks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: bm.pageNumber === currentPage ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${bm.pageNumber === currentPage ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      onSelectPage(bm.pageNumber);
                      onClose();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <BookmarkIcon size={14} style={{ color: '#f59e0b' }} />
                    <span>Page {bm.pageNumber}</span>
                    <ArrowRight size={14} opacity={0.6} />
                  </button>

                  <button
                    onClick={() => onRemoveBookmark(bm.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Delete bookmark"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {bm.note && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                    "{bm.note}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <BookmarkIcon size={36} opacity={0.3} style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '0.85rem' }}>No bookmarks added yet for this book.</p>
          </div>
        )}
      </div>
    </div>
  );
};
