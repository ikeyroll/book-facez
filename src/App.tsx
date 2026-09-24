import React, { useEffect, useState } from 'react';
import { BookInfo, BookReadingState, ChecklistItem } from './types/book';
import { INITIAL_BOOKS } from './services/pdfService';
import {
  getBookState,
  getLastActiveBookId,
  getChecklistItems,
  saveChecklistItems,
} from './services/storageService';
import { Header } from './components/Header';
import { LibraryView } from './components/LibraryView';
import { BookReader } from './components/BookReader';
import { ChecklistModal } from './components/ChecklistModal';

export const App: React.FC = () => {
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [readingStates, setReadingStates] = useState<Record<string, BookReadingState>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const states: Record<string, BookReadingState> = {};
    INITIAL_BOOKS.forEach((book) => {
      states[book.id] = getBookState(book.id);
    });
    setReadingStates(states);
    setChecklistItems(getChecklistItems());
  }, []);

  const handleUpdateBookState = (newState: BookReadingState) => {
    setReadingStates((prev) => ({
      ...prev,
      [newState.bookId]: newState,
    }));
  };

  const handleUpdateChecklist = (newItems: ChecklistItem[]) => {
    setChecklistItems(newItems);
    saveChecklistItems(newItems);
  };

  const activeBook = INITIAL_BOOKS.find((b) => b.id === activeBookId);
  const activeBookState = activeBookId ? readingStates[activeBookId] : undefined;

  const lastBookId = getLastActiveBookId();
  const lastActiveBookInfo = lastBookId
    ? INITIAL_BOOKS.find((b) => b.id === lastBookId)
    : undefined;
  const lastActiveBookState = lastBookId ? readingStates[lastBookId] : undefined;

  const lastActiveBookData =
    lastActiveBookInfo && lastActiveBookState && lastActiveBookState.completionRate < 100
      ? { book: lastActiveBookInfo, state: lastActiveBookState }
      : null;

  const activeChecklistCount = checklistItems.filter((i) => !i.completed).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {!activeBook && (
        <Header
          onOpenChecklist={() => setIsChecklistOpen(true)}
          onGoHome={() => setActiveBookId(null)}
          isReaderView={false}
          checklistBadgeCount={activeChecklistCount}
        />
      )}

      {activeBook && activeBookState ? (
        <BookReader
          book={activeBook}
          initialState={activeBookState}
          onBackToLibrary={() => setActiveBookId(null)}
          onUpdateState={handleUpdateBookState}
        />
      ) : (
        <LibraryView
          books={INITIAL_BOOKS}
          readingStates={readingStates}
          onSelectBook={(bookId) => setActiveBookId(bookId)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          lastActiveBookData={lastActiveBookData}
        />
      )}

      <ChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        items={checklistItems}
        onUpdateItems={handleUpdateChecklist}
      />
    </div>
  );
};
