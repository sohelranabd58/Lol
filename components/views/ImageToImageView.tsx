
import React, { useState } from 'react';
import ImageUploader from '../ImageUploader.tsx';
import ResultViewer from '../ResultViewer.tsx';
import { UserPhoto } from '../../types.ts';
import { generateImageToImage } from '../../services/geminiService.ts';

const ImageToImageView: React.FC = () => {
  const [facePhoto, setFacePhoto] = useState<UserPhoto | null>(null);
  const [stylePhoto, setStylePhoto] = useState<UserPhoto | null>(null);
  
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
    if (!facePhoto || !stylePhoto || isGenerating) return;
    setIsGenerating(true);
    setStatusMessage('স্টাইল ফিউশন প্রসেসিং...');
    setError(null);

    try {
      const faceB64 = await getBase64(facePhoto.previewUrl);
      const styleB64 = await getBase64(stylePhoto.previewUrl);
      const result = await generateImageToImage(faceB64, styleB64);
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
    link.download = `studio-fusion-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-10">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-amber-500/5 p-6 rounded-[3rem] border border-amber-500/10">
            <ImageUploader 
                label="Step 1: Your Face"
                subLabel={
                  <div className="text-center">
                    <p className="text-[12px] text-slate-200 font-bold mb-1">আপনার নিজের ছবি আপলোড করুন</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Upload your face source</p>
                  </div>
                }
                previewUrl={facePhoto?.previewUrl || null}
                onImageSelect={(file) => setFacePhoto({ file, previewUrl: URL.createObjectURL(file) })}
                isProcessing={isGenerating}
            />
        </div>

        <div className="bg-amber-500/5 p-6 rounded-[3rem] border border-amber-500/10">
            <ImageUploader 
                label="Step 2: Target Style/Pose"
                subLabel={
                  <div className="text-center">
                    <p className="text-[12px] text-slate-200 font-bold mb-1">যে স্টাইলটি দিতে চান সেই ছবিটি দিন</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Upload target style photo</p>
                  </div>
                }
                previewUrl={stylePhoto?.previewUrl || null}
                onImageSelect={(file) => setStylePhoto({ file, previewUrl: URL.createObjectURL(file) })}
                isProcessing={isGenerating}
            />
        </div>
      </div>

      <button 
        disabled={isGenerating || !facePhoto || !stylePhoto} 
        onClick={handleGenerateClick} 
        className="w-full py-8 bg-amber-600 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-amber-600/30 active:scale-95 transition-all disabled:opacity-50"
      >
        {isGenerating ? <span><i className="fas fa-circle-notch animate-spin mr-3"></i>ফিউশন হচ্ছে...</span> : 'Generate Fusion Image'}
      </button>

      {/* Interactive Result Viewer */}
      {resultImage && (
        <ResultViewer 
          imageUrl={resultImage} 
          title="Image Fusion Result"
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

export default ImageToImageView;
