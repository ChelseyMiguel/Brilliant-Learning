import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const G = 9.8;
const TRACK_H = 320;   // px - height of drop zone
const BALL_R = 18;
const FLOOR_Y = TRACK_H - BALL_R - 4;
const MAX_DROP = 1.0;  // metres (maps to FLOOR_Y pixels)
const PX_PER_M = FLOOR_Y / MAX_DROP;

function pxToM(px: number): number {
  return (FLOOR_Y - px) / PX_PER_M;
}
function mToPx(m: number): number {
  return FLOOR_Y - m * PX_PER_M;
}

function pctColor(pct: number, hue: string): string {
  return `hsl(${hue}, 85%, ${52 + (1 - pct) * 18}%)`;
}

interface PhysicsState {
  y: number;        // metres (0 = ground)
  v: number;        // m/s (positive = upward)
  playing: boolean;
}

export default function EnergyConservationLab() {
  const [dropHeight, setDropHeight] = useState(0.85); // metres
  const [state, setState] = useState<PhysicsState>({ y: dropHeight, v: 0, playing: false });
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);

  const h0 = dropHeight;
  const totalE = G * h0; // specific energy (per unit mass), joules/kg

  const pe = Math.max(0, G * state.y);
  const ke = Math.max(0, totalE - pe);
  const pePct = pe / totalE;
  const kePct = ke / totalE;

  const tick = useCallback(
    (timestamp: number) => {
      if (!lastTRef.current) { lastTRef.current = timestamp; }
      const dt = Math.min((timestamp - lastTRef.current) / 1000, 0.04);
      lastTRef.current = timestamp;

      setState((prev) => {
        if (!prev.playing) return prev;
        let newV = prev.v - G * dt; // gravity accelerates downward (decreases v)
        let newY = prev.y + newV * dt;

        // Bounce at ground
        if (newY <= 0) {
          newY = 0;
          newV = -newV * 0.82; // partial restitution
          if (Math.abs(newV) < 0.08) { newV = 0; newY = 0; }
        }

        // Cap at drop height (safety)
        if (newY > h0) { newY = h0; newV = 0; }

        const stillMoving = newY > 0.005 || Math.abs(newV) > 0.05;
        return { y: newY, v: newV, playing: stillMoving };
      });

      rafRef.current = requestAnimationFrame(tick);
    },
    [h0]
  );

  useEffect(() => {
    setState({ y: dropHeight, v: 0, playing: false });
  }, [dropHeight]);

  useEffect(() => {
    if (state.playing) {
      lastTRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.playing, tick]);

  const togglePlay = () => {
    setState((prev) => {
      // If at rest at bottom, reset first
      if (!prev.playing && prev.y <= 0.01 && Math.abs(prev.v) < 0.1) {
        return { y: h0, v: 0, playing: true };
      }
      return { ...prev, playing: !prev.playing };
    });
  };

  const reset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState({ y: h0, v: 0, playing: false });
  };

  const ballPx = mToPx(state.y);

  return (
    <div className="flex flex-col gap-6 p-6 select-none">
      {/* Main visualization */}
      <div className="flex gap-6 items-end justify-center">
        {/* Drop column */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Drop</span>
          <div className="relative" style={{ width: 60, height: TRACK_H }}>
            {/* Drop height indicator */}
            <div
              className="absolute left-1/2 -translate-x-1/2 border-l-2 border-dashed border-gray-200"
              style={{ top: mToPx(h0), bottom: BALL_R + 4, width: 0 }}
            />
            {/* Height label */}
            <div
              className="absolute right-0 text-[10px] text-gray-400 font-mono leading-none"
              style={{ top: mToPx(h0) - 6 }}
            >
              h₀
            </div>
            {/* Floor */}
            <div
              className="absolute left-0 right-0 h-1 bg-gray-300 rounded-full"
              style={{ bottom: 0 }}
            />
            {/* Ball */}
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#6366f1] to-[#4f46e5] shadow-lg shadow-[#4f46e5]/40 transition-none"
              style={{
                width: BALL_R * 2,
                height: BALL_R * 2,
                top: ballPx - BALL_R,
              }}
            />
          </div>
        </div>

        {/* Energy bars */}
        <div className="flex gap-4 items-end" style={{ height: TRACK_H }}>
          {/* PE bar */}
          <div className="flex flex-col items-center gap-2" style={{ width: 52 }}>
            <span className="text-[10px] font-bold text-gray-400">PE</span>
            <div
              className="relative flex-1 w-full rounded-xl bg-gray-100 overflow-hidden flex flex-col-reverse"
              style={{ height: TRACK_H - 24 }}
            >
              <div
                className="w-full rounded-xl transition-none"
                style={{
                  height: `${pePct * 100}%`,
                  backgroundColor: "#f97316",
                  transition: "height 0.016s linear",
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-orange-500 font-bold">
              {(pePct * 100).toFixed(0)}%
            </span>
          </div>

          {/* KE bar */}
          <div className="flex flex-col items-center gap-2" style={{ width: 52 }}>
            <span className="text-[10px] font-bold text-gray-400">KE</span>
            <div
              className="relative flex-1 w-full rounded-xl bg-gray-100 overflow-hidden flex flex-col-reverse"
              style={{ height: TRACK_H - 24 }}
            >
              <div
                className="w-full rounded-xl transition-none"
                style={{
                  height: `${kePct * 100}%`,
                  backgroundColor: "#8b5cf6",
                  transition: "height 0.016s linear",
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-violet-500 font-bold">
              {(kePct * 100).toFixed(0)}%
            </span>
          </div>

          {/* Total E line */}
          <div className="flex flex-col items-center gap-2" style={{ width: 52 }}>
            <span className="text-[10px] font-bold text-gray-400">Total</span>
            <div
              className="relative flex-1 w-full rounded-xl bg-gray-100 overflow-hidden flex flex-col-reverse"
              style={{ height: TRACK_H - 24 }}
            >
              <div
                className="w-full rounded-xl"
                style={{ height: "100%", background: "repeating-linear-gradient(45deg, #d1fae5, #d1fae5 4px, #ecfdf5 4px, #ecfdf5 10px)" }}
              />
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">100%</span>
          </div>
        </div>
      </div>

      {/* Equations */}
      <div className="flex gap-3 justify-center flex-wrap text-sm font-mono">
        <span className="px-3 py-1.5 bg-orange-50 rounded-lg text-orange-700 font-bold">
          PE = mgh = {(pePct * 100).toFixed(0)}%
        </span>
        <span className="text-gray-300 self-center font-sans">+</span>
        <span className="px-3 py-1.5 bg-violet-50 rounded-lg text-violet-700 font-bold">
          KE = ½mv² = {(kePct * 100).toFixed(0)}%
        </span>
        <span className="text-gray-300 self-center font-sans">=</span>
        <span className="px-3 py-1.5 bg-emerald-50 rounded-lg text-emerald-700 font-bold">
          E = 100%
        </span>
      </div>

      {/* Drop height slider */}
      <div className="flex items-center gap-4 max-w-xs mx-auto w-full">
        <span className="text-xs font-semibold text-gray-500 w-16 shrink-0">
          Drop h₀
        </span>
        <input
          type="range"
          min={0.3}
          max={1.0}
          step={0.05}
          value={dropHeight}
          onChange={(e) => setDropHeight(parseFloat(e.target.value))}
          className="flex-1 accent-[#4f46e5]"
        />
        <span className="text-xs font-mono text-[#4f46e5] w-12 text-right font-bold">
          {dropHeight.toFixed(2)} m
        </span>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={togglePlay}
          className="h-10 px-7 rounded-full bg-[#4f46e5] text-white font-bold text-sm flex items-center gap-2"
        >
          {state.playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {state.playing ? "Pause" : "Drop"}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        Watch PE (orange) drain into KE (purple) as the ball falls - and reverse on the way up.
        Total energy (green, striped) stays constant the entire time.
      </p>
    </div>
  );
}
