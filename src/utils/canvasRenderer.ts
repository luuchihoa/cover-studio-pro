import { CanvasObject, BackgroundSettings, TextCanvasObject, ImageCanvasObject, ShapeCanvasObject, BadgeCanvasObject, SafeZoneType } from '../types/canvas';

// Helper image cache for loaded images
const imageElementCache: Map<string, HTMLImageElement> = new Map();

export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  if (imageElementCache.has(src)) {
    return Promise.resolve(imageElementCache.get(src)!);
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
  const { scale = 1, selectedId = null, drawSafeZone = 'none', isExporting = false, snappingLines } = options;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Background
  await drawBackground(ctx, width, height, bgSettings);

  // 2. Draw Objects sorted by zIndex
  const sortedObjects = [...objects].filter(obj => obj.isVisible).sort((a, b) => a.zIndex - b.zIndex);

  for (const obj of sortedObjects) {
    ctx.save();
    ctx.globalAlpha = obj.opacity;

    // Apply translation & rotation around object center
    const centerX = obj.x + obj.width / 2;
    const centerY = obj.y + obj.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((obj.rotation * Math.PI) / 180);
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
  }

  // 3. Draw Selection Bounding Box & Handles (if not exporting)
  if (!isExporting && selectedId) {
    const selectedObj = objects.find(o => o.id === selectedId);
    if (selectedObj && selectedObj.isVisible) {
      drawSelectionBox(ctx, selectedObj);
    }
  }

  // 4. Draw Safe Zone Overlay (if not exporting)
  if (!isExporting && drawSafeZone !== 'none') {
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
  ctx.save();
  if (bg.type === 'color') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'gradient') {
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
    grad.addColorStop(0, bg.gradient.start);
    grad.addColorStop(1, bg.gradient.end);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'image' && bg.imageSrc) {
    try {
      const img = await preloadImage(bg.imageSrc);
      if (bg.imageBlur > 0) {
        ctx.filter = `blur(${bg.imageBlur}px)`;
      }
      // Cover fit
      const imgRatio = img.naturalWidth / img.naturalHeight;
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
      if (bg.overlayOpacity > 0) {
        ctx.fillStyle = bg.overlayColor;
        ctx.globalAlpha = bg.overlayOpacity;
        ctx.fillRect(0, 0, width, height);
      }
    } catch {
      ctx.fillStyle = bg.color || '#111827';
      ctx.fillRect(0, 0, width, height);
    }
  }
  ctx.restore();
};

/**
 * Draw Text Object with 3D Extrusion, Double Stroke, Neon Glow & Auto-Pill Box
 */
const drawTextObject = (ctx: CanvasRenderingContext2D, obj: TextCanvasObject) => {
  const { text, style, x, y, width, height } = obj;
  const lines = text.split('\n');
  const fontSize = style.fontSize;
  const lineHeight = fontSize * (style.lineHeight || 1.2);
  const fontStyleStr = `${style.fontStyle === 'italic' ? 'italic ' : ''}${style.fontWeight} ${fontSize}px "${style.fontFamily}", sans-serif`;

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
  if (style.pillBackground && style.pillBackground.enabled) {
    ctx.save();
    ctx.globalAlpha = style.pillBackground.opacity ?? 1;
    ctx.fillStyle = style.pillBackground.color;
    
    const padX = style.pillBackground.paddingX || 20;
    const padY = style.pillBackground.paddingY || 10;
    const radius = style.pillBackground.borderRadius || 12;

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
    if (style.stroke.enabled && style.stroke.doubleStroke?.enabled) {
      ctx.save();
      ctx.strokeStyle = style.stroke.doubleStroke.color;
      ctx.lineWidth = style.stroke.width + (style.stroke.doubleStroke.width * 2);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeText(displayText, lineX, lineY);
      ctx.restore();
    }

    // Primary Stroke
    if (style.stroke.enabled && style.stroke.width > 0) {
      ctx.save();
      ctx.strokeStyle = style.stroke.color;
      ctx.lineWidth = style.stroke.width;
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
        const grad = ctx.createLinearGradient(lineX, lineY, lineX + textMetrics.width, lineY + fontSize);
        grad.addColorStop(0, style.gradient.startColor);
        grad.addColorStop(1, style.gradient.endColor);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = style.fillColor;
      }
      ctx.fillText(displayText, lineX, lineY);
      ctx.restore();
    }
  };

  // 2. 3D Extrusion Effect
  if (style.effect3D && style.effect3D.enabled && style.effect3D.depth > 0) {
    ctx.save();
    const depth = style.effect3D.depth;
    const angleRad = ((style.effect3D.angle || 45) * Math.PI) / 180;
    const stepX = Math.cos(angleRad);
    const stepY = Math.sin(angleRad);

    ctx.fillStyle = style.effect3D.color;
    ctx.strokeStyle = style.effect3D.color;
    ctx.lineWidth = style.stroke.enabled ? style.stroke.width : 2;
    ctx.lineJoin = 'round';

    for (let d = depth; d >= 1; d -= 1) {
      const offX = x + alignOffset + d * stepX;
      lines.forEach((line, index) => {
        const offY = y + index * lineHeight + d * stepY;
        let dt = line;
        if (style.textTransform === 'uppercase') dt = line.toUpperCase();
        ctx.fillText(dt, offX, offY);
        if (style.stroke.enabled) {
          ctx.strokeText(dt, offX, offY);
        }
      });
    }
    ctx.restore();
  }

  // 3. Shadow & Glow
  if (style.shadow && style.shadow.enabled) {
    ctx.save();
    ctx.shadowColor = style.shadow.color;
    ctx.shadowBlur = style.shadow.blur;
    ctx.shadowOffsetX = style.shadow.offsetX;
    ctx.shadowOffsetY = style.shadow.offsetY;

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
  const { src, x, y, width, height, borderRadius = 0, flipX, flipY, stickerOutline, filters, maskShape = 'none' } = obj;
  
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
  if (stickerOutline && stickerOutline.enabled && stickerOutline.width > 0) {
    ctx.save();
    if (stickerOutline.glow) {
      ctx.shadowColor = stickerOutline.color;
      ctx.shadowBlur = stickerOutline.width * 2;
    }
    // Draw expanded border rect or shape
    ctx.strokeStyle = stickerOutline.color;
    ctx.lineWidth = stickerOutline.width * 2;
    if (borderRadius > 0 || maskShape === 'circle') {
      drawRoundedRect(ctx, x - stickerOutline.width / 2, y - stickerOutline.width / 2, width + stickerOutline.width, height + stickerOutline.width, borderRadius + stickerOutline.width / 2);
    } else {
      ctx.strokeRect(x - stickerOutline.width / 2, y - stickerOutline.width / 2, width + stickerOutline.width, height + stickerOutline.width);
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
    if (filters.brightness !== 0) filterParts.push(`brightness(${100 + filters.brightness}%)`);
    if (filters.contrast !== 0) filterParts.push(`contrast(${100 + filters.contrast}%)`);
    if (filters.saturation !== 0) filterParts.push(`saturate(${100 + filters.saturation}%)`);
    if (filters.blur > 0) filterParts.push(`blur(${filters.blur}px)`);
    if (filters.grayscale) filterParts.push(`grayscale(100%)`);
    if (filters.sepia) filterParts.push(`sepia(100%)`);
    if (filters.invert) filterParts.push(`invert(100%)`);
  }
  if (filterParts.length > 0) {
    ctx.filter = filterParts.join(' ');
  }

  // Draw image
  ctx.drawImage(img, x, y, width, height);

  ctx.restore(); // restore clip
  ctx.restore(); // restore flip/transforms
};

/**
 * Draw Shapes
 */
const drawShapeObject = (ctx: CanvasRenderingContext2D, obj: ShapeCanvasObject) => {
  const { shapeType, x, y, width, height, fillColor, strokeColor, strokeWidth, borderRadius } = obj;

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
  const { x, y, width, height, badgeText, bgColor, textColor } = obj;

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
  ctx.fillStyle = textColor || '#FFFFFF';
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
  const bx = obj.x - pad;
  const by = obj.y - pad;
  const bw = obj.width + pad * 2;
  const bh = obj.height + pad * 2;

  ctx.strokeRect(bx, by, bw, bh);

  // Draw 8 Resize Handles
  ctx.setLineDash([]);
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#4F46E5';
  ctx.lineWidth = 2;
  const handleSize = 10;

  const points = [
    { x: bx, y: by }, // Top-Left
    { x: bx + bw / 2, y: by }, // Top-Center
    { x: bx + bw, y: by }, // Top-Right
    { x: bx + bw, y: by + bh / 2 }, // Right-Center
    { x: bx + bw, y: by + bh }, // Bottom-Right
    { x: bx + bw / 2, y: by + bh }, // Bottom-Center
    { x: bx, y: by + bh }, // Bottom-Left
    { x: bx, y: by + bh / 2 }, // Left-Center
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
    // 9:16 TikTok Safe Zone Overlay
    // Top area (Header/Search/Tabs): 15%
    // Bottom area (Caption, Song, Home Bar): 22%
    // Right area (Like, Comment, Share, Profile Avatar): 18% width on right
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);

    const topH = height * 0.14;
    const bottomH = height * 0.22;
    const rightW = width * 0.18;

    // Top block
    ctx.fillRect(0, 0, width, topH);
    ctx.strokeRect(0, 0, width, topH);

    // Bottom block
    ctx.fillRect(0, height - bottomH, width, bottomH);
    ctx.strokeRect(0, height - bottomH, width, bottomH);

    // Right sidebar block
    ctx.fillRect(width - rightW, topH, rightW, height - topH - bottomH);
    ctx.strokeRect(width - rightW, topH, rightW, height - topH - bottomH);

    // Safe Zone Label
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ VÙNG NÚT BẤM TIKTOK (TRÁNH ĐẶT CHỮ/CHỦ THỂ TẠI ĐÂY)', width / 2, height - bottomH / 2);
    ctx.fillText('⚠️ VÙNG THANH TÌM KIẾM / HEADER', width / 2, topH / 2);
  } else if (zoneType === 'youtube') {
    // 16:9 YouTube Thumbnail Safe Zone
    // Bottom-right corner video timestamp: 180px x 60px
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
  const r = Math.min(radius, width / 2, height / 2);
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
