import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

const EV = 3.5; // true expected value of a fair die
const MAX_ROLLS = 200;
const CHART_W = 420;
const CHART_H = 140;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

const FACE_DOTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export default function ExpectedValueLab() {
  const [rolls, setRolls] = useState<number[]>([]);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const total = rolls.length;
  const sum = rolls.reduce((s, r) => s + r, 0);
  const runningAvg = total === 0 ? null : sum / total;

  // Running average series for chart
  const series: number[] = [];
  let acc = 0;
  for (let i = 0; i < rolls.length; i++) {
    acc += rolls[i];
    series.push(acc / (i + 1));
  }

  const doRoll = useCallback((n: number = 1) => {
    if (rolls.length >= MAX_ROLLS) return;
    const newRolls: number[] = [];
    for (let i = 0; i < n; i++) newRolls.push(rollDie());
    const last = newRolls[newRolls.length - 1];
    setLastRoll(last);
    setRolls((prev) => [...prev, ...newRolls].slice(0, MAX_ROLLS));
  }, [rolls.length]);

  const reset = () => {
    setRolls([]);
    setLastRoll(null);
    setRolling(false);
  };

  // Chart helpers
  function toX(i: number) {
    return PAD.left + (i / Math.max(series.length - 1, 1)) * PLOT_W;
  }
  function toY(v: number) {
    // y range 1..6
    return PAD.top + PLOT_H - ((v - 1) / 5) * PLOT_H;
  }

  const linePath = series
    .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`)
    .join(" ");

  // EV line y
  const evY = toY(EV);

  // Frequency counts
  const freq: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const r of rolls) freq[r]++;

  return (
    <div className="flex flex-col gap-5 p-5 select-none">
      {/* Die + stats */}
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {/* Die face */}
        <div className="flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={lastRoll ?? "empty"}
              initial={{ rotateY: 90, scale: 0.8 }}
              animate={{ rotateY: 0, scale: 1 }}
              exit={{ rotateY: -90, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="w-16 h-16 bg-white rounded-xl border-2 border-gray-200 shadow-md relative flex-shrink-0"
              style={{ perspective: 200 }}
            >
              {lastRoll !== null &&
                FACE_DOTS[lastRoll].map(([fx, fy], i) => (
                  <div
                    key={i}
                    className="absolute w-2.5 h-2.5 bg-gray-800 rounded-full"
                    style={{
                      left: `calc(${fx * 100}% - 5px)`,
                      top: `calc(${fy * 100}% - 5px)`,
                    }}
                  />
                ))}
              {lastRoll === null && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-2xl">?</div>
              )}
            </motion.div>
          </AnimatePresence>
          <p className="text-xs text-gray-400">{total} roll{total !== 1 ? "s" : ""}</p>
        </div>

        {/* Running average */}
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Running avg</p>
          <motion.p
            className="text-3xl font-black"
            style={{ color: runningAvg !== null && Math.abs(runningAvg - EV) < 0.15 ? "#22c55e" : "#4f46e5" }}
            key={runningAvg?.toFixed(2)}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            {runningAvg !== null ? runningAvg.toFixed(2) : " - "}
          </motion.p>
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">True EV</p>
          <p className="text-3xl font-black text-gray-300">3.50</p>
        </div>
      </div>

      {/* Convergence chart */}
      {series.length > 1 && (
        <div className="flex justify-center">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            width={CHART_W}
            height={CHART_H}
            style={{ maxWidth: "100%" }}
          >
            {/* EV reference line */}
            <line
              x1={PAD.left} y1={evY} x2={PAD.left + PLOT_W} y2={evY}
              stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7}
            />
            <text x={PAD.left + PLOT_W + 3} y={evY} dominantBaseline="middle" fontSize={9} fill="#22c55e">EV=3.5</text>

            {/* Axes */}
            <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT_H} stroke="#e5e7eb" strokeWidth={1} />
            <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={PAD.left + PLOT_W} y2={PAD.top + PLOT_H} stroke="#e5e7eb" strokeWidth={1} />

            {/* Y ticks */}
            {[1, 2, 3, 4, 5, 6].map((v) => (
              <text key={v} x={PAD.left - 6} y={toY(v)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#d1d5db">{v}</text>
            ))}

            {/* X ticks */}
            {[10, 50, 100, 150, 200].filter((t) => t <= series.length).map((t) => (
              <text key={t} x={toX(t - 1)} y={PAD.top + PLOT_H + 14} textAnchor="middle" fontSize={9} fill="#d1d5db">{t}</text>
            ))}

            {/* Running average line */}
            <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth={2} strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Frequency bars */}
      {total > 0 && (
        <div className="flex gap-1.5 justify-center">
          {[1, 2, 3, 4, 5, 6].map((face) => {
            const pct = freq[face] / total;
            const theoretical = 1 / 6;
            return (
              <div key={face} className="flex flex-col items-center gap-1">
                <div className="relative w-8 h-16 bg-gray-100 rounded-md overflow-hidden">
                  {/* Theoretical */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-indigo-100 rounded-md"
                    style={{ height: `${theoretical * 100}%` }}
                  />
                  {/* Actual */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-[#4f46e5] rounded-md opacity-80"
                    animate={{ height: `${pct * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-600">{face}</span>
                <span className="text-xs text-gray-400">{freq[face]}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => doRoll(1)}
          disabled={total >= MAX_ROLLS}
          className="h-10 px-6 rounded-full bg-[#4f46e5] text-white font-bold text-sm disabled:opacity-40"
        >
          Roll 1
        </button>
        <button
          onClick={() => doRoll(10)}
          disabled={total >= MAX_ROLLS}
          className="h-10 px-6 rounded-full bg-gray-100 text-gray-700 font-bold text-sm disabled:opacity-40 hover:bg-gray-200"
        >
          Roll 10
        </button>
        <button
          onClick={() => doRoll(50)}
          disabled={total >= MAX_ROLLS}
          className="h-10 px-5 rounded-full bg-gray-100 text-gray-700 font-bold text-sm disabled:opacity-40 hover:bg-gray-200"
        >
          Roll 50
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        Watch the running average wobble early, then lock in near 3.5. The light bars show the theoretical 1/6 chance for each face. Expected value is the long-run average - not any single outcome.
      </p>
    </div>
  );
}
