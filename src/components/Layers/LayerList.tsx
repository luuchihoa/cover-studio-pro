import React from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Shapes,
  Award
} from 'lucide-react';
import { CanvasObject } from '../../types/canvas';

interface LayerListProps {
  objects: CanvasObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdateObject: (id: string, updates: Partial<CanvasObject>) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const LayerList: React.FC<LayerListProps> = ({
  objects,
  selectedId,
  onSelect,
  onUpdateObject,
  onMoveLayer,
  onDuplicate,
  onDelete
}) => {
  // Sort descending by zIndex so top layer appears on top of the list
  const sorted = [...objects].sort((a, b) => b.zIndex - a.zIndex);

  const getIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-indigo-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'shape':
        return <Shapes className="w-3.5 h-3.5 text-pink-400" />;
      case 'badge':
        return <Award className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-1.5">
      {sorted.length === 0 ? (
        <div className="text-center py-6 text-neutral-500 text-xs">
          Chưa có đối tượng nào trên Canvas.
        </div>
      ) : (
        sorted.map((obj, index) => {
          const isSelected = obj.id === selectedId;

          return (
            <div
              key={obj.id}
              onClick={() => onSelect(obj.id)}
              className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all group ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-neutral-950/80 border-neutral-800/80 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {/* Left: Icon & Name */}
              <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                <div className="p-1 rounded bg-neutral-900 border border-neutral-800">
                  {getIcon(obj.type)}
                </div>
                <span className="text-xs font-medium truncate">
                  {obj.name || (obj.type === 'text' ? (obj as any).text.slice(0, 15) : obj.type)}
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                {/* Move Up/Down */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayer(obj.id, 'up');
                  }}
                  disabled={index === 0}
                  title="Đưa lên trên"
                  className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayer(obj.id, 'down');
                  }}
                  disabled={index === sorted.length - 1}
                  title="Đưa xuống dưới"
                  className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Lock / Unlock */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateObject(obj.id, { isLocked: !obj.isLocked });
                  }}
                  title={obj.isLocked ? 'Mở khóa' : 'Khóa layer'}
                  className={`p-1 rounded ${obj.isLocked ? 'text-amber-400' : 'text-neutral-400 hover:text-white'}`}
                >
                  {obj.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                {/* Visibility */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateObject(obj.id, { isVisible: !obj.isVisible });
                  }}
                  title={obj.isVisible ? 'Ẩn layer' : 'Hiện layer'}
                  className="p-1 rounded text-neutral-400 hover:text-white"
                >
                  {obj.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-600" />}
                </button>

                {/* Duplicate */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(obj.id);
                  }}
                  title="Nhân bản"
                  className="p-1 rounded text-neutral-400 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(obj.id);
                  }}
                  title="Xóa layer"
                  className="p-1 rounded text-neutral-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
