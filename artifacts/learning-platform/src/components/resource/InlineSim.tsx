/**
 * InlineSim — tiny self-contained interactive widgets embedded inline
 * between article sections in the resource reader.
 *
 * Each sim type is a small focused experience (not a full lab):
 *   coin-proportion  → flip counter showing running proportion → 0.5
 *   big-o-bars       → bar chart toggling O(n) vs O(n²) vs O(log n) at fixed n
 *   truth-toggle     → P/Q boolean toggle, live AND/OR/NOT output
 *   ev-calculator    → payout + probability inputs, live EV display
 *   normal-68        → static illustrated bell curve with σ bands
 */
import { useState, useCallback } from "react";
import { motion } from "framer-motion";

export type SimType =
  | "coin-proportion"
  | "big-o-bars"
  | "truth-toggle"
  | "ev-calculator"
  | "normal-68";

interface Props {
  type: SimType;
  caption?: string;
}

// ─── Shared wrapper ──────────────────────────────────────────────────────────

function SimWrapper({ caption, children }: { caption?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "hsl(var(--primary) / 0.15)", background: "hsl(var(--primary) / 0.03)" }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: "hsl(var(--primary) / 0.12)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "hsl(var(--primary))" }}>
          Try it
        </p>
        {caption && <p className="text-xs text-muted-foreground mt-0.5">{caption}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── 1. Coin proportion ──────────────────────────────────────────────────────

function CoinProportionSim() {
  const [flips, setFlips] = useState<("H" | "T")[]>([]);
  const [flipping, setFlipping] = useState(false);

  const flip = useCallback((n = 1) => {
    if (flipping) return;
    setFlipping(true);
    const newFlips = Array.from({ length: n }, () =>
      Math.random() < 0.5 ? "H" : "T"
    ) as ("H" | "T")[];
    setTimeout(() => {
      setFlips(prev => [...prev, ...newFlips]);
      setFlipping(false);
    }, 200);
  }, [flipping]);

  const heads = flips.filter(f => f === "H").length;
  const total = flips.length;
  const pct   = total > 0 ? Math.round((heads / total) * 100) : 50;

  return (
    <div className="space-y-3">
      {/* Chip history — last 20 */}
      <div className="flex flex-wrap gap-1 min-h-[28px]">
        {flips.slice(-30).map((f, i) => (
          <motion.span
            key={flips.length - Math.min(30, flips.length) + i}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
            style={{ background: f === "H" ? "#16a34a" : "#6366f1" }}
          >
            {f}
          </motion.span>
        ))}
        {flips.length === 0 && (
          <p className="text-xs text-muted-foreground self-center">Press Flip to start</p>
        )}
      </div>

      {/* Proportion bar */}
      {total > 0 && (
        <div className="space-y-1">
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 120 }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Heads {pct}%</span>
            <span>{total} flips · 50% expected</span>
            <span>Tails {100 - pct}%</span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        {[1, 10, 50].map(n => (
          <button
            key={n}
            onClick={() => flip(n)}
            disabled={flipping}
            className="flex-1 text-xs font-semibold py-2 rounded-xl transition-all"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              opacity: flipping ? 0.6 : 1,
            }}
          >
            Flip {n > 1 ? `×${n}` : ""}
          </button>
        ))}
        {total > 0 && (
          <button
            onClick={() => setFlips([])}
            className="text-xs px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-all"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 2. Big-O bars ───────────────────────────────────────────────────────────

const BIG_O_DATA = [
  { label: "O(log n)", color: "#10b981", fn: (n: number) => Math.log2(n) },
  { label: "O(n)",     color: "#6366f1", fn: (n: number) => n },
  { label: "O(n²)",   color: "#f59e0b", fn: (n: number) => n * n },
] as const;

const N_VALUES = [10, 50, 100];

function BigOBarsSim() {
  const [active, setActive] = useState<boolean[]>([true, true, true]);

  const toggle = (i: number) =>
    setActive(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });

  // Max across all visible series at n=100 for scaling
  const maxVal = Math.max(
    ...BIG_O_DATA.filter((_, i) => active[i]).map(d => d.fn(100)),
    1
  );

  return (
    <div className="space-y-3">
      {/* Legend toggles */}
      <div className="flex flex-wrap gap-2">
        {BIG_O_DATA.map((d, i) => (
          <button
            key={d.label}
            onClick={() => toggle(i)}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all"
            style={{
              background: active[i] ? `${d.color}18` : "transparent",
              borderColor: active[i] ? d.color : "hsl(var(--border))",
              color: active[i] ? d.color : "hsl(var(--muted-foreground))",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: active[i] ? d.color : "#d1d5db" }} />
            {d.label}
          </button>
        ))}
      </div>

      {/* Grouped bars per N */}
      <div className="grid grid-cols-3 gap-3">
        {N_VALUES.map(n => (
          <div key={n} className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold text-center text-muted-foreground">n = {n}</p>
            <div className="flex items-end gap-1 justify-center h-20">
              {BIG_O_DATA.map((d, i) => {
                if (!active[i]) return null;
                const val  = d.fn(n);
                const pct  = Math.min((val / maxVal) * 100, 100);
                const label = val >= 1000
                  ? `${(val / 1000).toFixed(0)}k`
                  : val >= 1
                    ? val.toFixed(0)
                    : val.toFixed(1);
                return (
                  <div key={d.label} className="flex flex-col items-center gap-0.5 flex-1">
                    <span className="text-[9px] text-muted-foreground">{label}</span>
                    <motion.div
                      animate={{ height: `${Math.max(pct, 4)}%` }}
                      transition={{ type: "spring", stiffness: 160 }}
                      className="w-full rounded-t-sm"
                      style={{ background: d.color, minHeight: 4, maxHeight: 64 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">Toggle classes to see how quickly n² explodes</p>
    </div>
  );
}

// ─── 3. Truth table toggle ───────────────────────────────────────────────────

function TruthToggleSim() {
  const [p, setP] = useState(true);
  const [q, setQ] = useState(true);

  const results = [
    { label: "P AND Q",  val: p && q,  color: "#6366f1" },
    { label: "P OR Q",   val: p || q,  color: "#10b981" },
    { label: "NOT P",    val: !p,      color: "#f59e0b" },
    { label: "P → Q",   val: !p || q, color: "#ec4899" },
  ];

  const Toggle = ({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border font-mono text-sm font-semibold transition-all"
      style={{
        background: value ? "#f0fdf4" : "#fff1f2",
        borderColor: value ? "#86efac" : "#fca5a5",
        color: value ? "#166534" : "#991b1b",
      }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ background: value ? "#16a34a" : "#ef4444" }}
      />
      {label} = {value ? "T" : "F"}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Inputs */}
      <div className="flex gap-2">
        <Toggle label="P" value={p} onToggle={() => setP(v => !v)} />
        <Toggle label="Q" value={q} onToggle={() => setQ(v => !v)} />
      </div>

      {/* Outputs */}
      <div className="grid grid-cols-2 gap-2">
        {results.map(r => (
          <motion.div
            key={r.label}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between px-3 py-2 rounded-xl"
            style={{
              background: r.val ? `${r.color}12` : "hsl(var(--muted) / 0.5)",
              border: `1.5px solid ${r.val ? `${r.color}40` : "hsl(var(--border))"}`,
            }}
          >
            <span className="text-xs font-mono font-medium text-foreground/80">{r.label}</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: r.val ? r.color : "#94a3b8",
                color: "white",
              }}
            >
              {r.val ? "TRUE" : "FALSE"}
            </span>
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">Click P and Q to toggle their truth value</p>
    </div>
  );
}

// ─── 4. EV calculator ────────────────────────────────────────────────────────

function EvCalculatorSim() {
  const [payout, setPayout]   = useState("10");
  const [prob,   setProb]     = useState("0.2");
  const [cost,   setCost]     = useState("2");

  const p    = Math.min(Math.max(parseFloat(prob)   || 0, 0), 1);
  const pay  = parseFloat(payout) || 0;
  const c    = parseFloat(cost)   || 0;
  const ev   = p * pay - c;
  const good = ev >= 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Win payout ($)", val: payout, set: setPayout, hint: "Amount you win" },
          { label: "Win probability", val: prob, set: setProb, hint: "0 – 1" },
          { label: "Cost to play ($)", val: cost, set: setCost, hint: "Entry price" },
        ].map(({ label, val, set, hint }) => (
          <div key={label} className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground">{label}</label>
            <input
              type="number"
              value={val}
              onChange={e => set(e.target.value)}
              placeholder={hint}
              className="w-full text-sm border rounded-lg px-2.5 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
      </div>

      <motion.div
        animate={{ scale: 1 }}
        initial={{ scale: 0.95 }}
        key={`${ev.toFixed(2)}`}
        className="rounded-xl px-4 py-3 text-center"
        style={{
          background: good ? "#f0fdf4" : "#fff1f2",
          border: `1.5px solid ${good ? "#86efac" : "#fca5a5"}`,
        }}
      >
        <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">Expected Value</p>
        <p
          className="text-2xl font-bold font-mono"
          style={{ color: good ? "#16a34a" : "#dc2626" }}
        >
          {ev >= 0 ? "+" : ""}${ev.toFixed(2)}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          {good
            ? "Positive EV — profitable in the long run"
            : "Negative EV — losing game on average"}
        </p>
      </motion.div>

      <p className="text-[10px] text-muted-foreground">
        Formula: EV = (win probability × payout) − cost to play
      </p>
    </div>
  );
}

// ─── 5. Normal distribution visual ──────────────────────────────────────────

function Normal68Sim() {
  const [sigma, setSigma] = useState(1);
  // Simple SVG bell curve approximation
  const W = 280; const H = 100;
  const cx = W / 2;

  // Generate bell curve path points
  const points: [number, number][] = [];
  for (let px = 0; px <= W; px += 2) {
    const x = (px - cx) / (W / 8);           // map to ±4σ range
    const y = Math.exp(-0.5 * x * x);         // standard normal density shape
    points.push([px, H - 8 - y * (H - 16)]);
  }
  const pathD =
    `M ${points[0][0]} ${points[0][1]} ` +
    points.slice(1).map(([x, y]) => `L ${x} ${y}`).join(" ") +
    ` L ${W} ${H} L 0 ${H} Z`;

  // Shade ±1σ and ±2σ bands
  const sigmaW = (W / 8) * sigma;
  const bands = [
    { mult: 2, color: "#818cf820", label: "±2σ 95%" },
    { mult: 1, color: "#6366f130", label: "±1σ 68%" },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-muted-foreground">
          Std deviation (σ) — drag to reshape
        </label>
        <input
          type="range"
          min={0.5}
          max={2.5}
          step={0.1}
          value={sigma}
          onChange={e => setSigma(parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ overflow: "visible" }}
      >
        {/* Shade bands */}
        {bands.map(band => {
          const x1 = cx - sigmaW * band.mult;
          const x2 = cx + sigmaW * band.mult;
          return (
            <rect
              key={band.mult}
              x={x1} y={0} width={x2 - x1} height={H}
              fill={band.color}
            />
          );
        })}

        {/* Curve */}
        <path d={pathD} fill="#6366f118" stroke="#6366f1" strokeWidth={2} />

        {/* Mean line */}
        <line x1={cx} y1={8} x2={cx} y2={H} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={cx} y={6} textAnchor="middle" fontSize={9} fill="#6366f1" fontWeight={600}>μ</text>

        {/* σ labels */}
        {[-2, -1, 1, 2].map(n => {
          const x = cx + sigmaW * n;
          return (
            <text key={n} x={x} y={H - 2} textAnchor="middle" fontSize={8} fill="#94a3b8">
              {n > 0 ? "+" : ""}{n}σ
            </text>
          );
        })}
      </svg>

      {/* Band legend */}
      <div className="flex gap-3 text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#6366f130" }} />
          ±1σ = ~68%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#818cf820" }} />
          ±2σ = ~95%
        </span>
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

const SIM_META: Record<SimType, { caption: string }> = {
  "coin-proportion": { caption: "Watch the proportion of heads converge to 50% as flips increase" },
  "big-o-bars":      { caption: "Compare how many operations each complexity class needs at different input sizes" },
  "truth-toggle":    { caption: "Toggle P and Q to see how AND, OR, NOT, and implication change" },
  "ev-calculator":   { caption: "Enter a game's payoff and probability to compute its expected value" },
  "normal-68":       { caption: "Drag σ to reshape the bell curve and watch the 68% / 95% bands shift" },
};

export default function InlineSim({ type, caption }: Props) {
  const meta = SIM_META[type];
  return (
    <SimWrapper caption={caption ?? meta.caption}>
      {type === "coin-proportion"  && <CoinProportionSim />}
      {type === "big-o-bars"       && <BigOBarsSim />}
      {type === "truth-toggle"     && <TruthToggleSim />}
      {type === "ev-calculator"    && <EvCalculatorSim />}
      {type === "normal-68"        && <Normal68Sim />}
    </SimWrapper>
  );
}
