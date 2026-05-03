import { useParams, Link } from "wouter";
import { useState } from "react";
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
  Brain,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Play,
  FlaskConical,
  BookOpen,
  Zap,
} from "lucide-react";
import { LESSON_LABS } from "@/components/labs";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = parseInt(courseId ?? "0");
  const [hoveredLesson, setHoveredLesson] = useState<number | null>(null);

  const { data: course, isLoading: loadingCourse } = useGetCourse(id, {
    query: { enabled: !!id, queryKey: getGetCourseQueryKey(id) },
  });
  const { data: progress } = useGetCourseProgress(id, {
    query: { enabled: !!id, queryKey: getGetCourseProgressQueryKey(id) },
  });

  if (loadingCourse) {
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
          <Link href="/courses">
            <Button>Browse courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const nextLessonId = progress?.currentLessonId ?? course.lessons?.[0]?.id;
  const percentComplete = progress?.percentComplete ?? 0;
  const completedCount = progress?.completedLessons ?? 0;
  const totalCount = course.lessons?.length ?? 0;

  const sortedLessons = [...(course.lessons ?? [])].sort(
    (a, b) => a.order - b.order
  );

  const getLessonState = (lessonId: number) => {
    if (!progress) return sortedLessons[0]?.id === lessonId ? "current" : "locked";
    const completedIndices = Math.min(progress.completedLessons, totalCount);
    const idx = sortedLessons.findIndex((l) => l.id === lessonId);
    if (idx < completedIndices) return "completed";
    if (idx === completedIndices) return "current";
    return "locked";
  };

  const currentLesson = sortedLessons.find(
    (l) => getLessonState(l.id) === "current"
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/courses">
            <button
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              data-testid="button-back-courses"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: (course.iconColor ?? "#4f46e5") + "20" }}
            >
              <Brain className="w-4 h-4" style={{ color: course.iconColor ?? "#4f46e5" }} />
            </div>
            <span className="font-semibold text-sm text-gray-900">
              {course.title}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left: Course info card ─────────────────────────────────── */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-20">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: (course.iconColor ?? "#4f46e5") + "18" }}
              >
                <Brain
                  className="w-9 h-9"
                  style={{ color: course.iconColor ?? "#4f46e5" }}
                />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  {course.category}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    course.difficulty === "beginner"
                      ? "bg-emerald-50 text-emerald-600"
                      : course.difficulty === "intermediate"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {course.difficulty}
                </span>
              </div>
              <h1
                className="text-xl font-bold text-gray-900 mb-2"
                data-testid="course-title"
              >
                {course.title}
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {course.description}
              </p>

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

              {/* Progress bar */}
              {progress && (
                <div data-testid="course-progress">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Progress</span>
                    <span className="font-semibold text-[#4f46e5]">
                      {completedCount}/{totalCount}
                    </span>
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

              {/* CTA */}
              {nextLessonId && (
                <Link href={`/lessons/${nextLessonId}`}>
                  <Button
                    size="lg"
                    className="w-full h-12 rounded-full mt-5 gap-2 font-bold bg-[#4f46e5] hover:bg-[#4338ca]"
                    data-testid="button-start-course"
                  >
                    {(progress?.completedLessons ?? 0) > 0
                      ? "Continue"
                      : "Start course"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* ── Right: Lesson path ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-6">
              Learning Path
            </h2>
            <div className="relative">
              {/* Connector line — runs through center of bubbles */}
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-100" />

              <div className="space-y-2">
                {sortedLessons.map((lesson, i) => {
                  const state = getLessonState(lesson.id);
                  const isClickable = state !== "locked";
                  const isHovered = hoveredLesson === lesson.id;
                  const hasLab = !!LESSON_LABS[lesson.id];

                  // Node visual props
                  let nodeBg = "bg-gray-100";
                  let nodeRing = "";
                  let nodeIconColor = "text-gray-400";
                  if (state === "completed") {
                    nodeBg = "bg-emerald-500";
                    nodeIconColor = "text-white";
                  } else if (state === "current") {
                    nodeBg = "bg-[#4f46e5]";
                    nodeIconColor = "text-white";
                    nodeRing = "ring-4 ring-[#4f46e5]/20";
                  }

                  const NodeIcon =
                    state === "completed"
                      ? CheckCircle2
                      : state === "current"
                      ? Play
                      : Lock;

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="relative flex items-start gap-5"
                      onMouseEnter={() => isClickable && setHoveredLesson(lesson.id)}
                      onMouseLeave={() => setHoveredLesson(null)}
                    >
                      {/* Bubble node */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${nodeBg} ${nodeRing}`}
                        >
                          {state === "current" && (
                            <motion.div
                              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ repeat: Infinity, duration: 2.2 }}
                              className="absolute inset-0 rounded-full border-2 border-[#4f46e5]"
                            />
                          )}
                          <NodeIcon className={`w-6 h-6 ${nodeIconColor}`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div
                        className={`flex-1 min-w-0 py-3 transition-all ${
                          state === "locked" ? "opacity-50" : ""
                        }`}
                      >
                        {isClickable ? (
                          <Link href={`/lessons/${lesson.id}`}>
                            <div
                              className={`rounded-2xl p-4 border-2 transition-all ${
                                state === "current"
                                  ? "border-[#4f46e5]/20 bg-[#f5f4ff]"
                                  : isHovered
                                  ? "border-gray-200 bg-gray-50"
                                  : "border-transparent"
                              } cursor-pointer`}
                              data-testid={`lesson-node-${lesson.id}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                                    Lesson {lesson.order}
                                  </p>
                                  <h3
                                    className={`font-bold text-base leading-snug ${
                                      state === "current"
                                        ? "text-[#4f46e5]"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {lesson.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                                    {lesson.description}
                                  </p>
                                  {hasLab && (
                                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-[#4f46e5]/8 text-xs font-semibold text-[#4f46e5]">
                                      <FlaskConical className="w-3 h-3" />
                                      Interactive lab
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                                  <span className="text-xs font-bold text-[#4f46e5]">
                                    {lesson.xpReward} XP
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {lesson.challengeCount} qs
                                  </span>
                                  {state === "current" && (
                                    <ArrowRight className="w-4 h-4 text-[#4f46e5] mt-1" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div
                            className="rounded-2xl p-4 border-2 border-transparent"
                            data-testid={`lesson-node-locked-${lesson.id}`}
                          >
                            <p className="text-xs text-gray-400 font-medium mb-0.5">
                              Lesson {lesson.order}
                            </p>
                            <h3 className="font-bold text-base text-gray-500">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-gray-400 mt-0.5">
                              {lesson.description}
                            </p>
                            {hasLab && (
                              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-400">
                                <FlaskConical className="w-3 h-3" />
                                Interactive lab
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Floating "Start" card for current lesson */}
            <AnimatePresence>
              {currentLesson && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 28 }}
                  className="mt-8 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] rounded-3xl p-6 text-white shadow-lg shadow-indigo-200"
                >
                  <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">
                    Up next
                  </p>
                  <h3 className="text-xl font-bold mb-1">{currentLesson.title}</h3>
                  <p className="text-indigo-200 text-sm mb-5">
                    {currentLesson.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-indigo-200 text-sm">
                      <span>{currentLesson.challengeCount} challenges</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        {currentLesson.xpReward} XP
                      </span>
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
