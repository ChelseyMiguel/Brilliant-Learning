import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GRID = 10;
const TOTAL = GRID * GRID;
const RED_SQUARES = new Set<number>([
  2, 3, 4, 12, 13, 14, 22, 23, 24,
  31, 32, 33, 41, 42, 43,
  60, 61, 70, 71, 80, 81,
  55, 56, 57, 65, 66, 67, 75, 76, 77,
]);

interface Drop {
  id: number;
  square: number;
  isRed: boolean;
}

export default function ProbabilityGridAnimation() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [activeDrop, setActiveDrop] = useState<number | null>(null);

  const dropPoint = useCallback(() => {
    const square = Math.floor(Math.random() * TOTAL);
    const isRed = RED_SQUARES.has(square);
    const id = Date.now();
    setActiveDrop(square);
    setTimeout(() => {
      setDrops(prev => [...prev.slice(-49), { id, square, isRed }]);
      setTimeout(() => setActiveDrop(null), 300);
    }, 150);
  }, []);

  const reset = () => { setDrops([]); setActiveDrop(null); };

  const reds = drops.filter(d => d.isRed).length;
  const total = drops.length;
  const pct = total > 0 ? ((reds / total) * 100).toFixed(0) : "–";
  const theoretical = ((RED_SQUARES.size / TOTAL) * 100).toFixed(0);

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Probability Grid</p>
        <div className="text-xs text-slate-500">
          <span className="text-rose-500 font-bold">{RED_SQUARES.size}</span>
          <span> red / </span>
          <span className="font-bold">{TOTAL}</span>
          <span> total = </span>
          <span className="font-bold text-slate-700">{theoretical}%</span>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-0.5 mb-4 mx-auto"
        style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, maxWidth: "240px" }}
      >
        {Array.from({ length: TOTAL }, (_, i) => {
          const isRed = RED_SQUARES.has(i);
          const isActive = activeDrop === i;
          const hasDropped = drops.some(d => d.square === i);

          return (
            <motion.div
              key={i}
              animate={isActive ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`aspect-square rounded-sm transition-colors ${
                isActive
                  ? "bg-amber-400"
                  : isRed
                  ? hasDropped
                    ? "bg-rose-500"
                    : "bg-rose-200"
                  : hasDropped
                  ? "bg-primary/50"
                  : "bg-slate-200"
              }`}
            />
          );
        })}
      </div>

      {/* Stats */}
      {total > 0 && (
        <div className="mb-3 text-center">
          <p className="text-xs text-slate-600">
            Drops: <strong>{total}</strong> · Red hits: <strong className="text-rose-500">{reds}</strong> · Empirical: <strong>{pct}%</strong>
            {total >= 20 && ` (theoretical: ${theoretical}%)`}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={dropPoint}
          className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Drop Point
        </button>
        <button
          onClick={() => { for (let i = 0; i < 10; i++) setTimeout(dropPoint, i * 80); }}
          className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
        >
          Drop 10
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
