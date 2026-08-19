import React, { useState } from 'react';
import {
  Sliders,
  Layers as LayersIcon,
  RotateCw,
  Move,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Copy
} from 'lucide-react';
import { CanvasObject, TextCanvasObject, ImageCanvasObject, ShapeCanvasObject, BadgeCanvasObject } from '../../types/canvas';
import { TypographyControls } from '../Typography/TypographyControls';
import { ImageControls } from '../Image/ImageControls';
import { LayerList } from '../Layers/LayerList';

interface RightSidebarProps {
  selectedObject: CanvasObject | null;
  objects: CanvasObject[];
  onSelectObject: (id: string) => void;
  onUpdateObject: (id: string, updates: Partial<CanvasObject>) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedObject,
  objects,
  onSelectObject,
  onUpdateObject,
  onMoveLayer,
  onDuplicate,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');

  return (
    <aside className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Header Tabs */}
      <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'properties'
              ? 'bg-indigo-600/90 text-white shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Thuộc Tính</span>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'layers'
              ? 'bg-indigo-600/90 text-white shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
          }`}
        >
          <LayersIcon className="w-3.5 h-3.5" />
          <span>Lớp Layer ({objects.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'layers' ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Danh Sách Layer</h3>
            </div>
            <LayerList
              objects={objects}
              selectedId={selectedObject?.id || null}
              onSelect={onSelectObject}
              onUpdateObject={onUpdateObject}
              onMoveLayer={onMoveLayer}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
        ) : !selectedObject ? (
          <div className="text-center py-16 text-neutral-500 text-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800/60 flex items-center justify-center mx-auto text-neutral-400">
              <Sliders className="w-6 h-6" />
            </div>
            <p className="font-semibold text-neutral-400">Chưa chọn đối tượng nào</p>
            <p className="text-[11px] text-neutral-600">Nhấp vào một phần tử trên khung vẽ để chỉnh sửa chi tiết</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Quick Actions Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-bold uppercase">
                  {selectedObject.type}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {selectedObject.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDuplicate(selectedObject.id)}
                  title="Nhân bản"
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateObject(selectedObject.id, { isLocked: !selectedObject.isLocked })}
                  title={selectedObject.isLocked ? 'Mở khóa' : 'Khóa'}
                  className={`p-1.5 rounded-lg ${selectedObject.isLocked ? 'text-amber-400 bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                >
                  {selectedObject.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => onDelete(selectedObject.id)}
                  title="Xóa"
                  className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* General Transforms: Opacity & Rotation */}
            <div className="space-y-3 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <div className="flex justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                  Độ mờ (Opacity)
                </span>
                <span>{Math.round(selectedObject.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={selectedObject.opacity}
                onChange={(e) => onUpdateObject(selectedObject.id, { opacity: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />

              <div className="flex justify-between text-xs text-neutral-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-neutral-400" />
                  Góc xoay
                </span>
                <span>{selectedObject.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedObject.rotation}
                onChange={(e) => onUpdateObject(selectedObject.id, { rotation: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Dynamic Type-specific Controls */}
            {selectedObject.type === 'text' && (
              <TypographyControls
                selectedObject={selectedObject as TextCanvasObject}
                onUpdateStyle={(newStyle) =>
                  onUpdateObject(selectedObject.id, {
                    style: { ...(selectedObject as TextCanvasObject).style, ...newStyle }
                  })
                }
                onUpdateText={(newText) => onUpdateObject(selectedObject.id, { text: newText })}
              />
            )}

            {selectedObject.type === 'image' && (
              <ImageControls
                selectedObject={selectedObject as ImageCanvasObject}
                onUpdateImage={(updates) => onUpdateObject(selectedObject.id, updates)}
                onUpdateFilters={(filters) =>
                  onUpdateObject(selectedObject.id, {
                    filters: { ...(selectedObject as ImageCanvasObject).filters, ...filters }
                  })
                }
              />
            )}

            {selectedObject.type === 'shape' && (
              <div className="space-y-3 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
                <label className="text-xs font-bold text-neutral-300 block">Tùy Chỉnh Khối</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(selectedObject as ShapeCanvasObject).fillColor}
                    onChange={(e) => onUpdateObject(selectedObject.id, { fillColor: e.target.value } as any)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs text-neutral-400">Màu sắc khối</span>
                </div>
              </div>
            )}

            {selectedObject.type === 'badge' && (
              <div className="space-y-3 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
                <label className="text-xs font-bold text-neutral-300 block">Chữ Trên Huy Hiệu</label>
                <input
                  type="text"
                  value={(selectedObject as BadgeCanvasObject).badgeText}
                  onChange={(e) => onUpdateObject(selectedObject.id, { badgeText: e.target.value } as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(selectedObject as BadgeCanvasObject).bgColor}
                    onChange={(e) => onUpdateObject(selectedObject.id, { bgColor: e.target.value } as any)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs text-neutral-400">Màu nền huy hiệu</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
