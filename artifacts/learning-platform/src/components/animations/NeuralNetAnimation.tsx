import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NodePos { x: number; y: number; }

const LAYERS: NodePos[][] = [
  [{ x: 60, y: 80 }, { x: 60, y: 160 }, { x: 60, y: 240 }],
  [{ x: 200, y: 60 }, { x: 200, y: 140 }, { x: 200, y: 220 }, { x: 200, y: 300 }],
  [{ x: 340, y: 120 }, { x: 340, y: 200 }],
];

interface Pulse { id: number; fromLayer: number; fromNode: number; toNode: number; }

export default function NeuralNetAnimation() {
  const [weights, setWeights] = useState<number[][]>([
    [0.8, 0.4, 0.6, 0.3],
    [0.7, 0.5],
  ]);
  const [inputs, setInputs] = useState([1, 0, 1]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  const fireNetwork = () => {
    let delay = 0;
    for (let layer = 0; layer < LAYERS.length - 1; layer++) {
      const fromNodes = LAYERS[layer];
      const toNodes = LAYERS[layer + 1];
      fromNodes.forEach((_, fi) => {
        toNodes.forEach((_, ti) => {
          setTimeout(() => {
            setPulses(prev => [...prev, { id: Date.now() + Math.random(), fromLayer: layer, fromNode: fi, toNode: ti }]);
            setActiveLayer(layer);
            setTimeout(() => {
              setPulses(prev => prev.slice(1));
            }, 600);
          }, delay);
          delay += 40;
        });
      });
      delay += 200;
    }
    setTimeout(() => setActiveLayer(null), delay + 400);
  };

  const toggleInput = (i: number) => {
    setInputs(prev => { const n = [...prev]; n[i] = n[i] === 1 ? 0 : 1; return n; });
  };

  const svgH = 360;
  const svgW = 400;

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Neural Network Visualizer</p>

      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="mb-4" style={{ maxHeight: 220 }}>
        {/* Connections */}
        {LAYERS.slice(0, -1).map((layer, li) =>
          layer.map((from, fi) =>
            LAYERS[li + 1].map((to, ti) => {
              const w = li === 0 ? (weights[0][ti] ?? 0.5) : (weights[1][ti] ?? 0.5);
              const isActive = activeLayer === li;
              return (
                <motion.line
                  key={`${li}-${fi}-${ti}`}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isActive ? `hsl(238, 80%, 50%)` : "#CBD5E1"}
                  strokeWidth={isActive ? w * 3 + 0.5 : w * 2 + 0.5}
                  strokeOpacity={isActive ? 0.8 : 0.4}
                  animate={{ stroke: isActive ? "hsl(238, 80%, 50%)" : "#CBD5E1" }}
                  transition={{ duration: 0.3 }}
                />
              );
            })
          )
        )}

        {/* Pulse particles */}
        <AnimatePresence>
          {pulses.map(p => {
            const from = LAYERS[p.fromLayer][p.fromNode];
            const to = LAYERS[p.fromLayer + 1][p.toNode];
            return (
              <motion.circle
                key={p.id}
                r={5}
                fill="hsl(238, 80%, 50%)"
                initial={{ cx: from.x, cy: from.y, opacity: 1 }}
                animate={{ cx: to.x, cy: to.y, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeIn" }}
              />
            );
          })}
        </AnimatePresence>

        {/* Nodes */}
        {LAYERS.map((layer, li) =>
          layer.map((pos, ni) => {
            const isInput = li === 0;
            const isOutput = li === LAYERS.length - 1;
            const isActive = isInput && inputs[ni] === 1;
            return (
              <g key={`node-${li}-${ni}`} onClick={() => isInput && toggleInput(ni)} style={{ cursor: isInput ? "pointer" : "default" }}>
                <motion.circle
                  cx={pos.x} cy={pos.y} r={18}
                  fill={isActive ? "hsl(238, 80%, 50%)" : isOutput ? "hsl(150, 70%, 40%)" : "white"}
                  stroke={isActive ? "hsl(238, 80%, 50%)" : "hsl(215, 20%, 65%)"}
                  strokeWidth={2}
                  animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                  transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                />
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize={10} fontWeight={600}
                  fill={isActive || isOutput ? "white" : "#64748B"}
                >
                  {isInput ? (inputs[ni] === 1 ? "1" : "0") : isOutput ? "out" : ""}
                </text>
              </g>
            );
          })
        )}

        {/* Layer labels */}
        {["Input", "Hidden", "Output"].map((label, i) => (
          <text key={label} x={LAYERS[i][0].x} y={svgH - 10} textAnchor="middle"
            fontSize={10} fill="#94A3B8" fontWeight={500}>
            {label}
          </text>
        ))}
      </svg>

      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs text-slate-500 flex-1">Click input nodes to toggle 0/1</p>
      </div>

      <button
        onClick={fireNetwork}
        className="w-full py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Fire Signal
      </button>
    </div>
  );
}
