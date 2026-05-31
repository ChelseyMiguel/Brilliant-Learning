import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DATA = [3, 7, 12, 18, 24, 31, 39, 45, 52, 60];

interface Step {
  low: number;
  high: number;
  mid: number;
  found: boolean;
  direction: "left" | "right" | null;
}

function computeSteps(target: number): Step[] {
  const steps: Step[] = [];
  let low = 0;
  let high = DATA.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const found = DATA[mid] === target;
    const direction: "left" | "right" | null = found
      ? null
      : DATA[mid] < target
      ? "left"
      : "right";
    steps.push({ low, high, mid, found, direction });
    if (found) break;
    if (DATA[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return steps;
}

export default function BinarySearchLab() {
  const [targetInput, setTargetInput] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);

  const handleSearch = useCallback(() => {
    const t = parseInt(targetInput);
    if (isNaN(t)) return;
    const s = computeSteps(t);
    setSteps(s);
    setStepIdx(0);
  }, [targetInput]);

  const current = steps[stepIdx] ?? null;
  const done = stepIdx >= steps.length - 1 && steps.length > 0;
  const notInArray =
    done && steps.length > 0 && !steps[steps.length - 1].found;
  const target = parseInt(targetInput);

  const getCellClass = (i: number) => {
    if (!current) return "bg-gray-100 text-gray-500";
    if (i === current.mid)
      return current.found
        ? "bg-emerald-500 text-white ring-4 ring-emerald-200 scale-110 z-10"
        : "bg-[#4f46e5] text-white scale-105 z-10";
    if (i < current.low || i > current.high)
      return "bg-gray-50 text-gray-300 opacity-50";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex flex-col gap-8 p-6 items-center">
      {/* Array cells */}
      <div className="flex gap-2 justify-center flex-wrap">
        {DATA.map((val, i) => (
          <motion.div
            key={i}
            layout
            animate={{ scale: current?.mid === i ? (current.found ? 1.15 : 1.08) : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative w-12 h-14 rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-colors ${getCellClass(i)}`}
          >
            <span>{val}</span>
            <span className="text-[9px] opacity-50 font-normal">[{i}]</span>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      {current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4 text-xs font-medium"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#4f46e5] inline-block" />
            Mid
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300 inline-block" />
            Search range
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-50 opacity-50 border border-gray-200 inline-block" />
            Eliminated
          </span>
        </motion.div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-center">
        <input
          type="number"
          value={targetInput}
          onChange={(e) => {
            setTargetInput(e.target.value);
            setSteps([]);
            setStepIdx(-1);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Target…"
          className="w-32 h-11 rounded-xl border-2 border-gray-200 text-center font-bold focus:border-[#4f46e5] outline-none text-sm"
        />
        <button
          onClick={handleSearch}
          disabled={!targetInput || isNaN(parseInt(targetInput))}
          className="h-11 px-5 bg-[#4f46e5] text-white rounded-xl font-bold text-sm disabled:opacity-40 transition-opacity"
        >
          Search
        </button>
        {steps.length > 0 && !done && (
          <button
            onClick={() => setStepIdx((s) => s + 1)}
            className="h-11 px-5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Next →
          </button>
        )}
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`max-w-sm w-full rounded-2xl p-4 text-sm text-center ${
              current.found
                ? "bg-emerald-50 text-emerald-800"
                : notInArray
                ? "bg-gray-50 text-gray-600"
                : "bg-[#f5f4ff] text-[#4f46e5]"
            }`}
          >
            {current.found ? (
              <>
                Found <strong>{target}</strong> at index{" "}
                <strong>{current.mid}</strong> in{" "}
                <strong>{stepIdx + 1}</strong>{" "}
                {stepIdx === 0 ? "step" : "steps"}! Linear search would take{" "}
                <strong>{DATA.indexOf(target) + 1}</strong> step
                {DATA.indexOf(target) > 0 ? "s" : ""}.
              </>
            ) : notInArray ? (
              <>
                <strong>{target}</strong> is not in the array. Binary search
                took <strong>{steps.length}</strong> steps to confirm - linear
                search checks all <strong>{DATA.length}</strong>.
              </>
            ) : (
              <>
                Step {stepIdx + 1}: Check index <strong>{current.mid}</strong>{" "}
                (value <strong>{DATA[current.mid]}</strong>). Target is{" "}
                {current.direction === "left" ? "larger" : "smaller"}  - 
                eliminating the {current.direction} half.
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-gray-400 text-center">
        Try values in the array (3, 18, 60…) and values outside it (10, 100).
        Count how many steps binary search needs vs. what a left-to-right scan
        would take.
      </p>
    </div>
  );
}
