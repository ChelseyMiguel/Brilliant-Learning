/**
 * BadgeShelf — medallion achievement system
 *
 * Each badge is a layered SVG (ribbon → shadow → metallic ring → inner disc
 * → emblem → radial gloss).  A per-theme colour triple drives all gradients so
 * every medal reads as the same physical family.
 *
 * Hover → "pop" scale + rotating gloss sweep
 * Locked → greyscale + opacity; lifts slightly on hover
 * Newest unlock → looping amber glow pulse
 */

import { motion } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SummaryLike {
  totalXp?: number;
  streakDays?: number;
  lessonsCompleted?: number;
  challengesCompleted?: number;
  coursesCompleted?: number;
}

// ── Emblem paths (24 × 24 viewBox icons, rendered at 1.5× inside the disc) ──

const EMBLEMS: Record<string, string> = {
  flag:   '<path d="M5 21V5h9l1 5h4v8h-5l-1-5H7v8z" />',
  flame:  '<path d="M12 3c1.2 3.4 3.4 4.8 3.4 8 0 1.2-.5 2.2-1.3 2.9.9-.2 1.8-1.1 2.2-2.3 1.6 1.7 2.7 3.9 2.7 6.4a6.5 6.5 0 0 1-13 0c0-1.2.4-2.4 1.1-3.4.3 1.2 1.1 2.1 2.3 2.4C8.4 9.5 10.2 8 12 3z" />',
  bolt:   '<path d="M11 3 5 13h5l-1 8 7-11h-5z" />',
  star:   '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9z" />',
  flask:  '<path d="M9 3v8L5 19a1 1 0 0 0 .9 1.4h12.2A1 1 0 0 0 19 19l-4-8V3" /><line x1="9" y1="3" x2="15" y2="3" />',
  bulb:   '<path d="M9 18h6M9 21h6M12 3a6 6 0 0 1 4.5 10.1A4 4 0 0 0 15 16H9a4 4 0 0 0-1.5-2.9A6 6 0 0 1 12 3z" />',
  trophy: '<path d="M8 21h8M12 17v4M7 4H4a1 1 0 0 0-1 1v3a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V5a1 1 0 0 0-1-1h-3" /><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" />',
  crown:  '<path d="M3 17h18M3 17L6 7l5 5 4-8 4 8 4-5-3 10" />',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
};

// ── Per-theme colour triples (light / mid / dark) ────────────────────────────

const THEMES: Record<string, { l: string; m: string; d: string }> = {
  green:  { l: "#7be0a8", m: "#34c07d", d: "#1f9e66" },
  orange: { l: "#ffb866", m: "#fb9d3e", d: "#ef7e23" },
  indigo: { l: "#9b98ff", m: "#6c68f5", d: "#4744e0" },
  purple: { l: "#c79bff", m: "#a86bf0", d: "#8b45e0" },
  teal:   { l: "#74d9e8", m: "#3fbfd2", d: "#1fa3b8" },
  blue:   { l: "#7aacff", m: "#4a82f5", d: "#2d5be3" },
  gold:   { l: "#ffd874", m: "#f4c04a", d: "#e0a52e" },
};

// ── 12 rim notches placed via trig ───────────────────────────────────────────

function notches(id: string): string {
  let s = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = (52 + Math.cos(a) * 40).toFixed(1);
    const y = (54 + Math.sin(a) * 40).toFixed(1);
    s += `<circle cx="${x}" cy="${y}" r="2.4" fill="#fff" opacity="0.45"/>`;
  }
  return s;
}

// ── SVG medal generator ───────────────────────────────────────────────────────

let _uid = 0;
function medal(themeKey: string, emblem: string): string {
  const t = THEMES[themeKey] ?? THEMES.indigo;
  const id = "m" + _uid++;
  const path = EMBLEMS[emblem] ?? EMBLEMS.star;
  return `
<svg viewBox="0 0 104 120" xmlns="http://www.w3.org/2000/svg" width="104" height="120">
  <defs>
    <linearGradient id="ring${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.l}"/>
      <stop offset="1" stop-color="${t.d}"/>
    </linearGradient>
    <linearGradient id="disc${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.m}"/>
      <stop offset="1" stop-color="${t.d}"/>
    </linearGradient>
    <radialGradient id="gloss${id}" cx="0.5" cy="0.32" r="0.62">
      <stop offset="0"    stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="0.55" stop-color="#fff" stop-opacity="0.06"/>
      <stop offset="1"    stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- ribbon tails -->
  <path d="M34 60 L24 110 L40 100 L46 70 Z" fill="${t.d}" opacity="0.9"/>
  <path d="M70 60 L80 110 L64 100 L58 70 Z" fill="${t.m}" opacity="0.9"/>

  <!-- drop shadow -->
  <ellipse cx="52" cy="60" rx="38" ry="8" fill="#1a2236" opacity="0.18"/>

  <!-- outer ring -->
  <circle cx="52" cy="54" r="40" fill="url(#ring${id})"/>
  <circle cx="52" cy="54" r="40" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="1.5"/>

  <!-- rim notches -->
  ${notches(id)}

  <!-- inner disc -->
  <circle cx="52" cy="54" r="31" fill="url(#disc${id})"/>
  <circle cx="52" cy="54" r="31" fill="none" stroke="${t.d}" stroke-opacity="0.5" stroke-width="1.5"/>

  <!-- emblem icon -->
  <g transform="translate(34,36) scale(1.5)"
     fill="none" stroke="#fff" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" opacity="0.95">
    ${path}
  </g>

  <!-- gloss highlight -->
  <circle cx="52" cy="54" r="31" fill="url(#gloss${id})"/>
</svg>`;
}

// ── Achievement data ──────────────────────────────────────────────────────────

interface Achievement {
  id: string;
  title: string;
  desc: string;
  theme: string;
  emblem: string;
  goal: number;
  value: (s: SummaryLike) => number;
  milestoneLabel?: string; // e.g. "7-day streak"
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-step",
    title: "First Step",
    desc: "Complete your first lesson",
    theme: "green",
    emblem: "flag",
    goal: 1,
    value: (s) => Math.min(s.lessonsCompleted ?? 0, 1),
  },
  {
    id: "on-a-roll",
    title: "On a Roll",
    desc: "Maintain a 3-day streak",
    theme: "orange",
    emblem: "flame",
    goal: 3,
    value: (s) => Math.min(s.streakDays ?? 0, 3),
    milestoneLabel: "3-day streak",
  },
  {
    id: "week-warrior",
    title: "Week Warrior",
    desc: "Maintain a 7-day streak",
    theme: "orange",
    emblem: "flame",
    goal: 7,
    value: (s) => Math.min(s.streakDays ?? 0, 7),
    milestoneLabel: "7-day streak",
  },
  {
    id: "century",
    title: "Century",
    desc: "Earn 100 XP",
    theme: "indigo",
    emblem: "bolt",
    goal: 100,
    value: (s) => Math.min(s.totalXp ?? 0, 100),
  },
  {
    id: "power-learner",
    title: "Power Learner",
    desc: "Earn 500 XP",
    theme: "purple",
    emblem: "star",
    goal: 500,
    value: (s) => Math.min(s.totalXp ?? 0, 500),
  },
  {
    id: "curious-mind",
    title: "Curious Mind",
    desc: "Answer 10 challenges",
    theme: "teal",
    emblem: "flask",
    goal: 10,
    value: (s) => Math.min(s.challengesCompleted ?? 0, 10),
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    desc: "Answer 50 challenges",
    theme: "blue",
    emblem: "target",
    goal: 50,
    value: (s) => Math.min(s.challengesCompleted ?? 0, 50),
  },
  {
    id: "graduate",
    title: "Graduate",
    desc: "Complete a full course",
    theme: "gold",
    emblem: "trophy",
    goal: 1,
    value: (s) => Math.min(s.coursesCompleted ?? 0, 1),
  },
  {
    id: "luminary",
    title: "Luminary",
    desc: "Earn 1 000 XP",
    theme: "gold",
    emblem: "crown",
    goal: 1000,
    value: (s) => Math.min(s.totalXp ?? 0, 1000),
  },
];

// ── Check icon & lock icon (inline SVG strings for dangerouslySetInnerHTML) ──
// We keep the main render in JSX but the medal SVG is injected as HTML.

// ── Component ─────────────────────────────────────────────────────────────────

export default function BadgeShelf({ summary }: { summary: SummaryLike }) {
  const earnedCount = ACHIEVEMENTS.filter((a) => a.value(summary) >= a.goal).length;
  const pct = Math.round((earnedCount / ACHIEVEMENTS.length) * 100);

  // Sort: unlocked first, then by progress desc
  const sorted = [...ACHIEVEMENTS].sort((a, b) => {
    const aEarned = a.value(summary) >= a.goal ? 1 : 0;
    const bEarned = b.value(summary) >= b.goal ? 1 : 0;
    if (aEarned !== bEarned) return bEarned - aEarned;
    return b.value(summary) / b.goal - a.value(summary) / a.goal;
  });

  // The most recently unlocked one gets the "NEW" glow (highest earned index)
  const newestId = sorted.find((a) => a.value(summary) >= a.goal)?.id ?? null;

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-base font-display">Achievements</h2>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          {earnedCount} / {ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="mb-6">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {sorted.map((ach, i) => {
          const cur = ach.value(summary);
          const unlocked = cur >= ach.goal;
          const isNew = unlocked && ach.id === newestId;
          const progressPct = Math.max(4, Math.round((cur / ach.goal) * 100));

          return (
            <BadgeCard
              key={ach.id}
              ach={ach}
              cur={cur}
              unlocked={unlocked}
              isNew={isNew}
              progressPct={progressPct}
              delay={i * 0.045}
            />
          );
        })}
      </div>

      {/* Hover hint */}
      <p className="text-center text-[10px] text-muted-foreground mt-5 opacity-60">
        Hover a medal for a closer look
      </p>
    </div>
  );
}

// ── Single badge card ─────────────────────────────────────────────────────────

interface BadgeCardProps {
  ach: Achievement;
  cur: number;
  unlocked: boolean;
  isNew: boolean;
  progressPct: number;
  delay: number;
}

function BadgeCard({ ach, cur, unlocked, isNew, progressPct, delay }: BadgeCardProps) {
  const medalSvg = medal(ach.theme, ach.emblem);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={[
        "badge-card relative flex flex-col items-center text-center rounded-2xl p-3 pt-4 gap-1 select-none",
        "border transition-all duration-200",
        unlocked
          ? "border-transparent bg-muted/20 hover:bg-muted/40"
          : "border-dashed border-border/60 hover:border-border",
        isNew ? "is-new" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* NEW tag */}
      {isNew && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 shadow-sm z-10">
          NEW
        </span>
      )}

      {/* Lock chip */}
      {!unlocked && (
        <span className="absolute top-2 right-2 text-muted-foreground/60">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </span>
      )}

      {/* Medal + gloss sweep wrapper */}
      <div
        className={["medal-wrap relative mb-1", unlocked ? "" : "locked-medal"].join(" ")}
        style={{ width: 86, height: 100 }}
      >
        {/* The SVG medal */}
        <div
          className="medal-svg"
          style={{ width: 86, height: 100 }}
          dangerouslySetInnerHTML={{ __html: medalSvg }}
        />
        {/* Gloss sweep overlay — clipped circle */}
        <div
          className="shine-clip absolute"
          style={{
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 66,
            height: 66,
            borderRadius: "50%",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div className="shine-streak" />
        </div>
      </div>

      {/* Title */}
      <p className={`text-[11px] font-bold leading-tight font-display ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
        {ach.title}
      </p>

      {/* Description */}
      <p className="text-[10px] text-muted-foreground leading-snug px-1">
        {ach.desc}
      </p>

      {/* Status */}
      {unlocked ? (
        <div className="flex items-center gap-1 mt-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            className="text-emerald-500">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="text-[9px] font-bold text-emerald-600">Unlocked</span>
        </div>
      ) : (
        <div className="w-full mt-1.5 px-1">
          <div className="flex justify-between text-[8px] text-muted-foreground mb-0.5">
            <span>In progress</span>
            <span className="tabular-nums">{cur.toLocaleString()} / {ach.goal.toLocaleString()}</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-400/60 transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Named exports kept for backward compat
export const BADGES = ACHIEVEMENTS;
export type { SummaryLike as BadgeSummary };
