import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Box,
  Layers,
  Sun,
  Sparkles,
  Palette
} from 'lucide-react';
import { TextCanvasObject, TextStyle } from '../../types/canvas';
import { VIETNAMESE_FONTS } from '../../utils/presets';

interface TypographyControlsProps {
  selectedObject: TextCanvasObject;
  onUpdateStyle: (style: Partial<TextStyle>) => void;
  onUpdateText: (text: string) => void;
}

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  selectedObject,
  onUpdateStyle,
  onUpdateText
}) => {
  const text = selectedObject.text || '';
  const style = selectedObject.style || ({} as TextStyle);

  const gradient = style.gradient || {
    enabled: false,
    startColor: '#FFE600',
    endColor: '#FF3B30',
    direction: 'diagonal' as const
  };

  const stroke = style.stroke || {
    enabled: false,
    color: '#000000',
    width: 6,
    doubleStroke: {
      enabled: false,
      color: '#FFFFFF',
      width: 4
    }
  };

  const effect3D = style.effect3D || {
    enabled: false,
    depth: 8,
    color: '#000000',
    angle: 45
  };

  const pillBackground = style.pillBackground || {
    enabled: false,
    color: '#FFE500',
    paddingX: 20,
    paddingY: 10,
    borderRadius: 12,
    opacity: 1
  };

  const shadow = style.shadow || {
    enabled: false,
    color: 'rgba(0,0,0,0.6)',
    blur: 15,
    offsetX: 4,
    offsetY: 6,
    glow: false
  };

  return (
    <div className="space-y-5 text-xs text-neutral-300">
      {/* 1. Text Input Area */}
      <div>
        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
          Nội Dung Văn Bản
        </label>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => onUpdateText(e.target.value)}
          placeholder="Nhập nội dung tiêu đề..."
          className="w-full bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-xl p-2.5 text-sm text-white placeholder-neutral-500 resize-none outline-none"
        />
      </div>

      {/* 2. Font Family & Size */}
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
            Phông Chữ Tiếng Việt
          </label>
          <select
            value={style.fontFamily || 'Montserrat'}
            onChange={(e) => onUpdateStyle({ fontFamily: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
          >
            {VIETNAMESE_FONTS.map((font) => (
              <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size & Alignment Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <span className="text-[10px] text-neutral-500 block mb-1">Cỡ chữ: {style.fontSize || 48}px</span>
            <input
              type="range"
              min="16"
              max="200"
              value={style.fontSize || 48}
              onChange={(e) => onUpdateStyle({ fontSize: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => onUpdateStyle({ align: 'left' })}
              className={`p-1.5 rounded ${style.align === 'left' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateStyle({ align: 'center' })}
              className={`p-1.5 rounded ${style.align === 'center' || !style.align ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateStyle({ align: 'right' })}
              className={`p-1.5 rounded ${style.align === 'right' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text Style: Bold, Italic, Uppercase */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateStyle({ fontWeight: style.fontWeight === '900' || style.fontWeight === 900 ? '400' : '900' })}
            className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 font-bold ${
              style.fontWeight === '900' || style.fontWeight === 900
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
            <span>Đậm</span>
          </button>
          <button
            onClick={() => onUpdateStyle({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}
            className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 ${
              style.fontStyle === 'italic'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
            <span>Nghiêng</span>
          </button>
          <button
            onClick={() => onUpdateStyle({ textTransform: style.textTransform === 'uppercase' ? 'none' : 'uppercase' })}
            className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 font-bold ${
              style.textTransform === 'uppercase'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>IN HOA</span>
          </button>
        </div>
      </div>

      {/* 3. Text Fill Color & Gradient */}
      <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            Màu Chữ & Gradient
          </span>
          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-md border border-neutral-800">
            <button
              onClick={() => onUpdateStyle({ gradient: { ...gradient, enabled: false } })}
              className={`px-2 py-0.5 text-[10px] rounded font-medium ${!gradient.enabled ? 'bg-indigo-600 text-white' : 'text-neutral-400'}`}
            >
              Đơn sắc
            </button>
            <button
              onClick={() =>
                onUpdateStyle({
                  gradient: {
                    enabled: true,
                    startColor: gradient.startColor || '#FFE600',
                    endColor: gradient.endColor || '#FF3B30',
                    direction: 'diagonal'
                  }
                })
              }
              className={`px-2 py-0.5 text-[10px] rounded font-medium ${gradient.enabled ? 'bg-indigo-600 text-white' : 'text-neutral-400'}`}
            >
              Gradient
            </button>
          </div>
        </div>

        {!gradient.enabled ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.fillColor || '#FFFFFF'}
              onChange={(e) => onUpdateStyle({ fillColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={style.fillColor || '#FFFFFF'}
              onChange={(e) => onUpdateStyle({ fillColor: e.target.value })}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white uppercase font-mono"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={gradient.startColor || '#FFE600'}
                onChange={(e) =>
                  onUpdateStyle({
                    gradient: { ...gradient, startColor: e.target.value }
                  })
                }
                className="w-7 h-7 rounded cursor-pointer"
              />
              <span className="text-[10px] text-neutral-400">Màu 1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={gradient.endColor || '#FF3B30'}
                onChange={(e) =>
                  onUpdateStyle({
                    gradient: { ...gradient, endColor: e.target.value }
                  })
                }
                className="w-7 h-7 rounded cursor-pointer"
              />
              <span className="text-[10px] text-neutral-400">Màu 2</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Viền Chữ & Double Stroke (MrBeast Viền Dày) */}
      <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            Viền Chữ (Stroke)
          </span>
          <input
            type="checkbox"
            checked={stroke.enabled}
            onChange={(e) =>
              onUpdateStyle({
                stroke: { ...stroke, enabled: e.target.checked }
              })
            }
            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
          />
        </div>

        {stroke.enabled && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={stroke.color || '#000000'}
                onChange={(e) =>
                  onUpdateStyle({
                    stroke: { ...stroke, color: e.target.value }
                  })
                }
                className="w-7 h-7 rounded cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Độ dày viền</span>
                  <span>{stroke.width || 6}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={stroke.width || 6}
                  onChange={(e) =>
                    onUpdateStyle({
                      stroke: { ...stroke, width: Number(e.target.value) }
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Double Stroke / Viền Kép */}
            <div className="pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-neutral-400">Viền kép ngoài (Double Stroke)</span>
                <input
                  type="checkbox"
                  checked={stroke.doubleStroke?.enabled ?? false}
                  onChange={(e) =>
                    onUpdateStyle({
                      stroke: {
                        ...stroke,
                        doubleStroke: {
                          enabled: e.target.checked,
                          color: stroke.doubleStroke?.color || '#FFFFFF',
                          width: stroke.doubleStroke?.width || 4
                        }
                      }
                    })
                  }
                  className="w-3.5 h-3.5 accent-indigo-500 cursor-pointer"
                />
              </div>
              {stroke.doubleStroke?.enabled && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stroke.doubleStroke.color || '#FFFFFF'}
                    onChange={(e) =>
                      onUpdateStyle({
                        stroke: {
                          ...stroke,
                          doubleStroke: {
                            ...stroke.doubleStroke!,
                            color: e.target.value
                          }
                        }
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={stroke.doubleStroke.width || 4}
                    onChange={(e) =>
                      onUpdateStyle({
                        stroke: {
                          ...stroke,
                          doubleStroke: {
                            ...stroke.doubleStroke!,
                            width: Number(e.target.value)
                          }
                        }
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Hiệu ứng 3D Khối (3D Extrusion) */}
      <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-300 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-amber-400" />
            Hiệu Ứng 3D Khối
          </span>
          <input
            type="checkbox"
            checked={effect3D.enabled}
            onChange={(e) =>
              onUpdateStyle({
                effect3D: {
                  ...effect3D,
                  enabled: e.target.checked
                }
              })
            }
            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
          />
        </div>

        {effect3D.enabled && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={effect3D.color || '#000000'}
                onChange={(e) =>
                  onUpdateStyle({
                    effect3D: { ...effect3D, color: e.target.value }
                  })
                }
                className="w-7 h-7 rounded cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Độ sâu 3D</span>
                  <span>{effect3D.depth || 8}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={effect3D.depth || 8}
                  onChange={(e) =>
                    onUpdateStyle({
                      effect3D: { ...effect3D, depth: Number(e.target.value) }
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Tô Nền Từ Khóa (CapCut Auto-Pill Highlight Box) */}
      <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Khung Nền Chữ (CapCut Pill)
          </span>
          <input
            type="checkbox"
            checked={pillBackground.enabled}
            onChange={(e) =>
              onUpdateStyle({
                pillBackground: {
                  ...pillBackground,
                  enabled: e.target.checked
                }
              })
            }
            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
          />
        </div>

        {pillBackground.enabled && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={pillBackground.color || '#FFE500'}
                onChange={(e) =>
                  onUpdateStyle({
                    pillBackground: { ...pillBackground, color: e.target.value }
                  })
                }
                className="w-7 h-7 rounded cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Bo góc khung</span>
                  <span>{pillBackground.borderRadius || 12}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={pillBackground.borderRadius || 12}
                  onChange={(e) =>
                    onUpdateStyle({
                      pillBackground: { ...pillBackground, borderRadius: Number(e.target.value) }
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Đổ Bóng & Phát Sáng Neon (Shadow / Glow) */}
      <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-300 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-cyan-400" />
            Đổ Bóng & Phát Sáng Neon
          </span>
          <input
            type="checkbox"
            checked={shadow.enabled}
            onChange={(e) =>
              onUpdateStyle({
                shadow: {
                  ...shadow,
                  enabled: e.target.checked
                }
              })
            }
            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
          />
        </div>

        {shadow.enabled && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={shadow.color?.startsWith('#') ? shadow.color : '#00FFFF'}
                onChange={(e) =>
                  onUpdateStyle({
                    shadow: { ...shadow, color: e.target.value }
                  })
                }
                className="w-7 h-7 rounded cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Độ mờ phát sáng (Blur)</span>
                  <span>{shadow.blur || 15}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={shadow.blur || 15}
                  onChange={(e) =>
                    onUpdateStyle({
                      shadow: { ...shadow, blur: Number(e.target.value) }
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
