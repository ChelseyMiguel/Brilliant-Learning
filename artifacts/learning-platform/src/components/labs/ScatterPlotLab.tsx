import { useState, useCallback, useRef } from "react";
import { Trash2 } from "lucide-react";

const W = 340;
const H = 300;
const PAD = 36;
const PLOT_W = W - PAD * 2;
const PLOT_H = H - PAD * 2;
const DOMAIN = 10; // 0..10 in both axes

type Point = { x: number; y: number };

const PRESETS: Record<string, Point[]> = {
  "Strong positive": [
    { x: 1.2, y: 1.5 }, { x: 2, y: 2.4 }, { x: 2.8, y: 3.1 }, { x: 3.5, y: 3.8 },
    { x: 4, y: 4.5 }, { x: 5, y: 5.2 }, { x: 5.8, y: 6 }, { x: 6.5, y: 6.8 },
    { x: 7.2, y: 7.3 }, { x: 8, y: 8.1 }, { x: 8.8, y: 8.9 }, { x: 9.5, y: 9.4 },
  ],
  "No correlation": [
    { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 8 }, { x: 4, y: 2 }, { x: 5, y: 6 },
    { x: 6, y: 1 }, { x: 7, y: 9 }, { x: 8, y: 4 }, { x: 9, y: 5 }, { x: 2.5, y: 5.5 },
    { x: 7.5, y: 2.5 }, { x: 5, y: 8.5 },
  ],
  "Strong negative": [
    { x: 1, y: 9.2 }, { x: 2, y: 8.1 }, { x: 2.8, y: 7.2 }, { x: 4, y: 6.4 },
    { x: 5, y: 5.5 }, { x: 5.8, y: 4.6 }, { x: 6.8, y: 3.8 }, { x: 7.5, y: 3 },
    { x: 8.3, y: 2.2 }, { x: 9, y: 1.5 },
  ],
};

function pearson(pts: Point[]): number | null {
  if (pts.length < 2) return null;
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const num = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const dx = Math.sqrt(pts.reduce((s, p) => s + (p.x - mx) ** 2, 0));
  const dy = Math.sqrt(pts.reduce((s, p) => s + (p.y - my) ** 2, 0));
  if (dx < 1e-9 || dy < 1e-9) return null;
  return num / (dx * dy);
}

function regression(pts: Point[]): { m: number; b: number } | null {
  if (pts.length < 2) return null;
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const dxSq = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  if (dxSq < 1e-9) return null;
  const m = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / dxSq;
  const b = my - m * mx;
  return { m, b };
}

function rLabel(r: number): { text: string; color: string } {
  const abs = Math.abs(r);
  const dir = r > 0 ? "positive" : "negative";
  if (abs >= 0.9) return { text: `Strong ${dir}`, color: r > 0 ? "#16a34a" : "#dc2626" };
  if (abs >= 0.6) return { text: `Moderate ${dir}`, color: r > 0 ? "#65a30d" : "#ea580c" };
  if (abs >= 0.3) return { text: `Weak ${dir}`, color: "#d97706" };
  return { text: "No correlation", color: "#6b7280" };
}

function toSvgX(x: number) { return PAD + (x / DOMAIN) * PLOT_W; }
function toSvgY(y: number) { return PAD + PLOT_H - (y / DOMAIN) * PLOT_H; }
function fromSvgX(sx: number) { return Math.max(0, Math.min(DOMAIN, ((sx - PAD) / PLOT_W) * DOMAIN)); }
function fromSvgY(sy: number) { return Math.max(0, Math.min(DOMAIN, ((PAD + PLOT_H - sy) / PLOT_H) * DOMAIN)); }

export default function ScatterPlotLab() {
  const [points, setPoints] = useState<Point[]>(PRESETS["Strong positive"]);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = svgRef.current!.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const sx = (e.clientX - rect.left) * scaleX;
      const sy = (e.clientY - rect.top) * scaleY;
      // Only add if click is inside the plot area
      if (sx < PAD || sx > PAD + PLOT_W || sy < PAD || sy > PAD + PLOT_H) return;
      const x = parseFloat(fromSvgX(sx).toFixed(2));
      const y = parseFloat(fromSvgY(sy).toFixed(2));
      setPoints((prev) => [...prev, { x, y }]);
    },
    []
  );

  const removePoint = (i: number) => setPoints((pts) => pts.filter((_, j) => j !== i));

  const r = pearson(points);
  const reg = regression(points);
  const label = r !== null ? rLabel(r) : null;

  // Regression line endpoints (x = 0..DOMAIN)
  let regLine: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (reg) {
    const y0 = reg.m * 0 + reg.b;
    const y10 = reg.m * DOMAIN + reg.b;
    regLine = { x1: toSvgX(0), y1: toSvgY(y0), x2: toSvgX(DOMAIN), y2: toSvgY(y10) };
  }

  // Grid lines
  const gridTicks = [0, 2, 4, 6, 8, 10];

  return (
    <div className="flex flex-col gap-5 p-5 select-none">
      {/* Preset buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => setPoints(PRESETS[name])}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              JSON.stringify(points) === JSON.stringify(PRESETS[name])
                ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#4f46e5]/40"
            }`}
          >
            {name}
          </button>
        ))}
        <button
          onClick={() => setPoints([])}
          className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-gray-200 bg-white text-gray-600 hover:border-rose-300 hover:text-rose-500 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* SVG */}
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="rounded-2xl border border-gray-100 bg-gray-50 cursor-crosshair"
          onClick={handleClick}
          style={{ maxWidth: "100%" }}
        >
          {/* Grid */}
          {gridTicks.map((t) => (
            <g key={t}>
              <line
                x1={toSvgX(t)} y1={PAD} x2={toSvgX(t)} y2={PAD + PLOT_H}
                stroke="#f3f4f6" strokeWidth={1}
              />
              <line
                x1={PAD} y1={toSvgY(t)} x2={PAD + PLOT_W} y2={toSvgY(t)}
                stroke="#f3f4f6" strokeWidth={1}
              />
            </g>
          ))}

          {/* Axes */}
          <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + PLOT_H} stroke="#e5e7eb" strokeWidth={1} />
          <line x1={PAD} y1={PAD + PLOT_H} x2={PAD + PLOT_W} y2={PAD + PLOT_H} stroke="#e5e7eb" strokeWidth={1} />

          {/* Axis labels */}
          {gridTicks.filter((t) => t > 0).map((t) => (
            <g key={t}>
              <text x={toSvgX(t)} y={PAD + PLOT_H + 14} textAnchor="middle" fontSize={9} fill="#d1d5db">
                {t}
              </text>
              <text x={PAD - 8} y={toSvgY(t)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#d1d5db">
                {t}
              </text>
            </g>
          ))}

          {/* Regression line */}
          {regLine && (
            <line
              x1={regLine.x1} y1={regLine.y1} x2={regLine.x2} y2={regLine.y2}
              stroke="#4f46e5"
              strokeWidth={1.8}
              strokeDasharray="5,3"
              opacity={0.7}
            />
          )}

          {/* Points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={toSvgX(pt.x)}
              cy={toSvgY(pt.y)}
              r={6}
              fill="#6366f1"
              stroke="white"
              strokeWidth={1.5}
              opacity={0.85}
              style={{ cursor: "pointer" }}
              onClick={(e) => { e.stopPropagation(); removePoint(i); }}
            />
          ))}
        </svg>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
        {r !== null ? (
          <>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                r (correlation)
              </p>
              <p
                className="text-2xl font-black"
                style={{ color: label?.color }}
              >
                {r.toFixed(3)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                Interpretation
              </p>
              <p className="text-sm font-bold" style={{ color: label?.color }}>
                {label?.text}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Add at least 2 points to see correlation</p>
        )}
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Points</p>
          <p className="text-2xl font-black text-gray-700">{points.length}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        Click inside the chart to add points. Click a point to remove it. Watch r change as you build different patterns. Remember - correlation describes the <em>linear</em> relationship only.
      </p>
    </div>
  );
}
