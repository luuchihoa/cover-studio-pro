export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:5' | 'custom';

export interface CanvasDimensions {
  width: number;
  height: number;
  label: string;
  ratio: AspectRatioType;
}

export type ObjectType = 'text' | 'image' | 'shape' | 'badge';

export interface BaseCanvasObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number; // 0 to 1
  zIndex: number;
  isLocked: boolean;
  isVisible: boolean;
  name: string;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic';
  fillColor: string;
  gradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  };
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase';
  
  // 3D Effect
  effect3D: {
    enabled: boolean;
    depth: number; // 1 - 30
    color: string;
    angle: number; // in degrees, e.g. 45
  };
  
  // Stroke / Double Stroke
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
    doubleStroke?: {
      enabled: boolean;
      color: string;
      width: number;
    };
  };
  
  // Neon Glow / Drop Shadow
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    glow: boolean;
  };
  
  // Auto-Pill Background (CapCut Highlight)
  pillBackground: {
    enabled: boolean;
    color: string;
    paddingX: number;
    paddingY: number;
    borderRadius: number;
    opacity: number;
  };

  // Curved text
  curved: {
    enabled: boolean;
    radius: number; // curvature
  };
}

export interface TextCanvasObject extends BaseCanvasObject {
  type: 'text';
  text: string;
  style: TextStyle;
}

export interface ImageFilters {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  saturation: number; // -100 to 100
  blur: number;       // 0 to 50
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  vignette: number;   // 0 to 100
}

export interface ImageCanvasObject extends BaseCanvasObject {
  type: 'image';
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  borderRadius: number;
  flipX: boolean;
  flipY: boolean;
  filters: ImageFilters;
  
  // Subject Sticker Outline (Creator White Glow)
  stickerOutline: {
    enabled: boolean;
    color: string;
    width: number;
    glow: boolean;
  };
  
  // Frame Mask
  maskShape?: 'none' | 'circle' | 'rounded' | 'hexagon' | 'star';
}

export interface ShapeCanvasObject extends BaseCanvasObject {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'arrow' | 'star' | 'badge' | 'line';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
}

export interface BadgeCanvasObject extends BaseCanvasObject {
  type: 'badge';
  badgeText: string;
  theme: 'hot' | 'new' | 'viral' | 'podcast' | 'rating' | 'verified';
  bgColor: string;
  textColor: string;
}

export type CanvasObject = TextCanvasObject | ImageCanvasObject | ShapeCanvasObject | BadgeCanvasObject;

export interface BackgroundSettings {
  type: 'color' | 'gradient' | 'image';
  color: string;
  gradient: {
    start: string;
    end: string;
    direction: 'horizontal' | 'vertical' | 'radial' | 'diagonal';
  };
  imageSrc?: string;
  imageBlur: number;
  overlayOpacity: number;
  overlayColor: string;
}

export type SafeZoneType = 'none' | 'tiktok' | 'youtube' | 'instagram';
