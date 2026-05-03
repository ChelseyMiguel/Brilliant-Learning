import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListCourses, useGetMyProgress } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import CourseIllustration from "@/components/CourseIllustration";

export default function CoursesPage() {
  const { data: courses, isLoading } = useListCourses();
  const { data: progress } = useGetMyProgress();
  const [search, setSearch] = useState("");

  const filtered = (courses ?? []).filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set((courses ?? []).map(c => c.category))];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Courses</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {progress && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-semibold text-primary">{progress.totalXp} XP</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{progress.streakDays} day streak</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Explore Courses</h1>
          <p className="text-muted-foreground">Choose a subject and start discovering.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-courses"
          />
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map(category => {
              const categoryCourses = filtered.filter(c => c.category === category);
              if (!categoryCourses.length) return null;
              return (
                <div key={category}>
                  <h2 className="text-lg font-semibold mb-4 text-foreground">{category}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categoryCourses.map((course, i) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Link href={`/courses/${course.id}`}>
                          <div
                            className="bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                            data-testid={`course-card-${course.id}`}
                          >
                            {/* Illustration header */}
                            <div className="flex items-center justify-center py-6 bg-muted/30">
                              <CourseIllustration
                                category={course.category}
                                iconColor={course.iconColor}
                                size={100}
                              />
                            </div>

                            <div className="p-5">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  {course.category}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  course.difficulty === "beginner" ? "bg-emerald-50 text-emerald-700" :
                                  course.difficulty === "intermediate" ? "bg-amber-50 text-amber-700" :
                                  "bg-rose-50 text-rose-700"
                                }`}>
                                  {course.difficulty}
                                </span>
                              </div>
                              <h3 className="font-semibold text-base mb-1.5 group-hover:text-primary transition-colors leading-snug">
                                {course.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                {course.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-muted-foreground">{course.lessonCount} lessons</span>
                                <span className="text-primary font-semibold">{course.totalXp} XP</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No courses match your search</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
