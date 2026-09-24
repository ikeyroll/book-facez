import React, { useEffect, useState } from 'react';
import { BookInfo, BookReadingState } from '../types/book';
import { generateCoverThumbnail } from '../services/pdfService';
import { BookOpen, Bookmark, Play, CheckCircle2, Search, SlidersHorizontal } from 'lucide-react';

interface LibraryViewProps {
  books: BookInfo[];
  readingStates: Record<string, BookReadingState>;
  onSelectBook: (bookId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  lastActiveBookData?: { book: BookInfo; state: BookReadingState } | null;
}

type FilterType = 'all' | 'reading' | 'completed';

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  readingStates,
  onSelectBook,
  searchQuery,
  onSearchChange,
  lastActiveBookData,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [covers, setCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    books.forEach((book) => {
      if (!covers[book.id]) {
        generateCoverThumbnail(book.url).then((coverDataUrl) => {
          if (coverDataUrl) {
            setCovers((prev) => ({ ...prev, [book.id]: coverDataUrl }));
          }
        });
      }
    });
  }, [books]);

  const filteredBooks = books.filter((book) => {
    const state = readingStates[book.id];
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'reading') {
      return state && state.completionRate > 0 && state.completionRate < 100;
    }
    if (filter === 'completed') {
      return state && state.completionRate >= 99;
    }

    return true;
  });

  const inProgressCount = books.filter((b) => {
    const s = readingStates[b.id];
    return s && s.completionRate > 0 && s.completionRate < 100;
  }).length;

  const completedCount = books.filter((b) => {
    const s = readingStates[b.id];
    return s && s.completionRate >= 99;
  }).length;

  return (
    <div className="library-container">
      {/* Search & Top Mobile Header */}
      <div className="library-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
          <div>
            <h1 className="library-title">Library</h1>
            <p className="library-subtitle">
              {books.length} Books · {inProgressCount > 0 ? `${inProgressCount} Reading` : 'Ready to read'}
            </p>
          </div>

          <div className="search-pill">
            <Search size={16} className="search-pill-icon" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-pill-input"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="filter-pills">
          <button
            className={`pill-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Books ({books.length})
          </button>
          <button
            className={`pill-btn ${filter === 'reading' ? 'active' : ''}`}
            onClick={() => setFilter('reading')}
          >
            Reading ({inProgressCount})
          </button>
          <button
            className={`pill-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Currently Reading Hero Card (Clean & Sophisticated) */}
      {lastActiveBookData && (
        <div
          className="continue-reading-card"
          onClick={() => onSelectBook(lastActiveBookData.book.id)}
        >
          <div className="continue-cover-wrapper">
            {covers[lastActiveBookData.book.id] ? (
              <img
                src={covers[lastActiveBookData.book.id]}
                alt={lastActiveBookData.book.title}
                className="continue-cover-img"
              />
            ) : (
              <div
                className="continue-cover-fallback"
                style={{ background: lastActiveBookData.book.colorGradient || '#1e293b' }}
              >
                <BookOpen size={24} color="#fff" />
              </div>
            )}
          </div>

          <div className="continue-details">
            <span className="continue-tag">Continue Reading</span>
            <h3 className="continue-title">{lastActiveBookData.book.title}</h3>
            <p className="continue-author">{lastActiveBookData.book.author}</p>

            <div className="continue-progress-row">
              <div className="continue-progress-bar">
                <div
                  className="continue-progress-fill"
                  style={{ width: `${lastActiveBookData.state.completionRate || 1}%` }}
                />
              </div>
              <span className="continue-page-num">
                Page {lastActiveBookData.state.currentPage} of {lastActiveBookData.state.totalPages}
              </span>
            </div>
          </div>

          <button className="continue-play-btn" title="Open reader">
            <Play size={18} fill="currentColor" />
          </button>
        </div>
      )}

      {/* Book Grid */}
      <div className="books-grid">
        {filteredBooks.map((book) => {
          const state = readingStates[book.id];
          const hasCover = !!covers[book.id];
          const progress = state ? state.completionRate : 0;
          const currentPage = state ? state.currentPage : 1;
          const isFinished = progress >= 99;

          return (
            <div
              key={book.id}
              className="book-card"
              onClick={() => onSelectBook(book.id)}
            >
              <div className="book-cover-wrapper">
                {hasCover ? (
                  <img
                    src={covers[book.id]}
                    alt={book.title}
                    className="book-cover-img"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="book-cover-fallback"
                    style={{ background: book.colorGradient || '#1e293b' }}
                  >
                    <h3 className="fallback-title">{book.title}</h3>
                    <p className="fallback-author">{book.author}</p>
                  </div>
                )}

                {progress > 0 && (
                  <div className="progress-badge">
                    {isFinished ? 'Finished' : `p. ${currentPage}`}
                  </div>
                )}
              </div>

              <div className="book-card-info">
                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-card-author">{book.author}</p>

                {progress > 0 && (
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
