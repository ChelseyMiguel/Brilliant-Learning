import { useState, useRef, useCallback, useEffect } from "react";

export default function CoinFlipAnimation() {
  const [dragY, setDragY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<"H" | "T" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);

  const isDragging = useRef(false);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cancelRaf = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const runFlip = useCallback((startDragY: number, startRotation: number) => {
    cancelRaf();
    setIsFlipping(true);
    setShowResult(false);

    const flipResult: "H" | "T" = Math.random() < 0.5 ? "H" : "T";
    // Heads = 0° or 360°, Tails = 180°
    // After 1800° of spin, land at the correct face
    const spinAmount = 1800;
    const targetRotation = flipResult === "H" ? startRotation + spinAmount : startRotation + spinAmount + 180;
    const targetDragY = 400;
    const duration = 850;
    let t0: number | null = null;

    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const elapsed = ts - t0;
      const p = Math.min(elapsed / duration, 1);
      // cubic ease-out for fall, smoothstep for spin
      const fallEase = 1 - Math.pow(1 - p, 2.5);
      const spinEase = 1 - Math.pow(1 - p, 3);
      setDragY(startDragY + fallEase * (targetDragY - startDragY));
      setRotation(startRotation + spinEase * (targetRotation - startRotation));

      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setResult(flipResult);
        setShowResult(true);
        setIsFlipping(false);
        if (flipResult === "H") setHeads((h) => h + 1);
        else setTails((t) => t + 1);

        // Bounce-settle then reset
        setTimeout(() => {
          cancelRaf();
          let r0: number | null = null;
          const resetDuration = 500;
          const fromDragY = targetDragY;

          const resetStep = (ts: number) => {
            if (!r0) r0 = ts;
            const p2 = Math.min((ts - r0) / resetDuration, 1);
            const ease = 1 - Math.pow(1 - p2, 3);
            setDragY(fromDragY * (1 - ease));
            // Normalise rotation so we don't accumulate large numbers
            const normalised = ((targetRotation % 360) + 360) % 360;
            setRotation(normalised * (1 - ease));
            if (p2 < 1) {
              rafRef.current = requestAnimationFrame(resetStep);
            } else {
              setDragY(0);
              setRotation(0);
              setShowResult(false);
            }
          };
          rafRef.current = requestAnimationFrame(resetStep);
        }, 1100);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isFlipping) return;
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    cancelRaf();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || isFlipping) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = Math.max(0, Math.min(340, e.clientY - rect.top - 110));
    setDragY(y);
    setRotation(y * 8);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (!isFlipping) {
      const currentY = dragY;
      const currentRot = rotation;
      if (currentY > 80) {
        runFlip(currentY, currentRot);
      } else {
        cancelRaf();
        // Spring back
        let r0: number | null = null;
        const fromY = currentY;
        const fromR = currentRot;
        const springBack = (ts: number) => {
          if (!r0) r0 = ts;
          const p = Math.min((ts - r0) / 250, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setDragY(fromY * (1 - ease));
          setRotation(fromR * (1 - ease));
          if (p < 1) rafRef.current = requestAnimationFrame(springBack);
          else { setDragY(0); setRotation(0); }
        };
        rafRef.current = requestAnimationFrame(springBack);
      }
    }
  };

  const flipButton = () => {
    if (!isFlipping) runFlip(0, 0);
  };

  useEffect(() => () => cancelRaf(), []);

  const total = heads + tails;
  const shadowBlur = 8 + dragY * 0.12;
  const shadowOpacity = Math.min(0.06 + dragY * 0.0005, 0.22);

  return (
    <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 overflow-hidden select-none">
      {/* Drag area */}
      <div
        ref={containerRef}
        className="relative h-[500px] overflow-hidden"
        style={{ cursor: isFlipping ? "default" : isDragging.current ? "grabbing" : "grab" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Instruction text */}
        <p className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-400 uppercase tracking-widest pointer-events-none whitespace-nowrap">
          {isFlipping ? "Flipping…" : dragY > 40 ? "Release to flip" : "Drag the coin down"}
        </p>

        {/* Pull guide line */}
        <div
          className="absolute left-1/2 top-[88px] -translate-x-1/2 w-px bg-slate-200 rounded-full pointer-events-none"
          style={{ height: Math.max(dragY - 2, 0), opacity: dragY > 4 ? 0.7 : 0 }}
        />

        {/* 3D Coin */}
        <div
          className="absolute left-1/2 top-16 pointer-events-none"
          style={{
            transform: `translateX(-50%) translateY(${dragY}px)`,
            perspective: "900px",
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              position: "relative",
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotation}deg)`,
              filter: `drop-shadow(0 ${4 + dragY * 0.06}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}))`,
            }}
          >
            {/* Heads face */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "linear-gradient(145deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                boxShadow: "inset 0 4px 8px rgba(255,255,255,0.35), inset 0 -5px 10px rgba(0,0,0,0.2)",
              }}
            >
              <span style={{ fontSize: 38, fontWeight: 800, color: "white", lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>H</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em" }}>HEADS</span>
            </div>

            {/* Tails face */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "linear-gradient(145deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                boxShadow: "inset 0 4px 8px rgba(255,255,255,0.3), inset 0 -5px 10px rgba(0,0,0,0.2)",
              }}
            >
              <span style={{ fontSize: 38, fontWeight: 800, color: "white", lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>T</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.12em" }}>TAILS</span>
            </div>
          </div>
        </div>

        {/* Landing zone ring */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-[2.5px] border-dashed pointer-events-none transition-all duration-200"
          style={{
            borderColor: "#10b981",
            opacity: isFlipping ? 0.6 : dragY > 15 ? 0.35 : 0.12,
            transform: `translateX(-50%) scale(${isFlipping ? 1.05 : 1})`,
          }}
        />

        {/* Result badge */}
        {showResult && !isFlipping && (
          <div
            className="absolute bottom-14 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              animation: "fadeSlideUp 0.25s ease-out",
            }}
          >
            <div className={`px-5 py-2 rounded-full shadow-md font-bold text-sm whitespace-nowrap ${
              result === "H" ? "bg-amber-400 text-white" : "bg-slate-600 text-white"
            }`}>
              {result === "H" ? "Heads!" : "Tails!"}
            </div>
          </div>
        )}
      </div>

      {/* Stats + controls */}
      <div className="px-5 py-4 border-t border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="text-amber-500">H: {heads}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">T: {tails}</span>
          </div>
          {total > 0 && (
            <span className="text-xs text-slate-400">
              {((heads / total) * 100).toFixed(0)}% heads · {total} flip{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {total > 1 && (
          <div className="h-2 rounded-full overflow-hidden bg-slate-100 mb-3">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(heads / total) * 100}%` }}
            />
          </div>
        )}

        <button
          onClick={flipButton}
          disabled={isFlipping}
          className="w-full h-10 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-bold disabled:opacity-40 transition-colors"
        >
          {isFlipping ? "Flipping…" : "Flip"}
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
