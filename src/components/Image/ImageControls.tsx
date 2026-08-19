import React from 'react';
import {
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  Sliders
} from 'lucide-react';
import { ImageCanvasObject, ImageFilters } from '../../types/canvas';

interface ImageControlsProps {
  selectedObject: ImageCanvasObject;
  onUpdateImage: (updates: Partial<ImageCanvasObject>) => void;
  onUpdateFilters: (filters: Partial<ImageFilters>) => void;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  selectedObject,
  onUpdateImage,
  onUpdateFilters
}) => {
  const stickerOutline = selectedObject.stickerOutline || {
    enabled: false,
    color: '#FFFFFF',
    width: 6,
    glow: true
  };

  const filters = selectedObject.filters || {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    grayscale: false,
    sepia: false,
    invert: false,
    vignette: 0
  };

  const borderRadius = selectedObject.borderRadius || 0;
  const flipX = selectedObject.flipX || false;
  const flipY = selectedObject.flipY || false;
  const maskShape = selectedObject.maskShape || 'none';

  return (
    <div className="space-y-5 text-xs text-neutral-300">
      {/* 1. Quick Transform & Masking */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
          Căn Chỉnh & Khung Hình
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdateImage({ flipX: !flipX })}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition-all ${
              flipX ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
            <span>Lật Ngang</span>
          </button>
          <button
            onClick={() => onUpdateImage({ flipY: !flipY })}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition-all ${
              flipY ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <FlipVertical className="w-4 h-4" />
            <span>Lật Dọc</span>
          </button>
        </div>

        {/* Mask shape */}
        <div>
          <span className="text-[10px] text-neutral-500 block mb-1">Khung ảnh (Masking)</span>
          <div className="grid grid-cols-3 gap-1.5">
            {(['none', 'circle', 'rounded'] as const).map((mask) => (
              <button
                key={mask}
                onClick={() => onUpdateImage({ maskShape: mask })}
                className={`py-1.5 text-xs rounded-lg capitalize ${
                  maskShape === mask
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {mask === 'none' ? 'Tự do' : mask === 'circle' ? 'Hình tròn' : 'Bo góc'}
              </button>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        {maskShape !== 'circle' && (
          <div>
            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
              <span>Bo góc ảnh</span>
              <span>{borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={borderRadius}
              onChange={(e) => onUpdateImage({ borderRadius: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>
        )}
      </div>

      {/* 2. Viền Sáng Chủ Thể (Sticker White Outline Glow) */}
      <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Viền Sáng Chủ Thể (Sticker Outline)
          </span>
          <input
            type="checkbox"
            checked={stickerOutline.enabled}
            onChange={(e) =>
              onUpdateImage({
                stickerOutline: { ...stickerOutline, enabled: e.target.checked }
              })
            }
            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
          />
        </div>

        {stickerOutline.enabled && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={stickerOutline.color || '#FFFFFF'}
                onChange={(e) =>
                  onUpdateImage({
                    stickerOutline: { ...stickerOutline, color: e.target.value }
                  })
                }
                className="w-7 h-7 rounded cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Độ dày viền</span>
                  <span>{stickerOutline.width || 6}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={stickerOutline.width || 6}
                  onChange={(e) =>
                    onUpdateImage({
                      stickerOutline: { ...stickerOutline, width: Number(e.target.value) }
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-neutral-400">Bật phát sáng (Outer Glow)</span>
              <input
                type="checkbox"
                checked={stickerOutline.glow || false}
                onChange={(e) =>
                  onUpdateImage({
                    stickerOutline: { ...stickerOutline, glow: e.target.checked }
                  })
                }
                className="w-3.5 h-3.5 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Bộ Lọc Hình Ảnh (Filters) */}
      <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-3">
        <span className="font-bold text-neutral-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          Bộ Lọc & Màu Sắc
        </span>

        {/* Brightness */}
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
            <span>Độ sáng (Brightness)</span>
            <span>{filters.brightness > 0 ? `+${filters.brightness}` : filters.brightness || 0}%</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filters.brightness || 0}
            onChange={(e) => onUpdateFilters({ brightness: Number(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
            <span>Tương phản (Contrast)</span>
            <span>{filters.contrast > 0 ? `+${filters.contrast}` : filters.contrast || 0}%</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filters.contrast || 0}
            onChange={(e) => onUpdateFilters({ contrast: Number(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
            <span>Độ rực màu (Saturation)</span>
            <span>{filters.saturation > 0 ? `+${filters.saturation}` : filters.saturation || 0}%</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filters.saturation || 0}
            onChange={(e) => onUpdateFilters({ saturation: Number(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Quick Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onUpdateFilters({ grayscale: !filters.grayscale })}
            className={`py-1.5 text-xs rounded-lg border ${
              filters.grayscale ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            Đen Trắng
          </button>
          <button
            onClick={() => onUpdateFilters({ sepia: !filters.sepia })}
            className={`py-1.5 text-xs rounded-lg border ${
              filters.sepia ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            Vintage Sepia
          </button>
        </div>
      </div>
    </div>
  );
};
