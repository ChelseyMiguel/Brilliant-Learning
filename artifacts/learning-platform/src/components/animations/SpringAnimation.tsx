import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function SpringAnimation() {
  const [k, setK] = useState(50);
  const [mass, setMass] = useState(1);
  const [running, setRunning] = useState(false);
  const [x, setX] = useState(0);
  const [v, setV] = useState(0);
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const amplitude = 80;
  const omega = Math.sqrt(k / mass);
  const period = ((2 * Math.PI) / omega).toFixed(2);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const step = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;
      timeRef.current += dt;
      const newX = amplitude * Math.cos(omega * timeRef.current);
      setX(newX);
      setV(-amplitude * omega * Math.sin(omega * timeRef.current));
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, k, mass, omega]);

  const toggle = () => {
    if (!running) {
      timeRef.current = 0;
      lastTimeRef.current = null;
    }
    setRunning(r => !r);
  };

  const reset = () => {
    setRunning(false);
    timeRef.current = 0;
    lastTimeRef.current = null;
    setX(0);
    setV(0);
  };

  // Spring coil visualization
  const equilibrium = 140;
  const massX = equilibrium + x;
  const springCoils = 10;
  const springStart = 20;
  const springEnd = massX - 16;

  const buildSpringPath = () => {
    const len = springEnd - springStart;
    const coilW = 12;
    let d = `M ${springStart} 80`;
    for (let i = 0; i < springCoils; i++) {
      const segLen = len / springCoils;
      const cx1 = springStart + i * segLen + segLen * 0.25;
      const cy1 = i % 2 === 0 ? 80 - coilW : 80 + coilW;
      const cx2 = springStart + i * segLen + segLen * 0.75;
      const cy2 = i % 2 === 0 ? 80 - coilW : 80 + coilW;
      const ex = springStart + (i + 1) * segLen;
      d += ` C ${cx1} ${cy1} ${cx2} ${cy2} ${ex} 80`;
    }
    return d;
  };

  const pe = (0.5 * k * (x / 80) * (x / 80) * 100).toFixed(0);
  const ke = (0.5 * mass * (v / 80) * (v / 80) * 100).toFixed(0);

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Spring-Mass Oscillator</p>

      {/* SVG visualization */}
      <svg width="100%" viewBox="0 0 300 160" className="mb-4" style={{ maxHeight: 140 }}>
        {/* Wall */}
        <rect x={0} y={0} width={18} height={160} fill="#E2E8F0" />
        <line x1={18} y1={0} x2={18} y2={160} stroke="#94A3B8" strokeWidth={2} />

        {/* Equilibrium line */}
        <line x1={equilibrium} y1={40} x2={equilibrium} y2={120} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="3,3" />
        <text x={equilibrium} y={130} textAnchor="middle" fontSize={9} fill="#94A3B8">eq.</text>

        {/* Spring */}
        {running || x !== 0 ? (
          <path d={buildSpringPath()} stroke="#7C3AED" strokeWidth={2} fill="none" />
        ) : (
          <line x1={springStart} y1={80} x2={springEnd} y2={80} stroke="#7C3AED" strokeWidth={2} />
        )}

        {/* Mass */}
        <motion.rect
          x={massX - 16} y={64} width={32} height={32} rx={6}
          fill="hsl(238, 80%, 50%)"
          animate={{ x: massX - 16 }}
          transition={{ type: "tween", duration: 0 }}
        />
        <text x={massX} y={83} textAnchor="middle" fontSize={9} fill="white" fontWeight={700}>m={mass}kg</text>

        {/* Energy bars */}
        <text x={240} y={50} fontSize={9} fill="#94A3B8">PE</text>
        <rect x={240} y={55} width={40} height={8} rx={2} fill="#E2E8F0" />
        <motion.rect x={240} y={55} width={Math.min(40, parseInt(pe) * 0.4)} height={8} rx={2} fill="#F59E0B"
          animate={{ width: Math.min(40, parseInt(pe) * 0.4) }} />

        <text x={240} y={80} fontSize={9} fill="#94A3B8">KE</text>
        <rect x={240} y={85} width={40} height={8} rx={2} fill="#E2E8F0" />
        <motion.rect x={240} y={85} width={Math.min(40, parseInt(ke) * 0.4)} height={8} rx={2} fill="#10B981"
          animate={{ width: Math.min(40, parseInt(ke) * 0.4) }} />
      </svg>

      {/* Controls */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-600 w-28">Spring k = {k} N/m</label>
          <input type="range" min={10} max={200} value={k} onChange={e => { setK(+e.target.value); reset(); }}
            className="flex-1 accent-primary" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-600 w-28">Mass = {mass} kg</label>
          <input type="range" min={1} max={5} value={mass} onChange={e => { setMass(+e.target.value); reset(); }}
            className="flex-1 accent-primary" />
        </div>
        <p className="text-xs text-center text-slate-500">Period T = {period} s · ω = {omega.toFixed(1)} rad/s</p>
      </div>

      <div className="flex gap-2">
        <button onClick={toggle} className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          {running ? "Pause" : "Simulate"}
        </button>
        <button onClick={reset} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
}
