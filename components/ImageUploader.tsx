
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        onClick={triggerUpload}
        className={`relative group cursor-pointer border-2 border-dashed rounded-[3rem] transition-all duration-500 flex flex-col items-center justify-center min-h-[350px] overflow-hidden ${
          previewUrl 
            ? 'border-indigo-500/40 bg-indigo-500/5' 
            : 'border-slate-800 bg-slate-900/40 hover:border-indigo-500 hover:bg-indigo-500/10'
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
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-6">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-[2rem] shadow-2xl transition-all" />
            
            {/* 2x2 Studio Overlay */}
            <div className="absolute inset-0 pointer-events-none p-6">
               <div className="w-full h-full border-2 border-indigo-500/30 rounded-[2rem] relative overflow-hidden">
                  {/* Rule of Thirds / 2x2 Alignment */}
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div className="border-[0.5px] border-indigo-500/10"></div>
                    <div className="border-[0.5px] border-indigo-500/10"></div>
                    <div className="border-[0.5px] border-indigo-500/10"></div>
                    <div className="border-[0.5px] border-indigo-500/10"></div>
                  </div>
                  {/* Biometric Head Circle */}
                  <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[55%] h-[60%] border-2 border-dashed border-indigo-400/30 rounded-full"></div>
                  <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[70%] h-[2px] bg-indigo-400/20"></div>
               </div>
            </div>

            <div className="absolute inset-0 bg-[#0f172a]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 mb-4 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                <i className="fas fa-sync-alt text-2xl"></i>
              </div>
              <span className="text-white text-xs font-black uppercase tracking-widest">Change Photo</span>
              <span className="text-slate-400 text-[10px] mt-1">ফটো পরিবর্তন করুন</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 group">
            <div className="w-28 h-28 bg-slate-800/80 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-500 group-hover:text-indigo-400 group-hover:bg-slate-700 group-hover:-rotate-3 transition-all shadow-3xl">
              <i className="fas fa-cloud-upload-alt text-5xl"></i>
            </div>
            <h3 className="text-white font-black text-xl mb-3 tracking-tight uppercase">Upload Portrait</h3>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.4em] mb-8">ফটো আপলোড করুন (2x2 Passport)</p>
            
            <div className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 group-hover:bg-indigo-500 transition-all">
              Choose From Device
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-start">
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mr-4 flex-shrink-0">
          <i className="fas fa-lightbulb text-sm"></i>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] text-white font-black uppercase tracking-wider">Studio Tip / স্টুডিও টিপ</p>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Ensure the subject is looking directly at the camera with shoulders level for the best 2x2 biometric result.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
