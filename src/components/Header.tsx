import React from 'react';
import { CheckSquare } from 'lucide-react';

interface HeaderProps {
  onOpenChecklist: () => void;
  onGoHome: () => void;
  isReaderView?: boolean;
  checklistBadgeCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenChecklist,
  onGoHome,
  isReaderView = false,
  checklistBadgeCount = 0,
}) => {
  if (isReaderView) return null;

  return (
    <header className="app-header">
      <div className="brand-container" onClick={onGoHome}>
        <div className="brand-icon-wrapper" style={{ background: '#ffffff' }}>
          <img
            src="/favicon.png"
            alt="MyBook"
            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
          />
        </div>
        <span className="brand-title">MyBook</span>
      </div>

      <div className="header-controls">
        <button
          className="btn btn-icon"
          onClick={onOpenChecklist}
          title="Reading Checklist & Wishlist"
          style={{ position: 'relative' }}
        >
          <CheckSquare size={18} />
          {checklistBadgeCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#ffffff',
                color: '#08090d',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {checklistBadgeCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
