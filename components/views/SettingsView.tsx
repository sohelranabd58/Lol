
import React, { useState, useEffect } from 'react';
import { fetchAvailableModels } from '../../services/geminiService.ts';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

interface SettingsViewProps {
  availableModels: any[];
  selectedModelId: string;
  isModelsLoading: boolean;
  onSelectModel: (model: any) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  availableModels: initialModels, 
  selectedModelId, 
  onSelectModel 
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showModels, setShowModels] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [models, setModels] = useState<any[]>(initialModels);
  const [showOnlyFree, setShowOnlyFree] = useState(true);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    const savedKey = localStorage.getItem('AMR_STUDIO_CUSTOM_API_KEY');
    if (savedKey) {
      setApiKeyInput(savedKey);
      setIsKeySaved(true);
    } else if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (hasKey) setIsKeySaved(true);
    }
  };

  const handleSaveApiKey = () => {
    if ('vibrate' in navigator) navigator.vibrate(20);
    setSaveStatus('saving');
    setTimeout(() => {
      if (apiKeyInput.trim().startsWith('AIza') && apiKeyInput.trim().length > 20) {
        localStorage.setItem('AMR_STUDIO_CUSTOM_API_KEY', apiKeyInput.trim());
        setIsKeySaved(true);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 1000);
  };

  const handleOpenOfficialKeyPicker = async () => {
    if (window.aistudio) {
      if ('vibrate' in navigator) navigator.vibrate(20);
      try {
        await window.aistudio.openSelectKey();
        setIsKeySaved(true);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) { console.error("Key selection failed", err); }
    } else {
      window.open('https://ai.google.dev/gemini-api/docs/billing', '_blank');
    }
  };

  const handleToggleModels = async () => {
    if (!showModels) {
      setIsFetchingModels(true);
      if ('vibrate' in navigator) navigator.vibrate(10);
      try {
        const data = await fetchAvailableModels(showOnlyFree);
        setModels(data);
        setShowModels(true);
      } catch (e) { console.error("Failed to fetch models"); } finally { setIsFetchingModels(false); }
    } else { setShowModels(false); }
  };

  const handleQuickOptimize = () => {
    if ('vibrate' in navigator) navigator.vibrate(30);
    const recommended = models.find(m => m.isRecommended) || models[0];
    if (recommended) {
      onSelectModel(recommended);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('AMR_STUDIO_CUSTOM_API_KEY');
    setApiKeyInput('');
    setIsKeySaved(false);
    setShowModels(false);
    if ('vibrate' in navigator) navigator.vibrate(15);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top-8 duration-500 pb-10">
      {/* Smart Recommendation Card */}
      <section className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-[2.5rem] space-y-4 relative overflow-hidden">
          <div className="relative z-10">
              <div className="flex items-center gap-3 text-indigo-400 mb-2">
                  <i className="fas fa-magic-wand-sparkles text-sm"></i>
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Recommended for this Studio</h4>
              </div>
              <h3 className="text-white font-black text-sm uppercase tracking-tight">Gemini 2.5 Flash Image</h3>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase mt-2">
                  এটি আপনার ২x২ পাসপোর্ট ফটো এবং পোর্ট্রেট ফিউশনের জন্য <span className="text-indigo-300">সেরা এবং দ্রুততম</span> মডেল। এটি ফ্রি-টায়ারেও কাজ করে।
              </p>
              <button 
                onClick={handleQuickOptimize}
                className="mt-4 px-6 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-600/30"
              >
                Auto-Optimize Studio
              </button>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full"></div>
      </section>

      {/* Connection Mode */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-white font-black uppercase text-[10px] tracking-[0.2em]">Authentication</h3>
            <button 
              onClick={() => setShowOnlyFree(!showOnlyFree)}
              className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full border transition-all ${showOnlyFree ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-white/5'}`}
            >
              {showOnlyFree ? 'Free Tier Models Only' : 'Showing All Models'}
            </button>
        </div>
        
        <button 
          onClick={handleOpenOfficialKeyPicker}
          className="w-full group bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 rounded-[2.5rem] flex items-center justify-between border border-white/10 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
        >
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white"><i className="fas fa-key text-xl"></i></div>
              <div className="text-left">
                <h4 className="text-[11px] text-white font-black uppercase tracking-wider">Official API Connection</h4>
                <p className="text-[8px] text-indigo-100 font-bold opacity-70 uppercase mt-0.5">Pick your paid or free project</p>
              </div>
          </div>
          <i className="fas fa-arrow-right text-white/40 group-hover:translate-x-1 transition-transform"></i>
        </button>

        <div className="bg-[#0e1217] border border-white/5 p-7 rounded-[3rem] space-y-4">
            <p className="text-[8px] text-slate-500 font-black uppercase mb-1 ml-2 tracking-widest">Manual API Key Override</p>
            <div className="relative group">
              <input 
                type="password"
                value={apiKeyInput}
                onChange={(e) => { setApiKeyInput(e.target.value); if (isKeySaved) setIsKeySaved(false); }}
                placeholder="AIzaSy..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-5 text-[12px] font-bold text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
              {apiKeyInput && (
                <button onClick={handleClearKey} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-rose-500 p-2"><i className="fas fa-times-circle"></i></button>
              )}
            </div>
            <button 
              onClick={handleSaveApiKey}
              disabled={saveStatus === 'saving' || !apiKeyInput.trim()}
              className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${saveStatus === 'success' ? 'bg-emerald-600 text-white' : saveStatus === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'} disabled:opacity-50`}
            >
              {saveStatus === 'saving' ? 'Validating...' : saveStatus === 'success' ? 'Validated' : 'Save Manual Key'}
            </button>
        </div>
      </section>

      {/* Engine Management */}
      {isKeySaved && (
        <section className="space-y-6">
           <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Active Studio Engine</p>
                <h4 className="text-white font-black text-xs uppercase mt-1 truncate">{selectedModelId.toUpperCase()}</h4>
              </div>
              <button 
                onClick={handleToggleModels}
                disabled={isFetchingModels}
                className={`px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border min-w-[130px] flex items-center justify-center gap-2 ${showModels ? 'bg-white text-black border-white' : 'bg-transparent text-indigo-400 border-indigo-500/30 active:scale-95'}`}
              >
                {isFetchingModels ? <i className="fas fa-sync animate-spin"></i> : (showModels ? 'Close List' : 'Switch Engine')}
              </button>
           </div>

           {showModels && !isFetchingModels && (
             <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-4 duration-500">
                {models.map(m => (
                  <div 
                    key={m.name}
                    onClick={() => onSelectModel(m)}
                    className={`group p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer active:scale-[0.98] ${selectedModelId === m.name ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-slate-900/40'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-white">{m.displayName}</h4>
                          {m.isRecommended && <span className="text-[7px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black">STUDIO PICK</span>}
                        </div>
                        <p className={`text-[8px] font-black uppercase mt-1.5 ${m.isImageModel ? 'text-amber-400' : 'text-slate-500'}`}>
                          {m.isImageModel ? 'Image Fusion Engine' : 'Text Assistant Engine'}
                        </p>
                      </div>
                      <span className="text-[8px] text-slate-600 font-bold uppercase px-2 py-1 bg-black/40 rounded-lg">{m.tier}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed mb-4">{m.useCase}</p>
                    <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                        <span className="text-[9px] text-indigo-300/60 font-black uppercase">{m.rpm} RPM</span>
                        <span className="text-[9px] text-emerald-300/60 font-black uppercase">{m.rpd} RPD</span>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </section>
      )}
    </div>
  );
};

export default SettingsView;
