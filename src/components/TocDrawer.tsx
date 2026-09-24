import React from 'react';
import { TocItem } from '../types/book';
import { X, List, ChevronRight } from 'lucide-react';

interface TocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  toc: TocItem[];
  currentPage: number;
  onSelectPage: (pageNum: number) => void;
}

export const TocDrawer: React.FC<TocDrawerProps> = ({
  isOpen,
  onClose,
  toc,
  currentPage,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  const renderItems = (items: TocItem[], depth = 0) => {
    return (
      <div className="toc-list-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item, idx) => {
          const isActive = currentPage === item.pageNumber;
          return (
            <React.Fragment key={`${item.title}_${idx}_${item.pageNumber}`}>
              <div
                className={`toc-item-row ${isActive ? 'active' : ''}`}
                style={{
                  paddingLeft: depth > 0 ? `${depth * 14 + 10}px` : '10px',
                  borderLeft: depth > 0 ? '2px solid rgba(99, 102, 241, 0.25)' : 'none',
                }}
                onClick={() => {
                  onSelectPage(item.pageNumber);
                  onClose();
                }}
              >
                <div className="toc-item-title">
                  {depth > 0 && <ChevronRight size={12} className="toc-chevron" />}
                  <span>{item.title}</span>
                </div>
                <span className="toc-page-badge">p. {item.pageNumber}</span>
              </div>
              {item.items && item.items.length > 0 && renderItems(item.items, depth + 1)}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="side-drawer drawer-left">
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <List size={18} className="text-indigo-400" style={{ color: '#818cf8' }} />
          <h3 className="drawer-title">Table of Contents</h3>
        </div>
        <button className="btn btn-icon" onClick={onClose} style={{ width: 30, height: 30 }}>
          <X size={15} />
        </button>
      </div>

      <div className="drawer-content">
        {toc.length > 0 ? (
          renderItems(toc)
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <List size={32} opacity={0.3} style={{ margin: '0 auto 8px auto' }} />
            <p style={{ fontSize: '0.85rem' }}>No table of contents available for this PDF document.</p>
          </div>
        )}
      </div>
    </div>
  );
};
