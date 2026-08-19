import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasObject, BackgroundSettings, SafeZoneType } from '../../types/canvas';
import { renderSceneToCanvas } from '../../utils/canvasRenderer';

interface CanvasWorkspaceProps {
  canvasWidth: number;
  canvasHeight: number;
  bgSettings: BackgroundSettings;
  objects: CanvasObject[];
  selectedId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (id: string, updates: Partial<CanvasObject>) => void;
  safeZone: SafeZoneType;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

type DragMode = 'none' | 'move' | 'resize' | 'rotate';
type ResizeHandle = 'tl' | 'tc' | 'tr' | 'rc' | 'br' | 'bc' | 'bl' | 'lc';

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  canvasWidth,
  canvasHeight,
  bgSettings,
  objects,
  selectedId,
  onSelectObject,
  onUpdateObject,
  safeZone,
  zoomLevel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialObjState, setInitialObjState] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  } | null>(null);
  const [snappingGuides, setSnappingGuides] = useState<{ x?: number; y?: number }>({});

  // Redraw canvas whenever state changes
  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await renderSceneToCanvas(ctx, canvasWidth, canvasHeight, bgSettings, objects, {
      scale: 1,
      selectedId,
      drawSafeZone: safeZone,
      isExporting: false,
      snappingLines: snappingGuides
    });
  }, [canvasWidth, canvasHeight, bgSettings, objects, selectedId, safeZone, snappingGuides]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Convert mouse event client coordinates to canvas internal coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Find object at position (considering zIndex descending)
  const hitTestObject = (x: number, y: number): CanvasObject | null => {
    const sorted = [...objects].filter(o => o.isVisible).sort((a, b) => b.zIndex - a.zIndex);
    for (const obj of sorted) {
      if (x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height) {
        return obj;
      }
    }
    return null;
  };

  // Hit test handles for the selected object
  const hitTestHandles = (x: number, y: number, obj: CanvasObject): { mode: DragMode; handle?: ResizeHandle } => {
    const pad = 6;
    const bx = obj.x - pad;
    const by = obj.y - pad;
    const bw = obj.width + pad * 2;
    const bh = obj.height + pad * 2;
    const handleThreshold = 18;

    // Rotation handle (top center above box)
    const rotX = bx + bw / 2;
    const rotY = by - 24;
    if (Math.hypot(x - rotX, y - rotY) <= handleThreshold) {
      return { mode: 'rotate' };
    }

    // Resize Handles
    const handles: { handle: ResizeHandle; hx: number; hy: number }[] = [
      { handle: 'tl', hx: bx, hy: by },
      { handle: 'tc', hx: bx + bw / 2, hy: by },
      { handle: 'tr', hx: bx + bw, hy: by },
      { handle: 'rc', hx: bx + bw, hy: by + bh / 2 },
      { handle: 'br', hx: bx + bw, hy: by + bh },
      { handle: 'bc', hx: bx + bw / 2, hy: by + bh },
      { handle: 'bl', hx: bx, hy: by + bh },
      { handle: 'lc', hx: bx, hy: by + bh / 2 },
    ];

    for (const h of handles) {
      if (Math.hypot(x - h.hx, y - h.hy) <= handleThreshold) {
        return { mode: 'resize', handle: h.handle };
      }
    }

    // Inside bounding box -> Move
    if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
      return { mode: 'move' };
    }

    return { mode: 'none' };
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setDragStartPos(coords);

    const selectedObj = objects.find(o => o.id === selectedId);

    if (selectedObj && !selectedObj.isLocked) {
      const hit = hitTestHandles(coords.x, coords.y, selectedObj);
      if (hit.mode !== 'none') {
        setDragMode(hit.mode);
        setActiveHandle(hit.handle || null);
        setInitialObjState({
          x: selectedObj.x,
          y: selectedObj.y,
          width: selectedObj.width,
          height: selectedObj.height,
          rotation: selectedObj.rotation
        });
        return;
      }
    }

    // Hit test another object
    const clickedObj = hitTestObject(coords.x, coords.y);
    if (clickedObj) {
      onSelectObject(clickedObj.id);
      if (!clickedObj.isLocked) {
        setDragMode('move');
        setInitialObjState({
          x: clickedObj.x,
          y: clickedObj.y,
          width: clickedObj.width,
          height: clickedObj.height,
          rotation: clickedObj.rotation
        });
      }
    } else {
      onSelectObject(null);
      setDragMode('none');
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragMode === 'none' || !selectedId || !initialObjState) return;

    const coords = getCanvasCoords(e);
    const dx = coords.x - dragStartPos.x;
    const dy = coords.y - dragStartPos.y;

    if (dragMode === 'move') {
      let newX = initialObjState.x + dx;
      let newY = initialObjState.y + dy;

      // Smart Snapping to Canvas Center & Edges
      const guides: { x?: number; y?: number } = {};
      const snapThreshold = 12;

      // Center X
      const objCenterX = newX + initialObjState.width / 2;
      const canvasCenterX = canvasWidth / 2;
      if (Math.abs(objCenterX - canvasCenterX) < snapThreshold) {
        newX = canvasCenterX - initialObjState.width / 2;
        guides.x = canvasCenterX;
      }

      // Center Y
      const objCenterY = newY + initialObjState.height / 2;
      const canvasCenterY = canvasHeight / 2;
      if (Math.abs(objCenterY - canvasCenterY) < snapThreshold) {
        newY = canvasCenterY - initialObjState.height / 2;
        guides.y = canvasCenterY;
      }

      setSnappingGuides(guides);
      onUpdateObject(selectedId, { x: Math.round(newX), y: Math.round(newY) });
    } else if (dragMode === 'resize' && activeHandle) {
      let newW = initialObjState.width;
      let newH = initialObjState.height;
      let newX = initialObjState.x;
      let newY = initialObjState.y;

      if (activeHandle.includes('r')) newW = Math.max(30, initialObjState.width + dx);
      if (activeHandle.includes('b')) newH = Math.max(30, initialObjState.height + dy);
      if (activeHandle.includes('l')) {
        const potentialW = initialObjState.width - dx;
        if (potentialW >= 30) {
          newW = potentialW;
          newX = initialObjState.x + dx;
        }
      }
      if (activeHandle.includes('t')) {
        const potentialH = initialObjState.height - dy;
        if (potentialH >= 30) {
          newH = potentialH;
          newY = initialObjState.y + dy;
        }
      }

      onUpdateObject(selectedId, {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH)
      });
    } else if (dragMode === 'rotate') {
      const centerX = initialObjState.x + initialObjState.width / 2;
      const centerY = initialObjState.y + initialObjState.height / 2;
      const angleRad = Math.atan2(coords.y - centerY, coords.x - centerX);
      let angleDeg = Math.round((angleRad * 180) / Math.PI) + 90;
      if (angleDeg > 180) angleDeg -= 360;

      onUpdateObject(selectedId, { rotation: angleDeg });
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    setDragMode('none');
    setActiveHandle(null);
    setInitialObjState(null);
    setSnappingGuides({});
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-[calc(100vh-4rem)] overflow-auto bg-neutral-950 canvas-checkerboard flex items-center justify-center p-8 relative select-none"
    >
      <div
        className="relative transition-all duration-150 shadow-2xl shadow-black/80 rounded-lg overflow-hidden border border-neutral-800"
        style={{
          width: `${canvasWidth * zoomLevel}px`,
          height: `${canvasHeight * zoomLevel}px`
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
};
