import React, { useState } from 'react';
import {
  X,
  Download,
  Check,
  Sparkles,
  Layers,
  FileImage,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CanvasObject, BackgroundSettings, AspectRatioType } from '../../types/canvas';
import { exportCanvasImage, ExportOptions } from '../../utils/exportCanvas';
import { ASPECT_RATIOS } from '../../utils/presets';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  width: number;
  height: number;
  ratio: AspectRatioType;
  bgSettings: BackgroundSettings;
  objects: CanvasObject[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  width,
  height,
  ratio,
  bgSettings,
  objects
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [resolution, setResolution] = useState<number>(1); // 1x, 2x, 4x
  const [quality, setQuality] = useState<number>(0.95);
  const [filename, setFilename] = useState<string>(`cover-${ratio.replace(':', 'x')}`);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const exportW = Math.round(width * resolution);
  const exportH = Math.round(height * resolution);

  const handleExportSingle = async () => {
    setIsExporting(true);
    try {
      await exportCanvasImage(width, height, bgSettings, objects, {
        format,
        quality,
        resolutionMultiplier: resolution,
        filename
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Xuất Ảnh Bìa Chất Lượng Cao</h2>
              <p className="text-xs text-neutral-400">Chọn định dạng và độ phân giải mong muốn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* File Name */}
          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1.5">Tên Tệp</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="cover-thumbnail"
              className="w-full bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white outline-none"
            />
          </div>

          {/* Format */}
          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-2">Định Dạng Ảnh</label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2.5 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    format === fmt
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="uppercase text-xs font-black">{fmt}</span>
                  <span className="text-[10px] text-neutral-500">
                    {fmt === 'png' ? 'Sắc nét nhất' : fmt === 'jpeg' ? 'Nhẹ dung lượng' : 'Chuẩn mới'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Multiplier */}
          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-2">Độ Phân Giải Xuất</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { multiplier: 1, label: '1x Tiêu Chuẩn', desc: `${width} × ${height}` },
                { multiplier: 1.5, label: '2K Sắc Nét', desc: `${Math.round(width * 1.5)} × ${Math.round(height * 1.5)}` },
                { multiplier: 2, label: '4K Siêu Nét', desc: `${width * 2} × ${height * 2}` }
              ].map((item) => (
                <button
                  key={item.multiplier}
                  onClick={() => setResolution(item.multiplier)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    resolution === item.multiplier
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 font-bold shadow'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] text-neutral-500">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Resolution info box */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Kích thước file xuất ra:</span>
            <span className="font-bold text-white font-mono">
              {exportW} × {exportH} px
            </span>
          </div>

          {/* Export Action Button */}
          <button
            onClick={handleExportSingle}
            disabled={isExporting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Đang Render & Tải Xuống...' : 'Tải Ảnh Bìa Về Máy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
