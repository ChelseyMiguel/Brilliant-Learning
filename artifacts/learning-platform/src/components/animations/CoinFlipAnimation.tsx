import { useState } from "react";

// ─── Coin geometry constants ────────────────────────────────────────────────
const CS  = 180;              // coin diameter, px
const TH  = 6;                // thicc factor (matches reference)
const EW  = CS / TH;         // edge width  = 30 px
const EHZ = EW / 2;          // half-edge   = 15 px (face z-offset)

// ─── Injected keyframes (reference-faithful) ────────────────────────────────
// rotateX is the real-coin toss axis. --flips drives the landing face:
//   720deg (2 full turns)  → front face  → H
//   900deg (2.5 full turns) → back face  → T
const STYLES = `
  @keyframes lum-coin-flip {
    0%   { transform: rotateY(0)      rotateX(0deg)                       scale(1);   }
    10%  { transform: rotateY(45deg)  rotateX(calc(var(--lum-flips) / 3)) scale(1.6); }
    60%  { transform: rotateY(-30deg) rotateX(calc(var(--lum-flips) / 1.5)) scale(2); }
    100% { transform: rotateY(0)      rotateX(var(--lum-flips))           scale(1);   }
  }
  @keyframes lum-floor-line {
    40%  { opacity: 1; background-position: -${CS * 0.8}px 0; }
    70%  { opacity: 1; background-position:  ${CS * 0.5}px 0; }
    100% { opacity: 1; background-position:  ${CS * 1.0}px 0; }
  }
`;

// Colours
const AMBER_MID  = "#f59e0b";
const AMBER_DARK = "#d97706";
const AMBER_XDRK = "#b45309";
const SLATE_MID  = "#94a3b8";
const SLATE_DARK = "#64748b";

export default function CoinFlipAnimation() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinKey,  setCoinKey]  = useState(0);   // remount to replay CSS anim
  const [linesKey, setLinesKey] = useState(0);
  const [flips, setFlips] = useState("720deg");
  const [result, setResult] = useState<"H" | "T" | null>(null);
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);

  const doFlip = () => {
    if (isFlipping) return;
    const winner: "H" | "T" = Math.random() > 0.5 ? "H" : "T";
    const deg = winner === "H" ? "720deg" : "900deg";

    setFlips(deg);
    setIsFlipping(true);
    setCoinKey((k) => k + 1);
    setLinesKey((k) => k + 1);

    // Animation is 1 s; give a tiny buffer
    setTimeout(() => {
      setResult(winner);
      if (winner === "H") setHeads((h) => h + 1);
      else setTails((t) => t + 1);
      setIsFlipping(false);
    }, 1150);
  };

  const total = heads + tails;

  return (
    <div className="select-none overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc]">
      <style>{STYLES}</style>

      {/* ── Stage ─────────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 460, perspective: 1400 }}
        onClick={doFlip}
      >
        {/* ── Floor burst lines ─────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            width: CS,
            height: CS,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={`${linesKey}-${i}`}
              style={{
                position:       "absolute",
                top:            "50%",
                left:           "50%",
                marginTop:      -(EW / 8),
                width:          CS,
                height:         EW / 4,
                transformOrigin:"center left",
                borderRadius:   EW / 4,
                background:     "linear-gradient(90deg, rgba(255,255,255,0.85) 20%, transparent 20%)",
                backgroundRepeat: "no-repeat",
                opacity:        0,
                transform:      `rotate(${i * 30}deg)${i % 2 !== 0 ? " scale(1.1)" : ""}`,
                animation:      isFlipping
                  ? `lum-floor-line ${1 * 0.6}s ease-out forwards`
                  : "none",
                animationDelay: isFlipping ? "0.65s" : "0s",
              }}
            />
          ))}
        </div>

        {/* ── Instruction text ──────────────────────────────────── */}
        <p
          className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-400 uppercase tracking-widest pointer-events-none whitespace-nowrap"
        >
          {isFlipping ? "Flipping…" : result ? `${result === "H" ? "Heads" : "Tails"}! Click to flip again` : "Click the coin to flip"}
        </p>

        {/* ── Coin ──────────────────────────────────────────────── */}
        <div
          key={coinKey}
          style={{
            position:        "relative",
            height:          CS,
            width:           CS,
            transformStyle:  "preserve-3d",
            transformOrigin: "50%",
            cursor:          isFlipping ? "default" : "grab",
            animation:       isFlipping ? "lum-coin-flip 1s linear forwards" : "none",
            ["--lum-flips" as any]: flips,
          }}
        >
          {/* Heads face - front (+Z) */}
          <div
            style={{
              position:         "absolute",
              inset:            0,
              borderRadius:     "50%",
              background:       `linear-gradient(145deg, #fcd34d 0%, ${AMBER_MID} 50%, ${AMBER_DARK} 100%)`,
              border:           `${CS * 0.07}px solid #fbbf24`,
              boxShadow:        `inset 0 0 0 ${CS * 0.025}px ${AMBER_DARK}, inset 0 4px 10px rgba(255,255,255,0.3), inset 0 -4px 10px rgba(0,0,0,0.2)`,
              display:          "flex",
              alignItems:       "center",
              justifyContent:   "center",
              transform:        `translateZ(${EHZ}px)`,
            }}
          >
            <span style={{
              fontSize:   CS * 0.38,
              fontWeight: 900,
              color:      AMBER_DARK,
              lineHeight: 1,
              textShadow: `${CS * 0.01}px ${CS * 0.01}px 0 ${AMBER_XDRK}, -${CS * 0.01}px -${CS * 0.01}px 0 #fcd34d`,
              userSelect: "none",
            }}>H</span>
          </div>

          {/* Tails face - back (−Z, rotated so lettering reads correctly) */}
          <div
            style={{
              position:         "absolute",
              inset:            0,
              borderRadius:     "50%",
              background:       `linear-gradient(145deg, #e2e8f0 0%, ${SLATE_MID} 50%, ${SLATE_DARK} 100%)`,
              border:           `${CS * 0.07}px solid #cbd5e1`,
              boxShadow:        `inset 0 0 0 ${CS * 0.025}px ${SLATE_DARK}, inset 0 4px 10px rgba(255,255,255,0.25), inset 0 -4px 10px rgba(0,0,0,0.2)`,
              display:          "flex",
              alignItems:       "center",
              justifyContent:   "center",
              transform:        `translateZ(-${EHZ}px) rotateY(180deg) rotateZ(180deg)`,
            }}
          >
            <span style={{
              fontSize:   CS * 0.38,
              fontWeight: 900,
              color:      SLATE_DARK,
              lineHeight: 1,
              textShadow: `${CS * 0.01}px ${CS * 0.01}px 0 #475569, -${CS * 0.01}px -${CS * 0.01}px 0 #e2e8f0`,
              userSelect: "none",
            }}>T</span>
          </div>

          {/* ── Cylindrical edge (16 segments) ─────────────────── */}
          <div
            style={{
              position:          "absolute",
              inset:             0,
              transform:         `translateX(${CS / 2 - EW / 2}px)`,
              transformStyle:    "preserve-3d",
              backfaceVisibility:"hidden",
            }}
          >
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                style={{
                  height:            CS,
                  width:             EW,
                  position:          "absolute",
                  transformStyle:    "preserve-3d",
                  backfaceVisibility:"hidden",
                  transform:         `rotateY(90deg) rotateX(${i * 11.25}deg)`,
                }}
              >
                {/* Top rim cap */}
                <div style={{
                  display:         "block",
                  height:          CS / 10,
                  width:           EW,
                  position:        "absolute",
                  top:             0,
                  transformOrigin: "top center",
                  transform:       "rotateX(84.375deg)",
                  background:      `repeating-linear-gradient(${AMBER_DARK} 0, ${AMBER_DARK} 25%, ${AMBER_XDRK} 25%, ${AMBER_XDRK} 50%)`,
                }} />
                {/* Bottom rim cap */}
                <div style={{
                  display:         "block",
                  height:          CS / 10,
                  width:           EW,
                  position:        "absolute",
                  bottom:          0,
                  transformOrigin: "center bottom",
                  transform:       "rotateX(84.375deg)",
                  background:      `repeating-linear-gradient(${AMBER_XDRK} 0, ${AMBER_XDRK} 25%, ${AMBER_DARK} 25%, ${AMBER_DARK} 50%)`,
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats + Flip button ────────────────────────────────────────── */}
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
          onClick={doFlip}
          disabled={isFlipping}
          className="w-full h-10 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-bold disabled:opacity-40 transition-colors"
        >
          {isFlipping ? "Flipping…" : "Flip"}
        </button>
      </div>
    </div>
  );
}
