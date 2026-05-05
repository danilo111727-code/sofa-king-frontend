import { useEffect, useCallback, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  altBase?: string;
}

export function ImageLightbox({ images, currentIndex, onClose, onNext, onPrev, altBase = "Foto" }: Props) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const state = useRef({
    pinching: false,
    dragging: false,
    lastDist: 0,
    lastScale: 1,
    lastTx: 0,
    lastTy: 0,
    dragStartX: 0,
    dragStartY: 0,
    lastTap: 0,
  });

  const resetZoom = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  useEffect(() => {
    resetZoom();
  }, [currentIndex, resetZoom]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
    },
    [onClose, onNext, onPrev, hasNext, hasPrev]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const getDist = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const s = state.current;

    if (e.touches.length === 2) {
      e.preventDefault();
      s.pinching = true;
      s.dragging = false;
      s.lastDist = getDist(e.touches);
      s.lastScale = scale;
      s.lastTx = tx;
      s.lastTy = ty;
    } else if (e.touches.length === 1) {
      s.pinching = false;
      const touch = e.touches[0];

      // double-tap
      const now = Date.now();
      if (now - s.lastTap < 280) {
        if (scale > 1) {
          resetZoom();
        } else {
          setScale(2.5);
        }
        s.lastTap = 0;
        return;
      }
      s.lastTap = now;

      if (scale > 1) {
        s.dragging = true;
        s.dragStartX = touch.clientX - tx * scale;
        s.dragStartY = touch.clientY - ty * scale;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const s = state.current;

    if (e.touches.length === 2 && s.pinching) {
      e.preventDefault();
      const dist = getDist(e.touches);
      const newScale = Math.min(Math.max(s.lastScale * (dist / s.lastDist), 1), 5);
      setScale(newScale);
    } else if (e.touches.length === 1 && s.dragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const newTx = (touch.clientX - s.dragStartX) / scale;
      const newTy = (touch.clientY - s.dragStartY) / scale;
      setTx(newTx);
      setTy(newTy);
    }
  };

  const handleTouchEnd = () => {
    const s = state.current;
    s.pinching = false;
    s.dragging = false;
    setScale(prev => {
      if (prev < 1.05) {
        setTx(0);
        setTy(0);
        return 1;
      }
      return prev;
    });
  };

  const handleBackdropClick = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      onClose();
    }
  };

  const isZoomed = scale > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Fechar"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev */}
      {hasPrev && !isZoomed && (
        <button
          className="absolute left-3 sm:left-6 z-10 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Foto anterior"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Image container */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          width: "92vw",
          height: "90vh",
          touchAction: isZoomed ? "none" : "pan-y",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`${altBase} ${currentIndex + 1}`}
          className="max-w-full max-h-full rounded-lg shadow-2xl object-contain select-none"
          draggable={false}
          style={{
            transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
            transition: isZoomed ? "none" : "transform 0.25s ease",
            cursor: isZoomed ? "grab" : "zoom-in",
            willChange: "transform",
          }}
        />
      </div>

      {/* Next */}
      {hasNext && !isZoomed && (
        <button
          className="absolute right-3 sm:right-6 z-10 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Próxima foto"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Counter */}
      {images.length > 1 && !isZoomed && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-xs bg-black/30 px-3 py-1 rounded-full pointer-events-none">
        {isZoomed ? "Toque no fundo para sair do zoom" : "Pinça ou toque duplo para dar zoom"}
      </div>
    </div>
  );
}
