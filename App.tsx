import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatAssistant from './components/ChatAssistant';
import SceneCard from './components/SceneCard';
import { StoryConfig, AspectRatio, ArtStyle, Scene, ImageResolution } from './types';
import { generateStoryScenes } from './services/geminiService';
import { Sparkles, Film, AlertCircle, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('studio');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  
  // Default Configuration
  const [config, setConfig] = useState<StoryConfig>({
    prompt: "",
    language: "English",
    country: "USA",
    aspectRatio: AspectRatio.Landscape,
    resolution: ImageResolution.OneK,
    artStyle: ArtStyle.Cinematic,
    sceneCount: 5,
    influencerDescription: ""
  });

  const [scenes, setScenes] = useState<Scene[]>([]);

  const handleStoryGeneration = async () => {
    if (!config.prompt) return;
    setIsGeneratingStory(true);
    try {
      const generatedScenes = await generateStoryScenes(config);
      setScenes(generatedScenes);
    } catch (error) {
      alert("Failed to generate story. Please check your API key or try a simpler prompt.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const updateScene = (id: number, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const renderContent = () => {
    if (activeTab === 'chat') {
      return (
        <div className="h-full p-6 max-w-4xl mx-auto">
          <ChatAssistant />
        </div>
      );
    }

    if (activeTab === 'library') {
        return (
            <div className="h-full flex items-center justify-center text-neutral-500 flex-col gap-4">
                <Film size={48} />
                <p>Your saved projects will appear here.</p>
            </div>
        )
    }

    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Story Configuration Panel */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create New Story</h2>
                <p className="text-neutral-400 text-sm">Configure your parameters and let Gemini weave the narrative.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Story Prompt</label>
                  <textarea 
                    value={config.prompt}
                    onChange={e => setConfig({...config, prompt: e.target.value})}
                    placeholder="A detective in 1940s New York uncovers a mystery involving a time-traveling cat..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-neutral-200 h-32 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Character/Influencer Description</label>
                  <input 
                    type="text"
                    value={config.influencerDescription}
                    onChange={e => setConfig({...config, influencerDescription: e.target.value})}
                    placeholder="e.g., Young woman with pink hair, futuristic glasses, wearing a silver jacket"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-neutral-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="grid grid-cols-2 gap-4 content-start">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Art Style</label>
                  <select 
                    value={config.artStyle}
                    onChange={e => setConfig({...config, artStyle: e.target.value as ArtStyle})}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-200 outline-none focus:border-blue-500"
                  >
                    {Object.values(ArtStyle).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Aspect Ratio</label>
                  <select 
                    value={config.aspectRatio}
                    onChange={e => setConfig({...config, aspectRatio: e.target.value as AspectRatio})}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-200 outline-none focus:border-blue-500"
                  >
                     {Object.values(AspectRatio).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Resolution (Nano Banana Pro)</label>
                    <select 
                        value={config.resolution}
                        onChange={e => setConfig({...config, resolution: e.target.value as ImageResolution})}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-200 outline-none focus:border-blue-500"
                    >
                        {Object.values(ImageResolution).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Scene Count</label>
                  <input 
                    type="number"
                    min={3}
                    max={10}
                    value={config.sceneCount}
                    onChange={e => setConfig({...config, sceneCount: parseInt(e.target.value)})}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Language</label>
                  <select 
                    value={config.language}
                    onChange={e => setConfig({...config, language: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-200 outline-none focus:border-blue-500"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Japanese</option>
                    <option>German</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-neutral-800 pt-4">
                <button 
                    onClick={handleStoryGeneration}
                    disabled={isGeneratingStory || !config.prompt}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeneratingStory ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Generating Story Script...
                        </>
                    ) : (
                        <>
                            Generate Scenes <ChevronRight size={18} />
                        </>
                    )}
                </button>
            </div>
          </div>

          {/* Scenes Grid */}
          {scenes.length > 0 && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Generated Scenes</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                        <AlertCircle size={14} />
                        <span>Review prompts before generating images for best consistency.</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {scenes.map(scene => (
                        <SceneCard 
                            key={scene.id} 
                            scene={scene} 
                            config={config}
                            onUpdate={updateScene}
                        />
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-neutral-200 font-sans selection:bg-blue-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
