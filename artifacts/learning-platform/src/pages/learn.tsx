import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  useGetDashboardSummary,
  useListCourses,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import OnboardingModal, { loadProfile, type LearnerProfile } from "@/components/OnboardingModal";
import ProgressRing from "@/components/ProgressRing";
import CourseIllustration from "@/components/CourseIllustration";
import { ResourceCard, ResourceSheet, getResourcesForGoal, type Resource } from "@/components/ResourceSheet";
import {
  Brain,
  ArrowRight,
  Zap,
  Flame,
  BookOpen,
  RotateCcw,
  Sparkles,
  Target,
  Map as MapIcon,
  Library,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MascotSticker from "@/components/MascotSticker";

// ── Goal → category filter ────────────────────────────────────────────────────

const GOAL_CATEGORY: Record<string, string[]> = {
  probability: ["probability", "statistics", "math"],
  cs:          ["computer science", "algorithms", "programming"],
  physics:     ["physics", "science"],
  explore:     [],
};

const GOAL_LABEL: Record<string, string> = {
  probability: "Probability & Statistics",
  cs:          "Computer Science",
  physics:     "Physics",
  explore:     "STEM",
};

const GOAL_GREETING: Record<string, string> = {
  probability: "Let's sharpen your probability instincts.",
  cs:          "Let's level up your CS thinking.",
  physics:     "Let's explore the laws of the universe.",
  explore:     "Let's follow your curiosity wherever it leads.",
};

const TIME_LESSONS: Record<string, number> = {
  light: 1,
  medium: 2,
  intensive: 4,
};

// ── Rule-based nudges ─────────────────────────────────────────────────────────

function buildNudges(
  reviewCount: number,
  streakDays: number,
  lessonsCompleted: number
): string[] {
  const nudges: string[] = [];
  if (reviewCount >= 5)
    nudges.push(`You have ${reviewCount} challenges to review - tackle them before they pile up.`);
  if (streakDays === 0)
    nudges.push("Start a new streak today - even one lesson counts.");
  else if (streakDays >= 7)
    nudges.push(`${streakDays}-day streak! You're in a great rhythm.`);
  if (lessonsCompleted > 0 && lessonsCompleted % 5 === 0)
    nudges.push(`${lessonsCompleted} lessons complete - you're building real momentum.`);
  return nudges.slice(0, 2);
}

// ── Category pill ─────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    math: "bg-blue-50 text-blue-700",
    probability: "bg-violet-50 text-violet-700",
    statistics: "bg-violet-50 text-violet-700",
    physics: "bg-amber-50 text-amber-700",
    "computer science": "bg-emerald-50 text-emerald-700",
    algorithms: "bg-emerald-50 text-emerald-700",
  };
  const cls = map[category.toLowerCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {category}
    </span>
  );
}

// ── Course card ───────────────────────────────────────────────────────────────

function LearnCourseCard({
  course,
  pct,
  currentLessonId,
  delay = 0,
}: {
  course: { id: number; title: string; description: string; category: string; iconColor: string; lessonCount: number; totalXp: number };
  pct: number;
  currentLessonId?: number | null;
  delay?: number;
}) {
  const isComplete = pct >= 100;
  const inProgress = pct > 0 && !isComplete;
  const href = currentLessonId ? `/lessons/${currentLessonId}` : `/courses/${course.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link href={href}>
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group flex gap-4 p-4">
          <div className="w-14 h-14 rounded-xl bg-muted/40 flex items-center justify-center flex-shrink-0">
            <CourseIllustration category={course.category} iconColor={course.iconColor} size={48} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors leading-snug line-clamp-2">
                {course.title}
              </h3>
              <ProgressRing pct={pct} size={28} strokeWidth={3} color={isComplete ? "#22c55e" : "#4f46e5"} trackColor="#e5e7eb" />
            </div>
            <CategoryBadge category={course.category} />
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
              <span>{course.lessonCount} lessons</span>
              <span className="text-primary font-medium">{course.totalXp} XP</span>
              {inProgress && (
                <span className="text-indigo-500 font-medium">In progress</span>
              )}
              {isComplete && (
                <span className="text-emerald-600 font-medium">Complete ✓</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [profile, setProfile] = useState<LearnerProfile | null>(loadProfile);
  const [showOnboarding, setShowOnboarding] = useState(!loadProfile());
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: allCourses, isLoading: coursesLoading } = useListCourses();
  const isLoading = summaryLoading || coursesLoading;

  const { data: reviewData } = useQuery({
    queryKey: ["/api/progress/review"],
    queryFn: () => fetch("/api/progress/review").then((r) => r.json()) as Promise<{ total: number }>,
  });
  const reviewCount = reviewData?.total ?? 0;

  // Keep profile in sync after onboarding completes
  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setProfile(p);
      setShowOnboarding(false);
    }
  }, []);

  // Determine recommended courses based on goal
  const progressMap = new Map(
    (summary?.recentCourses ?? []).map((cp) => [cp.courseId, cp] as const)
  );

  const goalCategories = GOAL_CATEGORY[profile?.goal ?? "explore"] ?? [];

  const matchesCourses = (allCourses ?? []).filter((c) => {
    if (goalCategories.length === 0) return true;
    return goalCategories.some((g) => c.category.toLowerCase().includes(g));
  });

  const inProgressCourses = (allCourses ?? []).filter((c) => {
    const cp = progressMap.get(c.id);
    return cp && cp.percentComplete > 0 && cp.percentComplete < 100;
  });

  const notStartedGoalCourses = matchesCourses.filter(
    (c) => !progressMap.has(c.id)
  );

  const recommendedCourse =
    inProgressCourses[0] ?? notStartedGoalCourses[0] ?? (allCourses ?? [])[0];

  const recProgress = recommendedCourse ? progressMap.get(recommendedCourse.id) : null;
  const recHref = recProgress?.currentLessonId
    ? `/lessons/${recProgress.currentLessonId}`
    : recommendedCourse
    ? `/courses/${recommendedCourse.id}`
    : "/courses";

  const nudges = buildNudges(
    reviewCount,
    summary?.streakDays ?? 0,
    summary?.lessonsCompleted ?? 0
  );

  const dailyGoal = TIME_LESSONS[profile?.timePerDay ?? "medium"];

  const displayCourses = profile?.goal === "explore"
    ? (allCourses ?? []).slice(0, 6)
    : matchesCourses.slice(0, 6);

  return (
    <>
      {showOnboarding && (
        <OnboardingModal
          onComplete={(p) => {
            setProfile(p);
            setShowOnboarding(false);
          }}
        />
      )}

      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

          {/* Personalized hero header */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Learning Center
                </span>
                {profile && (
                  <span className="text-xs text-muted-foreground">
                    · {GOAL_LABEL[profile.goal]} path
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight font-display">
                {profile ? GOAL_GREETING[profile.goal] : "Welcome to your Learning Center."}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {profile
                  ? `Your goal: ${dailyGoal} lesson${dailyGoal !== 1 ? "s" : ""} per session.`
                  : "Tell us about yourself to get personalized recommendations."}
              </p>
            </div>
            {!profile && (
              <Button
                onClick={() => setShowOnboarding(true)}
                className="gap-2 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                Personalize
              </Button>
            )}
            {profile && (
              <MascotSticker pose="coins" size={140} delay={0.1} className="flex-shrink-0" />
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* Nudges */}
              {nudges.length > 0 && (
                <div className="space-y-3">
                  {nudges.map((nudge, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-sm text-amber-800">{nudge}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Review CTA */}
              {reviewCount >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-rose-200 rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <RotateCcw className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {reviewCount} challenge{reviewCount !== 1 ? "s" : ""} waiting in review
                      </p>
                      <p className="text-xs text-muted-foreground">Reinforcing weak spots builds lasting understanding.</p>
                    </div>
                  </div>
                  <Link href="/review">
                    <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full flex-shrink-0 gap-1.5">
                      Review <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </motion.div>
              )}

              {/* Next up */}
              {recommendedCourse && (
                <div>
                  <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Next up
                  </h2>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-5"
                  >
                    <div className="w-16 h-16 rounded-xl bg-muted/30 flex items-center justify-center flex-shrink-0">
                      <CourseIllustration
                        category={recommendedCourse.category}
                        iconColor={recommendedCourse.iconColor}
                        size={56}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CategoryBadge category={recommendedCourse.category} />
                      <h3 className="font-semibold text-base mt-1 mb-0.5 line-clamp-1">
                        {recommendedCourse.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {recommendedCourse.lessonCount} lessons
                        </span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <Zap className="w-3.5 h-3.5" />
                          {recommendedCourse.totalXp} XP
                        </span>
                        {recProgress && recProgress.percentComplete > 0 && (
                          <span className="text-indigo-500 font-medium">
                            {Math.round(recProgress.percentComplete)}% done
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={recHref}>
                      <Button className="gap-2 flex-shrink-0 rounded-full">
                        {recProgress && recProgress.percentComplete > 0 ? "Continue" : "Start"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "XP earned", value: summary?.totalXp ?? 0, icon: Zap, color: "bg-indigo-50 text-indigo-600" },
                  { label: "Day streak", value: summary?.streakDays ?? 0, icon: Flame, color: "bg-orange-50 text-orange-500" },
                  { label: "Lessons done", value: summary?.lessonsCompleted ?? 0, icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xl font-bold leading-none">{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Course skill map */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-primary" />
                    {profile?.goal === "explore" ? "All Courses" : `${GOAL_LABEL[profile?.goal ?? "explore"]} Courses`}
                  </h2>
                  <Link href="/courses">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {displayCourses.map((course, i) => {
                    const cp = progressMap.get(course.id);
                    return (
                      <LearnCourseCard
                        key={course.id}
                        course={course}
                        pct={cp?.percentComplete ?? 0}
                        currentLessonId={cp?.currentLessonId}
                        delay={i * 0.05}
                      />
                    );
                  })}
                  {displayCourses.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      No courses found for your goal yet. <Link href="/courses"><span className="text-primary underline">Browse all courses</span></Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Reading & Resources */}
              {(() => {
                const resources = getResourcesForGoal(profile?.goal ?? "explore");
                return (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold flex items-center gap-2">
                        <Library className="w-4 h-4 text-primary" />
                        Reading &amp; Resources
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        {resources.length} article{resources.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {resources.map((r, i) => (
                        <ResourceCard
                          key={r.id}
                          resource={r}
                          onClick={() => setActiveResource(r)}
                          delay={i * 0.04}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Retake onboarding */}
              {profile && (
                <div className="flex justify-center pb-4">
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Retake learning profile
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ResourceSheet
        resource={activeResource}
        open={!!activeResource}
        onClose={() => setActiveResource(null)}
      />
    </>
  );
}
