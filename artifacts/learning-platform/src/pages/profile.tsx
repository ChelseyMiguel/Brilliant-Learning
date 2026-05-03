import { Link } from "wouter";
import { motion } from "framer-motion";
import { useUser, useClerk } from "@clerk/react";
import { useGetUserProfile, useGetMyProgress, useListCourses } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Zap, Flame, BookOpen, Trophy, LogOut, User } from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: profile, isLoading: loadingProfile } = useGetUserProfile();
  const { data: progress } = useGetMyProgress();
  const { data: courses } = useListCourses();

  const handleSignOut = () => signOut({ redirectUrl: "/" });

  const stats = [
    { label: "Total XP", value: profile?.totalXp ?? 0, icon: Zap, color: "bg-primary/10 text-primary" },
    { label: "Day Streak", value: profile?.streakDays ?? 0, icon: Flame, color: "bg-orange-50 text-orange-500" },
    { label: "Lessons Done", value: progress?.lessonsCompleted ?? 0, icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
    { label: "Challenges", value: progress?.challengesCompleted ?? 0, icon: Trophy, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back-from-profile">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Profile</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* User info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-card-border rounded-2xl p-8 flex items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {loadingProfile ? (
              <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold" data-testid="profile-name">
                  {user?.fullName ?? profile?.displayName ?? "Learner"}
                </h1>
                <p className="text-muted-foreground text-sm" data-testid="profile-email">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
                {profile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your stats</h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4"
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Available courses */}
        {courses && courses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Available courses</h2>
            <div className="bg-card border border-card-border rounded-2xl divide-y divide-border overflow-hidden">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <div
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer"
                    data-testid={`profile-course-${course.id}`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: course.iconColor + "20" }}
                    >
                      <Brain className="w-4 h-4" style={{ color: course.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.lessonCount} lessons · {course.totalXp} XP</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      course.difficulty === "beginner" ? "bg-emerald-50 text-emerald-600" :
                      course.difficulty === "intermediate" ? "bg-amber-50 text-amber-600" :
                      "bg-rose-50 text-rose-600"
                    }`}>{course.difficulty}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sign out */}
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
          data-testid="button-sign-out"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
