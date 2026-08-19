import { CanvasObject, BackgroundSettings, TextCanvasObject, ImageCanvasObject, ShapeCanvasObject, BadgeCanvasObject, SafeZoneType } from '../types/canvas';

// Helper image cache for loaded images
const imageElementCache: Map<string, HTMLImageElement> = new Map();

export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  if (!src) return Promise.reject(new Error('Empty src'));
  if (imageElementCache.has(src)) {
    const cached = imageElementCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageElementCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * Render complete scene onto a 2D canvas context
 */
export const renderSceneToCanvas = async (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgSettings: BackgroundSettings,
  objects: CanvasObject[],
  options: {
    scale?: number;
    selectedId?: string | null;
    drawSafeZone?: SafeZoneType;
    isExporting?: boolean;
    snappingLines?: { x?: number; y?: number };
  } = {}
) => {
  const { selectedId = null, drawSafeZone = 'none', isExporting = false, snappingLines } = options;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Background safely
  try {
    await drawBackground(ctx, width, height, bgSettings);
  } catch (err) {
    ctx.fillStyle = bgSettings?.color || '#111827';
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Objects sorted by zIndex
  const sortedObjects = [...(objects || [])].filter(obj => obj && obj.isVisible).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const obj of sortedObjects) {
    try {
      ctx.save();
      ctx.globalAlpha = typeof obj.opacity === 'number' ? Math.max(0, Math.min(1, obj.opacity)) : 1;

      // Apply translation & rotation around object center
      const centerX = (obj.x || 0) + (obj.width || 100) / 2;
      const centerY = (obj.y || 0) + (obj.height || 100) / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(((obj.rotation || 0) * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      if (obj.type === 'text') {
        drawTextObject(ctx, obj as TextCanvasObject);
      } else if (obj.type === 'image') {
        await drawImageObject(ctx, obj as ImageCanvasObject);
      } else if (obj.type === 'shape') {
        drawShapeObject(ctx, obj as ShapeCanvasObject);
      } else if (obj.type === 'badge') {
        drawBadgeObject(ctx, obj as BadgeCanvasObject);
      }

      ctx.restore();
    } catch (objErr) {
      console.warn('Error rendering object:', obj.id, objErr);
      ctx.restore();
    }
  }

  // 3. Draw Selection Bounding Box & Handles (if not exporting)
  if (!isExporting && selectedId) {
    const selectedObj = objects.find(o => o && o.id === selectedId);
    if (selectedObj && selectedObj.isVisible) {
      drawSelectionBox(ctx, selectedObj);
    }
  }

  // 4. Draw Safe Zone Overlay (if not exporting)
  if (!isExporting && drawSafeZone && drawSafeZone !== 'none') {
    drawSafeZoneOverlay(ctx, width, height, drawSafeZone);
  }

  // 5. Draw Snapping Guidelines (if not exporting)
  if (!isExporting && snappingLines) {
    drawSnappingGuides(ctx, width, height, snappingLines);
  }

  ctx.restore();
};

/**
 * Draw Canvas Background
 */
const drawBackground = async (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: BackgroundSettings
) => {
  if (!bg) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  ctx.save();
  if (bg.type === 'color') {
    ctx.fillStyle = bg.color || '#111827';
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'gradient' && bg.gradient) {
    let grad: CanvasGradient;
    if (bg.gradient.direction === 'horizontal') {
      grad = ctx.createLinearGradient(0, 0, width, 0);
    } else if (bg.gradient.direction === 'vertical') {
      grad = ctx.createLinearGradient(0, 0, 0, height);
    } else if (bg.gradient.direction === 'diagonal') {
      grad = ctx.createLinearGradient(0, 0, width, height);
    } else {
      grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.5);
    }
    grad.addColorStop(0, bg.gradient.start || '#0f172a');
    grad.addColorStop(1, bg.gradient.end || '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'image' && bg.imageSrc) {
    try {
      const img = await preloadImage(bg.imageSrc);
      if (bg.imageBlur && bg.imageBlur > 0) {
        ctx.filter = `blur(${bg.imageBlur}px)`;
      }
      // Cover fit
      const imgRatio = (img.naturalWidth || 1) / (img.naturalHeight || 1);
      const canvasRatio = width / height;
      let drawW = width, drawH = height, drawX = 0, drawY = 0;
      if (imgRatio > canvasRatio) {
        drawW = height * imgRatio;
        drawX = (width - drawW) / 2;
      } else {
        drawH = width / imgRatio;
        drawY = (height - drawH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.filter = 'none';

      // Overlay
      if (bg.overlayOpacity && bg.overlayOpacity > 0) {
        ctx.fillStyle = bg.overlayColor || '#000000';
        ctx.globalAlpha = bg.overlayOpacity;
        ctx.fillRect(0, 0, width, height);
      }
    } catch {
      ctx.fillStyle = bg.color || '#111827';
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    ctx.fillStyle = bg.color || '#111827';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
};

/**
 * Draw Text Object with 3D Extrusion, Double Stroke, Neon Glow & Auto-Pill Box
 */
const drawTextObject = (ctx: CanvasRenderingContext2D, obj: TextCanvasObject) => {
  const { text = '', style, x = 0, y = 0, width = 200 } = obj;
  if (!style) return;

  const lines = String(text).split('\n');
  const fontSize = style.fontSize || 48;
  const lineHeight = fontSize * (style.lineHeight || 1.2);
  const fontStyleStr = `${style.fontStyle === 'italic' ? 'italic ' : ''}${style.fontWeight || 700} ${fontSize}px "${style.fontFamily || 'sans-serif'}", sans-serif`;

  ctx.font = fontStyleStr;
  ctx.textBaseline = 'top';

  let alignOffset = 0;
  if (style.align === 'center') {
    alignOffset = width / 2;
    ctx.textAlign = 'center';
  } else if (style.align === 'right') {
    alignOffset = width;
    ctx.textAlign = 'right';
  } else {
    ctx.textAlign = 'left';
  }

  // 1. Auto-Pill Highlight Background (CapCut Highlight)
  if (style.pillBackground?.enabled) {
    ctx.save();
    ctx.globalAlpha = typeof style.pillBackground.opacity === 'number' ? style.pillBackground.opacity : 1;
    ctx.fillStyle = style.pillBackground.color || '#FFE500';
    
    const padX = style.pillBackground.paddingX ?? 20;
    const padY = style.pillBackground.paddingY ?? 10;
    const radius = style.pillBackground.borderRadius ?? 12;

    lines.forEach((line, index) => {
      const lineY = y + index * lineHeight;
      const metrics = ctx.measureText(line);
      const textW = metrics.width;
      
      let pillX = x - padX;
      if (style.align === 'center') {
        pillX = x + width / 2 - textW / 2 - padX;
      } else if (style.align === 'right') {
        pillX = x + width - textW - padX;
      }

      const pillY = lineY - padY / 2;
      const pillW = textW + padX * 2;
      const pillH = lineHeight + padY / 2;

      drawRoundedRect(ctx, pillX, pillY, pillW, pillH, radius);
      ctx.fill();
    });
    ctx.restore();
  }

  // Helper to draw single line of text with strokes & fill
  const renderTextLine = (line: string, lineX: number, lineY: number, fillPass = true) => {
    let displayText = line;
    if (style.textTransform === 'uppercase') displayText = line.toUpperCase();
    if (style.textTransform === 'lowercase') displayText = line.toLowerCase();

    // Double Stroke (Outer pass)
    if (style.stroke?.enabled && style.stroke.doubleStroke?.enabled) {
      ctx.save();
      ctx.strokeStyle = style.stroke.doubleStroke.color || '#FFFFFF';
      ctx.lineWidth = (style.stroke.width || 4) + ((style.stroke.doubleStroke.width || 4) * 2);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeText(displayText, lineX, lineY);
      ctx.restore();
    }

    // Primary Stroke
    if (style.stroke?.enabled && (style.stroke.width || 0) > 0) {
      ctx.save();
      ctx.strokeStyle = style.stroke.color || '#000000';
      ctx.lineWidth = style.stroke.width || 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeText(displayText, lineX, lineY);
      ctx.restore();
    }

    // Fill Text
    if (fillPass) {
      ctx.save();
      if (style.gradient?.enabled) {
        const textMetrics = ctx.measureText(displayText);
        const grad = ctx.createLinearGradient(lineX, lineY, lineX + (textMetrics.width || 100), lineY + fontSize);
        grad.addColorStop(0, style.gradient.startColor || '#FFE600');
        grad.addColorStop(1, style.gradient.endColor || '#FF3B30');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = style.fillColor || '#FFFFFF';
      }
      ctx.fillText(displayText, lineX, lineY);
      ctx.restore();
    }
  };

  // 2. 3D Extrusion Effect
  if (style.effect3D?.enabled && (style.effect3D.depth || 0) > 0) {
    ctx.save();
    const depth = Math.min(30, style.effect3D.depth || 10);
    const angleRad = (((style.effect3D.angle ?? 45)) * Math.PI) / 180;
    const stepX = Math.cos(angleRad);
    const stepY = Math.sin(angleRad);

    ctx.fillStyle = style.effect3D.color || '#000000';
    ctx.strokeStyle = style.effect3D.color || '#000000';
    ctx.lineWidth = style.stroke?.enabled ? (style.stroke.width || 2) : 2;
    ctx.lineJoin = 'round';

    for (let d = depth; d >= 1; d -= 1) {
      const offX = x + alignOffset + d * stepX;
      lines.forEach((line, index) => {
        const offY = y + index * lineHeight + d * stepY;
        let dt = line;
        if (style.textTransform === 'uppercase') dt = line.toUpperCase();
        ctx.fillText(dt, offX, offY);
        if (style.stroke?.enabled) {
          ctx.strokeText(dt, offX, offY);
        }
      });
    }
    ctx.restore();
  }

  // 3. Shadow & Glow
  if (style.shadow?.enabled) {
    ctx.save();
    ctx.shadowColor = style.shadow.color || 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = style.shadow.blur || 10;
    ctx.shadowOffsetX = style.shadow.offsetX || 0;
    ctx.shadowOffsetY = style.shadow.offsetY || 0;

    lines.forEach((line, index) => {
      const lineY = y + index * lineHeight;
      const lineX = x + alignOffset;
      renderTextLine(line, lineX, lineY, true);
    });
    ctx.restore();
  }

  // 4. Main Foreground Text Rendering
  lines.forEach((line, index) => {
    const lineY = y + index * lineHeight;
    const lineX = x + alignOffset;
    renderTextLine(line, lineX, lineY, true);
  });
};

/**
 * Draw Image Object with Subject Sticker Outline, Filters & Masking
 */
const drawImageObject = async (ctx: CanvasRenderingContext2D, obj: ImageCanvasObject) => {
  const { src, x = 0, y = 0, width = 100, height = 100, borderRadius = 0, flipX, flipY, stickerOutline, filters, maskShape = 'none' } = obj;
  if (!src) return;
  
  let img: HTMLImageElement;
  try {
    img = await preloadImage(src);
  } catch {
    return;
  }

  ctx.save();

  // Apply flip
  if (flipX || flipY) {
    ctx.translate(x + width / 2, y + height / 2);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.translate(-(x + width / 2), -(y + height / 2));
  }

  // 1. Sticker Outline / Glow (Sticker white glow effect)
  if (stickerOutline?.enabled && (stickerOutline.width || 0) > 0) {
    ctx.save();
    if (stickerOutline.glow) {
      ctx.shadowColor = stickerOutline.color || '#FFFFFF';
      ctx.shadowBlur = (stickerOutline.width || 6) * 2;
    }
    // Draw expanded border rect or shape
    ctx.strokeStyle = stickerOutline.color || '#FFFFFF';
    ctx.lineWidth = (stickerOutline.width || 6) * 2;
    if (borderRadius > 0 || maskShape === 'circle') {
      drawRoundedRect(ctx, x - (stickerOutline.width || 6) / 2, y - (stickerOutline.width || 6) / 2, width + (stickerOutline.width || 6), height + (stickerOutline.width || 6), borderRadius + (stickerOutline.width || 6) / 2);
    } else {
      ctx.strokeRect(x - (stickerOutline.width || 6) / 2, y - (stickerOutline.width || 6) / 2, width + (stickerOutline.width || 6), height + (stickerOutline.width || 6));
    }
    ctx.restore();
  }

  // 2. Clipping Mask
  ctx.save();
  if (maskShape === 'circle') {
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.clip();
  } else if (borderRadius > 0) {
    drawRoundedRect(ctx, x, y, width, height, borderRadius);
    ctx.clip();
  }

  // 3. Image Filters
  const filterParts: string[] = [];
  if (filters) {
    if (filters.brightness) filterParts.push(`brightness(${100 + filters.brightness}%)`);
    if (filters.contrast) filterParts.push(`contrast(${100 + filters.contrast}%)`);
    if (filters.saturation) filterParts.push(`saturate(${100 + filters.saturation}%)`);
    if (filters.blur && filters.blur > 0) filterParts.push(`blur(${filters.blur}px)`);
    if (filters.grayscale) filterParts.push(`grayscale(100%)`);
    if (filters.sepia) filterParts.push(`sepia(100%)`);
    if (filters.invert) filterParts.push(`invert(100%)`);
  }
  if (filterParts.length > 0) {
    ctx.filter = filterParts.join(' ');
  }

  // Draw image
  try {
    ctx.drawImage(img, x, y, width, height);
  } catch (err) {
    // safely ignore corrupted image draw
  }

  ctx.restore(); // restore clip
  ctx.restore(); // restore flip/transforms
};

/**
 * Draw Shapes
 */
const drawShapeObject = (ctx: CanvasRenderingContext2D, obj: ShapeCanvasObject) => {
  const { shapeType, x = 0, y = 0, width = 100, height = 100, fillColor = '#3B82F6', strokeColor = '#FFFFFF', strokeWidth = 0, borderRadius = 0 } = obj;

  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;

  if (shapeType === 'rectangle') {
    drawRoundedRect(ctx, x, y, width, height, borderRadius || 0);
    ctx.fill();
    if (strokeWidth > 0) ctx.stroke();
  } else if (shapeType === 'circle') {
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (strokeWidth > 0) ctx.stroke();
  } else if (shapeType === 'line') {
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    ctx.stroke();
  } else if (shapeType === 'star') {
    drawStar(ctx, x + width / 2, y + height / 2, 5, width / 2, width / 4);
    ctx.fill();
    if (strokeWidth > 0) ctx.stroke();
  } else if (shapeType === 'arrow') {
    drawArrow(ctx, x, y, width, height);
    ctx.fill();
    if (strokeWidth > 0) ctx.stroke();
  }

  ctx.restore();
};

/**
 * Draw Creator Badges (HOT, VIRAL, PODCAST, RATING)
 */
const drawBadgeObject = (ctx: CanvasRenderingContext2D, obj: BadgeCanvasObject) => {
  const { x = 0, y = 0, width = 200, height = 60, badgeText = '', bgColor = '#EF4444', textColor = '#FFFFFF' } = obj;

  ctx.save();
  // Pill shape
  const radius = height / 2;
  ctx.fillStyle = bgColor;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fill();

  // White inner border
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Text
  ctx.font = `bold ${Math.round(height * 0.46)}px "Be Vietnam Pro", sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, x + width / 2, y + height / 2 + 1);

  ctx.restore();
};

/**
 * Draw Selection Bounding Box & Handles
 */
const drawSelectionBox = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
  ctx.save();
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);

  const pad = 6;
  const bx = (obj.x || 0) - pad;
  const by = (obj.y || 0) - pad;
  const bw = (obj.width || 100) + pad * 2;
  const bh = (obj.height || 100) + pad * 2;

  ctx.strokeRect(bx, by, bw, bh);

  // Draw 8 Resize Handles
  ctx.setLineDash([]);
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#4F46E5';
  ctx.lineWidth = 2;
  const handleSize = 10;

  const points = [
    { x: bx, y: by },
    { x: bx + bw / 2, y: by },
    { x: bx + bw, y: by },
    { x: bx + bw, y: by + bh / 2 },
    { x: bx + bw, y: by + bh },
    { x: bx + bw / 2, y: by + bh },
    { x: bx, y: by + bh },
    { x: bx, y: by + bh / 2 },
  ];

  points.forEach(p => {
    ctx.fillRect(p.x - handleSize / 2, p.y - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(p.x - handleSize / 2, p.y - handleSize / 2, handleSize, handleSize);
  });

  // Rotation Handle above top center
  const rotY = by - 24;
  ctx.beginPath();
  ctx.moveTo(bx + bw / 2, by);
  ctx.lineTo(bx + bw / 2, rotY);
  ctx.strokeStyle = '#6366F1';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(bx + bw / 2, rotY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#4F46E5';
  ctx.fill();
  ctx.stroke();

  ctx.restore();
};

/**
 * Draw Safe Zone Overlay for TikTok / YouTube
 */
const drawSafeZoneOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, zoneType: SafeZoneType) => {
  ctx.save();

  if (zoneType === 'tiktok') {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);

    const topH = height * 0.14;
    const bottomH = height * 0.22;
    const rightW = width * 0.18;

    ctx.fillRect(0, 0, width, topH);
    ctx.strokeRect(0, 0, width, topH);

    ctx.fillRect(0, height - bottomH, width, bottomH);
    ctx.strokeRect(0, height - bottomH, width, bottomH);

    ctx.fillRect(width - rightW, topH, rightW, height - topH - bottomH);
    ctx.strokeRect(width - rightW, topH, rightW, height - topH - bottomH);

    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ VÙNG NÚT BẤM TIKTOK (TRÁNH ĐẶT CHỮ/CHỦ THỂ TẠI ĐÂY)', width / 2, height - bottomH / 2);
    ctx.fillText('⚠️ VÙNG THANH TÌM KIẾM / HEADER', width / 2, topH / 2);
  } else if (zoneType === 'youtube') {
    const stampW = width * 0.16;
    const stampH = height * 0.12;
    const stampX = width - stampW - 20;
    const stampY = height - stampH - 20;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);

    ctx.fillRect(stampX, stampY, stampW, stampH);
    ctx.strokeRect(stampX, stampY, stampW, stampH);

    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⏱️ TEM THỜI LƯỢNG YOUTUBE', stampX + stampW / 2, stampY + stampH / 2 + 7);
  }

  ctx.restore();
};

/**
 * Draw Magnetic Snapping Guides
 */
const drawSnappingGuides = (ctx: CanvasRenderingContext2D, width: number, height: number, lines: { x?: number; y?: number }) => {
  ctx.save();
  ctx.strokeStyle = '#EC4899';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);

  if (lines.x !== undefined) {
    ctx.beginPath();
    ctx.moveTo(lines.x, 0);
    ctx.lineTo(lines.x, height);
    ctx.stroke();
  }
  if (lines.y !== undefined) {
    ctx.beginPath();
    ctx.moveTo(0, lines.y);
    ctx.lineTo(width, lines.y);
    ctx.stroke();
  }
  ctx.restore();
};

/**
 * Helper: Draw Rounded Rectangle
 */
export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.max(0, Math.min(radius || 0, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

/**
 * Helper: Draw Star
 */
const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
};

/**
 * Helper: Draw Arrow
 */
const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
  const headW = width * 0.4;
  const shaftH = height * 0.4;
  const shaftY = y + (height - shaftH) / 2;

  ctx.beginPath();
  ctx.moveTo(x, shaftY);
  ctx.lineTo(x + width - headW, shaftY);
  ctx.lineTo(x + width - headW, y);
  ctx.lineTo(x + width, y + height / 2);
  ctx.lineTo(x + width - headW, y + height);
  ctx.lineTo(x + width - headW, shaftY + shaftH);
  ctx.lineTo(x, shaftY + shaftH);
  ctx.closePath();
};
