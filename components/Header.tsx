
import React from 'react';
import { AppView } from '../types.ts';
import { getSelectedModel, getApiKeyFragment } from '../services/geminiService.ts';

interface HeaderProps {
  view: AppView;
  onBack: () => void;
  onSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, onBack, onSettings }) => {
  const model = getSelectedModel();
  const keyFrag = getApiKeyFragment();

  return (
    <header className="bg-[#05070a]/90 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-[100] safe-top">
      <div className="max-w-lg mx-auto px-5 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {view !== 'home' ? (
              <button 
                onClick={onBack}
                className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-white/5"
              >
                <i className="fas fa-arrow-left text-sm"></i>
              </button>
            ) : (
              <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 ring-1 ring-white/10">
                <i className="fas fa-camera-retro text-white text-xl"></i>
              </div>
            )}
            <div>
              <h1 className="text-sm font-black text-white tracking-tighter uppercase leading-none">Shadow<span className="text-indigo-500">Studio</span></h1>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.1em] mt-1.5 flex items-center whitespace-nowrap overflow-hidden max-w-[150px]">
                <span className="text-indigo-400">{model.split('-').slice(0,2).join('-')}</span>
                <span className="mx-1 opacity-20">|</span>
                <span className="text-slate-500">{keyFrag}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {view === 'home' && (
              <button 
                onClick={onSettings}
                className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-all"
              >
                <i className="fas fa-cog"></i>
              </button>
            )}
            <div className="px-3 py-2 rounded-full border border-emerald-500/20 bg-black/40 flex items-center gap-2 text-emerald-500">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
