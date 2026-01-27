
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import { generatePassportPhoto } from './services/geminiService';
import { PhotoAttire, StudioHistoryItem } from './types';

const STORAGE_KEY = 'AMR_STUDIO_HISTORY';
const MAX_HISTORY = 15;

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attire, setAttire] = useState<PhotoAttire>(PhotoAttire.ORIGINAL_ATTIRE);
  const [selectedBg, setSelectedBg] = useState({ name: 'Pure White', hex: '#FFFFFF', bn: 'সাদা' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'none' | 'men' | 'women'>('men');
  const [history, setHistory] = useState<StudioHistoryItem[]>([]);
  const [loadingStep, setLoadingStep] = useState(0);
  
  const [manualApiKey, setManualApiKey] = useState(localStorage.getItem('STUDIO_API_KEY') || '');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const bgColors = [
    { name: 'Pure White', hex: '#FFFFFF', bn: 'সাদা', class: 'bg-white border-slate-200' },
    { name: 'Royal Blue', hex: '#0038A8', bn: 'নীল', class: 'bg-blue-800 border-blue-900' },
    { name: 'Sky Blue', hex: '#87CEEB', bn: 'আকাশী', class: 'bg-sky-300 border-sky-400' },
    { name: 'Grey', hex: '#808080', bn: 'গ্রে', class: 'bg-gray-500 border-gray-600' },
    { name: 'Red', hex: '#FF0000', bn: 'লাল', class: 'bg-red-600 border-red-700' }
  ];

  const attireConfig: Record<PhotoAttire, { label: string, bn: string, icon: string, bg: string, gender: 'none' | 'men' | 'women' }> = {
    [PhotoAttire.ORIGINAL_ATTIRE]: { label: "Keep Original", bn: "আসল পোশাক", icon: "fas fa-user", bg: "from-slate-800 to-slate-900", gender: 'none' },
    [PhotoAttire.M_NAVY_SUIT]: { label: "Navy Suit", bn: "নেভি স্যুট", icon: "fas fa-user-tie", bg: "from-blue-900 to-indigo-950", gender: 'men' },
    [PhotoAttire.M_BLACK_SUIT]: { label: "Black Suit", bn: "কালো স্যুট", icon: "fas fa-user-tie", bg: "from-slate-900 to-black", gender: 'men' },
    [PhotoAttire.M_CHARCOAL_SUIT]: { label: "Charcoal Grey", bn: "চারকোল স্যুট", icon: "fas fa-user-tie", bg: "from-slate-700 to-slate-900", gender: 'men' },
    [PhotoAttire.M_GREY_BLAZER]: { label: "Grey Blazer", bn: "গ্রে ব্লেজার", icon: "fas fa-user-tie", bg: "from-slate-400 to-slate-600", gender: 'men' },
    [PhotoAttire.M_BEIGE_SUIT]: { label: "Beige Suit", bn: "বেজ স্যুট", icon: "fas fa-user-tie", bg: "from-orange-100 to-orange-200", gender: 'men' },
    [PhotoAttire.M_WHITE_SHIRT]: { label: "White Shirt", bn: "সাদা শার্ট", icon: "fas fa-shirt", bg: "from-slate-50 to-slate-200", gender: 'men' },
    [PhotoAttire.M_BLUE_SHIRT]: { label: "Blue Shirt", bn: "নীল শার্ট", icon: "fas fa-shirt", bg: "from-blue-100 to-blue-200", gender: 'men' },
    [PhotoAttire.M_TUXEDO]: { label: "Black Tuxedo", bn: "টাক্সিডো", icon: "fas fa-user-tie", bg: "from-black to-slate-900", gender: 'men' },
    [PhotoAttire.M_NAVY_POLO]: { label: "Navy Polo", bn: "নেভি পলো", icon: "fas fa-shirt", bg: "from-blue-800 to-blue-900", gender: 'men' },
    [PhotoAttire.M_PANJABI]: { label: "White Panjabi", bn: "সাদা পাঞ্জাবী", icon: "fas fa-user", bg: "from-slate-100 to-white", gender: 'men' },
    [PhotoAttire.W_BLACK_BLAZER]: { label: "Black Blazer", bn: "কালো ব্লেজার", icon: "fas fa-user-tie", bg: "from-slate-900 to-black", gender: 'women' },
    [PhotoAttire.W_NAVY_SUIT]: { label: "Navy Business", bn: "নেভি বিজনেস", icon: "fas fa-user-tie", bg: "from-blue-900 to-indigo-950", gender: 'women' },
    [PhotoAttire.W_WHITE_BLOUSE]: { label: "Silk Blouse", bn: "সিল্ক ব্লাউজ", icon: "fas fa-shirt", bg: "from-slate-50 to-slate-100", gender: 'women' },
    [PhotoAttire.W_SAREE]: { label: "Silk Saree", bn: "সিল্ক শাড়ি", icon: "fas fa-user", bg: "from-rose-800 to-rose-950", gender: 'women' },
    [PhotoAttire.W_SALWAR]: { label: "Salwar Kameez", bn: "সালোয়ার কামিজ", icon: "fas fa-user", bg: "from-teal-800 to-teal-950", gender: 'women' },
    [PhotoAttire.W_GREY_CARDIGAN]: { label: "Grey Cardigan", bn: "গ্রে কার্ডিগান", icon: "fas fa-shirt", bg: "from-slate-400 to-slate-500", gender: 'women' },
    [PhotoAttire.W_MAROON_DRESS]: { label: "Maroon Dress", bn: "মেরুন ড্রেস", icon: "fas fa-user", bg: "from-red-900 to-red-950", gender: 'women' },
    [PhotoAttire.W_TEAL_BLAZER]: { label: "Teal Blazer", bn: "নীল ব্লেজার", icon: "fas fa-user-tie", bg: "from-teal-600 to-teal-800", gender: 'women' },
    [PhotoAttire.W_BEIGE_COAT]: { label: "Beige Trench", bn: "বেজ কোট", icon: "fas fa-user-tie", bg: "from-orange-100 to-orange-200", gender: 'women' },
    [PhotoAttire.W_TURTLENECK]: { label: "Turtleneck", bn: "টার্টলনেক", icon: "fas fa-shirt", bg: "from-black to-slate-800", gender: 'women' }
  };

  const loadingMessages = [
    { en: "Analyzing Biometric Points", bn: "বায়োমেট্রিক বিশ্লেষণ চলছে" },
    { en: "Adjusting Facial Lighting", bn: "মুখের আলো ঠিক করা হচ্ছে" },
    { en: "Applying Studio Backdrop", bn: "ব্যাকগ্রাউন্ড সেট করা হচ্ছে" },
    { en: "Rendering Formal Attire", bn: "পোশাক পরানো হচ্ছে" },
    { en: "Finalizing 2x2 Master", bn: "২x২ মাস্টার কপি তৈরি হচ্ছে" }
  ];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const syncHistory = (newHistory: StudioHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      if (newHistory.length > 1) {
        const pruned = newHistory.slice(0, newHistory.length - 1);
        setHistory(pruned);
        syncHistory(pruned);
      }
    }
  };

  const handleSaveApiKey = () => {
    if (!manualApiKey || manualApiKey.trim().length < 20) {
      setKeyValidationStatus('error');
      setTimeout(() => setKeyValidationStatus('idle'), 3000);
      return;
    }
    
    // Validate for Google AI Studio Key format (usually starts with AIza)
    if (manualApiKey.trim().startsWith('AIza')) {
      localStorage.setItem('STUDIO_API_KEY', manualApiKey.trim());
      setKeyValidationStatus('success');
      setTimeout(() => {
        setKeyValidationStatus('idle');
        setIsAdminMode(false);
      }, 1500);
    } else {
      setKeyValidationStatus('error');
      setTimeout(() => setKeyValidationStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageSelect = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
    setResultImageUrl(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await generatePassportPhoto(base64, attire, selectedBg, 85, manualApiKey);
        setResultImageUrl(result);
        
        const newItem: StudioHistoryItem = { 
          id: Date.now().toString(), 
          originalUrl: '', 
          resultUrl: result, 
          timestamp: Date.now() 
        };
        
        const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY);
        setHistory(updatedHistory);
        syncHistory(updatedHistory);
        
        setIsGenerating(false);
      };
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
      setIsGenerating(false);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    syncHistory(updated);
  };

  const purgeHistory = () => {
    if (window.confirm("Delete all studio archives? এটি আপনার সকল সেভ করা ফটো মুছে ফেলবে।")) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const generatePrintSheet = () => {
    if (!resultImageUrl) return;
    // 4x6 inch at 300 DPI = 1200 x 1800 px
    const canvas = document.createElement('canvas');
    canvas.width = 1800; canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = resultImageUrl;
    img.onload = () => {
      ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Exactly 2x2 inch at 300 DPI = 600 x 600 px
      const photoSize = 600;
      const paddingX = (canvas.width - (3 * photoSize)) / 4;
      const paddingY = (canvas.height - (2 * photoSize)) / 3;
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const x = paddingX + col * (photoSize + paddingX);
          const y = paddingY + row * (photoSize + paddingY);
          ctx.drawImage(img, x, y, photoSize, photoSize);
          // Drawing a very thin cut line
          ctx.strokeStyle = "#f1f5f9"; 
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, photoSize, photoSize);
        }
      }
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `Passport_PrintSheet_2x2inch_${Date.now()}.png`;
      link.click();
    };
  };

  const renderDropdownItem = (value: PhotoAttire, config: typeof attireConfig[PhotoAttire]) => (
    <button
      key={value}
      onClick={() => { setAttire(value); setIsDropdownOpen(false); }}
      className={`w-full p-3 rounded-xl flex items-center space-x-4 transition-all ${attire === value ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-white/20' : 'hover:bg-slate-900 text-slate-400'}`}
    >
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.bg} flex-shrink-0 flex items-center justify-center border border-white/10`}>
        <i className={`${config.icon} ${config.bg.includes('slate-100') || config.bg.includes('slate-50') ? 'text-slate-800' : 'text-white'} text-[10px]`}></i>
      </div>
      <div className="text-left">
        <span className="text-[10px] font-black uppercase block tracking-tight">{config.label}</span>
        <span className={`text-[8px] font-bold block uppercase ${attire === value ? 'text-white/60' : 'text-slate-600'}`}>{config.bn}</span>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#05070a] text-slate-300 font-sans">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-10 w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0e1217] p-8 rounded-[3rem] shadow-3xl border border-slate-800/60 relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Studio Controls</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">স্টুডিও কন্ট্রোল</p>
                </div>
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isAdminMode ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-900 text-slate-600 hover:text-white hover:bg-slate-800'}`}
                >
                  <i className="fas fa-key text-xs"></i>
                </button>
              </div>

              {isAdminMode && (
                <div className="mb-6 p-6 bg-[#080b0f] border border-indigo-500/10 rounded-[2.5rem] animate-in slide-in-from-top-4 relative overflow-hidden group shadow-2xl">
                  <div className="flex flex-col space-y-5">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block">
                      Google AI Studio Key
                      <span className="block text-[8px] text-slate-600 normal-case mt-1 font-medium tracking-normal">(Required for photo generation)</span>
                    </label>
                    
                    <div className="relative">
                      <div className={`p-4 bg-[#05070a] border ${keyValidationStatus === 'error' ? 'border-red-500/50' : keyValidationStatus === 'success' ? 'border-emerald-500/50' : 'border-slate-800/80'} rounded-2xl flex items-center transition-all shadow-inner`}>
                         <input 
                          type="password"
                          value={manualApiKey}
                          onChange={(e) => { setManualApiKey(e.target.value); setKeyValidationStatus('idle'); }}
                          placeholder="Enter AI Studio Key..."
                          className="w-full bg-transparent text-xs text-indigo-100 outline-none placeholder:text-slate-800 font-mono"
                        />
                        {keyValidationStatus === 'success' && <i className="fas fa-check-circle text-emerald-500 ml-2 animate-in zoom-in"></i>}
                        {keyValidationStatus === 'error' && <i className="fas fa-exclamation-circle text-red-500 ml-2 animate-in zoom-in"></i>}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleSaveApiKey}
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-white transition-all shadow-xl ${
                        keyValidationStatus === 'success' ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/30'
                      }`}
                    >
                      {keyValidationStatus === 'success' ? 'Saved Successfully' : 'Save & Validate Key'}
                    </button>
                    
                    {keyValidationStatus === 'error' && (
                      <p className="text-[8px] font-black text-red-500 uppercase text-center tracking-widest animate-pulse">Invalid API Key Format</p>
                    )}
                  </div>
                </div>
              )}

              <ImageUploader onImageSelect={handleImageSelect} previewUrl={previewUrl} />

              <div className="mt-10 space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">BG Color / ব্যাকগ্রাউন্ড</label>
                <div className="flex flex-wrap gap-4">
                  {bgColors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedBg(color)}
                      className={`group relative flex flex-col items-center transition-all ${selectedBg.hex === color.hex ? 'scale-110' : 'hover:scale-105 opacity-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-full border-2 ${color.class} ${selectedBg.hex === color.hex ? 'ring-4 ring-indigo-500/20 shadow-xl' : ''}`}></div>
                      <span className="mt-2 text-[8px] font-black uppercase text-slate-400">{color.bn}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-4 relative" ref={dropdownRef}>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Attire Style / পোশাক</label>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full bg-[#07090d] border border-slate-800 rounded-2xl p-4 flex items-center justify-between transition-all ${isDropdownOpen ? 'ring-2 ring-indigo-500/50 shadow-2xl' : 'hover:border-slate-700'}`}
                >
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${attireConfig[attire].bg} flex-shrink-0 flex items-center justify-center border border-white/5 shadow-xl`}>
                      <i className={`${attireConfig[attire].icon} ${attireConfig[attire].bg.includes('slate-100') || attireConfig[attire].bg.includes('slate-50') ? 'text-slate-800' : 'text-white'}`}></i>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-white uppercase truncate">{attireConfig[attire].label}</p>
                      <p className="text-[8px] text-slate-500 font-bold uppercase">{attireConfig[attire].bn}</p>
                    </div>
                  </div>
                  <i className={`fas fa-chevron-down text-slate-700 text-[10px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-4 bg-[#0e1217] border border-slate-800 rounded-[2.5rem] shadow-4xl z-[100] p-4 animate-in fade-in slide-in-from-top-4 overflow-hidden">
                    <div className="flex p-1 bg-[#05070a] rounded-2xl mb-4 border border-slate-800/50">
                      <button onClick={(e) => { e.stopPropagation(); setActiveTab('none'); }} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'none' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Reset</button>
                      <button onClick={(e) => { e.stopPropagation(); setActiveTab('men'); }} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${activeTab === 'men' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><i className="fas fa-mars text-[8px]"></i><span>Men</span></button>
                      <button onClick={(e) => { e.stopPropagation(); setActiveTab('women'); }} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${activeTab === 'women' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><i className="fas fa-venus text-[8px]"></i><span>Women</span></button>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar space-y-2">
                      {activeTab === 'none' && renderDropdownItem(PhotoAttire.ORIGINAL_ATTIRE, attireConfig[PhotoAttire.ORIGINAL_ATTIRE])}
                      {Object.values(PhotoAttire).filter((val) => attireConfig[val].gender === activeTab && val !== PhotoAttire.ORIGINAL_ATTIRE).map((val) => renderDropdownItem(val, attireConfig[val]))}
                      {activeTab !== 'none' && <div className="pt-2 mt-2 border-t border-slate-800/50 opacity-40">{renderDropdownItem(PhotoAttire.ORIGINAL_ATTIRE, attireConfig[PhotoAttire.ORIGINAL_ATTIRE])}</div>}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!selectedFile || isGenerating}
                className={`w-full mt-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] text-white transition-all flex items-center justify-center space-x-4 shadow-3xl ${
                  !selectedFile || isGenerating ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800/40' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-95'
                }`}
              >
                {isGenerating ? <><i className="fas fa-circle-notch fa-spin"></i><span>Processing...</span></> : <><i className="fas fa-bolt"></i><span>Render 2x2 Photo</span></>}
              </button>
              
              {error && <div className="mt-6 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-[9px] text-red-400 font-bold text-center uppercase animate-pulse">{error}</div>}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#0e1217] rounded-[4rem] border border-slate-800/60 p-12 min-h-[750px] flex flex-col items-center justify-center relative overflow-hidden">
              {!resultImageUrl && !isGenerating ? (
                <div className="text-center space-y-6">
                  <div className="w-40 h-40 bg-[#05070a] border border-slate-800 rounded-[3rem] flex items-center justify-center text-slate-800 mx-auto shadow-inner">
                    <i className="fas fa-image text-6xl opacity-20"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Studio Monitor</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">আপনার ফটো এখানে দেখা যাবে</p>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="text-center space-y-10 animate-in fade-in">
                  <div className="relative w-72 h-72 mx-auto rounded-[3.5rem] overflow-hidden bg-[#05070a] border border-slate-800 flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[scan_2s_linear_infinite]"></div>
                    <i className="fas fa-magic text-4xl text-indigo-400/30 animate-pulse"></i>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-black text-xl uppercase">{loadingMessages[loadingStep].en}</h3>
                    <p className="text-indigo-400 font-bold text-xs uppercase">{loadingMessages[loadingStep].bn}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center animate-in zoom-in">
                  <div className="bg-white p-10 rounded-[3.5rem] shadow-5xl border border-white/5 relative">
                    <div className="bg-[#f8fafc] rounded-[2rem] overflow-hidden flex items-center justify-center shadow-inner" style={{ width: 'min(480px, 100%)', aspectRatio: '1/1' }}>
                      <img src={resultImageUrl || ''} alt="Passport Result" className="w-full h-full object-contain" />
                    </div>
                    <div className="mt-6 flex justify-between items-center px-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Biometric Ready</span>
                        <span className="text-[7px] font-bold text-slate-400 uppercase mt-1">ISO/IEC 19794-5 COMPLIANT</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase bg-slate-100 px-5 py-2 rounded-full border border-slate-200 shadow-sm">2 x 2 INCH / 51 x 51 MM</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 w-full max-w-lg">
                    <button onClick={() => { const l = document.createElement('a'); l.href = resultImageUrl!; l.download = '2x2_photo.png'; l.click(); }} className="bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95">Download Single 2x2</button>
                    <button onClick={generatePrintSheet} className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95">Print 4x6 Sheet (6 Photos)</button>
                    <button onClick={() => { setResultImageUrl(null); setSelectedFile(null); setPreviewUrl(null); }} className="sm:col-span-2 text-[10px] font-black text-slate-500 uppercase py-4 hover:text-white transition-all flex items-center justify-center space-x-2">
                      <i className="fas fa-arrow-left text-[8px]"></i>
                      <span>Upload New Photo / নতুন ফটো আপলোড</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#0e1217] rounded-[3rem] border border-slate-800/60 p-8">
              <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-white font-black text-lg uppercase tracking-tighter">Studio Archives</h3>
                   <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mt-1">আর্কাইভ / পূর্বের কাজ</p>
                 </div>
                 {history.length > 0 && (
                   <button onClick={purgeHistory} className="text-[9px] font-black text-slate-700 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center space-x-2">
                     <i className="fas fa-trash-alt"></i>
                     <span>Purge All History</span>
                   </button>
                 )}
              </div>

              {history.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/40 rounded-[2.5rem]">
                  <i className="fas fa-history text-3xl text-slate-800 mb-4 opacity-40"></i>
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">History will appear here</p>
                </div>
              ) : (
                <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar scroll-smooth">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => { setResultImageUrl(item.resultUrl); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="group relative flex-shrink-0 w-28 h-28 bg-[#05070a] border border-slate-800 rounded-[1.5rem] overflow-hidden cursor-pointer hover:border-indigo-600/50 transition-all active:scale-95 shadow-lg"
                    >
                      <img src={item.resultUrl} alt="Archive" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100"></div>
                      <button 
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/70 backdrop-blur-lg rounded-full text-white opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-600 transition-all border border-white/5 shadow-xl"
                      >
                        <i className="fas fa-times text-[8px]"></i>
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[7px] font-black text-white/80 border border-white/5">
                        {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 bg-[#05070a] border-t border-slate-900 text-center">
        <p className="text-[9px] text-slate-800 font-bold uppercase tracking-[0.5em]">Amr Studio AI • Professional 2x2 Passport Generator</p>
      </footer>

      <style>{`
        @keyframes scan { 0% { top: -10%; opacity: 0; } 50% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default App;
