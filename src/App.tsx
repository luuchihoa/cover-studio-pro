import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatioType, CanvasObject, BackgroundSettings, SafeZoneType } from './types/canvas';
import { ASPECT_RATIOS, TEMPLATE_PRESETS, TemplatePreset } from './utils/presets';
import { TopNav } from './components/Header/TopNav';
import { LeftSidebar } from './components/Sidebar/LeftSidebar';
import { RightSidebar } from './components/Sidebar/RightSidebar';
import { CanvasWorkspace } from './components/Canvas/CanvasWorkspace';
import { MockupPreviewModal } from './components/Modal/MockupPreviewModal';
import { ExportModal } from './components/Modal/ExportModal';
import { exportProjectJSON } from './utils/exportCanvas';

export const App: React.FC = () => {
  const [currentRatio, setCurrentRatio] = useState<AspectRatioType>('16:9');
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>(TEMPLATE_PRESETS[0].bgSettings);
  const [objects, setObjects] = useState<CanvasObject[]>(TEMPLATE_PRESETS[0].objects);
  const [selectedId, setSelectedId] = useState<string | null>(TEMPLATE_PRESETS[0].objects[1]?.id || null);
  const [safeZone, setSafeZone] = useState<SafeZoneType>('none');
  const [zoomLevel, setZoomLevel] = useState<number>(0.55);

  // Modals
  const [isMockupOpen, setIsMockupOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // History for Undo / Redo
  const [history, setHistory] = useState<{ objects: CanvasObject[]; bgSettings: BackgroundSettings; ratio: AspectRatioType }[]>([
    { objects: TEMPLATE_PRESETS[0].objects, bgSettings: TEMPLATE_PRESETS[0].bgSettings, ratio: '16:9' }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const canvasWidth = ASPECT_RATIOS[currentRatio].width;
  const canvasHeight = ASPECT_RATIOS[currentRatio].height;

  // Auto-calculate best zoom fit on ratio change or window resize
  const calculateZoomFit = useCallback((ratio: AspectRatioType = currentRatio) => {
    const w = ASPECT_RATIOS[ratio].width;
    const h = ASPECT_RATIOS[ratio].height;
    const availWidth = window.innerWidth - 640 - 80; // subtracting 2 sidebars + padding
    const availHeight = window.innerHeight - 64 - 80; // subtracting topnav + padding

    const scaleX = availWidth / w;
    const scaleY = availHeight / h;
    const bestScale = Math.min(scaleX, scaleY, 0.9);
    setZoomLevel(Math.max(0.2, Number(bestScale.toFixed(2))));
  }, [currentRatio]);

  useEffect(() => {
    calculateZoomFit(currentRatio);
    const handleResize = () => calculateZoomFit(currentRatio);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateZoomFit, currentRatio]);

  // Push state to history
  const pushHistory = (newObjects: CanvasObject[], newBg: BackgroundSettings = bgSettings, newRatio: AspectRatioType = currentRatio) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      objects: JSON.parse(JSON.stringify(newObjects)),
      bgSettings: JSON.parse(JSON.stringify(newBg)),
      ratio: newRatio
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetState = history[historyIndex - 1];
      setObjects(targetState.objects);
      setBgSettings(targetState.bgSettings);
      setCurrentRatio(targetState.ratio);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetState = history[historyIndex + 1];
      setObjects(targetState.objects);
      setBgSettings(targetState.bgSettings);
      setCurrentRatio(targetState.ratio);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Ratio change
  const handleRatioChange = (ratio: AspectRatioType) => {
    setCurrentRatio(ratio);
    calculateZoomFit(ratio);

    // Auto toggle safe zone recommendation
    if (safeZone !== 'none') {
      setSafeZone(ratio === '9:16' ? 'tiktok' : 'youtube');
    }
    pushHistory(objects, bgSettings, ratio);
  };

  // Object operations
  const handleAddObject = (newObj: CanvasObject) => {
    const updated = [...objects, newObj];
    setObjects(updated);
    setSelectedId(newObj.id);
    pushHistory(updated);
  };

  const handleUpdateObject = (id: string, updates: Partial<CanvasObject>) => {
    const updated = objects.map((obj) => (obj.id === id ? ({ ...obj, ...updates } as CanvasObject) : obj));
    setObjects(updated);
  };

  const handleCommitUpdate = (id: string, updates: Partial<CanvasObject>) => {
    const updated = objects.map((obj) => (obj.id === id ? ({ ...obj, ...updates } as CanvasObject) : obj));
    setObjects(updated);
    pushHistory(updated);
  };

  const handleDeleteObject = (id: string) => {
    const updated = objects.filter((o) => o.id !== id);
    setObjects(updated);
    if (selectedId === id) setSelectedId(null);
    pushHistory(updated);
  };

  const handleDuplicateObject = (id: string) => {
    const target = objects.find((o) => o.id === id);
    if (!target) return;
    const duplicated: CanvasObject = {
      ...JSON.parse(JSON.stringify(target)),
      id: `${target.type}_${Date.now()}`,
      name: `${target.name} (Copy)`,
      x: target.x + 30,
      y: target.y + 30,
      zIndex: Date.now()
    };
    handleAddObject(duplicated);
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);
    const index = sorted.findIndex((o) => o.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < sorted.length - 1) {
      const temp = sorted[index].zIndex;
      sorted[index].zIndex = sorted[index + 1].zIndex;
      sorted[index + 1].zIndex = temp;
    } else if (direction === 'down' && index > 0) {
      const temp = sorted[index].zIndex;
      sorted[index].zIndex = sorted[index - 1].zIndex;
      sorted[index - 1].zIndex = temp;
    }

    setObjects([...sorted]);
    pushHistory(sorted);
  };

  const handleApplyTemplate = (tmpl: TemplatePreset) => {
    setCurrentRatio(tmpl.ratio);
    setBgSettings(tmpl.bgSettings);
    setObjects(tmpl.objects);
    setSelectedId(tmpl.objects[0]?.id || null);
    calculateZoomFit(tmpl.ratio);
    pushHistory(tmpl.objects, tmpl.bgSettings, tmpl.ratio);
  };

  const handleUpdateBackground = (bg: Partial<BackgroundSettings>) => {
    const newBg = { ...bgSettings, ...bg };
    setBgSettings(newBg);
    pushHistory(objects, newBg);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault();
          handleDeleteObject(selectedId);
        }
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, historyIndex, history]);

  // Project file persistence
  const handleSaveProject = () => {
    exportProjectJSON(currentRatio, canvasWidth, canvasHeight, bgSettings, objects);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.aspectRatio && json.objects) {
          setCurrentRatio(json.aspectRatio);
          setBgSettings(json.bgSettings);
          setObjects(json.objects);
          setSelectedId(json.objects[0]?.id || null);
          pushHistory(json.objects, json.bgSettings, json.aspectRatio);
        }
      } catch {
        alert('File dự án không hợp lệ!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedObject = objects.find((o) => o.id === selectedId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* 1. Header TopNav */}
      <TopNav
        currentRatio={currentRatio}
        onRatioChange={handleRatioChange}
        safeZone={safeZone}
        onSafeZoneChange={setSafeZone}
        onOpenMockup={() => setIsMockupOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onClearCanvas={() => {
          if (confirm('Bạn có chắc chắn muốn xóa toàn bộ đối tượng trên canvas?')) {
            setObjects([]);
            setSelectedId(null);
            pushHistory([]);
          }
        }}
        zoomLevel={zoomLevel}
        onZoomFit={() => calculateZoomFit(currentRatio)}
      />

      {/* 2. Main Studio Work Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Tools, Typography Presets, Images, Shapes, Background */}
        <LeftSidebar
          onAddObject={handleAddObject}
          onApplyTemplate={handleApplyTemplate}
          bgSettings={bgSettings}
          onUpdateBackground={handleUpdateBackground}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />

        {/* Center Workspace: HTML5 Canvas with Drag, Resize, Rotate & Snapping */}
        <CanvasWorkspace
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          bgSettings={bgSettings}
          objects={objects}
          selectedId={selectedId}
          onSelectObject={setSelectedId}
          onUpdateObject={handleUpdateObject}
          safeZone={safeZone}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
        />

        {/* Right Sidebar: Object Properties & Layer Stack */}
        <RightSidebar
          selectedObject={selectedObject}
          objects={objects}
          onSelectObject={setSelectedId}
          onUpdateObject={handleCommitUpdate}
          onMoveLayer={handleMoveLayer}
          onDuplicate={handleDuplicateObject}
          onDelete={handleDeleteObject}
        />
      </div>

      {/* 3. Live Platform Mockup Modal */}
      <MockupPreviewModal
        isOpen={isMockupOpen}
        onClose={() => setIsMockupOpen(false)}
        width={canvasWidth}
        height={canvasHeight}
        ratio={currentRatio}
        bgSettings={bgSettings}
        objects={objects}
      />

      {/* 4. High-Res Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        width={canvasWidth}
        height={canvasHeight}
        ratio={currentRatio}
        bgSettings={bgSettings}
        objects={objects}
      />
    </div>
  );
};

export default App;
