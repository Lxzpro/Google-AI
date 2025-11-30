import React, { forwardRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertCircle } from 'lucide-react';

// Setup PDF Worker for react-pdf v10+
// Ensure the worker version matches the library version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookProps {
  file: File | string;
  width: number;
  height: number;
  onFlip: (e: any) => void;
  bookRef: any;
}

interface PageProps {
  pageNumber: number;
  width: number;
  height: number;
}

// ForwardRef is required by react-pageflip for custom children
const PDFPage = forwardRef<HTMLDivElement, PageProps>(({ pageNumber, width, height }, ref) => {
  return (
    <div ref={ref} className="bg-white shadow-inner overflow-hidden border-r border-slate-200">
      <div className="h-full w-full relative">
        <Page
          pageNumber={pageNumber}
          width={width}
          height={height}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="h-full w-full"
          loading={
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center">
              <AlertCircle className="w-8 h-8 mb-2" />
              <span className="text-xs">Render Error</span>
            </div>
          }
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-mono z-10 select-none">
           PAGE {pageNumber}
        </div>
      </div>
    </div>
  );
});

PDFPage.displayName = 'PDFPage';

const Book: React.FC<BookProps> = ({ file, width, height, onFlip, bookRef }) => {
  const [numPages, setNumPages] = useState<number>(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="relative shadow-2xl shadow-cyan-900/40 rounded-sm">
      {/* The Document component must wrap the Pages to provide Context */}
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700" style={{ width: width * 2, height: height }}>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
              <span className="text-cyan-400 font-mono animate-pulse">DECODING DATA STREAM...</span>
            </div>
          </div>
        }
        error={
            <div className="flex items-center justify-center bg-red-900/20 backdrop-blur rounded-lg border border-red-700/50" style={{ width: width * 2, height: height }}>
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <span className="text-red-400 font-bold">ERROR LOADING DOCUMENT</span>
                <span className="text-xs text-red-300 font-mono">Verify PDF format and integrity</span>
              </div>
            </div>
        }
        className="flex justify-center"
      >
        {numPages > 0 && (
            // @ts-ignore - react-pageflip types
            <HTMLFlipBook
                width={width}
                height={height}
                ref={bookRef}
                onFlip={onFlip}
                showCover={true}
                maxShadowOpacity={0.5}
                className="book-shadow"
                startZIndex={0}
                autoSize={true}
                clickEventForward={true}
                usePortrait={false} // Double page spread enabled
                startPage={0}
                drawShadow={true}
                flippingTime={1000}
                useMouseEvents={true}
                swipeDistance={30}
                mobileScrollSupport={true}
                size="fixed"
            >
              {Array.from(new Array(numPages), (el, index) => (
                <PDFPage
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={width}
                    height={height}
                />
              ))}
            </HTMLFlipBook>
        )}
      </Document>
    </div>
  );
};

export default Book;