import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Smartphone,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  ThumbsUp,
  MoreVertical,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { CanvasObject, BackgroundSettings, AspectRatioType } from '../../types/canvas';
import { renderSceneToCanvas } from '../../utils/canvasRenderer';

interface MockupPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  width: number;
  height: number;
  ratio: AspectRatioType;
  bgSettings: BackgroundSettings;
  objects: CanvasObject[];
}

export const MockupPreviewModal: React.FC<MockupPreviewModalProps> = ({
  isOpen,
  onClose,
  width,
  height,
  ratio,
  bgSettings,
  objects
}) => {
  const [platform, setPlatform] = useState<'tiktok' | 'youtube'>(ratio === '9:16' ? 'tiktok' : 'youtube');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    // Generate snapshot data url
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
      renderSceneToCanvas(ctx, width, height, bgSettings, objects, {
        isExporting: true,
        drawSafeZone: 'none'
      }).then(() => {
        setPreviewDataUrl(offCanvas.toDataURL('image/png'));
      });
    }
  }, [isOpen, width, height, bgSettings, objects]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Xem Trước Thực Tế Trên Nền Tảng (Live Mockup)</h2>
              <p className="text-xs text-neutral-400">Kiểm tra ảnh bìa khi xuất hiện trên giao diện ứng dụng thực tế</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Platform Switcher */}
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setPlatform('youtube')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  platform === 'youtube'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                YouTube Feed
              </button>
              <button
                onClick={() => setPlatform('tiktok')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  platform === 'tiktok'
                    ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                TikTok / Reels
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mockup Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950/80 flex items-center justify-center">
          {platform === 'youtube' ? (
            /* YOUTUBE MOCKUP CONTAINER */
            <div className="w-[420px] bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  YouTube Mobile
                </span>
                <span>10:24 AM</span>
              </div>

              {/* Video Thumbnail Box */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-neutral-800">
                {previewDataUrl ? (
                  <img src={previewDataUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">
                    Đang dựng ảnh...
                  </div>
                )}
                {/* YouTube Duration badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[11px] font-bold text-white">
                  12:45
                </div>
              </div>

              {/* Video Info Details */}
              <div className="flex gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  C
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                    BÍ QUYẾT TĂNG 1 TRIỆU LƯỢT XEM VÀ GIỮ CHÂN KHÁN GIẢ TỪ CON SỐ 0
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                    <span>Creator Channel</span>
                    <CheckCircle2 className="w-3 h-3 text-neutral-400 inline" />
                    <span>• 1.2M lượt xem • 2 ngày trước</span>
                  </p>
                </div>
                <MoreVertical className="w-4 h-4 text-neutral-500" />
              </div>
            </div>
          ) : (
            /* TIKTOK / REELS MOCKUP CONTAINER */
            <div className="w-[340px] h-[600px] bg-black border-4 border-neutral-800 rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col justify-between p-4">
              {/* Cover Background */}
              {previewDataUrl && (
                <img src={previewDataUrl} alt="TikTok" className="absolute inset-0 w-full h-full object-cover" />
              )}

              {/* TikTok Top Nav */}
              <div className="relative z-10 flex justify-center items-center gap-4 text-white text-xs font-bold drop-shadow-md pt-2">
                <span className="text-neutral-400">Đang theo dõi</span>
                <span className="border-b-2 border-white pb-0.5">Dành cho bạn</span>
              </div>

              {/* TikTok Right Action Bar */}
              <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-4 text-white drop-shadow-lg">
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                  Pro
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5">142.5K</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5">1,820</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5">8,410</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5">Share</span>
                </div>
              </div>

              {/* TikTok Bottom Caption */}
              <div className="relative z-10 text-white drop-shadow-md pr-14 space-y-1.5">
                <p className="text-xs font-bold">@creator.studio.pro</p>
                <p className="text-[11px] text-neutral-200 line-clamp-2">
                  Bật mí cách thiết kế ảnh bìa triệu view siêu dễ dàng! 🔥 #creator #design #viral #tips
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-300">
                  <Music className="w-3 h-3 animate-spin" />
                  <span className="truncate">Âm thanh gốc - Creator Studio Music</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
