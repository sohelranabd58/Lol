
import React, { useState, useRef, useEffect } from 'react';

interface ResultViewerProps {
  imageUrl: string;
  onClose: () => void;
  onDownload: () => void;
  title?: string;
  isPassport?: boolean;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ imageUrl, onClose, onDownload, title = "Studio Output", isPassport = false }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(1, prev + delta), 4));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || scale <= 1) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className={`fixed inset-0 z-[5000] flex flex-col items-center justify-center bg-black/98 backdrop-blur-3xl animate-in zoom-in-95 duration-500 overflow-hidden`}>
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all backdrop-blur-md">
            <i className="fas fa-times"></i>
          </button>
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{title}</h3>
            <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Interactive Viewer Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={toggleFullscreen} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/70 active:scale-90 transition-all">
             <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
           </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <div 
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)'
          }}
          className={`relative max-w-[90%] max-h-[70%] bg-white ${isPassport ? 'aspect-square' : ''} p-2 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/20`}
        >
          <img 
            ref={imgRef}
            src={imageUrl} 
            draggable={false}
            className="w-full h-full object-contain rounded-xl select-none pointer-events-none" 
            alt="Studio Output" 
          />
          {scale > 1.2 && (
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-bounce">
               Zoom: {Math.round(scale * 100)}%
             </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-10 left-6 right-6 flex flex-col items-center gap-6">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-full flex items-center gap-6 shadow-2xl">
           <button onClick={() => handleZoom(-0.25)} className="text-white/60 hover:text-white transition-colors active:scale-75"><i className="fas fa-minus"></i></button>
           <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(scale - 1) / 3 * 100}%` }}></div>
           </div>
           <button onClick={() => handleZoom(0.25)} className="text-white/60 hover:text-white transition-colors active:scale-75"><i className="fas fa-plus"></i></button>
           <div className="w-[1px] h-4 bg-white/10"></div>
           <button onClick={resetZoom} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Reset</button>
        </div>

        <div className="w-full max-w-xs flex gap-4">
           <button 
             onClick={onClose} 
             className="flex-1 py-5 bg-slate-900 border border-white/10 rounded-[1.5rem] text-slate-400 font-black uppercase text-[10px] active:scale-95 transition-all"
           >Cancel</button>
           <button 
             onClick={onDownload} 
             className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-600/30"
           >
             <i className="fas fa-download"></i> Save
           </button>
        </div>
      </div>
    </div>
  );
};

export default ResultViewer;
