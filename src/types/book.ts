export interface Bookmark {
  id: string;
  pageNumber: number;
  label: string;
  createdAt: number;
  note?: string;
}

export type ChecklistCategory = 'Manhwa' | 'Manhua' | 'Manga' | 'Novels' | 'Books' | 'Others';
export type ChecklistStatus = 'Reading' | 'Plan to Read' | 'Completed' | 'On Hold';

export interface ChecklistItem {
  id: string;
  title: string;
  category: ChecklistCategory;
  lastChapter?: string;
  totalChapters?: string;
  status?: ChecklistStatus;
  completed: boolean;
  createdAt: number;
  note?: string;
  coverGradient?: string;
}

export interface BookReadingState {
  bookId: string;
  currentPage: number;
  totalPages: number;
  lastReadTime: number;
  completionRate: number;
  bookmarks: Bookmark[];
  zoom: number;
}

export interface TocItem {
  title: string;
  pageNumber: number;
  items?: TocItem[];
}

export interface BookInfo {
  id: string;
  fileName: string;
  title: string;
  author: string;
  url: string;
  fileSizeBytes: number;
  coverUrl?: string;
  totalPages?: number;
  description?: string;
  colorGradient?: string;
}

export interface ReadingStats {
  totalBooks: number;
  completedBooks: number;
  inProgressBooks: number;
  totalPagesRead: number;
}
