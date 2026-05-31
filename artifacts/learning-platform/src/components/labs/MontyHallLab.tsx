import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Door = 0 | 1 | 2;
type Phase = "pick" | "reveal" | "result";

interface Stats {
  stayWins: number;
  stayTotal: number;
  switchWins: number;
  switchTotal: number;
}

function randomDoor(): Door {
  return (Math.floor(Math.random() * 3)) as Door;
}

function getRevealedDoor(car: Door, pick: Door): Door {
  const candidates = ([0, 1, 2] as Door[]).filter(
    (d) => d !== car && d !== pick
  );
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getSwitchDoor(pick: Door, revealed: Door): Door {
  return ([0, 1, 2] as Door[]).find((d) => d !== pick && d !== revealed)!;
}

export default function MontyHallLab() {
  const [car, setCar] = useState<Door>(randomDoor());
  const [pick, setPick] = useState<Door | null>(null);
  const [revealed, setRevealed] = useState<Door | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [winner, setWinner] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats>({
    stayWins: 0,
    stayTotal: 0,
    switchWins: 0,
    switchTotal: 0,
  });

  const handlePick = (d: Door) => {
    if (phase !== "pick") return;
    setPick(d);
    setRevealed(getRevealedDoor(car, d));
    setPhase("reveal");
  };

  const handleStay = () => {
    const won = pick === car;
    setWinner(won);
    setPhase("result");
    setStats((s) => ({
      ...s,
      stayWins: s.stayWins + (won ? 1 : 0),
      stayTotal: s.stayTotal + 1,
    }));
  };

  const handleSwitch = () => {
    const won = getSwitchDoor(pick!, revealed!) === car;
    setWinner(won);
    setPhase("result");
    setStats((s) => ({
      ...s,
      switchWins: s.switchWins + (won ? 1 : 0),
      switchTotal: s.switchTotal + 1,
    }));
  };

  const reset = () => {
    setCar(randomDoor());
    setPick(null);
    setRevealed(null);
    setPhase("pick");
    setWinner(null);
  };

  const simulate = useCallback(() => {
    let sw = 0, swT = 0, st = 0, stT = 0;
    for (let i = 0; i < 300; i++) {
      const c = randomDoor();
      const p = randomDoor();
      const rev = getRevealedDoor(c, p);
      stT++;
      if (p === c) st++;
      swT++;
      if (getSwitchDoor(p, rev) === c) sw++;
    }
    setStats((s) => ({
      stayWins: s.stayWins + st,
      stayTotal: s.stayTotal + stT,
      switchWins: s.switchWins + sw,
      switchTotal: s.switchTotal + swT,
    }));
  }, []);

  const getDoorContent = (d: Door) => {
    if (phase === "result") return d === car ? "🏆" : "🐐";
    if (phase === "reveal" && d === revealed) return "🐐";
    return "🚪";
  };

  const getDoorLabel = (d: Door) => {
    if (phase === "result") return d === car ? "Car!" : "Goat";
    if (phase === "reveal" && d === revealed) return "Goat";
    return `Door ${d + 1}`;
  };

  const isClickable = (d: Door) =>
    (phase === "pick") ||
    (phase === "reveal" && d !== pick && d !== revealed);

  const total = stats.stayTotal + stats.switchTotal;

  return (
    <div className="flex flex-col gap-8 p-6 items-center select-none">
      {/* Phase label */}
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
        {phase === "pick"
          ? "Pick a door"
          : phase === "reveal"
          ? "Stay or switch?"
          : winner
          ? "You won! 🎉"
          : "Goat. 🐐"}
      </p>

      {/* Doors */}
      <div className="flex gap-5">
        {([0, 1, 2] as Door[]).map((d) => {
          let borderClass = "border-gray-200 bg-white";
          if (phase !== "pick" && d === pick)
            borderClass = "border-[#4f46e5] ring-4 ring-[#4f46e5]/20 bg-white";
          if (phase === "reveal" && d === revealed)
            borderClass = "border-gray-100 bg-gray-50 opacity-60";
          if (phase === "result" && d === car)
            borderClass = "border-emerald-400 ring-4 ring-emerald-100 bg-white";

          return (
            <motion.button
              key={d}
              whileHover={isClickable(d) ? { scale: 1.05, y: -2 } : {}}
              whileTap={isClickable(d) ? { scale: 0.96 } : {}}
              onClick={() => {
                if (phase === "pick") handlePick(d);
                else if (phase === "reveal" && d !== pick && d !== revealed)
                  handleSwitch();
              }}
              disabled={phase === "result" || (phase === "reveal" && (d === pick || d === revealed))}
              className={`flex flex-col items-center justify-center w-24 h-32 rounded-2xl border-2 transition-all font-bold text-4xl disabled:cursor-default ${borderClass} ${
                isClickable(d) ? "cursor-pointer shadow-sm" : ""
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={getDoorContent(d)}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="leading-none"
                >
                  {getDoorContent(d)}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs font-semibold text-gray-400 mt-2">
                {getDoorLabel(d)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Stay / Switch */}
      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3"
          >
            <button
              onClick={handleStay}
              className="h-11 px-6 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Stay with Door {pick! + 1}
            </button>
            <button
              onClick={handleSwitch}
              className="h-11 px-6 rounded-full bg-[#4f46e5] text-white font-bold text-sm hover:bg-[#4338ca] transition-colors"
            >
              Switch doors
            </button>
          </motion.div>
        )}
        {phase === "result" && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={reset}
            className="h-11 px-8 rounded-full bg-[#4f46e5] text-white font-bold text-sm"
          >
            Play again
          </motion.button>
        )}
      </AnimatePresence>

      {/* Stats */}
      {total > 0 && (
        <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">
            Running totals
          </p>
          {[
            { label: "Stay strategy", wins: stats.stayWins, total: stats.stayTotal },
            { label: "Switch strategy", wins: stats.switchWins, total: stats.switchTotal },
          ]
            .filter((r) => r.total > 0)
            .map((row) => {
              const pct = Math.round((row.wins / row.total) * 100);
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">
                      {row.label}
                    </span>
                    <span className="font-bold text-[#4f46e5]">{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#4f46e5] rounded-full"
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {row.wins} wins / {row.total} games
                  </p>
                </div>
              );
            })}
        </div>
      )}

      {/* Simulate */}
      <button
        onClick={simulate}
        className="text-sm font-semibold text-[#4f46e5] hover:underline underline-offset-2 transition-all"
      >
        Auto-simulate 300 games →
      </button>

      <p className="text-xs text-gray-400 text-center max-w-sm">
        Theory says switching wins ~66% of the time. Does your data match? After
        the simulation, try to explain <em>why</em> switching is better.
      </p>
    </div>
  );
}
