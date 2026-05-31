import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListCourses,
  useGetMyProgress,
  useGetCourseProgress,
  getGetCourseProgressQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Brain, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import CourseIllustration from "@/components/CourseIllustration";
import ProgressRing from "@/components/ProgressRing";
import Navbar from "@/components/Navbar";
import MascotSticker from "@/components/MascotSticker";

function CourseProgressBadge({ courseId }: { courseId: number }) {
  const { data } = useGetCourseProgress(courseId, {
    query: { queryKey: getGetCourseProgressQueryKey(courseId) },
  });
  if (!data || data.completedLessons === 0) return null;
  const isComplete = data.percentComplete >= 100;
  return (
    <div className="absolute top-3 right-3 flex flex-col items-center gap-0.5">
      <ProgressRing
        pct={data.percentComplete}
        size={36}
        strokeWidth={3.5}
        color={isComplete ? "#22c55e" : "#4f46e5"}
        trackColor="#e5e7eb"
      />
      <span className="text-[9px] font-semibold text-gray-400">
        {data.completedLessons}/{data.totalLessons}
      </span>
    </div>
  );
}

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-rose-50 text-rose-700 border-rose-200",
};

const difficultyActiveColors: Record<string, string> = {
  beginner: "bg-emerald-500 text-white border-emerald-500",
  intermediate: "bg-amber-500 text-white border-amber-500",
  advanced: "bg-rose-500 text-white border-rose-500",
};

export default function CoursesPage() {
  const { data: courses, isLoading } = useListCourses();
  const { data: progress } = useGetMyProgress();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);

  const allCategories = [...new Set((courses ?? []).map((c) => c.category))];

  const filtered = (courses ?? []).filter((c) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || c.category === activeCategory;
    const matchesDifficulty = !activeDifficulty || c.difficulty === activeDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const visibleCategories = activeCategory
    ? [activeCategory]
    : allCategories.filter((cat) => filtered.some((c) => c.category === cat));

  const hasFilters = !!search || !!activeCategory || !!activeDifficulty;

  const clearAll = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveDifficulty(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 font-display">Explore Courses</h1>
            <p className="text-muted-foreground">Choose a subject and start discovering.</p>
          </div>
          <MascotSticker pose="study" size={155} delay={0.1} className="flex-shrink-0" />
        </div>

        {/* Search + filters */}
        <div className="space-y-4 mb-8">
          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
              data-testid="input-search-courses"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category chips */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                Subject
              </span>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(null)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  !activeCategory
                    ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#4f46e5]/50"
                }`}
              >
                All
              </motion.button>
              {allCategories.map((cat) => (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.96 }}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat ? null : cat)
                  }
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    activeCategory === cat
                      ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#4f46e5]/50"
                  }`}
                  data-testid={`filter-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          )}

          {/* Difficulty chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
              Level
            </span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveDifficulty(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                !activeDifficulty
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              All levels
            </motion.button>
            {DIFFICULTIES.map((diff) => (
              <motion.button
                key={diff}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  setActiveDifficulty(activeDifficulty === diff ? null : diff)
                }
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                  activeDifficulty === diff
                    ? difficultyActiveColors[diff]
                    : `bg-white border-gray-200 ${difficultyColors[diff].split(" ").slice(1).join(" ")} hover:border-current`
                }`}
                data-testid={`filter-difficulty-${diff}`}
              >
                {diff}
              </motion.button>
            ))}
          </div>

          {/* Active filter summary + clear */}
          <AnimatePresence>
            {hasFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 text-sm text-muted-foreground overflow-hidden"
              >
                <span>
                  {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
                </span>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[#4f46e5] font-medium hover:underline"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {visibleCategories.map((category) => {
              const categoryCourses = filtered.filter(
                (c) => c.category === category
              );
              if (!categoryCourses.length) return null;
              return (
                <div key={category}>
                  {!activeCategory && (
                    <h2 className="text-lg font-semibold mb-4 text-foreground">
                      {category}
                    </h2>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categoryCourses.map((course, i) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link href={`/courses/${course.id}`}>
                          <div
                            className="bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                            data-testid={`course-card-${course.id}`}
                          >
                            <div className="relative flex items-center justify-center py-6 bg-muted/30">
                              <CourseIllustration
                                category={course.category}
                                iconColor={course.iconColor}
                                size={100}
                              />
                              <CourseProgressBadge courseId={course.id} />
                            </div>
                            <div className="p-5">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  {course.category}
                                </span>
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    course.difficulty === "beginner"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : course.difficulty === "intermediate"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-rose-50 text-rose-700"
                                  }`}
                                >
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
                                <span className="text-muted-foreground">
                                  {course.lessonCount} lessons
                                </span>
                                <span className="text-primary font-semibold">
                                  {course.totalXp} XP
                                </span>
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
                <p className="mb-3">No courses match your filters</p>
                <button
                  onClick={clearAll}
                  className="text-sm text-[#4f46e5] font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
