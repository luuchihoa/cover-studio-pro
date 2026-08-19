import React from 'react';
import {
  Sparkles,
  Download,
  Smartphone,
  ShieldCheck,
  Undo2,
  Redo2,
  FolderOpen,
  Save,
  Ratio,
  Maximize2,
  Trash2
} from 'lucide-react';
import { AspectRatioType, SafeZoneType } from '../../types/canvas';
import { ASPECT_RATIOS } from '../../utils/presets';

interface TopNavProps {
  currentRatio: AspectRatioType;
  onRatioChange: (ratio: AspectRatioType) => void;
  safeZone: SafeZoneType;
  onSafeZoneChange: (zone: SafeZoneType) => void;
  onOpenMockup: () => void;
  onOpenExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSaveProject: () => void;
  onLoadProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearCanvas: () => void;
  zoomLevel: number;
  onZoomFit: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRatio,
  onRatioChange,
  safeZone,
  onSafeZoneChange,
  onOpenMockup,
  onOpenExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSaveProject,
  onLoadProject,
  onClearCanvas,
  zoomLevel,
  onZoomFit
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="h-16 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between select-none z-30">
      {/* Left: Logo & Project Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              COVER STUDIO <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black tracking-widest uppercase">PRO</span>
            </h1>
            <p className="text-[11px] text-neutral-400">Design 16:9 • 9:16 Creator Studio</p>
          </div>
        </div>

        <div className="h-6 w-px bg-neutral-800 mx-2" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-lg border border-neutral-700/50">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl+Z)"
            className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Làm lại (Ctrl+Y)"
            className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Save / Load Project JSON */}
        <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-lg border border-neutral-700/50">
          <button
            onClick={onSaveProject}
            title="Lưu dự án (.cover JSON)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-700 rounded transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lưu file</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Mở file dự án"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-700 rounded transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Mở file</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".cover,.json"
            onChange={onLoadProject}
            className="hidden"
          />
        </div>
      </div>

      {/* Center: Aspect Ratio Switcher & Safe Zone */}
      <div className="flex items-center gap-2.5">
        {/* Ratio Selector */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 shadow-inner">
          <span className="text-[11px] font-semibold text-neutral-400 px-2 flex items-center gap-1">
            <Ratio className="w-3.5 h-3.5 text-indigo-400" />
            Tỷ lệ:
          </span>
          {(['16:9', '9:16', '1:1', '4:5'] as AspectRatioType[]).map((r) => {
            const isActive = currentRatio === r;
            return (
              <button
                key={r}
                onClick={() => onRatioChange(r)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* Safe Zone Toggle */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <span className="text-[11px] font-semibold text-neutral-400 px-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Vùng an toàn:
          </span>
          <button
            onClick={() => onSafeZoneChange(safeZone === 'none' ? (currentRatio === '9:16' ? 'tiktok' : 'youtube') : 'none')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              safeZone !== 'none'
                ? 'bg-rose-600/90 text-white shadow-md shadow-rose-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${safeZone !== 'none' ? 'bg-white animate-ping' : 'bg-neutral-500'}`} />
            {safeZone === 'none' ? 'Tắt' : safeZone === 'tiktok' ? 'TikTok Safe' : 'YouTube Safe'}
          </button>
        </div>
      </div>

      {/* Right: Mockup Preview & Export Action */}
      <div className="flex items-center gap-2.5">
        {/* Zoom Fit */}
        <button
          onClick={onZoomFit}
          title="Tự động thu phóng vừa màn hình"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 rounded-lg border border-neutral-700/50 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
          <span>{Math.round(zoomLevel * 100)}%</span>
        </button>

        {/* Clear */}
        <button
          onClick={onClearCanvas}
          title="Xóa trắng Canvas"
          className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Live Mockup Preview */}
        <button
          onClick={onOpenMockup}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md shadow-purple-600/25 transition-all transform active:scale-95"
        >
          <Smartphone className="w-4 h-4" />
          <span>Xem Thực Tế</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Ảnh 4K</span>
        </button>
      </div>
    </header>
  );
};
