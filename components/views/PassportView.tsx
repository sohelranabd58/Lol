
import React, { useState } from 'react';
import ImageUploader from '../ImageUploader.tsx';
import ResultViewer from '../ResultViewer.tsx';
import { UserPhoto, PhotoAttire, ATTIRE_CATEGORIES } from '../../types.ts';
import { generatePassportPhoto } from '../../services/geminiService.ts';

const PassportView: React.FC = () => {
  const [photo, setPhoto] = useState<UserPhoto | null>(null);
  const [genderCategory, setGenderCategory] = useState<'MEN' | 'WOMEN' | 'CUSTOM'>('MEN');
  const [selectedAttire, setSelectedAttire] = useState<PhotoAttire>(PhotoAttire.ORIGINAL_ATTIRE);
  const [customAttireText, setCustomAttireText] = useState('');
  const [bgColor, setBgColor] = useState({ name: 'Sky Blue', hex: '#BFEFFF', bnName: 'আকাশী নীল' });
  const [customHex, setCustomHex] = useState('#BFEFFF');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showPrintSheet, setShowPrintSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundOptions = [
    { name: 'Sky Blue', bnName: 'আকাশী নীল', hex: '#BFEFFF' }, 
    { name: 'White', bnName: 'সাদা', hex: '#FFFFFF' }, 
    { name: 'Navy', bnName: 'নেভি ব্লু', hex: '#0038A8' },
    { name: 'Light Grey', bnName: 'হালকা ধূসর', hex: '#D3D3D3' }
  ];

  const getBase64 = async (previewUrl: string): Promise<string> => {
    const res = await fetch(previewUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerateClick = async () => {
    if (!photo || isGenerating) return;
    if ('vibrate' in navigator) navigator.vibrate(50);
    setIsGenerating(true);
    setStatusMessage('AI স্টুডিও প্রসেসিং (2x2)...');
    setError(null);
    
    try {
      const b64 = await getBase64(photo.previewUrl);
      const finalAttire = selectedAttire === PhotoAttire.CUSTOM ? customAttireText : selectedAttire;
      const result = await generatePassportPhoto(b64, finalAttire, { name: bgColor.name, hex: customHex });
      setResultImage(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleCategoryChange = (cat: 'MEN' | 'WOMEN' | 'CUSTOM') => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    setGenderCategory(cat);
    const defaultOption = ATTIRE_CATEGORIES[cat][0].id as PhotoAttire;
    setSelectedAttire(defaultOption);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `studio-2x2-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-10">
      <div className="bg-indigo-500/5 p-6 rounded-[3rem] border border-indigo-500/10 shadow-inner">
          <ImageUploader 
              label="Passport Photo Source"
              subLabel={
                <div className="text-center">
                  <p className="text-[12px] text-slate-200 font-bold mb-1">আপনার একটি পোর্ট্রেট ছবি দিন</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Upload your portrait for 2x2</p>
                </div>
              }
              previewUrl={photo?.previewUrl || null}
              onImageSelect={(file) => setPhoto({ file, previewUrl: URL.createObjectURL(file) })}
              isProcessing={isGenerating}
          />
      </div>

      <div className="space-y-6 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center justify-between px-2">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">পেশাদার পোশাক (Attire)</p>
          </div>
          
          <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/5">
              {(['MEN', 'WOMEN', 'CUSTOM'] as const).map(cat => (
                  <button 
                      key={cat}
                      disabled={isGenerating}
                      onClick={() => handleCategoryChange(cat)}
                      className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${genderCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'} disabled:opacity-50`}
                  >
                      {cat === 'MEN' ? 'Men' : cat === 'WOMEN' ? 'Women' : 'Custom'}
                  </button>
              ))}
          </div>

          <div className="relative group">
              <select 
                  value={selectedAttire}
                  disabled={isGenerating}
                  onChange={(e) => {
                    setSelectedAttire(e.target.value as PhotoAttire);
                    if ('vibrate' in navigator) navigator.vibrate(5);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-5 text-[12px] font-bold text-slate-200 outline-none focus:border-indigo-500 appearance-none cursor-pointer transition-colors disabled:opacity-50"
              >
                  {ATTIRE_CATEGORIES[genderCategory].map(opt => (
                      <option key={opt.id} value={opt.id} className="bg-[#0e1217]">
                        {opt.bnLabel} ({opt.label})
                      </option>
                  ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                  <i className="fas fa-chevron-down"></i>
              </div>
          </div>

          {(selectedAttire === PhotoAttire.CUSTOM) && (
              <textarea 
                  value={customAttireText}
                  disabled={isGenerating}
                  onChange={(e) => setCustomAttireText(e.target.value)}
                  placeholder="এখানে আপনার পছন্দের পোশাকের নাম বা বর্ণনা লিখুন..."
                  className="w-full h-24 bg-black/60 border border-white/5 rounded-2xl p-4 text-[11px] font-bold text-slate-300 outline-none focus:border-indigo-500 animate-in fade-in slide-in-from-top-2 disabled:opacity-50"
              />
          )}
      </div>

      <div className="space-y-4 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-2">ব্যাকগ্রাউন্ড কালার (Background)</p>
        
        <div className="grid grid-cols-2 gap-4 px-2">
          {backgroundOptions.map(c => (
            <button 
              key={c.name} 
              disabled={isGenerating}
              onClick={() => { 
                setBgColor(c); 
                setCustomHex(c.hex);
                if ('vibrate' in navigator) navigator.vibrate(5);
              }} 
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 relative ${customHex === c.hex ? 'border-indigo-500 bg-indigo-500/5 shadow-xl ring-4 ring-indigo-500/10' : 'border-white/5 bg-black/20'} disabled:opacity-30`} 
            >
              <div 
                className="w-full h-12 rounded-xl border border-white/10 flex items-center justify-center shadow-inner" 
                style={{ backgroundColor: c.hex }}
              >
                {customHex === c.hex && <i className={`fas fa-check text-xs ${c.name === 'White' || c.name === 'Sky Blue' ? 'text-indigo-900' : 'text-white'}`}></i>}
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-white uppercase tracking-tighter">{c.bnName}</p>
                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{c.name}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 px-2 flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
          <input 
              type="color" 
              value={customHex} 
              disabled={isGenerating}
              onChange={(e) => setCustomHex(e.target.value)}
              className="w-12 h-12 rounded-xl overflow-hidden border-none bg-transparent cursor-pointer disabled:opacity-50"
          />
          <div className="flex-1">
              <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Custom Selection (পছন্দমতো রঙ)</p>
              <input 
                  type="text" 
                  value={customHex}
                  disabled={isGenerating}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-black text-indigo-300 outline-none w-full uppercase disabled:opacity-50"
              />
          </div>
        </div>
      </div>

      <button 
        disabled={isGenerating || !photo} 
        onClick={handleGenerateClick} 
        className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-indigo-600/40 active:scale-[0.97] transition-all disabled:opacity-50 btn-active overflow-hidden relative"
      >
        {isGenerating && <div className="absolute inset-0 bg-indigo-500/50 animate-pulse"></div>}
        <span className="relative z-10">
          {isGenerating ? (
            <span className="flex items-center justify-center gap-3">
              <i className="fas fa-circle-notch animate-spin"></i>
              জেনারেটিং...
            </span>
          ) : 'জেনারেট ২x২ পাসপোর্ট ফটো'}
        </span>
      </button>

      {/* Interactive Result Viewer */}
      {resultImage && (
        <ResultViewer 
          imageUrl={resultImage} 
          isPassport={true}
          title="2x2 Official Output"
          onClose={() => setResultImage(null)}
          onDownload={handleDownload}
        />
      )}

      {error && (
        <div className="fixed bottom-10 left-6 right-6 z-[3000] bg-rose-500 text-white p-6 rounded-[2.5rem] animate-in shake duration-500 shadow-2xl">
          <p className="text-[11px] font-black uppercase text-center">{error}</p>
          <button onClick={() => setError(null)} className="absolute top-2 right-4 text-white/50 text-xl font-bold">×</button>
        </div>
      )}
    </div>
  );
};

export default PassportView;
