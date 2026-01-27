
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 h-12 w-12 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
              <i className="fas fa-camera-retro text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">Amr<span className="text-indigo-500">Studio</span> AI</h1>
              <div className="flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">আমার ডিজিটাল স্টুডিও</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Studio Status</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Online / অনলাইন</span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
              Settings
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
