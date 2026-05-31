import { useParams, Link } from "wouter";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetCourse,
  useGetCourseProgress,
  getGetCourseQueryKey,
  getGetCourseProgressQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Play,
  FlaskConical,
  BookOpen,
  Zap,
  Star,
} from "lucide-react";
import { LESSON_LABS } from "@/components/labs";
import CourseIllustration from "@/components/CourseIllustration";
import Navbar from "@/components/Navbar";
import FormulaSheet from "@/components/FormulaSheet";

// ── Map geometry ──────────────────────────────────────────────────────────────
const MAP_W = 480;
const ROW_H = 140;
const NODE_D = 66;
const NODE_R = NODE_D / 2;
const PAD_TOP = 28;
const LEFT_CX = 88;
const RIGHT_CX = MAP_W - 88;

function nodePos(i: number) {
  return {
    cx: i % 2 === 0 ? LEFT_CX : RIGHT_CX,
    cy: PAD_TOP + NODE_R + i * ROW_H,
  };
}

function buildPath(pts: { cx: number; cy: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].cx} ${pts[0].cy}`;
  let d = `M ${pts[0].cx} ${pts[0].cy}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const f = pts[i], t = pts[i + 1];
    const midY = (f.cy + t.cy) / 2;
    d += ` C ${f.cx} ${midY}, ${t.cx} ${midY}, ${t.cx} ${t.cy}`;
  }
  return d;
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = parseInt(courseId ?? "0");
  const [hoveredLesson, setHoveredLesson] = useState<number | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: course, isLoading } = useGetCourse(id, {
    query: { enabled: !!id, queryKey: getGetCourseQueryKey(id) },
  });
  const { data: progress } = useGetCourseProgress(id, {
    query: { enabled: !!id, queryKey: getGetCourseProgressQueryKey(id) },
  });

  const enterNode = (lessonId: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredLesson(lessonId);
  };
  const leaveNode = () => {
    hoverTimer.current = setTimeout(() => setHoveredLesson(null), 160);
  };
  const enterCard = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };
  const leaveCard = () => {
    hoverTimer.current = setTimeout(() => setHoveredLesson(null), 160);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-80" />
          <div className="flex gap-8 pt-6">
            <Skeleton className="w-72 h-64 rounded-3xl flex-shrink-0" />
            <div className="flex-1 space-y-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                  <Skeleton className="flex-1 h-14 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Course not found</p>
          <Link href="/courses"><Button>Browse courses</Button></Link>
        </div>
      </div>
    );
  }

  const sortedLessons = [...(course.lessons ?? [])].sort((a, b) => a.order - b.order);
  const totalCount = sortedLessons.length;
  const completedCount = progress?.completedLessons ?? 0;
  const percentComplete = progress?.percentComplete ?? 0;
  const nextLessonId = progress?.currentLessonId ?? sortedLessons[0]?.id;

  const getLessonState = (lessonId: number): "completed" | "current" | "locked" => {
    const idx = sortedLessons.findIndex((l) => l.id === lessonId);
    if (idx < completedCount) return "completed";
    if (idx === completedCount) return "current";
    return "locked";
  };

  const currentLesson = sortedLessons.find((l) => getLessonState(l.id) === "current");

  // SVG paths
  const positions = sortedLessons.map((_, i) => nodePos(i));
  const totalMapH = PAD_TOP + NODE_D + (totalCount - 1) * ROW_H + PAD_TOP;

  const fullPath = buildPath(positions);
  const donePts = positions.slice(0, Math.min(completedCount + 1, positions.length));
  const donePath = buildPath(donePts);

  return (
    <div className="min-h-screen bg-white">
      <Navbar
      />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Left sidebar ──────────────────────────────────────── */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-20">
              <div className="flex items-center justify-center mb-5 py-4 rounded-2xl" style={{ backgroundColor: (course.iconColor ?? "#4f46e5") + "10" }}>
                <CourseIllustration category={course.category} iconColor={course.iconColor} size={88} />
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{course.category}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  course.difficulty === "beginner" ? "bg-emerald-50 text-emerald-600" :
                  course.difficulty === "intermediate" ? "bg-amber-50 text-amber-600" :
                  "bg-rose-50 text-rose-600"
                }`}>{course.difficulty}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2" data-testid="course-title">{course.title}</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{course.description}</p>

              <div className="flex gap-4 text-sm text-gray-500 mb-5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>{totalCount} lessons</span>
                </div>
                {progress && (
                  <div className="flex items-center gap-1.5 text-[#4f46e5] font-medium">
                    <Zap className="w-4 h-4" />
                    <span>{progress.xpEarned} XP</span>
                  </div>
                )}
              </div>

              {progress && (
                <div className="mb-5" data-testid="course-progress">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Progress</span>
                    <span className="font-semibold text-[#4f46e5]">{completedCount}/{totalCount}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#4f46e5] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentComplete}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{percentComplete}% complete</p>
                </div>
              )}

              {nextLessonId && (
                <Link href={`/lessons/${nextLessonId}`}>
                  <Button size="lg" className="w-full h-12 rounded-full gap-2 font-bold bg-[#4f46e5] hover:bg-[#4338ca]" data-testid="button-start-course">
                    {(progress?.completedLessons ?? 0) > 0 ? "Continue" : "Start course"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}

              {/* Formula Sheet */}
              <FormulaSheet courseId={id} />
            </div>
          </div>

          {/* ── Course map ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-6">
              Learning Path
            </h2>

            <div className="overflow-x-auto">
              <div className="relative mx-auto" style={{ width: MAP_W, height: totalMapH }}>

                {/* ── SVG track ── */}
                <svg
                  width={MAP_W}
                  height={totalMapH}
                  viewBox={`0 0 ${MAP_W} ${totalMapH}`}
                  className="absolute inset-0 pointer-events-none"
                  style={{ overflow: "visible" }}
                >
                  {/* Gray full track */}
                  <path d={fullPath} fill="none" stroke="#f0f0f0" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
                  {/* Completed track */}
                  {donePath && (
                    <path d={donePath} fill="none" stroke="#4f46e5" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
                  )}
                </svg>

                {/* ── Lesson nodes ── */}
                {sortedLessons.map((lesson, i) => {
                  const state = getLessonState(lesson.id);
                  const pos = positions[i];
                  const isLeft = i % 2 === 0;
                  const isClickable = state !== "locked";
                  const isHovered = hoveredLesson === lesson.id;
                  const hasLab = !!LESSON_LABS[lesson.id];

                  const nodeBg =
                    state === "completed" ? "#22c55e" :
                    state === "current"   ? "#4f46e5" :
                                            "#e5e7eb";
                  const nodeShadow =
                    state === "completed" ? "0 4px 14px rgba(34,197,94,0.35)" :
                    state === "current"   ? "0 4px 18px rgba(79,70,229,0.4)" :
                                            "0 2px 6px rgba(0,0,0,0.08)";

                  return (
                    <div
                      key={lesson.id}
                      className="absolute"
                      style={{ left: pos.cx - NODE_R, top: pos.cy - NODE_R, zIndex: isHovered ? 30 : 10 }}
                      onMouseEnter={() => isClickable && enterNode(lesson.id)}
                      onMouseLeave={leaveNode}
                    >
                      {/* Node circle */}
                      {isClickable ? (
                        <Link href={`/lessons/${lesson.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.94 }}
                            className="rounded-full flex items-center justify-center cursor-pointer relative"
                            style={{ width: NODE_D, height: NODE_D, backgroundColor: nodeBg, boxShadow: nodeShadow }}
                          >
                            {state === "current" && (
                              <motion.div
                                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                                className="absolute rounded-full border-2 border-[#4f46e5]"
                                style={{ inset: -7 }}
                              />
                            )}
                            {state === "completed" ? (
                              <CheckCircle2 className="w-7 h-7 text-white" />
                            ) : (
                              <Play className="w-7 h-7 text-white ml-0.5" />
                            )}
                          </motion.div>
                        </Link>
                      ) : (
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{ width: NODE_D, height: NODE_D, backgroundColor: nodeBg, boxShadow: nodeShadow }}
                        >
                          <span className="text-sm font-bold text-gray-400">{lesson.order}</span>
                        </div>
                      )}

                      {/* Lesson order badge */}
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white ${
                        state === "completed" ? "bg-emerald-100 text-emerald-700" :
                        state === "current"   ? "bg-indigo-100 text-indigo-700" :
                                                "bg-gray-100 text-gray-400"
                      }`}>
                        {lesson.order}
                      </div>

                      {/* Lab badge */}
                      {hasLab && (
                        <div className={`absolute whitespace-nowrap flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          state !== "locked"
                            ? "bg-indigo-50 text-indigo-500 border-indigo-100"
                            : "bg-gray-50 text-gray-400 border-gray-100"
                        }`} style={{ bottom: -22, left: "50%", transform: "translateX(-50%)" }}>
                          <FlaskConical className="w-2.5 h-2.5" />
                          Lab
                        </div>
                      )}

                      {/* Inline label - right side for left nodes, left side for right nodes */}
                      <div
                        className="absolute"
                        style={{
                          top: "50%",
                          transform: "translateY(-50%)",
                          ...(isLeft
                            ? { left: NODE_D + 14, width: 168 }
                            : { right: NODE_D + 14, width: 168, textAlign: "right" }),
                        }}
                      >
                        <p className={`text-[10px] font-medium mb-0.5 ${state !== "locked" ? "text-gray-400" : "text-gray-300"}`}>
                          Lesson {lesson.order}
                        </p>
                        <p className={`font-bold text-sm leading-snug ${
                          state === "current"   ? "text-[#4f46e5]" :
                          state === "completed" ? "text-gray-700" :
                                                  "text-gray-400"
                        }`}>
                          {lesson.title}
                        </p>
                        <p className={`text-xs mt-0.5 flex items-center gap-1 ${isLeft ? "" : "justify-end"} ${state !== "locked" ? "text-[#4f46e5]" : "text-gray-300"}`}>
                          <Zap className="w-3 h-3" />
                          {lesson.xpReward} XP
                        </p>
                      </div>

                      {/* Hover tooltip card */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            transition={{ duration: 0.14 }}
                            className="absolute z-50 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
                            style={{
                              top: -8,
                              ...(isLeft ? { left: NODE_D + 12 } : { right: NODE_D + 12 }),
                            }}
                            onMouseEnter={enterCard}
                            onMouseLeave={leaveCard}
                          >
                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">Lesson {lesson.order}</p>
                            <h4 className="font-bold text-sm text-gray-900 leading-snug mb-1">{lesson.title}</h4>
                            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">{lesson.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="text-xs text-gray-400">{lesson.challengeCount} questions</span>
                              <span className="text-xs font-bold text-indigo-600 flex items-center gap-0.5">
                                <Zap className="w-3 h-3" />{lesson.xpReward} XP
                              </span>
                              {hasLab && (
                                <span className="text-xs font-semibold text-indigo-500 flex items-center gap-0.5 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                                  <FlaskConical className="w-3 h-3" />Lab
                                </span>
                              )}
                            </div>
                            <Link href={`/lessons/${lesson.id}`}>
                              <button className="w-full h-8 rounded-full bg-[#4f46e5] text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#4338ca] transition-colors">
                                {state === "completed" ? "Replay" : "Continue"}
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Up next card */}
            <AnimatePresence>
              {currentLesson && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 28 }}
                  className="mt-10 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 max-w-[480px]"
                >
                  <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Up next</p>
                  <h3 className="text-xl font-bold mb-1">{currentLesson.title}</h3>
                  <p className="text-indigo-200 text-sm mb-5">{currentLesson.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-indigo-200 text-sm">
                      <span>{currentLesson.challengeCount} challenges</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />{currentLesson.xpReward} XP
                      </span>
                      {LESSON_LABS[currentLesson.id] && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5" />Lab</span>
                        </>
                      )}
                    </div>
                    <Link href={`/lessons/${currentLesson.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-white text-[#4f46e5] px-6 h-11 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm"
                      >
                        Start <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
