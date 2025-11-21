import React, { useState } from 'react';
import { Scene, StoryConfig } from '../types';
import { RefreshCw, Video, Download, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { generateSceneImage, generateVeoVideo } from '../services/geminiService';

interface SceneCardProps {
  scene: Scene;
  config: StoryConfig;
  onUpdate: (id: number, updates: Partial<Scene>) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, config, onUpdate }) => {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleGenerateImage = async () => {
    onUpdate(scene.id, { imageState: 'generating' });
    try {
      const url = await generateSceneImage(scene.prompt, config);
      onUpdate(scene.id, { imageState: 'complete', imageUrl: url });
    } catch (e) {
      onUpdate(scene.id, { imageState: 'error' });
      alert('Failed to generate image. Please ensure you have selected a valid API Key.');
    }
  };

  const handleGenerateVideo = async () => {
    if (!scene.imageUrl) return;
    onUpdate(scene.id, { videoState: 'generating' });
    try {
      const url = await generateVeoVideo(scene.imageUrl, scene.prompt, config.aspectRatio);
      onUpdate(scene.id, { videoState: 'complete', videoUrl: url });
    } catch (e) {
      onUpdate(scene.id, { videoState: 'error' });
      console.error(e);
      alert('Failed to generate video. Check console for details.');
    }
  };

  const copyToClipboard = (text: string, type: 'script' | 'prompt') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
    } else {
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden flex flex-col shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-700 flex justify-between items-center bg-neutral-900">
        <h3 className="font-semibold text-neutral-200">Scene {scene.id}</h3>
        <div className="flex gap-2">
            {/* Image Generation Button */}
            <button 
                onClick={handleGenerateImage}
                disabled={scene.imageState === 'generating'}
                className="p-2 hover:bg-neutral-700 rounded-lg text-blue-400 transition disabled:opacity-50"
                title="Generate/Regenerate Image"
            >
                <RefreshCw size={18} className={scene.imageState === 'generating' ? 'animate-spin' : ''} />
            </button>
            
            {/* Video Generation Button - Only active if image exists */}
            <button 
                onClick={handleGenerateVideo}
                disabled={scene.videoState === 'generating' || !scene.imageUrl}
                className={`p-2 rounded-lg transition disabled:opacity-50 ${scene.videoUrl ? 'text-green-400 hover:bg-green-900/30' : 'text-purple-400 hover:bg-purple-900/30'}`}
                title="Animate with Veo"
            >
                <Video size={18} className={scene.videoState === 'generating' ? 'animate-pulse' : ''} />
            </button>
        </div>
      </div>

      {/* Visual Area */}
      <div className="relative w-full aspect-video bg-neutral-950 flex items-center justify-center group">
        {scene.videoUrl ? (
            <video 
                src={scene.videoUrl} 
                controls 
                className="w-full h-full object-contain"
            />
        ) : scene.imageUrl ? (
            <div className="relative w-full h-full">
                <img 
                    src={scene.imageUrl} 
                    alt={`Scene ${scene.id}`} 
                    className="w-full h-full object-contain"
                />
                {/* Overlay to show prompt or download */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <a href={scene.imageUrl} download={`scene-${scene.id}.png`} className="bg-black/50 p-2 rounded-full text-white hover:bg-black/80 block">
                        <Download size={16} />
                    </a>
                </div>
            </div>
        ) : (
            <div className="text-neutral-600 flex flex-col items-center">
                {scene.imageState === 'generating' ? (
                    <div className="animate-pulse text-blue-500">Generating Image...</div>
                ) : (
                    <>
                    <ImageIcon size={48} className="mb-2 opacity-50" />
                    <p className="text-sm">No image generated</p>
                    </>
                )}
            </div>
        )}

        {/* Video Loading Overlay */}
        {scene.videoState === 'generating' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-purple-300 font-medium animate-pulse">Generating Veo Video...</p>
                <p className="text-neutral-400 text-xs mt-2">This may take a minute</p>
            </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Prompt Editor */}
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Visual Prompt</label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => copyToClipboard(scene.prompt, 'prompt')}
                        className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                        title="Copy Prompt"
                    >
                        {copiedPrompt ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                    <button 
                        onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                    >
                        {isEditingPrompt ? 'Done' : 'Edit'}
                    </button>
                </div>
            </div>
            {isEditingPrompt ? (
                <textarea 
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-neutral-300 focus:border-blue-500 outline-none h-24 resize-none"
                    value={scene.prompt}
                    onChange={(e) => onUpdate(scene.id, { prompt: e.target.value })}
                />
            ) : (
                <p className="text-sm text-neutral-400 line-clamp-3 italic bg-neutral-900/50 p-2 rounded border border-transparent">
                    "{scene.prompt}"
                </p>
            )}
        </div>

        {/* Script */}
        <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800 relative group">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Script</label>
                <button 
                    onClick={() => copyToClipboard(scene.script.map(s => `${s.character}: ${s.text}`).join('\n'), 'script')}
                    className="text-neutral-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                    title="Copy Script"
                >
                    {copiedScript ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
            </div>
            {scene.script.map((line, idx) => (
                <p key={idx} className="text-sm mb-1">
                    <span className="font-bold text-orange-400">{line.character}:</span> <span className="text-neutral-300">{line.text}</span>
                </p>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
