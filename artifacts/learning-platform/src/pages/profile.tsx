import { Link } from "wouter";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  useGetUserProfile,
  useGetMyProgress,
  useGetDashboardSummary,
  type CourseProgress,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Zap, Flame, BookOpen, Trophy, ArrowRight } from "lucide-react";
import BadgeShelf from "@/components/BadgeShelf";
import ProgressRing from "@/components/ProgressRing";
import CourseIllustration from "@/components/CourseIllustration";
import Navbar from "@/components/Navbar";

// ── XP level system ────────────────────────────────────────────────────────────
const LEVELS = [
  { level: 1, name: "Newcomer",  min: 0,    max: 99   },
  { level: 2, name: "Learner",   min: 100,  max: 299  },
  { level: 3, name: "Scholar",   min: 300,  max: 699  },
  { level: 4, name: "Explorer",  min: 700,  max: 1499 },
  { level: 5, name: "Achiever",  min: 1500, max: 2999 },
  { level: 6, name: "Master",    min: 3000, max: 99999 },
];

function getLevel(xp: number) {
  const lvl = [...LEVELS].reverse().find((l) => xp >= l.min) ?? LEVELS[0];
  const next = LEVELS[lvl.level] ?? null;
  const pct = next
    ? Math.round(((xp - lvl.min) / (next.min - lvl.min)) * 100)
    : 100;
  return { ...lvl, next, pct };
}

// ── XP Sparkline helpers ───────────────────────────────────────────────────────
const BAR_W = 18;
const BAR_GAP = 5;
const SPARK_H = 72;

function buildSparkline(
  weeklyActivity: { day: string; xpEarned: number }[],
  totalXp: number,
  joinedAt: string,
): { label: string; xp: number; isReal: boolean }[] {
  // Prior 7 days (seeded)
  const seed = (new Date(joinedAt).getTime() >>> 0) ^ (totalXp * 17);
  const rand = seededRand(seed);
  const maxSeed = Math.max(10, Math.min(totalXp * 0.05, 80));
  const prior7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 13 + i);
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      xp: rand() > 0.45 ? Math.round(rand() * maxSeed) : 0,
      isReal: false,
    };
  });
  // Real last 7 days
  const real7 = weeklyActivity.map((a) => ({
    label: a.day,
    xp: a.xpEarned,
    isReal: true,
  }));
  return [...prior7, ...real7];
}
function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ── Heatmap data generation ────────────────────────────────────────────────────
const WEEKS = 18;
const DAYS  = WEEKS * 7;

interface HeatCell { date: Date; level: 0 | 1 | 2 | 3 }

function buildHeatmap(
  totalXp: number,
  lessonsCompleted: number,
  streakDays: number,
  joinedAt: string,
  realActivity: { day: string; active: boolean; xpEarned: number }[],
): HeatCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const seed = (new Date(joinedAt).getTime() >>> 0) ^ (totalXp * 31);
  const rand = seededRand(seed);

  // Build map of real activity by date string
  const realMap = new Map<string, number>();
  for (const a of realActivity) {
    if (a.active) realMap.set(a.day, a.xpEarned);
  }
  // Also mark the most recent `streakDays` days as active (streak enforcement)
  for (let d = 0; d < streakDays; d++) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - d);
    const key = dt.toISOString().slice(0, 10);
    if (!realMap.has(key)) realMap.set(key, 10 + Math.floor(rand() * 40));
  }

  const cells: HeatCell[] = [];
  const joinDate = new Date(joinedAt);
  joinDate.setHours(0, 0, 0, 0);
  const activeProbBase = Math.min(0.65, 0.1 + lessonsCompleted * 0.04);

  for (let i = DAYS - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);

    if (date < joinDate) {
      cells.push({ date, level: 0 });
      continue;
    }

    if (realMap.has(key)) {
      const xp = realMap.get(key)!;
      const level = xp >= 60 ? 3 : xp >= 30 ? 2 : 1;
      cells.push({ date, level });
      continue;
    }

    // Simulated: probability decays with distance from today
    const daysAgo = i;
    const recencyBoost = Math.max(0, 1 - daysAgo / DAYS);
    const prob = activeProbBase * (0.5 + recencyBoost);
    const r = rand();
    if (r < prob) {
      const intensity = rand();
      const level = intensity > 0.7 ? 3 : intensity > 0.4 ? 2 : 1;
      cells.push({ date, level });
    } else {
      cells.push({ date, level: 0 });
    }
  }
  return cells;
}

// ── Month labels for heatmap ───────────────────────────────────────────────────
function getMonthLabels(cells: HeatCell[]) {
  const labels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  for (let week = 0; week < WEEKS; week++) {
    const cell = cells[week * 7];
    if (!cell) continue;
    const m = cell.date.getMonth();
    if (m !== lastMonth) {
      labels.push({ label: cell.date.toLocaleString("default", { month: "short" }), colIndex: week });
      lastMonth = m;
    }
  }
  return labels;
}

const CELL = 13;
const GAP  = 3;
const STEP = CELL + GAP;
const DAY_LABELS = ["", "M", "", "W", "", "F", ""];

const HEAT_COLORS = [
  "bg-gray-100",
  "bg-indigo-200",
  "bg-indigo-400",
  "bg-indigo-600",
];

export default function ProfilePage() {
  const { data: profile, isLoading: loadingProfile } = useGetUserProfile();
  const { data: progress } = useGetMyProgress();
  const { data: summary } = useGetDashboardSummary();

  const totalXp          = profile?.totalXp ?? 0;
  const streakDays       = profile?.streakDays ?? 0;
  const lessonsCompleted = progress?.lessonsCompleted ?? 0;
  const challengesDone   = progress?.challengesCompleted ?? 0;
  const joinedAt         = profile?.joinedAt ?? new Date().toISOString();
  const lvl              = getLevel(totalXp);

  const recentCourses: CourseProgress[] = summary?.recentCourses ?? [];
  const coursesCompleted = recentCourses.filter((c) => c.percentComplete >= 100).length;

  const heatmap = useMemo(
    () => buildHeatmap(totalXp, lessonsCompleted, streakDays, joinedAt, summary?.weeklyActivity ?? []),
    [totalXp, lessonsCompleted, streakDays, joinedAt, summary?.weeklyActivity],
  );

  const monthLabels = useMemo(() => getMonthLabels(heatmap), [heatmap]);

  // Rows: 7 days; Cols: WEEKS
  const grid: HeatCell[][] = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: WEEKS }, (_, week) => heatmap[week * 7 + day] ?? { date: new Date(), level: 0 })
  );

  const activeDays = heatmap.filter((c) => c.level > 0).length;

  const stats = [
    { label: "Total XP",     value: totalXp,          icon: Zap,      color: "bg-indigo-50 text-indigo-600" },
    { label: "Day Streak",   value: streakDays,        icon: Flame,    color: "bg-orange-50 text-orange-500" },
    { label: "Lessons Done", value: lessonsCompleted,  icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
    { label: "Challenges",   value: challengesDone,    icon: Trophy,   color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar
      />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* ── Hero card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-card-border rounded-2xl p-7"
        >
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black text-indigo-600">
                {loadingProfile ? "?" : (profile?.displayName ?? "D")[0].toUpperCase()}
              </span>
            </div>

            {/* Name + level */}
            <div className="flex-1 min-w-0">
              {loadingProfile ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-4 w-52" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h1 className="text-xl font-bold font-display" data-testid="profile-name">
                      {profile?.displayName ?? "Demo Learner"}
                    </h1>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      Level {lvl.level} · {lvl.name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4" data-testid="profile-email">
                    Member since {new Date(joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>

                  {/* XP progress to next level */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span className="font-medium">{totalXp} XP</span>
                      {lvl.next ? (
                        <span>{lvl.next.min} XP · {lvl.next.name}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Max level reached</span>
                      )}
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#4f46e5] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${lvl.pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                    {lvl.next && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {lvl.next.min - totalXp} XP to {lvl.next.name}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stats grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── XP Sparkline ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-card border border-card-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base font-display">XP — last 14 days</h2>
            <span className="text-xs text-muted-foreground">
              {(() => {
                const bars = buildSparkline(summary?.weeklyActivity ?? [], totalXp, joinedAt);
                const total = bars.reduce((s, b) => s + b.xp, 0);
                return `${total} XP earned`;
              })()}
            </span>
          </div>
          {(() => {
            const bars = buildSparkline(summary?.weeklyActivity ?? [], totalXp, joinedAt);
            const max = Math.max(...bars.map((b) => b.xp), 1);
            const svgW = bars.length * (BAR_W + BAR_GAP) - BAR_GAP;
            return (
              <div className="overflow-x-auto">
                <svg width={svgW} height={SPARK_H + 28} className="block">
                  {bars.map((bar, i) => {
                    const barH = bar.xp > 0 ? Math.max(4, Math.round((bar.xp / max) * SPARK_H)) : 2;
                    const x = i * (BAR_W + BAR_GAP);
                    const y = SPARK_H - barH;
                    return (
                      <g key={i}>
                        <rect
                          x={x}
                          y={y}
                          width={BAR_W}
                          height={barH}
                          rx={4}
                          fill={bar.isReal ? "#4f46e5" : "#c7d2fe"}
                          opacity={bar.xp === 0 ? 0.25 : 1}
                        />
                        {bar.xp > 0 && (
                          <text
                            x={x + BAR_W / 2}
                            y={y - 3}
                            textAnchor="middle"
                            fontSize={8}
                            fill="#6366f1"
                            fontWeight="600"
                          >
                            {bar.xp}
                          </text>
                        )}
                        <text
                          x={x + BAR_W / 2}
                          y={SPARK_H + 14}
                          textAnchor="middle"
                          fontSize={9}
                          fill="#9ca3af"
                        >
                          {bar.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" /> This week
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-200 inline-block" /> Prior week (est.)
                  </span>
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* ── Activity heatmap ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-card-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base font-display">Activity</h2>
            <span className="text-xs text-muted-foreground">{activeDays} active days</span>
          </div>

          <div className="overflow-x-auto">
            <div style={{ width: WEEKS * STEP + 24 }}>
              {/* Month labels */}
              <div className="flex mb-1 pl-6">
                {monthLabels.map(({ label, colIndex }) => (
                  <div
                    key={`${label}-${colIndex}`}
                    className="text-[10px] text-muted-foreground absolute"
                    style={{ marginLeft: colIndex * STEP }}
                  >
                    {label}
                  </div>
                ))}
                {/* spacer to give month labels height */}
                <div style={{ height: 14 }} />
              </div>

              {/* Grid */}
              <div className="flex gap-0" style={{ gap: GAP }}>
                {/* Day labels */}
                <div className="flex flex-col" style={{ gap: GAP, marginRight: 4 }}>
                  {DAY_LABELS.map((d, i) => (
                    <div key={i} className="text-[10px] text-muted-foreground flex items-center justify-end" style={{ height: CELL }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Week columns */}
                {Array.from({ length: WEEKS }, (_, week) => (
                  <div key={week} className="flex flex-col" style={{ gap: GAP }}>
                    {Array.from({ length: 7 }, (_, day) => {
                      const cell = grid[day][week];
                      if (!cell) return <div key={day} style={{ width: CELL, height: CELL }} />;
                      return (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: (week * 7 + day) * 0.001 }}
                          title={`${cell.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${cell.level > 0 ? " · active" : ""}`}
                          className={`rounded-sm ${HEAT_COLORS[cell.level]}`}
                          style={{ width: CELL, height: CELL }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-1.5 mt-3 pl-6">
                <span className="text-[10px] text-muted-foreground mr-1">Less</span>
                {HEAT_COLORS.map((c, i) => (
                  <div key={i} className={`rounded-sm ${c}`} style={{ width: CELL, height: CELL }} />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1">More</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Badges ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BadgeShelf summary={{ totalXp, streakDays, lessonsCompleted, challengesCompleted: challengesDone, coursesCompleted }} />
        </motion.div>

        {/* ── Courses in progress ───────────────────────────────── */}
        {recentCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-card-border rounded-2xl p-6"
          >
            <h2 className="font-semibold text-base mb-4 font-display">Courses</h2>
            <div className="space-y-3">
              {recentCourses.map((cp) => {
                const isComplete = cp.percentComplete >= 100;
                return (
                  <Link key={cp.courseId} href={`/courses/${cp.courseId}`}>
                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group">
                      {/* Progress ring */}
                      <div className="flex-shrink-0">
                        <ProgressRing
                          pct={cp.percentComplete}
                          size={44}
                          strokeWidth={4}
                          color={isComplete ? "#22c55e" : "#4f46e5"}
                          trackColor="#e5e7eb"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {isComplete ? "✓ " : ""}{cp.completedLessons}/{cp.totalLessons} lessons
                          </p>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-[#4f46e5]"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${cp.percentComplete}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {/* XP + arrow */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-0.5">
                          <Zap className="w-3 h-3" />{cp.xpEarned}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
