import { useRef, useState, useEffect, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const COIN_SIZE = 150;    // px
const COIN_THICC = 6;     // divisor: edge width = COIN_SIZE / COIN_THICC
const EDGE_W = COIN_SIZE / COIN_THICC;          // 25 px
const FACE_Z  = EDGE_W / 2;                     // translateZ for each face
const COIN_COLOR = "#f7941e";
const COIN_LIGHT  = "#f9a93c";
const COIN_DARK   = "#de7d0a";
const COIN_DARKER = "#c97008";
const BG_COLOR = "#1e1b1b";

// Heads = 900 °, Tails = 720 ° (matching original logic)
const HEADS_FLIPS = 900;
const TAILS_FLIPS = 720;

interface FlipResult {
  side: "heads" | "tails";
  count: { heads: number; tails: number };
}

// ── Segment angles ────────────────────────────────────────────────────────────

const SEGMENTS = Array.from({ length: 16 }, (_, i) => i + 1);

// ── Styles ────────────────────────────────────────────────────────────────────

const edgeSegStyle = (i: number): React.CSSProperties => ({
  height: COIN_SIZE,
  width: EDGE_W,
  position: "absolute",
  transformStyle: "preserve-3d",
  backfaceVisibility: "hidden",
  transform: `rotateY(90deg) rotateX(${i * 11.25}deg)`,
});

// ── Component ─────────────────────────────────────────────────────────────────

export default function Coin3DFlipLab() {
  const coinRef  = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const [flipping, setFlipping]   = useState(false);
  const [lastResult, setLastResult] = useState<FlipResult | null>(null);
  const [history, setHistory]     = useState<FlipResult["side"][]>([]);

  // Remove CSS classes then re-add on next frame to restart animation
  const flip = useCallback(() => {
    if (flipping || !coinRef.current || !linesRef.current) return;
    setFlipping(true);

    const isHeads = Math.random() > 0.5;
    const degrees = isHeads ? HEADS_FLIPS : TAILS_FLIPS;

    // Set --flips CSS variable
    coinRef.current.style.setProperty("--flips", `${degrees}deg`);

    // Remove anim class from all children
    const animated = [
      coinRef.current,
      ...Array.from(linesRef.current.querySelectorAll(".floor-line")),
    ];
    animated.forEach(el => el.classList.remove("coin-anim", "line-anim"));

    // Re-add on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        coinRef.current?.classList.add("coin-anim");
        linesRef.current?.querySelectorAll(".floor-line").forEach(el =>
          el.classList.add("line-anim")
        );
      });
    });

    // After animation completes (~1 s for coin + 0.65 + 0.6 for lines = 1.25 s total)
    const side = isHeads ? "heads" : "tails";
    setTimeout(() => {
      setHistory(prev => {
        const next = [...prev, side] as ("heads" | "tails")[];
        const heads = next.filter(s => s === "heads").length;
        const tails = next.filter(s => s === "tails").length;
        setLastResult({ side, count: { heads, tails } });
        return next;
      });
      setFlipping(false);
    }, 1300);
  }, [flipping]);

  // Auto-flip on mount
  useEffect(() => {
    const t = setTimeout(() => flip(), 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headsCount  = history.filter(s => s === "heads").length;
  const tailsCount  = history.filter(s => s === "tails").length;
  const total       = history.length;
  const headsPct    = total ? Math.round((headsCount / total) * 100) : 50;

  return (
    <>
      {/* Inject keyframes + animation classes once */}
      <style>{`
        @keyframes coin3d-flip {
          0%   { transform: rotateY(0)     rotateX(0deg)               scale(1);   }
          10%  { transform: rotateY(45deg) rotateX(calc(var(--flips) / 3))  scale(1.6); }
          60%  { transform: rotateY(-30deg) rotateX(calc(var(--flips) / 1.5)) scale(2);   }
          100% { transform: rotateY(0)     rotateX(var(--flips))       scale(1);   }
        }
        @keyframes coin3d-lines {
          40%  { opacity: 1; background-position: -${COIN_SIZE * 0.8}px 0; }
          70%  { opacity: 1; background-position: ${COIN_SIZE * 0.5}px 0;  }
          100% { opacity: 1; background-position: ${COIN_SIZE * 1}px 0;    }
        }
        .coin-anim {
          animation: coin3d-flip 1s linear forwards;
        }
        .line-anim {
          animation: coin3d-lines 0.6s ease-out forwards;
          animation-delay: 0.65s;
        }
      `}</style>

      <div
        className="w-full flex flex-col items-center gap-6 py-8 px-4 select-none"
        style={{ background: BG_COLOR, borderRadius: 20, minHeight: 360 }}
      >
        {/* ── Scene ──────────────────────────────────────────────────── */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: COIN_SIZE, height: COIN_SIZE }}
        >
          {/* Floor lines */}
          <div
            ref={linesRef}
            style={{ position: "absolute", width: COIN_SIZE, height: COIN_SIZE }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const even = (i + 1) % 2 === 0;
              return (
                <div
                  key={i}
                  className="floor-line"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: -(EDGE_W / 4) / 2,
                    width: COIN_SIZE,
                    height: EDGE_W / 4,
                    transformOrigin: "center left",
                    borderRadius: EDGE_W / 4,
                    background: "linear-gradient(90deg, white 20%, transparent 20%)",
                    backgroundRepeat: "no-repeat",
                    opacity: 0,
                    transform: `rotate(${(i + 1) * 30}deg) ${even ? "" : "scale(1.1)"}`,
                  }}
                />
              );
            })}
          </div>

          {/* Coin */}
          <div
            ref={coinRef}
            onClick={flip}
            style={{
              height: COIN_SIZE,
              width: COIN_SIZE,
              transformStyle: "preserve-3d",
              transformOrigin: "50%",
              cursor: flipping ? "not-allowed" : "grab",
              position: "relative",
              ["--flips" as string]: `${HEADS_FLIPS}deg`,
            }}
          >
            {/* Heads face (front) */}
            <div style={{
              display: "grid",
              placeItems: "center",
              position: "absolute",
              height: "100%",
              width: "100%",
              borderRadius: "50%",
              background: COIN_COLOR,
              border: `${COIN_SIZE * 0.08}px solid ${COIN_LIGHT}`,
              boxShadow: `inset 0 0 0 ${COIN_SIZE * 0.02}px ${COIN_DARK}`,
              fontSize: COIN_SIZE * 0.38,
              fontFamily: "'Raleway', 'Bebas Neue', Impact, sans-serif",
              fontWeight: 900,
              color: COIN_DARK,
              textShadow: `${COIN_SIZE * 0.01}px ${COIN_SIZE * 0.01}px 0 ${COIN_DARKER}, ${-COIN_SIZE * 0.01}px ${-COIN_SIZE * 0.01}px 0 ${COIN_LIGHT}`,
              transform: `translateZ(${FACE_Z}px)`,
            }}>
              H
            </div>

            {/* Tails face (back) */}
            <div style={{
              display: "grid",
              placeItems: "center",
              position: "absolute",
              height: "100%",
              width: "100%",
              borderRadius: "50%",
              background: COIN_COLOR,
              border: `${COIN_SIZE * 0.08}px solid ${COIN_LIGHT}`,
              boxShadow: `inset 0 0 0 ${COIN_SIZE * 0.02}px ${COIN_DARK}`,
              fontSize: COIN_SIZE * 0.38,
              fontFamily: "'Raleway', 'Bebas Neue', Impact, sans-serif",
              fontWeight: 900,
              color: COIN_DARK,
              textShadow: `${COIN_SIZE * 0.01}px ${COIN_SIZE * 0.01}px 0 ${COIN_DARKER}, ${-COIN_SIZE * 0.01}px ${-COIN_SIZE * 0.01}px 0 ${COIN_LIGHT}`,
              transform: `translateZ(${-FACE_Z}px) rotateY(180deg) rotateZ(180deg)`,
            }}>
              T
            </div>

            {/* Edge */}
            <div style={{
              transform: `translateX(${COIN_SIZE / 2 - FACE_Z}px)`,
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}>
              {SEGMENTS.map(i => (
                <div key={i} style={edgeSegStyle(i)}>
                  {/* Top rib */}
                  <div style={{
                    content: "",
                    display: "block",
                    height: COIN_SIZE / 10,
                    width: EDGE_W,
                    position: "absolute",
                    transformOrigin: "top center",
                    transform: "rotateX(84.375deg)",
                    background: `repeating-linear-gradient(${COIN_DARK} 0, ${COIN_DARK} 25%, ${COIN_DARKER} 25%, ${COIN_DARKER} 50%)`,
                  }} />
                  {/* Bottom rib */}
                  <div style={{
                    content: "",
                    display: "block",
                    height: COIN_SIZE / 10,
                    width: EDGE_W,
                    position: "absolute",
                    bottom: 0,
                    transformOrigin: "center bottom",
                    transform: "rotateX(84.375deg)",
                    background: `repeating-linear-gradient(${COIN_DARKER} 0, ${COIN_DARKER} 25%, ${COIN_DARK} 25%, ${COIN_DARK} 50%)`,
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Result badge ────────────────────────────────────────────── */}
        {lastResult && (
          <div
            style={{
              background: lastResult.side === "heads" ? "#16a34a22" : "#6366f122",
              border: `1.5px solid ${lastResult.side === "heads" ? "#16a34a" : "#6366f1"}`,
              color: lastResult.side === "heads" ? "#4ade80" : "#a5b4fc",
              borderRadius: 12,
              padding: "6px 18px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {lastResult.side === "heads" ? "🪙 Heads!" : "🔄 Tails!"}
          </div>
        )}

        {/* ── Stats row ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <Stat label="Heads" value={headsCount} color="#4ade80" />
          <Stat label="Tails" value={tailsCount} color="#a5b4fc" />
          <Stat label="Total" value={total} color="#94a3b8" />
          {total > 0 && (
            <Stat label="Heads %" value={`${headsPct}%`} color="#f59e0b" />
          )}
        </div>

        {/* ── Proportion bar ──────────────────────────────────────────── */}
        {total > 0 && (
          <div className="w-full max-w-xs">
            <div
              style={{
                height: 10,
                borderRadius: 10,
                background: "#374151",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${headsPct}%`,
                  background: "linear-gradient(90deg, #4ade80, #22c55e)",
                  borderRadius: 10,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <div className="flex justify-between mt-1" style={{ fontSize: 11, color: "#64748b" }}>
              <span>Heads {headsPct}%</span>
              <span>Tails {100 - headsPct}%</span>
            </div>
          </div>
        )}

        {/* ── Flip history chips ──────────────────────────────────────── */}
        {history.length > 0 && (
          <div
            className="flex flex-wrap gap-1 justify-center"
            style={{ maxWidth: 320 }}
          >
            {history.slice(-30).map((side, i) => (
              <div
                key={i}
                title={side}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: side === "heads" ? "#16a34a" : "#4f46e5",
                  fontSize: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                {side === "heads" ? "H" : "T"}
              </div>
            ))}
            {history.length > 30 && (
              <span style={{ color: "#475569", fontSize: 11, alignSelf: "center" }}>
                +{history.length - 30} more
              </span>
            )}
          </div>
        )}

        {/* ── Action button ───────────────────────────────────────────── */}
        <button
          onClick={flip}
          disabled={flipping}
          style={{
            marginTop: 4,
            padding: "10px 28px",
            borderRadius: 999,
            background: flipping
              ? "#374151"
              : "linear-gradient(135deg, #f7941e, #f59e0b)",
            color: flipping ? "#6b7280" : "#1a1a1a",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: flipping ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            letterSpacing: "0.04em",
          }}
        >
          {flipping ? "Flipping…" : "Flip the Coin"}
        </button>

        <p style={{ fontSize: 11, color: "#4b5563", marginTop: -8 }}>
          Or click the coin directly
        </p>
      </div>
    </>
  );
}

// ── Small stat badge ──────────────────────────────────────────────────────────

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span style={{ fontSize: 22, fontWeight: 800, color }}>{value}</span>
      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
    </div>
  );
}
