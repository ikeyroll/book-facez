import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BookOpen, RefreshCw, AlertTriangle } from 'lucide-react';
import { clearAllProgress } from '../services/storageService';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    clearAllProgress();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#08090d',
            color: '#f3f4f6',
            padding: '2rem',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#11131c',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                fontSize: '0.9rem',
                color: '#9ca3af',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              MyBook encountered an unexpected issue. You can try refreshing the app or resetting local storage state.
            </p>

            {this.state.error && (
              <pre
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: '#f87171',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: '1.5rem',
                  maxHeight: '100px',
                }}
              >
                {this.state.error.message || 'Unknown error'}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={this.handleReset}
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <BookOpen size={15} />
                <span>Reset State</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
