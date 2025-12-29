
import React, { useState } from 'react';
import { ProjectState } from '../types';

interface ExportModalProps {
  project: ProjectState;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const startExport = () => {
    setIsExporting(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          alert("Project successfully exported to Downloads folder!");
          onClose();
        }, 500);
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">Export Project</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!isExporting ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Resolution</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm">
                    <option>1080p (FHD)</option>
                    <option>720p (HD)</option>
                    <option>4K (UHD)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Format</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm">
                    <option>MP4 (H.264)</option>
                    <option>MOV</option>
                    <option>WEBM</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Total Clips:</span>
                  <span className="font-bold">{project.clips.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Est. File Size:</span>
                  <span className="font-bold">{(project.clips.length * 4.2).toFixed(1)} MB</span>
                </div>
              </div>

              <button 
                onClick={startExport}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg"
              >
                Start Export
              </button>
            </>
          ) : (
            <div className="space-y-6 py-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-1">Exporting your masterpiece...</h3>
                <p className="text-xs text-slate-500">Stitching clips and applying AI transformations</p>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-indigo-400">{progress}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
