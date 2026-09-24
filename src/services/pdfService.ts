import * as pdfjsLib from 'pdfjs-dist';
import { BookInfo, TocItem } from '../types/book';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const INITIAL_BOOKS: BookInfo[] = [
  {
    id: 'atomic-habits',
    fileName: 'Atomic habits.pdf',
    title: 'Atomic Habits',
    author: 'James Clear',
    url: '/Atomic habits.pdf',
    fileSizeBytes: 5111325,
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
    colorGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  },
  {
    id: '7-habits',
    fileName: '7 Habits of Highly Effective People.pdf',
    title: '7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    url: '/7 Habits of Highly Effective People.pdf',
    fileSizeBytes: 4626938,
    description: 'Powerful Lessons in Personal Change.',
    colorGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  },
  {
    id: 'break-through-advertising',
    fileName: 'Break Through Advertising.pdf',
    title: 'Break Through Advertising',
    author: 'Eugene M. Schwartz',
    url: '/Break Through Advertising.pdf',
    fileSizeBytes: 2393252,
    description: 'How to write headline copy that opens minds and opens wallets.',
    colorGradient: 'linear-gradient(135deg, #311b92 0%, #4527a0 100%)',
  },
  {
    id: 'deep-work',
    fileName: 'Deep Work.pdf',
    title: 'Deep Work',
    author: 'Cal Newport',
    url: '/Deep Work.pdf',
    fileSizeBytes: 1594739,
    description: 'Rules for Focused Success in a Distracted World.',
    colorGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
  {
    id: 'good-to-great',
    fileName: 'Good-to-Great.pdf',
    title: 'Good to Great',
    author: 'Jim Collins',
    url: '/Good-to-Great.pdf',
    fileSizeBytes: 1299329,
    description: 'Why Some Companies Make the Leap... and Others Don\'t.',
    colorGradient: 'linear-gradient(135deg, #881337 0%, #9f1239 100%)',
  },
  {
    id: 'how-to-win-friends',
    fileName: 'How to win Friends & Influence People.pdf',
    title: 'How to Win Friends & Influence People',
    author: 'Dale Carnegie',
    url: '/How to win Friends & Influence People.pdf',
    fileSizeBytes: 1594324,
    description: 'The time-tested advice that has carried millions up the ladder of success.',
    colorGradient: 'linear-gradient(135deg, #701a75 0%, #86198f 100%)',
  },
  {
    id: 'never-split-the-difference',
    fileName: 'Never Split the Difference.pdf',
    title: 'Never Split the Difference',
    author: 'Chris Voss',
    url: '/Never Split the Difference.pdf',
    fileSizeBytes: 1383132,
    description: 'Negotiating As If Your Life Depended On It.',
    colorGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
  },
  {
    id: 'shoe-dog',
    fileName: 'Shoe Dog.pdf',
    title: 'Shoe Dog',
    author: 'Phil Knight',
    url: '/Shoe Dog.pdf',
    fileSizeBytes: 2487746,
    description: 'A Memoir by the Creator of Nike.',
    colorGradient: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)',
  },
  {
    id: 'psychology-of-money',
    fileName: 'The Psychology of Money.pdf',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    url: '/The Psychology of Money.pdf',
    fileSizeBytes: 2982509,
    description: 'Timeless lessons on wealth, greed, and happiness.',
    colorGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
  },
  {
    id: 'the-tipping-point',
    fileName: 'the tipping point.pdf',
    title: 'The Tipping Point',
    author: 'Malcolm Gladwell',
    url: '/the tipping point.pdf',
    fileSizeBytes: 1141036,
    description: 'How Little Things Can Make a Big Difference.',
    colorGradient: 'linear-gradient(135deg, #431407 0%, #7c2d12 100%)',
  },
  {
    id: 'the-book',
    fileName: 'The Book.pdf',
    title: 'The Book',
    author: 'Alan Watts & Classic Texts',
    url: 'https://archive.org/download/the-book-alan-watts/The%20Book%20Alan%20Watts.pdf',
    fileSizeBytes: 70176618,
    description: 'On the Taboo Against Knowing Who You Are.',
    colorGradient: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
  },
];

const pdfDocCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

export const loadPdfDocument = async (url: string): Promise<pdfjsLib.PDFDocumentProxy> => {
  const isExternal = url.startsWith('http://') || url.startsWith('https://');
  const safeUrl = isExternal ? url : encodeURI(url);

  if (pdfDocCache.has(safeUrl)) {
    return pdfDocCache.get(safeUrl)!;
  }

  const loadingTask = pdfjsLib.getDocument({
    url: safeUrl,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    enableXfa: true,
    withCredentials: false,
  });

  const pdfDoc = await loadingTask.promise;
  pdfDocCache.set(safeUrl, pdfDoc);
  return pdfDoc;
};

export const renderPdfPageToCanvas = async (
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scaleMultiplier: number = 1.0
): Promise<void> => {
  if (!pdfDoc || pageNumber < 1 || pageNumber > pdfDoc.numPages || !canvas) return;

  try {
    const page = await pdfDoc.getPage(pageNumber);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    const isMobile = window.innerWidth <= 640;
    const parentWidth = canvas.parentElement?.clientWidth || window.innerWidth || 380;
    const parentHeight = canvas.parentElement?.clientHeight || window.innerHeight || 600;

    let baseScale = 1.0;
    if (isMobile) {
      baseScale = (parentWidth / unscaledViewport.width) * 0.98;
    } else {
      const scaleX = (parentWidth / unscaledViewport.width) * 0.95;
      const scaleY = (parentHeight / unscaledViewport.height) * 0.95;
      baseScale = Math.min(scaleX, scaleY);
    }

    const finalScale = baseScale * scaleMultiplier;
    const devicePixelRatio = window.devicePixelRatio || 1.5;
    const renderScale = finalScale * devicePixelRatio;

    const viewport = page.getViewport({ scale: Math.max(0.8, renderScale) });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    canvas.style.width = `${Math.floor(viewport.width / devicePixelRatio)}px`;
    canvas.style.height = `${Math.floor(viewport.height / devicePixelRatio)}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  } catch (err) {
    console.error(`Error rendering PDF page ${pageNumber}`, err);
  }
};

export const generateCoverThumbnail = async (url: string): Promise<string> => {
  try {
    const pdfDoc = await loadPdfDocument(url);
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 0.8 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas.toDataURL('image/jpeg', 0.85);
    }
  } catch (err) {
    console.error(`Failed to generate thumbnail for ${url}`, err);
  }
  return '';
};

export const extractPdfToc = async (pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<TocItem[]> => {
  try {
    const outline = await pdfDoc.getOutline();
    if (!outline || outline.length === 0) {
      return [];
    }

    const processItems = async (items: any[]): Promise<TocItem[]> => {
      const result: TocItem[] = [];
      for (const item of items) {
        let pageNum = 1;
        if (item.dest) {
          try {
            let dest = item.dest;
            if (typeof dest === 'string') {
              dest = await pdfDoc.getDestination(dest);
            }
            if (Array.isArray(dest)) {
              const ref = dest[0];
              const pageIdx = await pdfDoc.getPageIndex(ref);
              pageNum = pageIdx + 1;
            }
          } catch (e) {
            // fallback
          }
        }

        let subItems: TocItem[] = [];
        if (item.items && item.items.length > 0) {
          subItems = await processItems(item.items);
        }

        result.push({
          title: item.title ? item.title.trim() : 'Untitled Section',
          pageNumber: pageNum,
          items: subItems.length > 0 ? subItems : undefined,
        });
      }
      return result;
    };

    return await processItems(outline);
  } catch (err) {
    console.error('Error extracting PDF outline', err);
    return [];
  }
};
