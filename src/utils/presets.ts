import { TextStyle, AspectRatioType, CanvasDimensions, CanvasObject, BackgroundSettings } from '../types/canvas';

export const ASPECT_RATIOS: Record<AspectRatioType, CanvasDimensions> = {
  '16:9': {
    width: 1920,
    height: 1080,
    label: '16:9 (YouTube / Facebook)',
    ratio: '16:9'
  },
  '9:16': {
    width: 1080,
    height: 1920,
    label: '9:16 (TikTok / Reels / Shorts)',
    ratio: '9:16'
  },
  '1:1': {
    width: 1080,
    height: 1080,
    label: '1:1 (Square / Podcast)',
    ratio: '1:1'
  },
  '4:5': {
    width: 1080,
    height: 1350,
    label: '4:5 (Instagram Portrait)',
    ratio: '4:5'
  },
  'custom': {
    width: 1200,
    height: 1200,
    label: 'Tùy chỉnh',
    ratio: 'custom'
  }
};

export const VIETNAMESE_FONTS = [
  { name: 'Anton', category: 'Display', label: 'Anton (Đậm Nét Creator)' },
  { name: 'Bangers', category: 'Comic/Pop', label: 'Bangers (Pop-Art / Hài Hước)' },
  { name: 'Montserrat', category: 'Sans-Serif', label: 'Montserrat (Hiện Đại Chuẩn)' },
  { name: 'Be Vietnam Pro', category: 'Sans-Serif', label: 'Be Vietnam Pro (Thuần Việt)' },
  { name: 'Oswald', category: 'Condensed', label: 'Oswald (Gọn Gàng & Cao)' },
  { name: 'Outfit', category: 'Sans-Serif', label: 'Outfit (Công Nghệ / Trẻ Trung)' },
  { name: 'Playfair Display', category: 'Serif', label: 'Playfair Display (Sang Trọng)' },
  { name: 'Roboto', category: 'Sans-Serif', label: 'Roboto (Cổ Điển)' },
  { name: 'Caveat', category: 'Handwriting', label: 'Caveat (Viết Tay Tự Nhiên)' },
  { name: 'Inter', category: 'Sans-Serif', label: 'Inter (Rõ Ràng & Chuẩn)' },
];

export interface TypographyPreset {
  id: string;
  name: string;
  category: string;
  style: Partial<TextStyle>;
  previewText: string;
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'mrbeast_gold',
    name: 'MrBeast Viral Gold',
    category: 'YouTube Creator',
    previewText: '1 TRIỆU VIEW',
    style: {
      fontFamily: 'Anton',
      fontSize: 96,
      fontWeight: '900',
      fillColor: '#FFE600',
      textTransform: 'uppercase',
      effect3D: {
        enabled: true,
        depth: 12,
        color: '#8A5800',
        angle: 45
      },
      stroke: {
        enabled: true,
        color: '#000000',
        width: 14,
        doubleStroke: {
          enabled: true,
          color: '#FFFFFF',
          width: 6
        }
      },
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.8)',
        blur: 16,
        offsetX: 6,
        offsetY: 8,
        glow: false
      },
      pillBackground: {
        enabled: false,
        color: '#000000',
        paddingX: 20,
        paddingY: 10,
        borderRadius: 12,
        opacity: 0.9
      }
    }
  },
  {
    id: 'cyber_neon',
    name: 'Neon Glow Cyberpunk',
    category: 'Gaming & Vibe',
    previewText: 'CYBER NIGHT',
    style: {
      fontFamily: 'Montserrat',
      fontSize: 88,
      fontWeight: '900',
      fillColor: '#00FFFF',
      textTransform: 'uppercase',
      stroke: {
        enabled: true,
        color: '#FFFFFF',
        width: 4
      },
      shadow: {
        enabled: true,
        color: '#00FFFF',
        blur: 35,
        offsetX: 0,
        offsetY: 0,
        glow: true
      },
      effect3D: {
        enabled: false,
        depth: 5,
        color: '#055',
        angle: 45
      },
      pillBackground: {
        enabled: false,
        color: '#000000',
        paddingX: 16,
        paddingY: 8,
        borderRadius: 8,
        opacity: 0.8
      }
    }
  },
  {
    id: 'capcut_highlight',
    name: 'CapCut Yellow Pill',
    category: 'TikTok Shorts',
    previewText: 'BÍ QUYẾT NÀY',
    style: {
      fontFamily: 'Be Vietnam Pro',
      fontSize: 76,
      fontWeight: '900',
      fillColor: '#000000',
      textTransform: 'uppercase',
      pillBackground: {
        enabled: true,
        color: '#FFE500',
        paddingX: 28,
        paddingY: 14,
        borderRadius: 18,
        opacity: 1
      },
      stroke: {
        enabled: false,
        color: '#000000',
        width: 0
      },
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 4,
        glow: false
      },
      effect3D: {
        enabled: false,
        depth: 0,
        color: '#000',
        angle: 45
      }
    }
  },
  {
    id: 'breaking_news',
    name: 'Breaking News Đỏ Trắng',
    category: 'Tin Tức / Báo Chí',
    previewText: 'TIN NÓNG 24H',
    style: {
      fontFamily: 'Oswald',
      fontSize: 84,
      fontWeight: '700',
      fillColor: '#FFFFFF',
      textTransform: 'uppercase',
      pillBackground: {
        enabled: true,
        color: '#E50914',
        paddingX: 24,
        paddingY: 12,
        borderRadius: 6,
        opacity: 1
      },
      stroke: {
        enabled: true,
        color: '#000000',
        width: 4
      },
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.6)',
        blur: 12,
        offsetX: 4,
        offsetY: 6,
        glow: false
      },
      effect3D: {
        enabled: false,
        depth: 4,
        color: '#500',
        angle: 45
      }
    }
  },
  {
    id: 'luxury_podcast',
    name: 'Podcast Vàng Đồng Sang Trọng',
    category: 'Podcast / Talkshow',
    previewText: 'TÂM SỰ ĐÊM MUỘN',
    style: {
      fontFamily: 'Playfair Display',
      fontSize: 78,
      fontWeight: '700',
      fillColor: '#F6D365',
      textTransform: 'uppercase',
      stroke: {
        enabled: false,
        color: '#000000',
        width: 0
      },
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.8)',
        blur: 20,
        offsetX: 2,
        offsetY: 8,
        glow: false
      },
      effect3D: {
        enabled: true,
        depth: 6,
        color: '#805B10',
        angle: 90
      },
      pillBackground: {
        enabled: false,
        color: '#000000',
        paddingX: 16,
        paddingY: 8,
        borderRadius: 8,
        opacity: 0.8
      }
    }
  },
  {
    id: 'fire_gaming',
    name: 'Gaming Rực Lửa',
    category: 'Gaming / Stream',
    previewText: 'TRẬN ĐẤU ĐỈNH CAO',
    style: {
      fontFamily: 'Bangers',
      fontSize: 100,
      fontWeight: '400',
      fillColor: '#FF3B30',
      textTransform: 'uppercase',
      stroke: {
        enabled: true,
        color: '#FFE600',
        width: 10,
        doubleStroke: {
          enabled: true,
          color: '#000000',
          width: 8
        }
      },
      shadow: {
        enabled: true,
        color: '#FF9500',
        blur: 30,
        offsetX: 0,
        offsetY: 0,
        glow: true
      },
      effect3D: {
        enabled: true,
        depth: 10,
        color: '#660000',
        angle: 45
      },
      pillBackground: {
        enabled: false,
        color: '#000000',
        paddingX: 20,
        paddingY: 10,
        borderRadius: 12,
        opacity: 0.8
      }
    }
  }
];

export interface TemplatePreset {
  id: string;
  title: string;
  ratio: AspectRatioType;
  category: string;
  thumbnailColor: string;
  bgSettings: BackgroundSettings;
  objects: CanvasObject[];
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'yt_viral_1',
    title: 'YouTube Thumbnail Triệu View (16:9)',
    ratio: '16:9',
    category: 'YouTube Video',
    thumbnailColor: 'from-amber-600 to-red-900',
    bgSettings: {
      type: 'gradient',
      color: '#111827',
      gradient: {
        start: '#0f172a',
        end: '#1e1b4b',
        direction: 'diagonal'
      },
      imageBlur: 0,
      overlayOpacity: 0.2,
      overlayColor: '#000000'
    },
    objects: [
      {
        id: 'obj_badge_1',
        type: 'badge',
        name: 'Badge #01',
        x: 100,
        y: 120,
        width: 280,
        height: 60,
        rotation: -4,
        opacity: 1,
        zIndex: 1,
        isLocked: false,
        isVisible: true,
        badgeText: '🔥 HOT NHẤT TUẦN',
        theme: 'hot',
        bgColor: '#FF3B30',
        textColor: '#FFFFFF'
      },
      {
        id: 'obj_text_1',
        type: 'text',
        name: 'Tiêu đề chính',
        text: 'BÍ QUYẾT KIẾM TIỀN\nONLINE TỪ CON SỐ 0',
        x: 100,
        y: 260,
        width: 1000,
        height: 260,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        isLocked: false,
        isVisible: true,
        style: {
          fontFamily: 'Anton',
          fontSize: 90,
          fontWeight: '900',
          fontStyle: 'normal',
          fillColor: '#FFE600',
          align: 'left',
          lineHeight: 1.15,
          letterSpacing: 2,
          textTransform: 'uppercase',
          effect3D: {
            enabled: true,
            depth: 10,
            color: '#713F12',
            angle: 45
          },
          stroke: {
            enabled: true,
            color: '#000000',
            width: 12,
            doubleStroke: {
              enabled: true,
              color: '#FFFFFF',
              width: 5
            }
          },
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.8)',
            blur: 16,
            offsetX: 6,
            offsetY: 8,
            glow: false
          },
          pillBackground: {
            enabled: false,
            color: '#000000',
            paddingX: 20,
            paddingY: 10,
            borderRadius: 12,
            opacity: 0.9
          },
          curved: {
            enabled: false,
            radius: 0
          }
        }
      },
      {
        id: 'obj_text_sub',
        type: 'text',
        name: 'Phụ đề CapCut',
        text: 'HƯỚNG DẪN CHI TIẾT TỪ A - Z',
        x: 100,
        y: 560,
        width: 700,
        height: 90,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        isLocked: false,
        isVisible: true,
        style: {
          fontFamily: 'Be Vietnam Pro',
          fontSize: 38,
          fontWeight: '800',
          fontStyle: 'normal',
          fillColor: '#000000',
          align: 'left',
          lineHeight: 1.2,
          letterSpacing: 1,
          textTransform: 'uppercase',
          pillBackground: {
            enabled: true,
            color: '#FFFFFF',
            paddingX: 24,
            paddingY: 12,
            borderRadius: 12,
            opacity: 1
          },
          stroke: {
            enabled: false,
            color: '#000',
            width: 0
          },
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.5)',
            blur: 10,
            offsetX: 0,
            offsetY: 4,
            glow: false
          },
          effect3D: {
            enabled: false,
            depth: 0,
            color: '#000',
            angle: 45
          },
          curved: {
            enabled: false,
            radius: 0
          }
        }
      }
    ]
  },
  {
    id: 'tiktok_viral_1',
    title: 'TikTok Viral Story (9:16)',
    ratio: '9:16',
    category: 'TikTok / Reels',
    thumbnailColor: 'from-fuchsia-600 to-indigo-900',
    bgSettings: {
      type: 'gradient',
      color: '#09090b',
      gradient: {
        start: '#180828',
        end: '#050212',
        direction: 'vertical'
      },
      imageBlur: 0,
      overlayOpacity: 0.3,
      overlayColor: '#000000'
    },
    objects: [
      {
        id: 'tt_badge',
        type: 'badge',
        name: 'Badge Top 1',
        x: 340,
        y: 400,
        width: 400,
        height: 70,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        isLocked: false,
        isVisible: true,
        badgeText: '⭐ TOP 1 MẸO HAY',
        theme: 'viral',
        bgColor: '#EC4899',
        textColor: '#FFFFFF'
      },
      {
        id: 'tt_title',
        type: 'text',
        name: 'Tiêu đề TikTok',
        text: '3 SAI LẦM KHIẾN BẠN\nCHƯA TĂNG FOLLOWER',
        x: 90,
        y: 520,
        width: 900,
        height: 240,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        isLocked: false,
        isVisible: true,
        style: {
          fontFamily: 'Montserrat',
          fontSize: 70,
          fontWeight: '900',
          fontStyle: 'normal',
          fillColor: '#FFFFFF',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 1,
          textTransform: 'uppercase',
          effect3D: {
            enabled: false,
            depth: 0,
            color: '#000',
            angle: 45
          },
          stroke: {
            enabled: true,
            color: '#000000',
            width: 10,
            doubleStroke: {
              enabled: true,
              color: '#06B6D4',
              width: 5
            }
          },
          shadow: {
            enabled: true,
            color: '#EC4899',
            blur: 25,
            offsetX: 0,
            offsetY: 0,
            glow: true
          },
          pillBackground: {
            enabled: false,
            color: '#000',
            paddingX: 16,
            paddingY: 8,
            borderRadius: 8,
            opacity: 0.8
          },
          curved: {
            enabled: false,
            radius: 0
          }
        }
      },
      {
        id: 'tt_pill',
        type: 'text',
        name: 'Nhấn mạnh',
        text: '👉 XEM HẾT VIDEO NÀY',
        x: 190,
        y: 820,
        width: 700,
        height: 90,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        isLocked: false,
        isVisible: true,
        style: {
          fontFamily: 'Be Vietnam Pro',
          fontSize: 42,
          fontWeight: '900',
          fontStyle: 'normal',
          fillColor: '#000000',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 2,
          textTransform: 'uppercase',
          pillBackground: {
            enabled: true,
            color: '#FFE600',
            paddingX: 30,
            paddingY: 16,
            borderRadius: 25,
            opacity: 1
          },
          stroke: {
            enabled: false,
            color: '#000',
            width: 0
          },
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.6)',
            blur: 15,
            offsetX: 0,
            offsetY: 6,
            glow: false
          },
          effect3D: {
            enabled: false,
            depth: 0,
            color: '#000',
            angle: 45
          },
          curved: {
            enabled: false,
            radius: 0
          }
        }
      }
    ]
  },
  {
    id: 'podcast_square',
    title: 'Podcast Cover Nghệ Thuật (1:1)',
    ratio: '1:1',
    category: 'Podcast / Audio',
    thumbnailColor: 'from-amber-700 to-stone-900',
    bgSettings: {
      type: 'gradient',
      color: '#1c1917',
      gradient: {
        start: '#292524',
        end: '#0c0a09',
        direction: 'vertical'
      },
      imageBlur: 0,
      overlayOpacity: 0.2,
      overlayColor: '#000000'
    },
    objects: [
      {
        id: 'pod_sub',
        type: 'text',
        name: 'Tên Host',
        text: 'PODCAST SERIES • TẬP 24',
        x: 100,
        y: 200,
        width: 880,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        isLocked: false,
        isVisible: true,
        style: {
          fontFamily: 'Montserrat',
          fontSize: 32,
          fontWeight: '700',
          fontStyle: 'normal',
          fillColor: '#D97706',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 6,
          textTransform: 'uppercase',
          stroke: { enabled: false, color: '#000', width: 0 },
          shadow: { enabled: false, color: '#000', blur: 0, offsetX: 0, offsetY: 0, glow: false },
          effect3D: { enabled: false, depth: 0, color: '#000', angle: 45 },
          pillBackground: { enabled: false, color: '#000', paddingX: 0, paddingY: 0, borderRadius: 0, opacity: 1 },
          curved: { enabled: false, radius: 0 }
        }
      },
      {
        id: 'pod_title',
        type: 'text',
        name: 'Tiêu đề Podcast',
        text: 'HÀNH TRÌNH TỰ DO\nTÀI CHÍNH TUỔI 30',
        x: 100,
        y: 350,
        width: 880,
        height: 240,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        isLocked: false,
        isVisible: true,
        style: {
          fontFamily: 'Playfair Display',
          fontSize: 76,
          fontWeight: '900',
          fontStyle: 'normal',
          fillColor: '#FDE68A',
          align: 'center',
          lineHeight: 1.2,
          letterSpacing: 2,
          textTransform: 'uppercase',
          stroke: { enabled: true, color: '#000000', width: 4 },
          shadow: { enabled: true, color: 'rgba(0,0,0,0.8)', blur: 20, offsetX: 4, offsetY: 8, glow: false },
          effect3D: { enabled: true, depth: 6, color: '#78350F', angle: 90 },
          pillBackground: { enabled: false, color: '#000', paddingX: 0, paddingY: 0, borderRadius: 0, opacity: 1 },
          curved: { enabled: false, radius: 0 }
        }
      }
    ]
  }
];
