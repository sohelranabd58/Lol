
import React, { useRef, useState, useEffect } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
  label?: string;
  subLabel?: string | React.ReactNode;
  isProcessing?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelect, 
  previewUrl, 
  label = "আপনার ছবি আপলোড করুন", 
  subLabel = "গ্যালারি থেকে ছবি সিলেক্ট করুন",
  isProcessing = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  const messages = [
    "Analyzing facial geometry...",
    "Adjusting attire details...",
    "Applying biometric background...",
    "Perfecting studio lighting...",
    "Rendering 2x2 standard...",
    "Finalizing image quality...",
    "Almost ready for print..."
  ];

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      interval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length);
      }, 2000);
    } else {
      setMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <p className="text-[12px] text-indigo-400 font-black uppercase tracking-[0.1em] mb-3 ml-2">
          {label}
        </p>
      )}
      <div 
        onClick={() => {
            if (isProcessing) return;
            if ('vibrate' in navigator) navigator.vibrate(10);
            fileInputRef.current?.click();
        }}
        className={`relative group cursor-pointer border-2 border-dashed rounded-[2.5rem] transition-all flex flex-col items-center justify-center min-h-[260px] overflow-hidden active:scale-[0.98] duration-300 ${
          previewUrl 
            ? 'border-indigo-500/40 bg-indigo-500/5' 
            : 'border-white/10 bg-black/40 hover:border-indigo-500/30 shadow-inner'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden" 
        />
        
        {previewUrl ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-3">
            <img src={previewUrl} alt="Preview" className={`w-full h-full object-cover rounded-[2rem] ring-1 ring-white/10 shadow-2xl transition-all duration-700 ${isProcessing ? 'blur-md grayscale opacity-50' : ''}`} />
            
            {isProcessing ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                  <div className="mb-6 relative">
                     <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full"></div>
                     <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-microchip text-indigo-500 animate-pulse"></i>
                     </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[12px] font-black text-white uppercase tracking-[0.2em] animate-pulse">Studio Processing</h4>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest min-h-[20px] transition-all duration-500">
                      {messages[msgIndex]}
                    </p>
                  </div>
                  <div className="mt-8 flex gap-1">
                    {messages.map((_, i) => (
                      <div key={i} className={`h-1 w-4 rounded-full transition-all duration-500 ${i === msgIndex ? 'bg-indigo-500' : 'bg-white/10'}`}></div>
                    ))}
                  </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[4px]">
                 <div className="bg-white/10 p-4 rounded-full border border-white/20 mb-2">
                    <i className="fas fa-sync-alt text-white text-xl"></i>
                 </div>
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">ছবি পরিবর্তন করুন</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 space-y-4">
            <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-2 text-indigo-500/50 shadow-2xl group-hover:scale-110 transition-transform duration-500 group-hover:text-indigo-400">
              <i className="fas fa-camera-viewfinder text-3xl"></i>
            </div>
            <div className="space-y-3 px-2">
              <div className="text-[12px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
                {subLabel}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
