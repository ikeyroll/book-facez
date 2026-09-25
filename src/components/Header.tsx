import React from 'react';
import { CheckSquare } from 'lucide-react';

interface HeaderProps {
  onOpenChecklist: () => void;
  onGoHome: () => void;
  isReaderView?: boolean;
  isTrackerView?: boolean;
  checklistBadgeCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenChecklist,
  onGoHome,
  isReaderView = false,
  isTrackerView = false,
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
          className={`btn btn-icon ${isTrackerView ? 'active' : ''}`}
          onClick={onOpenChecklist}
          title={isTrackerView ? 'Go Back to Library' : 'Reading Tracker & Wishlist'}
          style={{
            position: 'relative',
            background: isTrackerView ? 'rgba(99, 102, 241, 0.25)' : undefined,
            borderColor: isTrackerView ? '#6366f1' : undefined,
            color: isTrackerView ? '#ffffff' : undefined,
          }}
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
                background: isTrackerView ? '#6366f1' : '#ffffff',
                color: isTrackerView ? '#ffffff' : '#08090d',
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
