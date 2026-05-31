import { useState } from "react";

type Operation = "union" | "intersection" | "aOnly" | "bOnly" | "none";

const OPS: { key: Operation; label: string }[] = [
  { key: "union", label: "A ∪ B" },
  { key: "intersection", label: "A ∩ B" },
  { key: "aOnly", label: "A \\ B" },
  { key: "bOnly", label: "B \\ A" },
  { key: "none", label: "None" },
];

const CX_A = 170;
const CX_B = 330;
const CY = 130;
const R = 100;

// Intersection probability for independent events
function pIntersection(pA: number, pB: number) {
  return +(pA * pB).toFixed(4);
}

function formulaText(op: Operation, pA: number, pB: number): { formula: string; value: string } {
  const pAB = pIntersection(pA, pB);
  switch (op) {
    case "union":
      return {
        formula: `P(A ∪ B) = P(A) + P(B) − P(A ∩ B)`,
        value: `= ${pA.toFixed(2)} + ${pB.toFixed(2)} − ${pAB.toFixed(2)} = ${Math.min(1, pA + pB - pAB).toFixed(3)}`,
      };
    case "intersection":
      return {
        formula: `P(A ∩ B) = P(A) × P(B)  [independent]`,
        value: `= ${pA.toFixed(2)} × ${pB.toFixed(2)} = ${pAB.toFixed(3)}`,
      };
    case "aOnly":
      return {
        formula: `P(A \\ B) = P(A) − P(A ∩ B)`,
        value: `= ${pA.toFixed(2)} − ${pAB.toFixed(2)} = ${(pA - pAB).toFixed(3)}`,
      };
    case "bOnly":
      return {
        formula: `P(B \\ A) = P(B) − P(A ∩ B)`,
        value: `= ${pB.toFixed(2)} − ${pAB.toFixed(2)} = ${(pB - pAB).toFixed(3)}`,
      };
    default:
      return { formula: "", value: "" };
  }
}

export default function VennDiagramLab() {
  const [pA, setPa] = useState(0.5);
  const [pB, setPb] = useState(0.4);
  const [op, setOp] = useState<Operation>("intersection");

  const pAB = pIntersection(pA, pB);
  const { formula, value } = formulaText(op, pA, pB);

  // Fill opacities for each zone based on selected operation
  const fillA = op === "union" || op === "aOnly" ? 0.65 : 0.25;
  const fillB = op === "union" || op === "bOnly" ? 0.65 : 0.25;
  const fillAB = op === "union" || op === "intersection" ? 0.65 : op === "aOnly" || op === "bOnly" ? 0.08 : 0.25;

  return (
    <div className="flex flex-col gap-5 p-5 select-none">
      {/* SVG Venn diagram */}
      <div className="flex justify-center">
        <svg viewBox="0 0 500 260" className="w-full max-w-lg" style={{ height: 220 }}>
          <defs>
            {/* clipPath for A only (left crescent) */}
            <clipPath id="venn-clip-a">
              <circle cx={CX_A} cy={CY} r={R} />
            </clipPath>
            <clipPath id="venn-clip-b">
              <circle cx={CX_B} cy={CY} r={R} />
            </clipPath>
          </defs>

          {/* Labels */}
          <text x={CX_A - 38} y={CY + 4} fontSize={22} fontWeight="bold" fill="#4f46e5" opacity={0.7}>A</text>
          <text x={CX_B + 18} y={CY + 4} fontSize={22} fontWeight="bold" fill="#7c3aed" opacity={0.7}>B</text>

          {/* Circle A base fill */}
          <circle cx={CX_A} cy={CY} r={R} fill="#818cf8" fillOpacity={fillA} stroke="#4f46e5" strokeWidth={2} />

          {/* Circle B base fill */}
          <circle cx={CX_B} cy={CY} r={R} fill="#a78bfa" fillOpacity={fillB} stroke="#7c3aed" strokeWidth={2} />

          {/* Intersection highlight overlay — drawn on top */}
          {/* We clip a rect to circle A, then additionally mask to circle B */}
          <g clipPath="url(#venn-clip-a)">
            <circle cx={CX_B} cy={CY} r={R} fill="#f59e0b" fillOpacity={fillAB} />
          </g>

          {/* Circle outlines on top for crispness */}
          <circle cx={CX_A} cy={CY} r={R} fill="none" stroke="#4f46e5" strokeWidth={2} />
          <circle cx={CX_B} cy={CY} r={R} fill="none" stroke="#7c3aed" strokeWidth={2} />
        </svg>
      </div>

      {/* Sliders */}
      <div className="space-y-3 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-indigo-600 w-16">P(A)</span>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={pA}
            onChange={(e) => setPa(+e.target.value)}
            className="flex-1"
            style={{ accentColor: "#4f46e5" }}
          />
          <span className="text-xs font-mono font-bold w-10 text-right text-indigo-600">{pA.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-violet-600 w-16">P(B)</span>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={pB}
            onChange={(e) => setPb(+e.target.value)}
            className="flex-1"
            style={{ accentColor: "#7c3aed" }}
          />
          <span className="text-xs font-mono font-bold w-10 text-right text-violet-600">{pB.toFixed(2)}</span>
        </div>
      </div>

      {/* Operation buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        {OPS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setOp(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              op === key
                ? "bg-amber-400 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Probability summary */}
      <div className="flex flex-wrap gap-2 justify-center text-xs font-mono">
        <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold">
          P(A) = {pA.toFixed(2)}
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 font-semibold">
          P(B) = {pB.toFixed(2)}
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
          P(A∩B) = {pAB.toFixed(2)}
        </span>
      </div>

      {/* Formula display */}
      {op !== "none" && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 max-w-sm mx-auto w-full">
          <p className="text-xs font-mono text-gray-600 leading-relaxed">{formula}</p>
          <p className="text-sm font-mono font-bold text-[#4f46e5] mt-1">{value}</p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        Assumes A and B are independent. Sliders set P(A) and P(B); the intersection is P(A) × P(B).
      </p>
    </div>
  );
}
