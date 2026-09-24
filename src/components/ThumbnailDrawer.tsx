import React, { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPdfPageToCanvas } from '../services/pdfService';
import { X, Grid } from 'lucide-react';

interface ThumbnailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: PDFDocumentProxy | null;
  totalPages: number;
  currentPage: number;
  onSelectPage: (pageNum: number) => void;
}

export const ThumbnailDrawer: React.FC<ThumbnailDrawerProps> = ({
  isOpen,
  onClose,
  pdfDoc,
  totalPages,
  currentPage,
  onSelectPage,
}) => {
  if (!isOpen || !pdfDoc) return null;

  return (
    <div className="side-drawer drawer-left" style={{ width: '360px' }}>
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Grid size={20} className="text-indigo-400" />
          <h3 className="drawer-title">Page Thumbnails</h3>
        </div>
        <button className="btn btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
          <X size={16} />
        </button>
      </div>

      <div
        className="drawer-content"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          padding: '12px',
        }}
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <ThumbnailItem
            key={pageNum}
            pdfDoc={pdfDoc}
            pageNum={pageNum}
            isSelected={pageNum === currentPage}
            onSelectPage={(num) => {
              onSelectPage(num);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
};

const ThumbnailItem: React.FC<{
  pdfDoc: PDFDocumentProxy;
  pageNum: number;
  isSelected: boolean;
  onSelectPage: (pageNum: number) => void;
}> = ({ pdfDoc, pageNum, isSelected, onSelectPage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (canvasRef.current && !renderedRef.current) {
      renderedRef.current = true;
      renderPdfPageToCanvas(pdfDoc, pageNum, canvasRef.current, 0.35).catch((err) =>
        console.error(`Error rendering thumbnail page ${pageNum}`, err)
      );
    }
  }, [pdfDoc, pageNum]);

  return (
    <div
      onClick={() => onSelectPage(pageNum)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '8px',
        background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
        border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`,
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '3 / 4',
          background: '#fff',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500, marginTop: '6px' }}>
        Page {pageNum}
      </span>
    </div>
  );
};
