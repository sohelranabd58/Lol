
import React, { useState } from 'react';
import ImageUploader from '../ImageUploader.tsx';
import ResultViewer from '../ResultViewer.tsx';
import { UserPhoto } from '../../types.ts';
import { generatePromptToImage } from '../../services/geminiService.ts';

const PromptToImageView: React.FC = () => {
  const [photo, setPhoto] = useState<UserPhoto | null>(null);
  const [prompt, setPrompt] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (!photo || !prompt || isGenerating) return;
    setIsGenerating(true);
    setStatusMessage('নতুন ইমেজ জেনারেট হচ্ছে...');
    setError(null);

    try {
      const b64 = await getBase64(photo.previewUrl);
      const result = await generatePromptToImage(b64, prompt);
      setResultImage(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `studio-prompt-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-10">
      <div className="bg-emerald-500/5 p-6 rounded-[3rem] border border-emerald-500/10">
          <ImageUploader 
              label="Face Reference Photo"
              subLabel={
                <div className="text-center">
                  <p className="text-[12px] text-slate-200 font-bold mb-1">আপনার ফেস পোর্ট্রেট আপলোড করুন</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Upload face for reference</p>
                </div>
              }
              previewUrl={photo?.previewUrl || null}
              onImageSelect={(file) => setPhoto({ file, previewUrl: URL.createObjectURL(file) })}
              isProcessing={isGenerating}
          />
      </div>

      <div className="space-y-4 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Prompt (Describe the scene)</p>
          </div>
          <textarea 
              value={prompt}
              disabled={isGenerating}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="উদাহরণ: মহাকাশচারী হিসেবে চাঁদে হাঁটছি, অত্যন্ত বাস্তবসম্মত ছবি..."
              className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-5 text-[12px] font-bold text-slate-200 outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed disabled:opacity-50"
          />
      </div>

      <button 
        disabled={isGenerating || !photo || !prompt} 
        onClick={handleGenerateClick} 
        className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
      >
        {isGenerating ? <span><i className="fas fa-circle-notch animate-spin mr-3"></i>জেনারেটিং...</span> : 'Generate AI Image'}
      </button>

      {/* Interactive Result Viewer */}
      {resultImage && (
        <ResultViewer 
          imageUrl={resultImage} 
          title="AI Prompt Generation"
          onClose={() => setResultImage(null)}
          onDownload={handleDownload}
        />
      )}

      {error && (
        <div className="fixed bottom-10 left-6 right-6 z-[3000] bg-rose-500 text-white p-6 rounded-[2.5rem] animate-in shake duration-500">
          <p className="text-[11px] font-black uppercase text-center">{error}</p>
          <button onClick={() => setError(null)} className="absolute top-2 right-4 text-white/50">×</button>
        </div>
      )}
    </div>
  );
};

export default PromptToImageView;
