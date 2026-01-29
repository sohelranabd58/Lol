
import React, { useState } from 'react';
import ImageUploader from '../ImageUploader.tsx';
import ResultViewer from '../ResultViewer.tsx';
import { UserPhoto } from '../../types.ts';
import { generateFaceSwap } from '../../services/geminiService.ts';

const FaceSwapView: React.FC = () => {
  const [sourceFace, setSourceFace] = useState<UserPhoto | null>(null);
  const [targetPhoto, setTargetPhoto] = useState<UserPhoto | null>(null);
  
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
    if (!sourceFace || !targetPhoto || isGenerating) return;
    if ('vibrate' in navigator) navigator.vibrate(50);
    setIsGenerating(true);
    setStatusMessage('ফেস সোয়াপ হচ্ছে...');
    setError(null);

    try {
      const sourceB64 = await getBase64(sourceFace.previewUrl);
      const targetB64 = await getBase64(targetPhoto.previewUrl);
      const result = await generateFaceSwap(sourceB64, targetB64);
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
    link.download = `studio-faceswap-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-10">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-rose-500/5 p-6 rounded-[3rem] border border-rose-500/10">
            <ImageUploader 
                label="Step 1: Your Face"
                subLabel={
                  <div className="text-center">
                    <p className="text-[12px] text-slate-200 font-bold mb-1">আপনার নিজের স্পষ্ট ফেস ফটো দিন</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Source Face Photo</p>
                  </div>
                }
                previewUrl={sourceFace?.previewUrl || null}
                onImageSelect={(file) => setSourceFace({ file, previewUrl: URL.createObjectURL(file) })}
                isProcessing={isGenerating}
            />
        </div>

        <div className="bg-indigo-500/5 p-6 rounded-[3rem] border border-indigo-500/10">
            <ImageUploader 
                label="Step 2: Target Photo"
                subLabel={
                  <div className="text-center">
                    <p className="text-[12px] text-slate-200 font-bold mb-1">যার ওপর মুখ বসাতে চান সেই ছবিটি দিন</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Target Image to Swap</p>
                  </div>
                }
                previewUrl={targetPhoto?.previewUrl || null}
                onImageSelect={(file) => setTargetPhoto({ file, previewUrl: URL.createObjectURL(file) })}
                isProcessing={isGenerating}
            />
        </div>
      </div>

      <button 
        disabled={isGenerating || !sourceFace || !targetPhoto} 
        onClick={handleGenerateClick} 
        className="w-full py-8 bg-rose-600 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-rose-600/30 active:scale-95 transition-all disabled:opacity-50"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-3">
            <i className="fas fa-circle-notch animate-spin"></i>
            সোয়াপ হচ্ছে...
          </span>
        ) : 'Swap Face Now'}
      </button>

      {/* Interactive Result Viewer */}
      {resultImage && (
        <ResultViewer 
          imageUrl={resultImage} 
          title="Face Swap Result"
          onClose={() => setResultImage(null)}
          onDownload={handleDownload}
        />
      )}

      {error && (
        <div className="fixed bottom-10 left-6 right-6 z-[3000] bg-rose-500 text-white p-6 rounded-[2.5rem] animate-in shake duration-500">
          <p className="text-[11px] font-black uppercase text-center">{error}</p>
          <button onClick={() => setError(null)} className="absolute top-2 right-4 text-white/50 text-xl font-bold">×</button>
        </div>
      )}
    </div>
  );
};

export default FaceSwapView;
