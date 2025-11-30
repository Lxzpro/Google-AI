import React, { useState, useRef, useEffect, useCallback } from 'react';
import Book from './components/Book';
import { Upload, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  const bookRef = useRef<any>(null); // react-pageflip ref

  // Dimensions for single page (Spread will be 2x Width)
  // Adjusted for standard screen fit when doubled (800x600 approx)
  const BOOK_WIDTH = 400;
  const BOOK_HEIGHT = 600;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      // Reset state
      setCurrentPage(0);
    }
  };

  const handleNext = useCallback(() => {
    if (bookRef.current && bookRef.current.pageFlip()) {
      bookRef.current.pageFlip().flipNext();
    }
  }, []);

  const handlePrev = useCallback(() => {
    if (bookRef.current && bookRef.current.pageFlip()) {
      bookRef.current.pageFlip().flipPrev();
    }
  }, []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  }, [handleNext, handlePrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Handle Page Flip Event
  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col items-center justify-center relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/50 rounded flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">HoloBook<span className="text-cyan-500">.Reader</span></h1>
            <p className="text-xs text-slate-500 font-mono tracking-wider">IMMERSIVE PDF SIMULATION</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center w-full h-full min-h-[800px]">
        {!file ? (
          <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 transition-all group max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upload Neural Data</h2>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">Select a PDF file to initialize the holographic book simulation.</p>
            
            <label className="relative cursor-pointer">
              <input type="file" accept=".pdf" onChange={handleFileChange} />
              <div className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-900/50 transition-all transform active:scale-95 flex items-center gap-2">
                 <span>SELECT FILE</span>
                 <ChevronRight className="w-4 h-4" />
              </div>
            </label>
            
            <div className="mt-8 grid grid-cols-1 gap-4 text-xs text-slate-500 font-mono">
                <div className="flex items-center justify-center gap-2">
                     <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    STATIC CORE LOADED
                </div>
            </div>
          </div>
        ) : (
          <>
            {/* Book Wrapper */}
            <div className="relative group">
                <Book 
                    key={file.name} // Force remount on new file to reset FlipBook
                    file={file} 
                    width={BOOK_WIDTH} 
                    height={BOOK_HEIGHT} 
                    onFlip={onFlip} 
                    bookRef={bookRef}
                />
                
                {/* Floating Manual Controls */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 glass-panel px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="font-mono text-sm text-cyan-400 min-w-[60px] text-center">
                        PAGE {currentPage + 1}
                    </span>
                    <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
          </>
        )}
      </main>

    </div>
  );
};

export default App;