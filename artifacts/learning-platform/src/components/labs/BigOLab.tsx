import { useState, useMemo } from "react";

const W = 500;
const H = 260;
const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const N_MAX = 32;

const CURVES = [
  { key: "o1",     label: "O(1)",       color: "#22c55e", fn: (_n: number) => 1 },
  { key: "ologn",  label: "O(log n)",   color: "#3b82f6", fn: (n: number) => Math.log2(n + 1) },
  { key: "on",     label: "O(n)",       color: "#f59e0b", fn: (n: number) => n },
  { key: "onlogn", label: "O(n log n)", color: "#f97316", fn: (n: number) => n * Math.log2(n + 1) },
  { key: "on2",    label: "O(n²)",      color: "#ef4444", fn: (n: number) => n * n },
] as const;

type CurveKey = typeof CURVES[number]["key"];

function polyline(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

export default function BigOLab() {
  const [active, setActive] = useState<Set<CurveKey>>(
    new Set(["o1", "ologn", "on", "onlogn", "on2"] as CurveKey[])
  );
  const [hovered, setHovered] = useState<number | null>(null); // n value being hovered

  const ns = useMemo(() => Array.from({ length: N_MAX + 1 }, (_, i) => i), []);

  // Compute all values; cap at n² for display
  const yMax = useMemo(() => N_MAX * N_MAX, []);

  function toSvgX(n: number) { return PAD.left + (n / N_MAX) * PLOT_W; }
  function toSvgY(v: number) { return PAD.top + PLOT_H - Math.min(v / yMax, 1) * PLOT_H; }

  const toggle = (key: CurveKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  // X-axis ticks
  const xTicks = [0, 8, 16, 24, 32];
  // Y-axis ticks: 0, n, n², label as "n" / "n²"
  const yTicks = [0, N_MAX, N_MAX * N_MAX / 2, N_MAX * N_MAX];

  return (
    <div className="flex flex-col gap-5 p-5 select-none">
      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {CURVES.map((c) => (
          <button
            key={c.key}
            onClick={() => toggle(c.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              active.has(c.key)
                ? "text-white border-transparent"
                : "bg-white text-gray-400 border-gray-200"
            }`}
            style={active.has(c.key) ? { backgroundColor: c.color, borderColor: c.color } : {}}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ maxWidth: "100%" }}
          className="overflow-visible"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const scaleX = W / rect.width;
            const sx = (e.clientX - rect.left) * scaleX;
            const n = Math.round(((sx - PAD.left) / PLOT_W) * N_MAX);
            setHovered(Math.max(0, Math.min(N_MAX, n)));
          }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Grid lines */}
          {xTicks.map((t) => (
            <line key={t} x1={toSvgX(t)} y1={PAD.top} x2={toSvgX(t)} y2={PAD.top + PLOT_H}
              stroke="#f3f4f6" strokeWidth={1} />
          ))}
          {yTicks.map((t, i) => (
            <line key={i} x1={PAD.left} y1={toSvgY(t)} x2={PAD.left + PLOT_W} y2={toSvgY(t)}
              stroke="#f3f4f6" strokeWidth={1} />
          ))}

          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT_H} stroke="#e5e7eb" strokeWidth={1} />
          <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={PAD.left + PLOT_W} y2={PAD.top + PLOT_H} stroke="#e5e7eb" strokeWidth={1} />

          {/* X-axis labels */}
          {xTicks.map((t) => (
            <text key={t} x={toSvgX(t)} y={PAD.top + PLOT_H + 16} textAnchor="middle" fontSize={10} fill="#9ca3af">
              {t === 0 ? "" : `n=${t}`}
            </text>
          ))}

          {/* Y-axis labels */}
          <text x={PAD.left - 6} y={toSvgY(N_MAX * N_MAX)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#9ca3af">n²</text>
          <text x={PAD.left - 6} y={toSvgY(N_MAX)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#9ca3af">n</text>
          <text x={PAD.left - 6} y={toSvgY(0)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#9ca3af">0</text>
          <text x={PAD.left - 4} y={PAD.top + PLOT_H / 2} textAnchor="end" dominantBaseline="middle" fontSize={8} fill="#9ca3af" transform={`rotate(-90, ${PAD.left - 4}, ${PAD.top + PLOT_H / 2})`}>operations</text>

          {/* Curves */}
          {CURVES.filter((c) => active.has(c.key)).map((c) => {
            const pts = ns.map((n) => ({ x: toSvgX(n), y: toSvgY(c.fn(n)) }));
            return (
              <path
                key={c.key}
                d={polyline(pts)}
                fill="none"
                stroke={c.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {/* Hover crosshair */}
          {hovered !== null && (
            <>
              <line
                x1={toSvgX(hovered)} y1={PAD.top}
                x2={toSvgX(hovered)} y2={PAD.top + PLOT_H}
                stroke="#6b7280" strokeWidth={1} strokeDasharray="3,2"
              />
              {CURVES.filter((c) => active.has(c.key)).map((c) => {
                const v = c.fn(hovered);
                if (v > yMax) return null;
                return (
                  <circle
                    key={c.key}
                    cx={toSvgX(hovered)}
                    cy={toSvgY(v)}
                    r={4}
                    fill={c.color}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                );
              })}
            </>
          )}

          {/* Axis labels */}
          <text x={PAD.left + PLOT_W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#9ca3af">
            Input size (n)
          </text>
        </svg>
      </div>

      {/* Hover values */}
      {hovered !== null && hovered > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {CURVES.filter((c) => active.has(c.key)).map((c) => {
            const v = c.fn(hovered);
            return (
              <div key={c.key} className="text-center">
                <p className="text-xs font-bold" style={{ color: c.color }}>{c.label}</p>
                <p className="text-sm font-mono font-black text-gray-700">{Math.round(v)}</p>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        Toggle complexity classes. Hover the chart to compare exact operation counts at any input size. Notice how quickly O(n²) separates from the rest - even at n=32.
      </p>
    </div>
  );
}
