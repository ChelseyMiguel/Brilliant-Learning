import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "pick" | "reveal" | "result";

export default function MontyHallAnimation() {
  const [carDoor, setCarDoor] = useState(Math.floor(Math.random() * 3));
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [finalChoice, setFinalChoice] = useState<number | null>(null);
  const [wins, setWins] = useState({ switch: 0, stay: 0 });
  const [trials, setTrials] = useState({ switch: 0, stay: 0 });

  const pickDoor = (d: number) => {
    if (phase !== "pick") return;
    setPicked(d);
    // Host reveals a goat door (not picked, not the car)
    const toReveal = [0, 1, 2].find(i => i !== d && i !== carDoor)!;
    setRevealed(toReveal);
    setPhase("reveal");
  };

  const stay = () => {
    const win = picked === carDoor;
    setFinalChoice(picked);
    setWins(w => ({ ...w, stay: w.stay + (win ? 1 : 0) }));
    setTrials(t => ({ ...t, stay: t.stay + 1 }));
    setPhase("result");
  };

  const switchDoor = () => {
    const newPick = [0, 1, 2].find(i => i !== picked && i !== revealed)!;
    const win = newPick === carDoor;
    setFinalChoice(newPick);
    setWins(w => ({ ...w, switch: w.switch + (win ? 1 : 0) }));
    setTrials(t => ({ ...t, switch: t.switch + 1 }));
    setPhase("result");
  };

  const reset = () => {
    setCarDoor(Math.floor(Math.random() * 3));
    setPicked(null);
    setRevealed(null);
    setFinalChoice(null);
    setPhase("pick");
  };

  const didWin = finalChoice === carDoor;

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monty Hall Simulator</p>
        {(trials.stay > 0 || trials.switch > 0) && (
          <div className="text-xs text-slate-500 flex gap-3">
            <span>Stay: <strong className="text-rose-500">{trials.stay > 0 ? Math.round(wins.stay / trials.stay * 100) : 0}%</strong></span>
            <span>Switch: <strong className="text-emerald-600">{trials.switch > 0 ? Math.round(wins.switch / trials.switch * 100) : 0}%</strong></span>
          </div>
        )}
      </div>

      {/* Doors */}
      <div className="flex gap-3 justify-center mb-5">
        {[0, 1, 2].map(i => {
          const isRevealed = revealed === i && phase !== "pick";
          const isFinal = finalChoice === i;
          const isOpen = phase === "result" || isRevealed;

          return (
            <motion.div
              key={i}
              onClick={() => pickDoor(i)}
              whileHover={phase === "pick" ? { scale: 1.05 } : {}}
              whileTap={phase === "pick" ? { scale: 0.95 } : {}}
              className={`relative w-20 h-28 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center transition-colors ${
                phase === "pick" ? "hover:border-primary/60 border-slate-300 bg-white" :
                picked === i ? "border-primary bg-primary/5" :
                revealed === i ? "border-slate-200 bg-slate-100 opacity-60" :
                "border-slate-300 bg-white"
              } ${isFinal ? "ring-2 ring-offset-1 ring-primary" : ""}`}
              animate={isRevealed ? { rotateY: [0, 5, -5, 0] } : {}}
            >
              <div className="text-2xl mb-1">
                {isOpen ? (isRevealed || phase === "result" ? (i === carDoor ? "🚗" : "🐐") : (i === carDoor ? "🚗" : "🐐")) : "🚪"}
              </div>
              <span className="text-xs font-bold text-slate-400">Door {i + 1}</span>
              {picked === i && phase !== "result" && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  Picked
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Phase UI */}
      <AnimatePresence mode="wait">
        {phase === "pick" && (
          <motion.p key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-sm text-center text-slate-600 mb-3">
            Pick a door - one hides a car, two hide goats.
          </motion.p>
        )}
        {phase === "reveal" && (
          <motion.div key="reveal" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-3">
            <p className="text-sm text-center text-slate-600">
              The host revealed a goat behind Door {revealed! + 1}. Switch or stay?
            </p>
            <div className="flex gap-3">
              <button onClick={stay} className="flex-1 py-2 rounded-xl bg-rose-100 text-rose-700 text-sm font-semibold hover:bg-rose-200 transition-colors">
                Stay with Door {picked! + 1}
              </button>
              <button onClick={switchDoor} className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-semibold hover:bg-emerald-200 transition-colors">
                Switch doors
              </button>
            </div>
          </motion.div>
        )}
        {phase === "result" && (
          <motion.div key="result" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className={`text-sm text-center font-semibold ${didWin ? "text-emerald-600" : "text-rose-500"}`}>
              {didWin ? "You won the car!" : "You got a goat."} Car was behind Door {carDoor + 1}.
            </p>
            <button onClick={reset} className="w-full py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Play again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
