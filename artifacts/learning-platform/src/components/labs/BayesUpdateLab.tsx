import { useState } from "react";
import { motion } from "framer-motion";

function posterior(pA: number, pRedGivenA: number, pRedGivenB: number) {
  const pB = 1 - pA;
  const pRed = pRedGivenA * pA + pRedGivenB * pB;
  if (pRed === 0) return { pAGivenRed: 0, pBGivenRed: 0, pRed: 0 };
  return {
    pAGivenRed: +(pRedGivenA * pA / pRed).toFixed(4),
    pBGivenRed: +(pRedGivenB * pB / pRed).toFixed(4),
    pRed: +pRed.toFixed(4),
  };
}

// Mini jar illustration: colored dots on a rounded rect background
function JarIllustration({ color, pRed, label }: { color: string; pRed: number; label: string }) {
  const total = 10;
  const redCount = Math.round(pRed * total);
  const dots = Array.from({ length: total }, (_, i) => i < redCount ? "red" : "blue");

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-20 h-24 rounded-b-3xl rounded-t-lg border-2 flex flex-wrap gap-1.5 items-center justify-center p-2"
        style={{ borderColor: color, backgroundColor: color + "18" }}
      >
        {dots.map((d, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: d === "red" ? "#f43f5e" : "#93c5fd" }}
          />
        ))}
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function ProbBar({
  label,
  value,
  color,
  animate: shouldAnimate,
}: {
  label: string;
  value: number;
  color: string;
  animate: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold w-24 text-gray-600">{label}</span>
      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={shouldAnimate ? { duration: 0.7, ease: "easeOut" } : { duration: 0 }}
        />
      </div>
      <span className="text-xs font-mono font-bold w-12 text-right" style={{ color }}>
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  );
}

export default function BayesUpdateLab() {
  const [priorA, setPriorA] = useState(0.5);
  const [pRedA, setPRedA] = useState(0.7);
  const [pRedB, setPRedB] = useState(0.3);
  const [drawn, setDrawn] = useState(false);
  const [animating, setAnimating] = useState(false);

  const priorB = +(1 - priorA).toFixed(2);
  const { pAGivenRed, pBGivenRed, pRed } = posterior(priorA, pRedA, pRedB);

  const handleDraw = () => {
    setDrawn(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 800);
  };

  const handleReset = () => {
    setDrawn(false);
  };

  return (
    <div className="flex flex-col gap-5 p-5 select-none">
      {/* Jar illustrations */}
      <div className="flex justify-center gap-10">
        <JarIllustration color="#4f46e5" pRed={pRedA} label="Jar A" />
        <JarIllustration color="#7c3aed" pRed={pRedB} label="Jar B" />
      </div>

      {/* Sliders */}
      <div className="space-y-3 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-indigo-600 w-24">P(Jar A)</span>
          <input
            type="range" min={0.1} max={0.9} step={0.05}
            value={priorA}
            onChange={(e) => { setPriorA(+e.target.value); setDrawn(false); }}
            className="flex-1"
            style={{ accentColor: "#4f46e5" }}
          />
          <span className="text-xs font-mono font-bold w-10 text-right text-indigo-600">{priorA.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 w-24">P(Jar B)</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-violet-400 rounded-full" style={{ width: `${priorB * 100}%` }} />
          </div>
          <span className="text-xs font-mono font-bold w-10 text-right text-violet-600">{priorB.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-rose-500 w-24">P(red|A)</span>
          <input
            type="range" min={0.1} max={0.9} step={0.05}
            value={pRedA}
            onChange={(e) => { setPRedA(+e.target.value); setDrawn(false); }}
            className="flex-1"
            style={{ accentColor: "#f43f5e" }}
          />
          <span className="text-xs font-mono font-bold w-10 text-right text-rose-500">{pRedA.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-rose-500 w-24">P(red|B)</span>
          <input
            type="range" min={0.1} max={0.9} step={0.05}
            value={pRedB}
            onChange={(e) => { setPRedB(+e.target.value); setDrawn(false); }}
            className="flex-1"
            style={{ accentColor: "#f43f5e" }}
          />
          <span className="text-xs font-mono font-bold w-10 text-right text-rose-500">{pRedB.toFixed(2)}</span>
        </div>
      </div>

      {/* Prior bars */}
      <div className="space-y-2 max-w-sm mx-auto w-full">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Prior</p>
        <ProbBar label="P(Jar A)" value={priorA} color="#4f46e5" animate={false} />
        <ProbBar label="P(Jar B)" value={priorB} color="#7c3aed" animate={false} />
      </div>

      {/* Draw button */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleDraw}
          className="h-10 px-6 rounded-full font-bold text-sm text-white transition-transform active:scale-95 flex items-center gap-2"
          style={{ backgroundColor: "#f43f5e" }}
        >
          <span className="w-4 h-4 rounded-full bg-white inline-block" style={{ flexShrink: 0 }} />
          Draw Red Ball
        </button>
        {drawn && (
          <button
            onClick={handleReset}
            className="h-10 px-4 rounded-full bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200"
          >
            Reset
          </button>
        )}
      </div>

      {/* Posterior bars — shown after draw */}
      {drawn && (
        <div className="space-y-2 max-w-sm mx-auto w-full">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Posterior — after drawing red
          </p>
          <ProbBar label="P(A | red)" value={pAGivenRed} color="#4f46e5" animate={animating} />
          <ProbBar label="P(B | red)" value={pBGivenRed} color="#7c3aed" animate={animating} />
        </div>
      )}

      {/* Bayes formula */}
      {drawn && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 max-w-sm mx-auto w-full">
          <p className="text-xs font-mono text-gray-500 leading-relaxed">
            P(A|red) = P(red|A) × P(A) / P(red)
          </p>
          <p className="text-xs font-mono text-gray-500 leading-relaxed mt-1">
            P(red) = P(red|A)·P(A) + P(red|B)·P(B)
          </p>
          <div className="border-t border-gray-200 mt-2 pt-2">
            <p className="text-xs font-mono text-gray-500">
              P(red) = {pRedA.toFixed(2)}×{priorA.toFixed(2)} + {pRedB.toFixed(2)}×{priorB.toFixed(2)} = {pRed.toFixed(3)}
            </p>
            <p className="text-sm font-mono font-bold text-[#4f46e5] mt-1">
              P(A|red) = {pRedA.toFixed(2)}×{priorA.toFixed(2)} / {pRed.toFixed(3)} = {pAGivenRed.toFixed(3)}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        The jar illustrations show the proportion of red (rose) vs blue balls based on the likelihoods.
        Stronger evidence from the drawn color shifts the posterior further from the prior.
      </p>
    </div>
  );
}
