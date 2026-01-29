
import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import HomeView from './components/views/HomeView.tsx';
import PassportView from './components/views/PassportView.tsx';
import FaceSwapView from './components/views/FaceSwapView.tsx';
import PromptToImageView from './components/views/PromptToImageView.tsx';
import ImageToImageView from './components/views/ImageToImageView.tsx';
import SettingsView from './components/views/SettingsView.tsx';
import { 
  fetchAvailableModels,
  getSelectedModel
} from './services/geminiService.ts';
import { AppView } from './types.ts';

const MODEL_STORAGE_KEY = 'AMR_STUDIO_SELECTED_MODEL';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [pendingModel, setPendingModel] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const currentModel = getSelectedModel();
    setSelectedModelId(currentModel);
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    setIsModelsLoading(true);
    try {
      const models = await fetchAvailableModels(true);
      setAvailableModels(models);
      
      // Auto-select recommended model if none is active or current is invalid
      const current = localStorage.getItem(MODEL_STORAGE_KEY);
      if (!current || !models.find(m => m.name === current)) {
        const recommended = models.find(m => m.isRecommended) || models[0];
        if (recommended) {
          setSelectedModelId(recommended.name);
          localStorage.setItem(MODEL_STORAGE_KEY, recommended.name);
        }
      }
    } catch (e: any) {
      console.error("Model load error");
    } finally {
      setIsModelsLoading(false);
    }
  };

  const handleBack = () => {
    setView('home');
  };

  const confirmModelChange = async () => {
    if (!pendingModel) return;
    if ('vibrate' in navigator) navigator.vibrate(50);
    setSelectedModelId(pendingModel.name);
    localStorage.setItem(MODEL_STORAGE_KEY, pendingModel.name);
    setPendingModel(null);
    setSuccessMsg(`Active Engine: ${pendingModel.displayName}`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans pb-20 overflow-x-hidden">
      <Header view={view} onBack={handleBack} onSettings={() => setView('settings')} />
      
      <main className="max-w-lg mx-auto px-6 py-6">
        {view === 'home' && (
          <HomeView onSetView={setView} selectedModelId={selectedModelId} />
        )}

        {view === 'passport' && <PassportView />}

        {view === 'face-swap' && <FaceSwapView />}

        {view === 'prompt-to-image' && <PromptToImageView />}

        {view === 'image-to-image' && <ImageToImageView />}

        {view === 'settings' && (
          <SettingsView 
            availableModels={availableModels}
            selectedModelId={selectedModelId}
            isModelsLoading={isModelsLoading}
            onSelectModel={setPendingModel}
          />
        )}
      </main>

      {/* Global Confirmation Modal */}
      {pendingModel && (
        <div className="fixed inset-0 z-[4000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="max-w-xs w-full bg-[#0e1217] border border-white/10 p-8 rounded-[3.5rem] space-y-6 text-center shadow-[0_0_100px_rgba(79,70,229,0.1)]">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto text-indigo-500 border border-indigo-500/20 mb-2">
                <i className="fas fa-microchip text-2xl"></i>
            </div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest">Confirm Engine Change</h4>
            <p className="text-[10px] text-slate-500 uppercase font-bold leading-relaxed">
                আপনি কি নিশ্চিত যে আপনি <span className="text-indigo-400">{pendingModel.displayName}</span> মডেলটি ব্যবহার করতে চান?
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button onClick={confirmModelChange} className="py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] active:scale-95 transition-all shadow-xl shadow-indigo-600/30">হ্যাঁ, কনফার্ম করুন</button>
              <button onClick={() => setPendingModel(null)} className="py-5 bg-transparent border border-white/5 text-slate-500 rounded-[1.5rem] font-black uppercase text-[10px] active:scale-95 transition-all">পরে করব</button>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="fixed bottom-10 left-6 right-6 z-[3000] bg-indigo-600 text-white p-6 rounded-[2.5rem] animate-in slide-in-from-bottom-8 duration-500 shadow-2xl shadow-indigo-600/40 border border-white/10">
            <div className="flex items-center justify-center gap-3">
               <i className="fas fa-check-circle"></i>
               <p className="text-[10px] font-black uppercase tracking-widest">{successMsg}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
