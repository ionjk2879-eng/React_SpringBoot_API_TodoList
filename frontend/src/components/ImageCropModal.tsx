import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  imageUrl: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const BOX = 280;
const CROP = 220;
const OUTPUT = 240;

export default function ImageCropModal({ imageUrl, onConfirm, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [userScale, setUserScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const baseScale = naturalSize ? CROP / Math.min(naturalSize.w, naturalSize.h) : 1;
  const scale = baseScale * userScale;
  const renderedW = naturalSize ? naturalSize.w * scale : 0;
  const renderedH = naturalSize ? naturalSize.h * scale : 0;

  const clamp = useCallback((ox: number, oy: number) => {
    const maxX = Math.max(0, (renderedW - CROP) / 2);
    const maxY = Math.max(0, (renderedH - CROP) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, ox)), y: Math.min(maxY, Math.max(-maxY, oy)) };
  }, [renderedW, renderedH]);

  useEffect(() => {
    setOffset(o => clamp(o.x, o.y));
  }, [clamp]);

  function handleImgLoad() {
    if (imgRef.current) {
      setNaturalSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: offset.x, origY: offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(clamp(dragRef.current.origX + dx, dragRef.current.origY + dy));
  }
  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleConfirm() {
    if (!naturalSize || !imgRef.current) return;
    const left = (BOX - renderedW) / 2 + offset.x;
    const top = (BOX - renderedH) / 2 + offset.y;
    const cropOriginInBox = (BOX - CROP) / 2;
    const sx = (cropOriginInBox - left) / scale;
    const sy = (cropOriginInBox - top) / scale;
    const sSize = CROP / scale;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT);
    canvas.toBlob(blob => { if (blob) onConfirm(blob); }, 'image/png', 0.92);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl shadow-black/10 p-5 w-full max-w-sm">
        <h2 className="text-sm font-semibold text-[#1D1D1F] mb-1">이미지 범위 지정</h2>
        <p className="text-xs text-[#86868B] mb-3">드래그해서 위치를 옮기고, 슬라이더로 확대해보세요</p>

        <div
          className="relative mx-auto rounded-lg bg-[#ECECEF] overflow-hidden touch-none cursor-grab active:cursor-grabbing select-none"
          style={{ width: BOX, height: BOX }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            draggable={false}
            onLoad={handleImgLoad}
            alt=""
            className="absolute pointer-events-none select-none"
            style={
              naturalSize
                ? { width: renderedW, height: renderedH, left: (BOX - renderedW) / 2 + offset.x, top: (BOX - renderedH) / 2 + offset.y }
                : { opacity: 0, width: 1, height: 1 }
            }
          />
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
              width: CROP,
              height: CROP,
              left: (BOX - CROP) / 2,
              top: (BOX - CROP) / 2,
            }}
          />
        </div>

        <div className="flex items-center gap-2 mt-3 px-0.5">
          <svg className="w-3.5 h-3.5 text-[#86868B] flex-shrink-0" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={userScale}
            onChange={e => setUserScale(Number(e.target.value))}
            className="flex-1 accent-orange-500"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 text-sm text-[#86868B] border border-[#D2D2D7] py-2 rounded-lg hover:bg-[#F5F5F7] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!naturalSize}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
