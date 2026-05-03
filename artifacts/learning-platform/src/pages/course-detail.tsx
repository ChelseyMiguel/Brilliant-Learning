import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import {
  useGetCourse,
  useGetCourseProgress,
  getGetCourseQueryKey,
  getGetCourseProgressQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, ArrowLeft, ArrowRight, CheckCircle2, Lock, Circle } from "lucide-react";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = parseInt(courseId ?? "0");

  const { data: course, isLoading: loadingCourse } = useGetCourse(id, {
    query: { enabled: !!id, queryKey: getGetCourseQueryKey(id) },
  });
  const { data: progress } = useGetCourseProgress(id, {
    query: { enabled: !!id, queryKey: getGetCourseProgressQueryKey(id) },
  });

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-6 w-48" />
          <div className="space-y-4 pt-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Course not found</p>
          <Link href="/courses"><Button>Browse courses</Button></Link>
        </div>
      </div>
    );
  }

  const completedIds = new Set<number>(/* populated from progress.completedLessons */ []);
  const nextLessonId = progress?.currentLessonId ?? course.lessons?.[0]?.id;
  const percentComplete = progress?.percentComplete ?? 0;
  const completedCount = progress?.completedLessons ?? 0;
  const totalCount = course.lessons?.length ?? 0;

  // Determine lesson states: completed, current (next unlocked), locked
  const getLessonState = (lessonId: number, lessonOrder: number) => {
    if (!progress) return lessonOrder === 1 ? "current" : "locked";
    const completedIndices = Math.min(progress.completedLessons, totalCount);
    const sortedLessons = [...(course.lessons ?? [])].sort((a, b) => a.order - b.order);
    const idx = sortedLessons.findIndex(l => l.id === lessonId);
    if (idx < completedIndices) return "completed";
    if (idx === completedIndices) return "current";
    return "locked";
  };

  const sortedLessons = [...(course.lessons ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/courses">
            <Button variant="ghost" size="icon" data-testid="button-back-courses">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">{course.title}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Course header */}
        <div className="mb-10">
          <div className="flex items-start gap-5 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: course.iconColor + "20" }}
            >
              <Brain className="w-8 h-8" style={{ color: course.iconColor }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{course.category}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  course.difficulty === "beginner" ? "bg-emerald-50 text-emerald-600" :
                  course.difficulty === "intermediate" ? "bg-amber-50 text-amber-600" :
                  "bg-rose-50 text-rose-600"
                }`}>{course.difficulty}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="course-title">{course.title}</h1>
              <p className="text-muted-foreground mt-1 leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="bg-card border border-card-border rounded-2xl p-5" data-testid="course-progress">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Your progress</span>
                <span className="text-sm font-semibold text-primary">{completedCount}/{totalCount} lessons</span>
              </div>
              <Progress value={percentComplete} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{percentComplete}% complete · {progress.xpEarned} XP earned</p>
            </div>
          )}
        </div>

        {/* Lesson path */}
        <div>
          <h2 className="text-lg font-semibold mb-6">Learning Path</h2>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border" />

            <div className="space-y-4">
              {sortedLessons.map((lesson, i) => {
                const state = getLessonState(lesson.id, lesson.order);
                const isClickable = state !== "locked";

                const NodeIcon = state === "completed" ? CheckCircle2 : state === "current" ? Circle : Lock;
                const nodeColor = state === "completed"
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : state === "current"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border";

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="relative flex items-start gap-5"
                  >
                    {/* Node */}
                    <div className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${nodeColor} ${state === "current" ? "ring-4 ring-primary/20" : ""}`}>
                      <NodeIcon className="w-5 h-5" />
                      {state === "current" && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 rounded-full border-2 border-primary opacity-40"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 bg-card border rounded-2xl p-5 transition-all ${
                      isClickable ? "border-card-border hover:border-primary/40 hover:shadow-sm cursor-pointer" : "border-border opacity-60"
                    }`}>
                      {isClickable ? (
                        <Link href={`/lessons/${lesson.id}`}>
                          <div data-testid={`lesson-node-${lesson.id}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1">Lesson {lesson.order}</p>
                                <h3 className="font-semibold text-base">{lesson.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs flex-shrink-0 ml-4">
                                <span className="text-muted-foreground">{lesson.challengeCount} challenges</span>
                                <span className="text-primary font-semibold">{lesson.xpReward} XP</span>
                                {state !== "completed" && <ArrowRight className="w-4 h-4 text-primary" />}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div data-testid={`lesson-node-locked-${lesson.id}`}>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Lesson {lesson.order}</p>
                          <h3 className="font-semibold text-base">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          {nextLessonId && (
            <div className="mt-10">
              <Link href={`/lessons/${nextLessonId}`}>
                <Button size="lg" className="w-full gap-2" data-testid="button-start-course">
                  {(progress?.completedLessons ?? 0) > 0 ? "Continue learning" : "Start first lesson"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
