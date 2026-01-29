
import React, { useState, useEffect } from 'react';

const SettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  useEffect(() => {
    // On component mount, check for a saved API key in localStorage
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsKeySaved(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    // Save the API key to localStorage
    localStorage.setItem('gemini_api_key', apiKey);
    setIsKeySaved(true);
    alert('API Key saved successfully!');
  };
  
  const handleClearApiKey = () => {
    // Remove the API key from localStorage
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsKeySaved(false);
    alert('API Key cleared.');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top-8 duration-500 pb-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-white font-black uppercase text-[10px] tracking-[0.2em]">Gemini API Key</h3>
        </div>
        
        <div className="bg-[#0e1217] border border-white/5 p-7 rounded-[3rem] space-y-4">
            <p className="text-[8px] text-slate-500 font-black uppercase mb-1 ml-2 tracking-widest">
              {isKeySaved ? 'API Key is saved in your browser's local storage.' : 'Enter your Gemini API Key'}
            </p>
            <div className="relative group">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-5 text-[12px] font-bold text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 bg-slate-800 text-slate-300 disabled:opacity-50"
              >
                Save Key
              </button>
              <button 
                onClick={handleClearApiKey}
                className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 bg-rose-800 text-slate-300"
              >
                Clear Key
              </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsView;
