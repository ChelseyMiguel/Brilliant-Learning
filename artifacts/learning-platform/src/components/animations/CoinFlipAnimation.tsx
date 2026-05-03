import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Flip {
  id: number;
  result: "H" | "T";
}

export default function CoinFlipAnimation() {
  const [flips, setFlips] = useState<Flip[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);

  const flip = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      const result: "H" | "T" = Math.random() > 0.5 ? "H" : "T";
      setFlips(prev => [...prev.slice(-11), { id: Date.now(), result }]);
      setIsFlipping(false);
    }, 400);
  }, [isFlipping]);

  const reset = () => { setFlips([]); setAutoRunning(false); };

  useEffect(() => {
    if (!autoRunning) return;
    const id = setInterval(() => flip(), 600);
    return () => clearInterval(id);
  }, [autoRunning, flip]);

  const heads = flips.filter(f => f.result === "H").length;
  const tails = flips.filter(f => f.result === "T").length;
  const total = flips.length;

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coin Flip Simulator</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-emerald-600 font-bold">H:{heads}</span>
          <span>·</span>
          <span className="text-rose-500 font-bold">T:{tails}</span>
          {total > 0 && <span>· {total} flips</span>}
        </div>
      </div>

      {/* Sequence display */}
      <div className="flex items-center gap-1.5 min-h-[44px] mb-4 flex-wrap">
        <AnimatePresence>
          {flips.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0 ${
                f.result === "H" ? "bg-emerald-500" : "bg-slate-400"
              } ${i === flips.length - 1 ? "ring-2 ring-offset-1 ring-primary" : ""}`}
            >
              {f.result}
            </motion.div>
          ))}
          {isFlipping && (
            <motion.div
              key="spinning"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotateY: [0, 180, 360, 540] }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0"
            >
              ?
            </motion.div>
          )}
          {flips.length === 0 && !isFlipping && (
            <p className="text-sm text-slate-400 italic">Click "Flip" to start...</p>
          )}
        </AnimatePresence>
      </div>

      {/* Probability bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex rounded-full overflow-hidden h-2 bg-slate-200">
            <motion.div
              animate={{ width: `${(heads / total) * 100}%` }}
              className="bg-emerald-500 h-full"
              transition={{ type: "spring", damping: 20 }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-center">
            Heads: {total > 0 ? ((heads / total) * 100).toFixed(0) : 0}% · Tails: {total > 0 ? ((tails / total) * 100).toFixed(0) : 0}%
            {total >= 10 && " — notice how it converges toward 50%"}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={flip}
          disabled={isFlipping || autoRunning}
          className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          Flip
        </button>
        <button
          onClick={() => setAutoRunning(r => !r)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            autoRunning ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {autoRunning ? "Stop" : "Auto"}
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
