
import React from 'react';
import { AppView } from '../../types.ts';

interface HomeViewProps {
  onSetView: (view: AppView) => void;
  selectedModelId: string;
}

const HomeView: React.FC<HomeViewProps> = ({ onSetView, selectedModelId }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="relative z-10">
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter mb-1">Shadow AI Studio</h2>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] opacity-80 mb-4">Professional Photo Engine</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[8px] text-indigo-200 font-black uppercase tracking-widest">{selectedModelId}</span>
          </div>
         </div>
         <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/10 blur-3xl rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => onSetView('passport')}
          className="p-6 bg-[#0e1217] rounded-[2.5rem] border border-white/5 flex items-center gap-6 group active:scale-95 transition-all"
        >
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-indigo-500">
            <i className="fas fa-id-card text-2xl"></i>
          </div>
          <div className="text-left flex-1">
            <h3 className="text-white font-black text-sm uppercase tracking-wider">2x2 Passport Photo</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Biometric Professional Output</p>
          </div>
          <i className="fas fa-chevron-right text-slate-700"></i>
        </button>

        <button 
          onClick={() => onSetView('face-swap')}
          className="p-6 bg-[#0e1217] rounded-[2.5rem] border border-white/5 flex items-center gap-6 group active:scale-95 transition-all"
        >
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-rose-500">
            <i className="fas fa-user-gear text-2xl"></i>
          </div>
          <div className="text-left flex-1">
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Face Swap AI</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Realistic Identity Transfer</p>
          </div>
          <i className="fas fa-chevron-right text-slate-700"></i>
        </button>

        <button 
          onClick={() => onSetView('prompt-to-image')}
          className="p-6 bg-[#0e1217] rounded-[2.5rem] border border-white/5 flex items-center gap-6 group active:scale-95 transition-all"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-emerald-500">
            <i className="fas fa-wand-magic-sparkles text-2xl"></i>
          </div>
          <div className="text-left flex-1">
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Prompt to Image</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Portrait Scene Generation</p>
          </div>
          <i className="fas fa-chevron-right text-slate-700"></i>
        </button>

        <button 
          onClick={() => onSetView('image-to-image')}
          className="p-6 bg-[#0e1217] rounded-[2.5rem] border border-white/5 flex items-center gap-6 group active:scale-95 transition-all"
        >
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-amber-500">
            <i className="fas fa-clone text-2xl"></i>
          </div>
          <div className="text-left flex-1">
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Image to Image</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Style Transfer Fusion</p>
          </div>
          <i className="fas fa-chevron-right text-slate-700"></i>
        </button>
      </div>
    </div>
  );
};

export default HomeView;
