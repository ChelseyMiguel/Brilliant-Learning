import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const CX = 130;     // spring horizontal centre in viewBox
const CEILING_Y = 24;
const EQUILIBRIUM_Y = 210; // rest position of top of mass
const MASS_SIZE = 40;
const COILS = 10;
const COIL_W = 16;

function buildSpringPath(top: number, bottom: number): string {
  const len = Math.max(bottom - top, 1);
  const lead = 6; // straight lead-in/out
  let d = `M ${CX} ${top} L ${CX} ${top + lead}`;

  for (let i = 0; i < COILS; i++) {
    const segLen = (len - lead * 2) / COILS;
    const y0 = top + lead + i * segLen;
    const y1 = y0 + segLen;
    const xSign = i % 2 === 0 ? 1 : -1;
    // S-shaped bezier for each coil
    d += ` C ${CX + xSign * COIL_W * 2} ${y0 + segLen * 0.2}
             ${CX + xSign * COIL_W * 2} ${y1 - segLen * 0.2}
             ${CX} ${y1}`;
  }

  d += ` L ${CX} ${bottom}`;
  return d;
}

export default function SpringAnimation() {
  const [k, setK] = useState(50);
  const [mass, setMass] = useState(1);
  const [running, setRunning] = useState(false);
  const [displacement, setDisplacement] = useState(0); // px from equilibrium
  const [velocity, setVelocity] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const stateRef = useRef({ displacement: 0, velocity: 0, k, mass });

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = { ...stateRef.current, k, mass };
  }, [k, mass]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
      return;
    }

    const step = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.04);
      lastTsRef.current = ts;

      const { displacement: x, velocity: v, k: kVal, mass: mVal } = stateRef.current;
      // Damped SHM: a = (-k/m)*x - damping*v
      const omega2 = kVal / mVal;
      const damping = 0.08;
      const a = -omega2 * (x / 80) - damping * v; // x normalised to [-1,1]
      const newV = v + a * dt;
      const newX = x + newV * 80 * dt; // back to px
      const clamped = Math.max(-70, Math.min(70, newX));

      stateRef.current = { ...stateRef.current, displacement: clamped, velocity: newV };
      setDisplacement(clamped);
      setVelocity(newV);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running]);

  const toggle = () => {
    if (!running) {
      // Give it an initial kick
      stateRef.current = { ...stateRef.current, displacement: -55, velocity: 0 };
      setDisplacement(-55);
      setVelocity(0);
    }
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    stateRef.current = { ...stateRef.current, displacement: 0, velocity: 0 };
    setDisplacement(0);
    setVelocity(0);
    lastTsRef.current = null;
  };

  // Visual positions (SVG coords)
  const massTopY = EQUILIBRIUM_Y + displacement;
  const springPath = buildSpringPath(CEILING_Y + 16, massTopY);

  // Energy (normalised 0–1, scaled to bar width)
  const maxPE = 0.5 * (k / 50) * 70 * 70;
  const pe = Math.min(0.5 * (k / 50) * displacement * displacement, maxPE);
  const ke = Math.max(0, maxPE - pe);
  const BAR_W = 72;
  const peW = maxPE > 0 ? (pe / maxPE) * BAR_W : 0;
  const keW = maxPE > 0 ? (ke / maxPE) * BAR_W : 0;

  const omega = Math.sqrt(k / mass).toFixed(1);

  return (
    <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 pt-4 pb-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Vertical Spring Oscillator
        </p>
      </div>

      {/* SVG simulation */}
      <svg
        width="100%"
        viewBox="0 0 290 310"
        className="block"
        style={{ maxHeight: 230 }}
      >
        {/* Ceiling hatch */}
        <rect x={CX - 46} y={0} width={92} height={CEILING_Y} rx={3} fill="#e2e8f0" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={CX - 38 + i * 19}
            y1={CEILING_Y}
            x2={CX - 46 + i * 19}
            y2={0}
            stroke="#cbd5e1"
            strokeWidth={1.5}
          />
        ))}
        <line x1={CX - 46} y1={CEILING_Y} x2={CX + 46} y2={CEILING_Y} stroke="#94a3b8" strokeWidth={2} />

        {/* Ceiling mount pin */}
        <circle cx={CX} cy={CEILING_Y + 2} r={4} fill="#94a3b8" />

        {/* Equilibrium dashed line */}
        <line
          x1={CX - 28}
          y1={EQUILIBRIUM_Y + MASS_SIZE / 2}
          x2={CX + 28}
          y2={EQUILIBRIUM_Y + MASS_SIZE / 2}
          stroke="#cbd5e1"
          strokeWidth={1}
          strokeDasharray="3,3"
        />
        <text x={CX + 34} y={EQUILIBRIUM_Y + MASS_SIZE / 2 + 4} fontSize={8} fill="#94a3b8">
          eq.
        </text>

        {/* Spring coil */}
        <path
          d={springPath}
          stroke="#6366f1"
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Mass block */}
        <motion.g
          animate={{ y: displacement }}
          transition={{ type: "tween", duration: 0 }}
        >
          <rect
            x={CX - MASS_SIZE / 2}
            y={EQUILIBRIUM_Y}
            width={MASS_SIZE}
            height={MASS_SIZE}
            rx={6}
            fill="#6366f1"
          />
          <text
            x={CX}
            y={EQUILIBRIUM_Y + MASS_SIZE / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fontWeight={700}
            fill="white"
          >
            {mass}kg
          </text>
        </motion.g>

        {/* Displacement arrow */}
        {Math.abs(displacement) > 4 && (
          <g>
            <line
              x1={CX - 34}
              y1={EQUILIBRIUM_Y + MASS_SIZE / 2}
              x2={CX - 34}
              y2={EQUILIBRIUM_Y + MASS_SIZE / 2 + displacement}
              stroke="#f59e0b"
              strokeWidth={1.8}
            />
            <circle
              cx={CX - 34}
              cy={EQUILIBRIUM_Y + MASS_SIZE / 2 + displacement}
              r={3}
              fill="#f59e0b"
            />
            <text
              x={CX - 44}
              y={EQUILIBRIUM_Y + MASS_SIZE / 2 + displacement / 2}
              textAnchor="middle"
              fontSize={8}
              fill="#f59e0b"
              fontWeight={600}
            >
              x
            </text>
          </g>
        )}

        {/* Energy bars — right side */}
        <text x={195} y={140} fontSize={9} fill="#94a3b8" fontWeight={600}>
          Energy
        </text>
        {/* PE bar */}
        <rect x={195} y={150} width={BAR_W} height={10} rx={3} fill="#f1f5f9" />
        <motion.rect
          x={195}
          y={150}
          width={peW}
          height={10}
          rx={3}
          fill="#f59e0b"
          animate={{ width: peW }}
          transition={{ type: "tween", duration: 0 }}
        />
        <text x={192} y={158} textAnchor="end" fontSize={8} fill="#f59e0b" fontWeight={700}>PE</text>
        <text x={195 + BAR_W + 4} y={158} fontSize={7} fill="#f59e0b">
          {pe.toFixed(0)}J
        </text>

        {/* KE bar */}
        <rect x={195} y={168} width={BAR_W} height={10} rx={3} fill="#f1f5f9" />
        <motion.rect
          x={195}
          y={168}
          width={keW}
          height={10}
          rx={3}
          fill="#10b981"
          animate={{ width: keW }}
          transition={{ type: "tween", duration: 0 }}
        />
        <text x={192} y={176} textAnchor="end" fontSize={8} fill="#10b981" fontWeight={700}>KE</text>
        <text x={195 + BAR_W + 4} y={176} fontSize={7} fill="#10b981">
          {ke.toFixed(0)}J
        </text>

        {/* F = -kx annotation */}
        {Math.abs(displacement) > 6 && (
          <text
            x={195}
            y={200}
            fontSize={8}
            fill="#6366f1"
            fontWeight={600}
          >
            F = {(-(k / 50) * displacement).toFixed(0)}N
          </text>
        )}

        <text x={195} y={230} fontSize={8} fill="#94a3b8">ω = {omega} rad/s</text>
      </svg>

      {/* Controls */}
      <div className="px-5 pb-5 space-y-2.5">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 w-24 flex-shrink-0">k = {k} N/m</label>
          <input
            type="range"
            min={10}
            max={200}
            value={k}
            onChange={(e) => { setK(+e.target.value); reset(); }}
            className="flex-1 accent-[#6366f1]"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 w-24 flex-shrink-0">m = {mass} kg</label>
          <input
            type="range"
            min={1}
            max={5}
            value={mass}
            onChange={(e) => { setMass(+e.target.value); reset(); }}
            className="flex-1 accent-[#6366f1]"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={toggle}
            className="flex-1 h-10 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-bold transition-colors"
          >
            {running ? "Pause" : "Simulate"}
          </button>
          <button
            onClick={reset}
            className="px-5 h-10 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
