import { BookReadingState, Bookmark, ChecklistItem } from '../types/book';

const STORAGE_KEY_PREFIX = 'bookfacez_reading_state_';
const LAST_BOOK_KEY = 'bookfacez_last_active_book';
const CHECKLIST_KEY = 'mybook_reading_checklist';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'ck_1',
    title: 'Solo Leveling',
    category: 'Manhwa',
    completed: false,
    createdAt: Date.now() - 300000,
    note: 'Action / Fantasy webtoon',
  },
  {
    id: 'ck_2',
    title: 'Omniscient Reader\'s Viewpoint',
    category: 'Manhwa',
    completed: false,
    createdAt: Date.now() - 200000,
    note: 'Apocalyptic / Webtoon',
  },
  {
    id: 'ck_3',
    title: 'Tales of Demons and Gods',
    category: 'Manhua',
    completed: false,
    createdAt: Date.now() - 100000,
  },
];

export const getBookState = (bookId: string): BookReadingState => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${bookId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read book state from localStorage', err);
  }
  return {
    bookId,
    currentPage: 1,
    totalPages: 1,
    lastReadTime: Date.now(),
    completionRate: 0,
    bookmarks: [],
    zoom: 1.0,
  };
};

export const saveBookState = (state: Partial<BookReadingState> & { bookId: string }): BookReadingState => {
  const existing = getBookState(state.bookId);
  const updated: BookReadingState = {
    ...existing,
    ...state,
    lastReadTime: Date.now(),
  };

  if (updated.totalPages > 0) {
    updated.completionRate = Math.min(100, Math.round((updated.currentPage / updated.totalPages) * 100));
  }

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${state.bookId}`, JSON.stringify(updated));
    localStorage.setItem(LAST_BOOK_KEY, state.bookId);
  } catch (err) {
    console.error('Failed to save book state to localStorage', err);
  }

  return updated;
};

export const getLastActiveBookId = (): string | null => {
  try {
    return localStorage.getItem(LAST_BOOK_KEY);
  } catch {
    return null;
  }
};

export const addBookmark = (bookId: string, pageNumber: number, label?: string, note?: string): Bookmark[] => {
  const state = getBookState(bookId);
  const newBookmark: Bookmark = {
    id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    pageNumber,
    label: label || `Page ${pageNumber}`,
    createdAt: Date.now(),
    note,
  };

  const filtered = state.bookmarks.filter((b) => b.pageNumber !== pageNumber);
  const updatedBookmarks = [...filtered, newBookmark].sort((a, b) => a.pageNumber - b.pageNumber);

  saveBookState({ bookId, bookmarks: updatedBookmarks });
  return updatedBookmarks;
};

export const removeBookmark = (bookId: string, bookmarkId: string): Bookmark[] => {
  const state = getBookState(bookId);
  const updatedBookmarks = state.bookmarks.filter((b) => b.id !== bookmarkId);
  saveBookState({ bookId, bookmarks: updatedBookmarks });
  return updatedBookmarks;
};

export const getChecklistItems = (): ChecklistItem[] => {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read checklist items', err);
  }
  return DEFAULT_CHECKLIST;
};

export const saveChecklistItems = (items: ChecklistItem[]): void => {
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save checklist items', err);
  }
};

export const clearAllProgress = (): void => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_KEY_PREFIX) || key === LAST_BOOK_KEY || key === CHECKLIST_KEY)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Failed to clear progress', err);
  }
};
