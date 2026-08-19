import { CanvasObject, BackgroundSettings } from '../types/canvas';
import { renderSceneToCanvas } from './canvasRenderer';

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0.1 - 1.0
  resolutionMultiplier: number; // 1, 2, 4
  filename?: string;
}

export const exportCanvasImage = async (
  width: number,
  height: number,
  bgSettings: BackgroundSettings,
  objects: CanvasObject[],
  options: ExportOptions
): Promise<string> => {
  const { format, quality, resolutionMultiplier } = options;
  const exportW = Math.round(width * resolutionMultiplier);
  const exportH = Math.round(height * resolutionMultiplier);

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = exportW;
  offscreenCanvas.height = exportH;
  const ctx = offscreenCanvas.getContext('2d', { alpha: format === 'png' });

  if (!ctx) {
    throw new Error('Cannot create offscreen 2D context');
  }

  // Scale context to resolution multiplier
  ctx.scale(resolutionMultiplier, resolutionMultiplier);

  // Render without guides or selection boxes
  await renderSceneToCanvas(ctx, width, height, bgSettings, objects, {
    scale: resolutionMultiplier,
    isExporting: true,
    drawSafeZone: 'none'
  });

  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  const dataUrl = offscreenCanvas.toDataURL(mimeType, quality);

  // Trigger browser download
  const downloadLink = document.createElement('a');
  const ext = format === 'jpeg' ? 'jpg' : format;
  downloadLink.download = `${options.filename || 'cover-studio-export'}-${exportW}x${exportH}.${ext}`;
  downloadLink.href = dataUrl;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  return dataUrl;
};

export const exportProjectJSON = (
  aspectRatio: string,
  width: number,
  height: number,
  bgSettings: BackgroundSettings,
  objects: CanvasObject[]
) => {
  const projectData = {
    version: '1.0',
    app: 'CoverStudioPro',
    createdAt: new Date().toISOString(),
    aspectRatio,
    width,
    height,
    bgSettings,
    objects
  };

  const jsonStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = `cover-project-${Date.now()}.cover`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
