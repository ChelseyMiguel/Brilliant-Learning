import { Link } from "wouter";
import { motion } from "framer-motion";
import { useUser } from "@clerk/react";
import {
  useGetDashboardSummary,
  useListCourses,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, BookOpen, ArrowRight, Flame, Trophy } from "lucide-react";
import CourseIllustration from "@/components/CourseIllustration";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: courses } = useListCourses();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Luminary</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" data-testid="nav-dashboard">Home</Button>
            </Link>
            <Link href="/courses">
              <Button variant="ghost" size="sm" data-testid="nav-courses">Courses</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" data-testid="nav-profile">Profile</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good to see you{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">Keep the streak alive — your brain is counting on you.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total XP" value={summary?.totalXp ?? 0} icon={Zap} color="bg-primary/10 text-primary" />
          <StatCard label="Day Streak" value={summary?.streakDays ?? 0} icon={Flame} color="bg-orange-50 text-orange-500" />
          <StatCard label="Lessons Done" value={summary?.lessonsCompleted ?? 0} icon={BookOpen} color="bg-emerald-50 text-emerald-600" />
          <StatCard label="Challenges" value={summary?.challengesCompleted ?? 0} icon={Trophy} color="bg-amber-50 text-amber-600" />
        </div>

        {/* Weekly activity + recommended */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weekly activity */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-5">Weekly Activity</h2>
            <div className="flex items-end justify-between gap-2" data-testid="weekly-activity">
              {(summary?.weeklyActivity ?? ["Su","M","Tu","W","Th","F","Sa"].map(d => ({ day: d, active: false, xpEarned: 0 }))).map((activity, i) => {
                const maxXp = Math.max(...(summary?.weeklyActivity?.map(a => a.xpEarned) ?? [1]), 1);
                const height = activity.xpEarned > 0 ? Math.max((activity.xpEarned / maxXp) * 80, 12) : 4;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <motion.div
                      initial={{ height: 4 }}
                      animate={{ height }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={`w-full rounded-full ${activity.active ? "bg-primary" : "bg-muted"}`}
                      style={{ minHeight: 4 }}
                    />
                    <span className={`text-xs font-medium ${activity.active ? "text-primary" : "text-muted-foreground"}`}>
                      {activity.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended course */}
          {summary?.recommendedCourse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-card-border rounded-2xl overflow-hidden flex flex-col"
              data-testid="recommended-course"
            >
              <div className="flex items-center justify-center py-5 bg-muted/30">
                <CourseIllustration
                  category={summary.recommendedCourse.category}
                  iconColor={summary.recommendedCourse.iconColor}
                  size={80}
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Recommended for you</p>
                <h3 className="font-semibold text-base leading-tight mb-1" data-testid="recommended-course-title">
                  {summary.recommendedCourse.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                  {summary.recommendedCourse.description}
                </p>
                <div className="flex items-center gap-3 text-xs mb-4">
                  <span className="text-muted-foreground">{summary.recommendedCourse.lessonCount} lessons</span>
                  <span className="font-medium text-primary">{summary.recommendedCourse.totalXp} XP</span>
                </div>
                <Link href={`/courses/${summary.recommendedCourse.id}`}>
                  <Button className="w-full gap-2" data-testid="button-start-recommended">
                    Start learning
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* All courses grid */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold tracking-tight">All Courses</h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="link-all-courses">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(courses ?? []).slice(0, 8).map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/courses/${course.id}`}>
                  <div
                    className="bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
                    data-testid={`course-card-${course.id}`}
                  >
                    <div className="flex items-center justify-center py-5 bg-muted/30">
                      <CourseIllustration
                        category={course.category}
                        iconColor={course.iconColor}
                        size={72}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground font-medium">{course.category}</span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                          course.difficulty === "beginner" ? "bg-emerald-50 text-emerald-600" :
                          course.difficulty === "intermediate" ? "bg-amber-50 text-amber-600" :
                          "bg-rose-50 text-rose-600"
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{course.lessonCount} lessons</span>
                        <span className="text-primary font-medium">{course.totalXp} XP</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
