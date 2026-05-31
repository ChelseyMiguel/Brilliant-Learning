import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Play, Pause } from "lucide-react";

const SIZE = 280;
const CX = SIZE / 2;
const R = SIZE / 2 - 4;
const BATCH = 20; // darts per animation frame when running
const MAX_DARTS = 4000;

type Dart = { x: number; y: number; inside: boolean };

export default function MonteCarloDartboardLab() {
  const [darts, setDarts] = useState<Dart[]>([]);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);

  const throwOne = useCallback((): Dart => {
    const x = Math.random() * 2 - 1; // -1..1
    const y = Math.random() * 2 - 1;
    return { x, y, inside: x * x + y * y <= 1 };
  }, []);

  const step = useCallback(() => {
    setDarts((prev) => {
      if (prev.length >= MAX_DARTS) {
        setRunning(false);
        return prev;
      }
      const batch: Dart[] = [];
      for (let i = 0; i < BATCH; i++) batch.push(throwOne());
      return [...prev, ...batch].slice(-MAX_DARTS);
    });
  }, [throwOne]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    const loop = () => {
      step();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [running, step]);

  const reset = () => {
    setRunning(false);
    setDarts([]);
  };

  const throwManual = () => {
    setDarts((prev) => {
      if (prev.length >= MAX_DARTS) return prev;
      const batch: Dart[] = [];
      const n = prev.length < 10 ? 1 : 10;
      for (let i = 0; i < n; i++) batch.push(throwOne());
      return [...prev, ...batch];
    });
  };

  const inside = darts.filter((d) => d.inside).length;
  const total = darts.length;
  const piEst = total === 0 ? null : (4 * inside) / total;
  const error = piEst !== null ? Math.abs(piEst - Math.PI) : null;

  // Convert dart coords (-1..1) to SVG coords
  function toSvg(v: number) { return CX + v * R; }

  // Show only the last 800 darts visually (older ones become the background density)
  const visibleDarts = darts.slice(-800);

  return (
    <div className="flex flex-col gap-5 p-5 select-none">
      {/* Canvas */}
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          style={{ maxWidth: "100%" }}
          className="rounded-2xl border border-gray-100"
        >
          {/* Background square */}
          <rect x={0} y={0} width={SIZE} height={SIZE} fill="#f8fafc" />

          {/* Circle */}
          <circle cx={CX} cy={CX} r={R} fill="#e0e7ff" stroke="#a5b4fc" strokeWidth={1.5} />

          {/* Darts */}
          {visibleDarts.map((d, i) => (
            <circle
              key={i}
              cx={toSvg(d.x)}
              cy={toSvg(d.y)}
              r={2}
              fill={d.inside ? "#4f46e5" : "#f97316"}
              opacity={0.7}
            />
          ))}

          {/* Labels */}
          <text x={CX} y={SIZE - 6} textAnchor="middle" fontSize={9} fill="#a5b4fc">circle</text>
          <text x={8} y={14} fontSize={9} fill="#fdba74">square</text>
        </svg>
      </div>

      {/* π estimate */}
      <div className="flex gap-6 justify-center items-center flex-wrap">
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">π estimate</p>
          <motion.p
            className="text-3xl font-black text-[#4f46e5]"
            key={piEst?.toFixed(4)}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            {piEst !== null ? piEst.toFixed(4) : " - "}
          </motion.p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">True π</p>
          <p className="text-3xl font-black text-gray-300">{Math.PI.toFixed(4)}</p>
        </div>
        {error !== null && (
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Error</p>
            <p className="text-lg font-black text-gray-500">{error.toFixed(4)}</p>
          </div>
        )}
      </div>

      {/* Formula */}
      <div className="text-center">
        <p className="text-xs font-mono text-gray-400">
          π ≈ 4 × (inside / total) = 4 × {inside} / {total}
          {total > 0 ? ` = ${((4 * inside) / total).toFixed(4)}` : ""}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center items-center">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={throwManual}
          disabled={total >= MAX_DARTS}
          className="h-10 px-5 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          {total < 10 ? "Throw 1" : "Throw 10"}
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={total >= MAX_DARTS}
          className="h-10 px-6 rounded-full bg-[#4f46e5] text-white font-bold text-sm disabled:opacity-40 flex items-center gap-2"
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? "Pause" : "Auto"}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        Each dart lands at a random point. If it falls inside the circle, it's counted. The ratio of inside hits to total hits converges to π/4 - so multiplying by 4 estimates π.
        Try stopping at 100, 500, and 2000 darts to see how the estimate tightens.
      </p>
    </div>
  );
}
