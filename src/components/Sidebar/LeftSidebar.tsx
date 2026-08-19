import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  LayoutTemplate,
  Shapes,
  Palette,
  Upload,
  Sparkles,
  Flame,
  Star,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { CanvasObject, BackgroundSettings, TextCanvasObject, ImageCanvasObject, ShapeCanvasObject, BadgeCanvasObject } from '../../types/canvas';
import { TYPOGRAPHY_PRESETS, TEMPLATE_PRESETS, TemplatePreset, TypographyPreset } from '../../utils/presets';

interface LeftSidebarProps {
  onAddObject: (obj: CanvasObject) => void;
  onApplyTemplate: (template: TemplatePreset) => void;
  bgSettings: BackgroundSettings;
  onUpdateBackground: (bg: Partial<BackgroundSettings>) => void;
  canvasWidth: number;
  canvasHeight: number;
}

type TabType = 'templates' | 'typography' | 'images' | 'shapes' | 'background';

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onAddObject,
  onApplyTemplate,
  bgSettings,
  onUpdateBackground,
  canvasWidth,
  canvasHeight
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('typography');
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const bgImageInputRef = React.useRef<HTMLInputElement>(null);

  // Helper to add custom text
  const handleAddCustomText = (type: 'heading' | 'subheading' | 'body') => {
    const isHeading = type === 'heading';
    const isSub = type === 'subheading';
    
    const newTextObj: TextCanvasObject = {
      id: `text_${Date.now()}`,
      type: 'text',
      name: isHeading ? 'Tiêu đề lớn' : isSub ? 'Phụ đề' : 'Nội dung',
      text: isHeading ? 'TIÊU ĐỀ NỔI BẬT' : isSub ? 'Phụ đề hấp dẫn cho người xem' : 'Nhập văn bản mô tả ngắn gọn...',
      x: canvasWidth * 0.1,
      y: canvasHeight * (isHeading ? 0.35 : isSub ? 0.5 : 0.6),
      width: canvasWidth * 0.8,
      height: isHeading ? 140 : 80,
      rotation: 0,
      opacity: 1,
      zIndex: Date.now(),
      isLocked: false,
      isVisible: true,
      style: {
        fontFamily: isHeading ? 'Anton' : 'Montserrat',
        fontSize: isHeading ? 80 : isSub ? 42 : 28,
        fontWeight: isHeading ? '900' : '700',
        fontStyle: 'normal',
        fillColor: '#FFFFFF',
        align: 'center',
        lineHeight: 1.2,
        letterSpacing: isHeading ? 2 : 1,
        textTransform: isHeading ? 'uppercase' : 'none',
        effect3D: {
          enabled: isHeading,
          depth: 8,
          color: '#000000',
          angle: 45
        },
        stroke: {
          enabled: true,
          color: '#000000',
          width: isHeading ? 10 : 4,
          doubleStroke: {
            enabled: false,
            color: '#FFFFFF',
            width: 4
          }
        },
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.6)',
          blur: 15,
          offsetX: 4,
          offsetY: 6,
          glow: false
        },
        pillBackground: {
          enabled: false,
          color: '#FFE500',
          paddingX: 20,
          paddingY: 10,
          borderRadius: 12,
          opacity: 1
        },
        curved: {
          enabled: false,
          radius: 0
        }
      }
    };
    onAddObject(newTextObj);
  };

  // Helper to add typography preset
  const handleAddTypographyPreset = (preset: TypographyPreset) => {
    const newTextObj: TextCanvasObject = {
      id: `text_${Date.now()}`,
      type: 'text',
      name: preset.name,
      text: preset.previewText,
      x: canvasWidth * 0.1,
      y: canvasHeight * 0.38,
      width: canvasWidth * 0.8,
      height: 160,
      rotation: 0,
      opacity: 1,
      zIndex: Date.now(),
      isLocked: false,
      isVisible: true,
      style: {
        fontFamily: preset.style.fontFamily || 'Anton',
        fontSize: preset.style.fontSize || 84,
        fontWeight: preset.style.fontWeight || '900',
        fontStyle: 'normal',
        fillColor: preset.style.fillColor || '#FFE600',
        align: 'center',
        lineHeight: 1.2,
        letterSpacing: 2,
        textTransform: preset.style.textTransform || 'uppercase',
        effect3D: preset.style.effect3D || { enabled: false, depth: 0, color: '#000', angle: 45 },
        stroke: preset.style.stroke || { enabled: true, color: '#000', width: 8 },
        shadow: preset.style.shadow || { enabled: true, color: 'rgba(0,0,0,0.7)', blur: 15, offsetX: 4, offsetY: 6, glow: false },
        pillBackground: preset.style.pillBackground || { enabled: false, color: '#000', paddingX: 16, paddingY: 8, borderRadius: 8, opacity: 1 },
        curved: { enabled: false, radius: 0 }
      }
    };
    onAddObject(newTextObj);
  };

  // Helper to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = canvasWidth * 0.5;
        const maxHeight = canvasHeight * 0.6;
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = w * ratio;
          h = h * ratio;
        }

        const newImgObj: ImageCanvasObject = {
          id: `img_${Date.now()}`,
          type: 'image',
          name: file.name.slice(0, 15) || 'Ảnh chủ thể',
          src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          x: (canvasWidth - w) / 2,
          y: (canvasHeight - h) / 2,
          width: w,
          height: h,
          rotation: 0,
          opacity: 1,
          zIndex: Date.now(),
          isLocked: false,
          isVisible: true,
          borderRadius: 0,
          flipX: false,
          flipY: false,
          filters: {
            brightness: 0,
            contrast: 10,
            saturation: 15,
            blur: 0,
            grayscale: false,
            sepia: false,
            invert: false,
            vignette: 0
          },
          stickerOutline: {
            enabled: false,
            color: '#FFFFFF',
            width: 8,
            glow: true
          }
        };
        onAddObject(newImgObj);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Helper to add Shapes & Badges
  const handleAddBadge = (text: string, theme: 'hot' | 'viral' | 'podcast' | 'rating' | 'verified', bgColor: string) => {
    const newBadge: BadgeCanvasObject = {
      id: `badge_${Date.now()}`,
      type: 'badge',
      name: `Badge ${text}`,
      badgeText: text,
      theme,
      bgColor,
      textColor: '#FFFFFF',
      x: canvasWidth * 0.1,
      y: canvasHeight * 0.15,
      width: 260,
      height: 64,
      rotation: 0,
      opacity: 1,
      zIndex: Date.now(),
      isLocked: false,
      isVisible: true
    };
    onAddObject(newBadge);
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'arrow' | 'star' | 'line', fillColor: string) => {
    const newShape: ShapeCanvasObject = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      name: `Khối ${shapeType}`,
      shapeType,
      fillColor,
      strokeColor: '#FFFFFF',
      strokeWidth: 0,
      borderRadius: shapeType === 'rectangle' ? 16 : 0,
      x: canvasWidth * 0.25,
      y: canvasHeight * 0.3,
      width: shapeType === 'line' ? 400 : 220,
      height: shapeType === 'line' ? 8 : 220,
      rotation: 0,
      opacity: 1,
      zIndex: Date.now(),
      isLocked: false,
      isVisible: true
    };
    onAddObject(newShape);
  };

  return (
    <aside className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('typography')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'typography'
              ? 'bg-indigo-600/90 text-white shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Chữ Pro</span>
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'images'
              ? 'bg-indigo-600/90 text-white shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hình Ảnh</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'templates'
              ? 'bg-indigo-600/90 text-white shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Mẫu Cover</span>
        </button>
        <button
          onClick={() => setActiveTab('shapes')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'shapes'
              ? 'bg-indigo-600/90 text-white shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Shapes className="w-4 h-4" />
          <span>Khối/Badge</span>
        </button>
        <button
          onClick={() => setActiveTab('background')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'background'
              ? 'bg-indigo-600/90 text-white shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Nền</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: TYPOGRAPHY PRO */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Thêm Tiêu Đề Nhanh</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleAddCustomText('heading')}
                  className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/60 rounded-xl text-left font-black text-lg text-white tracking-wide shadow-sm flex items-center justify-between group transition-all"
                >
                  <span style={{ fontFamily: 'Anton' }}>THÊM TIÊU ĐỀ LỚN</span>
                  <Plus className="w-4 h-4 text-neutral-400 group-hover:text-indigo-400" />
                </button>
                <button
                  onClick={() => handleAddCustomText('subheading')}
                  className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/60 rounded-xl text-left font-bold text-sm text-neutral-200 tracking-normal shadow-sm flex items-center justify-between group transition-all"
                >
                  <span style={{ fontFamily: 'Montserrat' }}>Thêm phụ đề cuốn hút</span>
                  <Plus className="w-4 h-4 text-neutral-400 group-hover:text-indigo-400" />
                </button>
                <button
                  onClick={() => handleAddCustomText('body')}
                  className="w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/60 rounded-xl text-left text-xs text-neutral-300 shadow-sm flex items-center justify-between group transition-all"
                >
                  <span>Thêm một đoạn văn bản ngắn</span>
                  <Plus className="w-4 h-4 text-neutral-400 group-hover:text-indigo-400" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Chữ Mẫu Creator Triệu View
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {TYPOGRAPHY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleAddTypographyPreset(preset)}
                    className="p-3 bg-neutral-950/80 hover:bg-neutral-800/80 border border-neutral-800 hover:border-indigo-500/50 rounded-xl text-center group transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[70px]"
                  >
                    <span className="text-[10px] text-neutral-500 font-medium absolute top-1.5 left-2">
                      {preset.name}
                    </span>
                    <span
                      className="text-xl font-black mt-3"
                      style={{
                        fontFamily: preset.style.fontFamily,
                        color: preset.style.fillColor,
                        WebkitTextStroke: preset.style.stroke?.enabled ? `${Math.min(preset.style.stroke.width || 0, 4)}px ${preset.style.stroke.color}` : 'none',
                        textShadow: preset.style.shadow?.enabled ? `0 0 10px ${preset.style.shadow.color}` : 'none',
                        backgroundColor: preset.style.pillBackground?.enabled ? preset.style.pillBackground.color : 'transparent',
                        padding: preset.style.pillBackground?.enabled ? '2px 10px' : '0',
                        borderRadius: '6px'
                      }}
                    >
                      {preset.previewText}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IMAGES */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Tải Ảnh Lên</h3>
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-700 hover:border-indigo-500 bg-neutral-950/60 hover:bg-indigo-950/10 rounded-2xl p-6 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-800 group-hover:bg-indigo-600/20 text-neutral-400 group-hover:text-indigo-400 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-neutral-200 group-hover:text-white">Chọn ảnh từ máy tính</p>
                <p className="text-xs text-neutral-500 mt-1">Hỗ trợ PNG, JPG, WebP (Ảnh chân dung, sản phẩm...)</p>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Kho Ảnh Mẫu & Sticker</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Podcast Mic', url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=60' },
                  { name: 'Creator Vlogger', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60' },
                  { name: 'Cyberpunk Girl', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60' },
                  { name: 'Neon Lighting', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const img = new Image();
                      img.crossOrigin = 'anonymous';
                      img.onload = () => {
                        const newImg: ImageCanvasObject = {
                          id: `sample_img_${Date.now()}_${idx}`,
                          type: 'image',
                          name: item.name,
                          src: item.url,
                          naturalWidth: img.naturalWidth,
                          naturalHeight: img.naturalHeight,
                          x: canvasWidth * 0.2,
                          y: canvasHeight * 0.2,
                          width: canvasWidth * 0.6,
                          height: canvasHeight * 0.6,
                          rotation: 0,
                          opacity: 1,
                          zIndex: Date.now(),
                          isLocked: false,
                          isVisible: true,
                          borderRadius: 16,
                          flipX: false,
                          flipY: false,
                          filters: { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false, sepia: false, invert: false, vignette: 0 },
                          stickerOutline: { enabled: false, color: '#FFFFFF', width: 6, glow: false }
                        };
                        onAddObject(newImg);
                      };
                      img.src = item.url;
                    }}
                    className="relative aspect-video rounded-xl overflow-hidden border border-neutral-800 hover:border-indigo-500 cursor-pointer group shadow-sm"
                  >
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[11px] font-medium text-white">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Mẫu Thiết Kế Sẵn</h3>
            <div className="space-y-3">
              {TEMPLATE_PRESETS.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => onApplyTemplate(tmpl)}
                  className="bg-neutral-950 border border-neutral-800 hover:border-indigo-500 rounded-2xl p-3 cursor-pointer group transition-all shadow-md"
                >
                  <div className={`h-28 rounded-xl bg-gradient-to-br ${tmpl.thumbnailColor} flex items-center justify-center p-3 text-center mb-2.5 relative overflow-hidden`}>
                    <span className="text-white font-black text-sm drop-shadow-md">
                      {tmpl.title}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold text-white uppercase">
                      {tmpl.ratio}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-200 group-hover:text-indigo-400">{tmpl.title}</p>
                      <p className="text-[11px] text-neutral-500">{tmpl.category}</p>
                    </div>
                    <span className="text-xs font-medium text-indigo-400 group-hover:translate-x-0.5 transition-transform">Dùng →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SHAPES & BADGES */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Huy Hiệu Creator / Badge</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddBadge('🔥 HOT NHẤT', 'hot', '#EF4444')}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs shadow hover:opacity-90 flex items-center justify-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>HOT NHẤT</span>
                </button>
                <button
                  onClick={() => handleAddBadge('⭐ VIRAL TIKTOK', 'viral', '#EC4899')}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-700 text-white font-black text-xs shadow hover:opacity-90 flex items-center justify-center gap-1"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>VIRAL</span>
                </button>
                <button
                  onClick={() => handleAddBadge('🎙️ PODCAST #01', 'podcast', '#D97706')}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-black text-xs shadow hover:opacity-90 flex items-center justify-center gap-1"
                >
                  <span>PODCAST</span>
                </button>
                <button
                  onClick={() => handleAddBadge('✅ ĐÃ XÁC THỰC', 'verified', '#059669')}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs shadow hover:opacity-90 flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Hình Khối Đồ Họa</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAddShape('rectangle', '#3B82F6')}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex flex-col items-center gap-1 text-xs text-neutral-300"
                >
                  <div className="w-8 h-6 bg-blue-500 rounded-md" />
                  <span>Chữ nhật</span>
                </button>
                <button
                  onClick={() => handleAddShape('circle', '#EC4899')}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex flex-col items-center gap-1 text-xs text-neutral-300"
                >
                  <div className="w-6 h-6 bg-pink-500 rounded-full" />
                  <span>Hình tròn</span>
                </button>
                <button
                  onClick={() => handleAddShape('star', '#F59E0B')}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex flex-col items-center gap-1 text-xs text-neutral-300"
                >
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <span>Ngôi sao</span>
                </button>
                <button
                  onClick={() => handleAddShape('arrow', '#10B981')}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex flex-col items-center gap-1 text-xs text-neutral-300"
                >
                  <ArrowRight className="w-6 h-6 text-emerald-400" />
                  <span>Mũi tên</span>
                </button>
                <button
                  onClick={() => handleAddShape('line', '#FFFFFF')}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex flex-col items-center gap-1 text-xs text-neutral-300"
                >
                  <div className="w-8 h-1 bg-white rounded" />
                  <span>Đường kẻ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BACKGROUND */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Loại Nền Canvas</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['color', 'gradient', 'image'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onUpdateBackground({ type })}
                    className={`py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                      bgSettings.type === type
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {type === 'color' ? 'Đơn sắc' : type === 'gradient' ? 'Chuyển màu' : 'Ảnh nền'}
                  </button>
                ))}
              </div>
            </div>

            {bgSettings.type === 'color' && (
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Chọn màu nền</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgSettings.color}
                    onChange={(e) => onUpdateBackground({ color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={bgSettings.color}
                    onChange={(e) => onUpdateBackground({ color: e.target.value })}
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono"
                  />
                </div>
              </div>
            )}

            {bgSettings.type === 'gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">Màu bắt đầu</span>
                    <input
                      type="color"
                      value={bgSettings.gradient.start}
                      onChange={(e) =>
                        onUpdateBackground({
                          gradient: { ...bgSettings.gradient, start: e.target.value }
                        })
                      }
                      className="w-full h-9 rounded-lg bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">Màu kết thúc</span>
                    <input
                      type="color"
                      value={bgSettings.gradient.end}
                      onChange={(e) =>
                        onUpdateBackground({
                          gradient: { ...bgSettings.gradient, end: e.target.value }
                        })
                      }
                      className="w-full h-9 rounded-lg bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-400 block mb-1">Hướng chuyển sắc</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['vertical', 'horizontal', 'diagonal', 'radial'] as const).map((dir) => (
                      <button
                        key={dir}
                        onClick={() =>
                          onUpdateBackground({
                            gradient: { ...bgSettings.gradient, direction: dir }
                          })
                        }
                        className={`py-1.5 text-xs rounded-lg capitalize ${
                          bgSettings.gradient.direction === dir
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {bgSettings.type === 'image' && (
              <div className="space-y-3">
                <button
                  onClick={() => bgImageInputRef.current?.click()}
                  className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700"
                >
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Chọn ảnh làm nền</span>
                </button>
                <input
                  ref={bgImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        onUpdateBackground({ imageSrc: ev.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Độ mờ hậu cảnh (Blur)</span>
                    <span>{bgSettings.imageBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={bgSettings.imageBlur}
                    onChange={(e) => onUpdateBackground({ imageBlur: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Lớp phủ tối (Overlay)</span>
                    <span>{Math.round(bgSettings.overlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgSettings.overlayOpacity}
                    onChange={(e) => onUpdateBackground({ overlayOpacity: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
