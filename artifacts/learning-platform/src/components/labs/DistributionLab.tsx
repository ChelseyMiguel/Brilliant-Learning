import { useMemo, useState } from "react";

const W = 560;
const H = 220;
const PAD = { top: 20, right: 20, bottom: 36, left: 36 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const N_SAMPLES = 2000;
const N_BINS = 28;

// Box-Muller transform - deterministic via seed
function seededRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function normalSamples(mu: number, sigma: number, n: number): number[] {
  const rng = seededRNG(42);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = Math.max(rng(), 1e-10);
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    out.push(mu + sigma * z);
  }
  return out;
}

function pdfNormal(x: number, mu: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

export default function DistributionLab() {
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);

  const { bins, pdfPoints, xMin, xMax, yMax, meanX, sd1L, sd1R, sd2L, sd2R } = useMemo(() => {
    const samples = normalSamples(mu, sigma, N_SAMPLES);
    const xMin = mu - 4 * sigma;
    const xMax = mu + 4 * sigma;
    const binW = (xMax - xMin) / N_BINS;

    // Histogram bins
    const counts = new Array(N_BINS).fill(0);
    for (const s of samples) {
      const b = Math.floor((s - xMin) / binW);
      if (b >= 0 && b < N_BINS) counts[b]++;
    }
    const density = counts.map((c) => c / (N_SAMPLES * binW));
    const bins = counts.map((_, i) => ({
      x: xMin + i * binW,
      w: binW,
      density: density[i],
    }));

    // PDF curve points (100 points)
    const pdfPoints: { x: number; y: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = xMin + (i / 100) * (xMax - xMin);
      pdfPoints.push({ x, y: pdfNormal(x, mu, sigma) });
    }

    const maxDensity = Math.max(...density, ...pdfPoints.map((p) => p.y));
    const yMax = maxDensity * 1.1;

    // σ lines
    return {
      bins,
      pdfPoints,
      xMin,
      xMax,
      yMax,
      meanX: mu,
      sd1L: mu - sigma,
      sd1R: mu + sigma,
      sd2L: mu - 2 * sigma,
      sd2R: mu + 2 * sigma,
    };
  }, [mu, sigma]);

  // Coordinate transforms
  const toSvgX = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * PLOT_W;
  const toSvgY = (y: number) => PAD.top + PLOT_H - (y / yMax) * PLOT_H;

  // PDF path
  const pdfPath = pdfPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.x).toFixed(2)},${toSvgY(p.y).toFixed(2)}`)
    .join(" ");

  // X-axis ticks (μ ± 0, 1σ, 2σ, 3σ)
  const ticks = [-3, -2, -1, 0, 1, 2, 3].map((k) => mu + k * sigma);

  const pct68 = 68.3;
  const pct95 = 95.4;

  return (
    <div className="flex flex-col gap-6 p-5 select-none">
      {/* SVG chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minHeight: 140, maxHeight: 240 }}
        >
          {/* σ bands */}
          {/* ±2σ band */}
          <rect
            x={toSvgX(sd2L)}
            y={PAD.top}
            width={toSvgX(sd2R) - toSvgX(sd2L)}
            height={PLOT_H}
            fill="#e0e7ff"
            opacity={0.5}
          />
          {/* ±1σ band */}
          <rect
            x={toSvgX(sd1L)}
            y={PAD.top}
            width={toSvgX(sd1R) - toSvgX(sd1L)}
            height={PLOT_H}
            fill="#c7d2fe"
            opacity={0.5}
          />

          {/* Histogram bars */}
          {bins.map((bin, i) => {
            const bx = toSvgX(bin.x);
            const bw = Math.max(toSvgX(bin.x + bin.w) - bx - 1, 1);
            const bh = (bin.density / yMax) * PLOT_H;
            return (
              <rect
                key={i}
                x={bx}
                y={PAD.top + PLOT_H - bh}
                width={bw}
                height={bh}
                fill="#818cf8"
                opacity={0.65}
                rx={1}
              />
            );
          })}

          {/* PDF curve */}
          <path
            d={pdfPath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {/* Mean line */}
          <line
            x1={toSvgX(meanX)}
            y1={PAD.top}
            x2={toSvgX(meanX)}
            y2={PAD.top + PLOT_H}
            stroke="#4f46e5"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />

          {/* X axis */}
          <line
            x1={PAD.left}
            y1={PAD.top + PLOT_H}
            x2={PAD.left + PLOT_W}
            y2={PAD.top + PLOT_H}
            stroke="#e5e7eb"
            strokeWidth={1}
          />

          {/* Ticks */}
          {ticks.map((t, i) => {
            const tx = toSvgX(t);
            if (tx < PAD.left || tx > PAD.left + PLOT_W) return null;
            const label = t === mu ? "μ" : `${t === mu - sigma ? "μ−σ" : t === mu + sigma ? "μ+σ" : t === mu - 2 * sigma ? "μ−2σ" : t === mu + 2 * sigma ? "μ+2σ" : ""}`;
            return (
              <g key={i}>
                <line x1={tx} y1={PAD.top + PLOT_H} x2={tx} y2={PAD.top + PLOT_H + 5} stroke="#9ca3af" strokeWidth={1} />
                <text x={tx} y={PAD.top + PLOT_H + 16} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="ui-monospace, monospace">
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* σ band labels */}
      <div className="flex justify-center gap-5 text-xs flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#c7d2fe] inline-block" />
          ±1σ ≈ 68%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#e0e7ff] inline-block" />
          ±2σ ≈ 95%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4f46e5] inline-block" />
          PDF curve
        </span>
      </div>

      {/* Sliders */}
      <div className="space-y-4 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-[#4f46e5] w-10 font-mono">μ</span>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.1}
            value={mu}
            onChange={(e) => setMu(parseFloat(e.target.value))}
            className="flex-1 accent-[#4f46e5]"
          />
          <span className="text-sm font-mono font-bold text-[#4f46e5] w-10 text-right">
            {mu.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-violet-500 w-10 font-mono">σ</span>
          <input
            type="range"
            min={0.3}
            max={2.5}
            step={0.05}
            value={sigma}
            onChange={(e) => setSigma(parseFloat(e.target.value))}
            className="flex-1 accent-violet-500"
          />
          <span className="text-sm font-mono font-bold text-violet-500 w-10 text-right">
            {sigma.toFixed(2)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        μ shifts the center. σ controls the spread - larger σ means more variance. Notice how the ±1σ band always covers ~68% of the area no matter what you set.
      </p>
    </div>
  );
}
