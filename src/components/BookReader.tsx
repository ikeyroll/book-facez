import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import type { PDFDocumentProxy } from 'pdfjs-dist';

import { BookInfo, BookReadingState, TocItem } from '../types/book';
import { extractPdfToc, loadPdfDocument, renderPdfPageToCanvas } from '../services/pdfService';
import { addBookmark, removeBookmark, saveBookState } from '../services/storageService';

import { TocDrawer } from './TocDrawer';
import { BookmarksDrawer } from './BookmarksDrawer';
import { ThumbnailDrawer } from './ThumbnailDrawer';

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Bookmark as BookmarkIcon,
  Grid,
  Maximize2,
  Minimize2,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

interface BookReaderProps {
  book: BookInfo;
  initialState: BookReadingState;
  onBackToLibrary: () => void;
  onUpdateState: (newState: BookReadingState) => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  initialState,
  onBackToLibrary,
  onUpdateState,
}) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(initialState.totalPages || 1);
  const [currentPage, setCurrentPage] = useState<number>(initialState.currentPage || 1);
  const [zoom, setZoom] = useState<number>(initialState.zoom || 1.0);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [bookmarks, setBookmarks] = useState(initialState.bookmarks || []);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderingError, setRenderingError] = useState<string | null>(null);

  // Active Drawers
  const [activeDrawer, setActiveDrawer] = useState<'toc' | 'bookmarks' | 'thumbnails' | null>(null);

  // DOM Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Load PDF Document & TOC
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setRenderingError(null);

    loadPdfDocument(book.url)
      .then(async (doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        const count = doc.numPages;
        setTotalPages(count);

        try {
          const outline = await extractPdfToc(doc);
          if (isMounted) setToc(outline);
        } catch (e) {
          console.warn('Could not extract TOC', e);
        }

        if (isMounted) setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading PDF document', err);
        if (isMounted) {
          setRenderingError('Failed to load PDF book.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [book]);

  // Auto-save progress
  useEffect(() => {
    if (totalPages > 0) {
      const updated = saveBookState({
        bookId: book.id,
        currentPage,
        totalPages,
        zoom,
        bookmarks,
      });
      onUpdateState(updated);

      if (currentPage >= totalPages && totalPages > 1) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [currentPage, totalPages, zoom, bookmarks]);

  // Render current page onto canvas
  useEffect(() => {
    if (!pdfDoc || loading || !canvasRef.current) return;

    renderPdfPageToCanvas(pdfDoc, currentPage, canvasRef.current, zoom).catch((err) =>
      console.error('Error rendering page', err)
    );
  }, [pdfDoc, currentPage, zoom, loading]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc && canvasRef.current) {
        renderPdfPageToCanvas(pdfDoc, currentPage, canvasRef.current, zoom);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, currentPage, zoom]);

  // Instant Page Changes
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleJumpToPage = (pageNum: number) => {
    const target = Math.max(1, Math.min(totalPages, pageNum));
    setCurrentPage(target);
  };

  // Zoom control helpers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3.0, parseFloat((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.75, parseFloat((prev - 0.25).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  // Stage click navigation (only when not zoomed in)
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1.2) return; // avoid unwanted page flip when scrolling zoomed image
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width * 0.3) {
      goToPrevPage();
    } else if (clickX > rect.width * 0.7) {
      goToNextPage();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const handleAddBookmark = (pageNum: number, label?: string, note?: string) => {
    const updated = addBookmark(book.id, pageNum, label, note);
    setBookmarks(updated);
  };

  const handleRemoveBookmark = (bmId: string) => {
    const updated = removeBookmark(book.id, bmId);
    setBookmarks(updated);
  };

  return (
    <div className="reader-container" ref={containerRef}>
      {/* Top Header Bar */}
      <div className="reader-header">
        <div className="reader-title-area">
          <button className="btn btn-secondary mobile-back-btn" onClick={onBackToLibrary}>
            <ArrowLeft size={16} />
            <span className="back-text">Library</span>
          </button>
          <h2 className="reader-book-title" title={book.title}>
            {book.title}
          </h2>
        </div>

        <div className="reader-toolbar">
          {/* Zoom Control Group */}
          <div className="zoom-pill-group">
            <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out (-)">
              <ZoomOut size={15} />
            </button>
            <span className="zoom-val" onClick={handleResetZoom} title="Reset Zoom">
              {Math.round(zoom * 100)}%
            </span>
            <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In (+)">
              <ZoomIn size={15} />
            </button>
          </div>

          {/* Drawer Buttons */}
          <button
            className={`btn btn-icon ${activeDrawer === 'toc' ? 'active' : ''}`}
            onClick={() => setActiveDrawer(activeDrawer === 'toc' ? null : 'toc')}
            title="Contents"
          >
            <List size={17} />
          </button>

          <button
            className={`btn btn-icon ${activeDrawer === 'thumbnails' ? 'active' : ''}`}
            onClick={() => setActiveDrawer(activeDrawer === 'thumbnails' ? null : 'thumbnails')}
            title="Thumbnails"
          >
            <Grid size={17} />
          </button>

          <button
            className={`btn btn-icon ${activeDrawer === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveDrawer(activeDrawer === 'bookmarks' ? null : 'bookmarks')}
            title="Bookmarks"
          >
            <BookmarkIcon size={17} style={{ color: bookmarks.some((b) => b.pageNumber === currentPage) ? '#f59e0b' : 'inherit' }} />
          </button>

          <button className="btn btn-icon desktop-only-btn" onClick={toggleFullscreen} title="Fullscreen">
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>

      {/* Main Reader Stage (Scrollable when zoomed) */}
      <div
        className="reader-stage-instant"
        ref={stageRef}
        onClick={handleStageClick}
        style={{
          overflow: zoom > 1.0 ? 'auto' : 'hidden',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div className="spinner" />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Opening {book.title}...</p>
          </div>
        ) : renderingError ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
            <BookOpen size={44} opacity={0.5} style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{renderingError}</p>
            <button className="btn btn-primary" onClick={onBackToLibrary} style={{ marginTop: '1rem' }}>
              Return to Library
            </button>
          </div>
        ) : (
          <div
            className="page-card-container"
            style={{
              transform: zoom > 1.0 ? 'none' : 'none',
              margin: zoom > 1.0 ? 'auto' : '0 auto',
            }}
          >
            <canvas ref={canvasRef} className="instant-page-canvas" />
          </div>
        )}
      </div>

      {/* Side Drawers */}
      <TocDrawer
        isOpen={activeDrawer === 'toc'}
        onClose={() => setActiveDrawer(null)}
        toc={toc}
        currentPage={currentPage}
        onSelectPage={handleJumpToPage}
      />

      <BookmarksDrawer
        isOpen={activeDrawer === 'bookmarks'}
        onClose={() => setActiveDrawer(null)}
        bookmarks={bookmarks}
        currentPage={currentPage}
        onAddBookmark={handleAddBookmark}
        onRemoveBookmark={handleRemoveBookmark}
        onSelectPage={handleJumpToPage}
      />

      <ThumbnailDrawer
        isOpen={activeDrawer === 'thumbnails'}
        onClose={() => setActiveDrawer(null)}
        pdfDoc={pdfDoc}
        totalPages={totalPages}
        currentPage={currentPage}
        onSelectPage={handleJumpToPage}
      />

      {/* Floating Control Bar */}
      <div className="reader-floating-footer">
        <button
          className="btn btn-icon"
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          style={{ width: 32, height: 32 }}
          title="Previous Page"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="page-scrubber">
          <input
            type="range"
            min={1}
            max={totalPages || 1}
            value={currentPage}
            onChange={(e) => handleJumpToPage(parseInt(e.target.value, 10))}
            className="scrubber-slider"
          />
        </div>

        <div className="page-indicator">
          Page {currentPage} of {totalPages}
        </div>

        <button
          className="btn btn-icon"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          style={{ width: 32, height: 32 }}
          title="Next Page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
