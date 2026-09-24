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
  const [booksList, setBooksList] = useState<BookInfo[]>(INITIAL_BOOKS);
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

  const handleImportCustomPdf = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.pdf$/i, '');
    const cleanId = `custom_${Date.now()}`;

    const newBook: BookInfo = {
      id: cleanId,
      fileName: file.name,
      title: cleanTitle,
      author: 'Imported PDF',
      url: objectUrl,
      fileSizeBytes: file.size,
      colorGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    };

    setBooksList((prev) => [newBook, ...prev]);
    setReadingStates((prev) => ({
      ...prev,
      [cleanId]: getBookState(cleanId),
    }));
    setActiveBookId(cleanId);
  };

  const activeBook = booksList.find((b) => b.id === activeBookId);
  const activeBookState = activeBookId ? readingStates[activeBookId] : undefined;

  const lastBookId = getLastActiveBookId();
  const lastActiveBookInfo = lastBookId
    ? booksList.find((b) => b.id === lastBookId)
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
          books={booksList}
          readingStates={readingStates}
          onSelectBook={(bookId) => setActiveBookId(bookId)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          lastActiveBookData={lastActiveBookData}
          onImportCustomPdf={handleImportCustomPdf}
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
