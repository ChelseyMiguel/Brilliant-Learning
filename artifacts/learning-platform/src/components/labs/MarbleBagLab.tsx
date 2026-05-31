import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

const COLORS = {
  red:    { bg: "#fca5a5", border: "#ef4444", text: "#dc2626", label: "Red" },
  blue:   { bg: "#93c5fd", border: "#3b82f6", text: "#2563eb", label: "Blue" },
  green:  { bg: "#86efac", border: "#22c55e", text: "#16a34a", label: "Green" },
};
type Color = keyof typeof COLORS;

const HISTORY_MAX = 40;

export default function MarbleBagLab() {
  const [counts, setCounts] = useState({ red: 3, blue: 7, green: 0 });
  const [draws, setDraws] = useState<Color[]>([]);

  const total = counts.red + counts.blue + counts.green;

  const draw = useCallback(() => {
    if (total === 0) return;
    const r = Math.random() * total;
    let acc = 0;
    for (const c of ["red", "blue", "green"] as Color[]) {
      acc += counts[c];
      if (r < acc) {
        setDraws((prev) => [c, ...prev].slice(0, HISTORY_MAX));
        return;
      }
    }
  }, [counts, total]);

  const drawTen = useCallback(() => {
    for (let i = 0; i < 10; i++) draw();
  }, [draw]);

  const reset = () => setDraws([]);

  const observed = (c: Color) => draws.filter((d) => d === c).length;
  const freq = (c: Color) => (draws.length === 0 ? 0 : observed(c) / draws.length);

  const marbles: Color[] = [];
  for (const c of ["red", "blue", "green"] as Color[]) {
    for (let i = 0; i < counts[c]; i++) marbles.push(c);
  }
  // shuffle for display variety
  const displayMarbles = [...marbles].sort(() => 0);

  return (
    <div className="flex flex-col gap-6 p-5 select-none">
      {/* Bag visualization */}
      <div className="flex flex-col items-center gap-3">
        {/* Bag outline */}
        <div className="relative w-52 h-36 rounded-b-[80px] rounded-t-2xl border-2 border-gray-200 bg-gray-50 flex flex-wrap gap-2 items-center justify-center p-4 overflow-hidden">
          {displayMarbles.map((c, i) => (
            <motion.div
              key={`${c}-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02, type: "spring", stiffness: 400, damping: 20 }}
              className="w-7 h-7 rounded-full border-2 flex-shrink-0"
              style={{ backgroundColor: COLORS[c].bg, borderColor: COLORS[c].border }}
            />
          ))}
          {total === 0 && (
            <p className="text-xs text-gray-400 text-center">Empty bag</p>
          )}
        </div>
        <p className="text-xs text-gray-400">{total} marble{total !== 1 ? "s" : ""} total</p>
      </div>

      {/* Sliders */}
      <div className="space-y-3 max-w-xs mx-auto w-full">
        {(["red", "blue", "green"] as Color[]).map((c) => (
          <div key={c} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border-2 flex-shrink-0"
              style={{ backgroundColor: COLORS[c].bg, borderColor: COLORS[c].border }}
            />
            <span className="text-xs font-semibold w-10" style={{ color: COLORS[c].text }}>
              {COLORS[c].label}
            </span>
            <input
              type="range"
              min={0}
              max={10}
              value={counts[c]}
              onChange={(e) => {
                setCounts((prev) => ({ ...prev, [c]: +e.target.value }));
                setDraws([]);
              }}
              className="flex-1"
              style={{ accentColor: COLORS[c].border }}
            />
            <span className="text-xs font-bold w-4 text-right" style={{ color: COLORS[c].text }}>
              {counts[c]}
            </span>
          </div>
        ))}
      </div>

      {/* Probability formulas */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(["red", "blue", "green"] as Color[]).filter((c) => counts[c] > 0).map((c) => (
          <div
            key={c}
            className="px-3 py-2 rounded-xl border text-xs font-mono font-semibold"
            style={{ backgroundColor: COLORS[c].bg + "60", borderColor: COLORS[c].border + "80", color: COLORS[c].text }}
          >
            P({COLORS[c].label.toLowerCase()}) = {counts[c]}/{total} = {(counts[c] / total).toFixed(2)}
          </div>
        ))}
      </div>

      {/* Draw controls */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={draw}
          disabled={total === 0}
          className="h-10 px-6 rounded-full bg-[#4f46e5] text-white font-bold text-sm disabled:opacity-40"
        >
          Draw 1
        </button>
        <button
          onClick={drawTen}
          disabled={total === 0}
          className="h-10 px-6 rounded-full bg-gray-100 text-gray-700 font-bold text-sm disabled:opacity-40 hover:bg-gray-200"
        >
          Draw 10
        </button>
      </div>

      {/* Observed vs theoretical */}
      {draws.length > 0 && (
        <div className="space-y-3 max-w-xs mx-auto w-full">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">
            After {draws.length} draws
          </p>
          {(["red", "blue", "green"] as Color[]).filter((c) => counts[c] > 0).map((c) => {
            const theory = counts[c] / total;
            const actual = freq(c);
            return (
              <div key={c}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold" style={{ color: COLORS[c].text }}>
                    {COLORS[c].label} - {observed(c)} draws
                  </span>
                  <span className="font-mono text-gray-500">
                    {(actual * 100).toFixed(0)}% vs {(theory * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  {/* Theoretical */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full opacity-30"
                    style={{ width: `${theory * 100}%`, backgroundColor: COLORS[c].border }}
                  />
                  {/* Observed */}
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    animate={{ width: `${actual * 100}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ backgroundColor: COLORS[c].border }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History strip */}
      {draws.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
          {draws.slice(0, 30).map((c, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: COLORS[c].bg, borderColor: COLORS[c].border }}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        Draw 10 or 20 times. Notice how the observed frequency jumps around before settling near the theoretical probability. That gap is sampling variation.
      </p>
    </div>
  );
}
