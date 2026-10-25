import React, { useState, useRef } from 'react';
import type { DocumentField } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface BoundingBoxOverlayProps {
  imageUrl: string;
  fields: DocumentField[];
  selectedFieldKey?: string | null;
  onSelectField: (fieldKey: string) => void;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  imageUrl,
  fields,
  selectedFieldKey,
  onSelectField,
}) => {
  const { getLabel } = useLanguage();
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 1100,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getBoxStyle = (bbox: [number, number, number, number]) => {
    let left = 0;
    let top = 0;
    let width = 0;
    let height = 0;

    const [v0, v1, v2, v3] = bbox;
    const maxVal = Math.max(v0, v1, v2, v3);
    const isNormalized = maxVal <= 1.0;

    if (isNormalized) {
      left = Math.min(v0, v2) * 100;
      top = Math.min(v1, v3) * 100;
      width = Math.abs(v2 - v0) * 100;
      height = Math.abs(v3 - v1) * 100;
    } else {
      const pairA_w = Math.abs(v2 - v0);
      const pairA_h = Math.abs(v3 - v1);
      const pairB_w = Math.abs(v3 - v1);
      const pairB_h = Math.abs(v2 - v0);

      if (pairA_w >= pairA_h) {
        const xMin = Math.min(v0, v2);
        const yMin = Math.min(v1, v3);
        left = (xMin / naturalSize.width) * 100;
        top = (yMin / naturalSize.height) * 100;
        width = (pairA_w / naturalSize.width) * 100;
        height = (pairA_h / naturalSize.height) * 100;
      } else {
        const xMin = Math.min(v1, v3);
        const yMin = Math.min(v0, v2);
        left = (xMin / naturalSize.width) * 100;
        top = (yMin / naturalSize.height) * 100;
        width = (pairB_w / naturalSize.width) * 100;
        height = (pairB_h / naturalSize.height) * 100;
      }
    }

    width = Math.max(width, 2);
    height = Math.max(height, 1.5);

    return {
      left: `${Math.max(0, Math.min(left, 98))}%`,
      top: `${Math.max(0, Math.min(top, 98))}%`,
      width: `${Math.min(width, 100)}%`,
      height: `${Math.min(height, 100)}%`,
    };
  };

  return (
    <div className="relative flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700 select-none">
      {/* Viewer Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-sm p-1.5 rounded-lg border border-slate-700 shadow-md">
        <button
          type="button"
          onClick={zoomIn}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-slate-300 px-1">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={resetZoom}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Confidence Legend */}
      <div className="absolute bottom-3 left-3 z-20 hidden md:flex items-center gap-3 bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 shadow-md">
        <span className="font-semibold text-slate-400">OCR Confidence:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> High (&gt;85%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span> Med (70-84%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span> Low (&lt;70%)
        </span>
      </div>

      {/* Main Pan/Zoom Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full overflow-hidden flex items-center justify-center p-4 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative inline-block max-w-full max-h-full"
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Land Record Scan"
            onLoad={handleImageLoad}
            className="block max-h-[72vh] w-auto object-contain rounded shadow-2xl pointer-events-none select-none"
            draggable={false}
          />

          {/* Overlays */}
          {fields.map((field) => {
            const isSelected = selectedFieldKey === field.key;
            const boxStyle = getBoxStyle(field.bbox);

            let borderColor = 'border-emerald-500';
            let bgColor = 'bg-emerald-500/15';

            if (field.confidence < 0.70) {
              borderColor = 'border-rose-500';
              bgColor = 'bg-rose-500/20';
            } else if (field.confidence < 0.85) {
              borderColor = 'border-amber-500';
              bgColor = 'bg-amber-500/20';
            }

            return (
              <div
                key={field.key}
                style={boxStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectField(field.key);
                }}
                className={`absolute cursor-pointer border-2 transition-all group ${
                  isSelected
                    ? 'border-blue-400 bg-blue-500/35 ring-4 ring-blue-400/50 z-30 scale-[1.02]'
                    : `${borderColor} ${bgColor} hover:border-white hover:bg-white/20 z-10`
                }`}
                title={`${getLabel(field)}: ${field.value} (${Math.round(field.confidence * 100)}%)`}
              >
                {(isSelected || zoom >= 1.2) && (
                  <div
                    className={`absolute -top-6 left-0 text-[10px] font-medium px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-900/90 text-slate-200'
                    }`}
                  >
                    {getLabel(field)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

