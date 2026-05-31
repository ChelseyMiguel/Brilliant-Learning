import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListCourses } from "@workspace/api-client-react";
import {
  ArrowRight, FlaskConical, RotateCcw, Trophy,
  Zap, CheckCircle2, BookOpen, BarChart2, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseIllustration from "@/components/CourseIllustration";

// ── Animation helper ──────────────────────────────────────────────────────────
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: 0.42, delay, ease: "easeOut" as const },
  };
}

// ── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FlaskConical,
    color: "bg-indigo-50 text-indigo-600",
    title: "Interactive Labs",
    body: "Every lesson opens with a hands-on simulation. Build intuition before you answer a single question.",
  },
  {
    icon: RotateCcw,
    color: "bg-rose-50 text-rose-500",
    title: "Spaced Review",
    body: "Questions you got wrong come back at the right time. The platform tracks weak spots so you don't have to.",
  },
  {
    icon: Trophy,
    color: "bg-amber-50 text-amber-600",
    title: "XP & Leaderboard",
    body: "Earn XP for every correct answer, climb the leaderboard, and unlock badges as you level up.",
  },
  {
    icon: BarChart2,
    color: "bg-emerald-50 text-emerald-600",
    title: "Progress Tracking",
    body: "Visual course maps and an activity heatmap show exactly where you are and how far you've come.",
  },
  {
    icon: Layers,
    color: "bg-cyan-50 text-cyan-600",
    title: "Structured Paths",
    body: "Each lesson unlocks the next. A clear sequence means you always know what to tackle.",
  },
  {
    icon: BookOpen,
    color: "bg-violet-50 text-violet-600",
    title: "Three Subjects",
    body: "Probability & Statistics, Computer Science, and Physics - each with dedicated interactive simulations.",
  },
];

const STATS = [
  { value: "16+", label: "Interactive labs" },
  { value: "22",  label: "Guided lessons"  },
  { value: "3",   label: "Course subjects" },
  { value: "9",   label: "Achievements"    },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: FlaskConical,
    color: "bg-indigo-50 text-indigo-600",
    title: "Explore the lab",
    body: "Before any questions, you interact with a simulation - tweak sliders, throw darts, watch energy trade off. Intuition first, theory second.",
  },
  {
    step: "02",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600",
    title: "Answer challenges",
    body: "Multiple-choice, true/false, and numeric questions test whether your intuition holds. Hints available if stuck; explanations appear after every answer.",
  },
  {
    step: "03",
    icon: Zap,
    color: "bg-amber-50 text-amber-600",
    title: "Earn XP, review mistakes",
    body: "Correct answers earn XP toward your level. Wrong answers enter the review queue and resurface later. Finish all lessons to complete the course.",
  },
];

export default function LandingPage() {
  const { data: courses } = useListCourses();
  const previewCourses = (courses ?? []).slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/lumina-logo.png" alt="Lumina" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold font-display">Lumina Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/courses">
              <Button variant="ghost" size="sm">Courses</Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm">Leaderboard</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-full px-4">
                Start learning
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div {...fadeUp(0)}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4f46e5] bg-indigo-50 px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3" />
            Interactive STEM education
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.08)}
          className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-5 font-display"
        >
          Learn by doing,<br />
          <span className="text-[#4f46e5]">not memorising.</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.15)}
          className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Lumina pairs hands-on simulations with structured lessons across probability,
          computer science, and physics - so concepts click the first time.
        </motion.p>

        <motion.div {...fadeUp(0.22)} className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/dashboard">
            <Button size="lg" className="h-12 px-8 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-base gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/courses">
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full font-bold text-base border-gray-200">
              Browse courses
            </Button>
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-wrap justify-center gap-x-10 gap-y-3 mt-14 pt-10 border-t border-gray-100"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Mock challenge card ───────────────────────────────────── */}
      <section className="bg-gray-50 py-16 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="text-3xl font-black mb-4 font-display">One insight at a time</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Instead of a wall of text, you solve carefully designed questions that each teach exactly one thing.
              Instant feedback tells you not just what's right, but why.
            </p>
            <ul className="space-y-3">
              {[
                "Multiple-choice with detailed explanations",
                "True/false that challenges assumptions",
                "Numeric inputs that reveal surprising answers",
                "Hints on demand - no looking up answers required",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  {...fadeUp(i * 0.08)}
                  className="flex items-center gap-3 text-sm text-gray-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#4f46e5] flex-shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Mock challenge */}
          <motion.div {...fadeUp(0.12)} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gray-100">
              <div className="h-full w-1/3 bg-[#4f46e5] rounded-full" />
            </div>
            <div className="p-7">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Probability · Challenge 1 of 3
              </p>
              <h3 className="text-base font-bold text-gray-900 mb-5 leading-snug">
                You flip a fair coin 5 times and get Heads every time. What is the probability the next flip is Tails?
              </h3>
              <div className="space-y-2.5 mb-5">
                {[
                  { label: "A", text: "Greater than 50% - Tails is due", correct: false },
                  { label: "B", text: "Exactly 50% - each flip is independent", correct: true },
                  { label: "C", text: "Less than 50% - Heads is on a streak", correct: false },
                ].map((opt) => (
                  <div
                    key={opt.label}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm ${
                      opt.correct
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "border-gray-100 text-gray-600"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      opt.correct ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}>{opt.label}</span>
                    {opt.text}
                  </div>
                ))}
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700 mb-0.5">Correct! +10 XP</p>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Each flip is independent. The coin has no memory of past outcomes - it's always 50/50.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <motion.div {...fadeUp(0)} className="text-center mb-10">
          <h2 className="text-3xl font-black mb-3 font-display">Everything you need to actually learn</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Every feature pushes you to engage rather than just read.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(i * 0.07)}
              className="bg-white border border-gray-100 rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Course preview ────────────────────────────────────────── */}
      {previewCourses.length > 0 && (
        <section className="bg-gray-50 py-16 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div {...fadeUp(0)} className="flex items-end justify-between mb-8 flex-wrap gap-3">
              <div>
                <h2 className="text-3xl font-black mb-1 font-display">Pick a subject</h2>
                <p className="text-gray-500">Three curated paths, each built from the ground up.</p>
              </div>
              <Link href="/courses">
                <Button variant="ghost" className="gap-1 text-[#4f46e5] hover:text-[#4338ca]">
                  See all courses <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {previewCourses.map((course, i) => (
                <motion.div key={course.id} {...fadeUp(i * 0.1)}>
                  <Link href={`/courses/${course.id}`}>
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#4f46e5]/30 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-center justify-center py-8 bg-white">
                        <CourseIllustration category={course.category} iconColor={course.iconColor} size={96} />
                      </div>
                      <div className="p-5 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{course.category}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            course.difficulty === "beginner"     ? "bg-emerald-50 text-emerald-700" :
                            course.difficulty === "intermediate" ? "bg-amber-50 text-amber-700" :
                                                                   "bg-rose-50 text-rose-700"
                          }`}>{course.difficulty}</span>
                        </div>
                        <h3 className="font-bold text-sm mb-1.5 group-hover:text-[#4f46e5] transition-colors leading-snug">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{course.description}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-400">{course.lessonCount} lessons</span>
                          <span className="text-[#4f46e5] font-bold flex items-center gap-0.5">
                            <Zap className="w-3 h-3" />{course.totalXp} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-16 max-w-3xl mx-auto px-6">
        <motion.div {...fadeUp(0)} className="text-center mb-10">
          <h2 className="text-3xl font-black mb-3 font-display">How a lesson works</h2>
          <p className="text-gray-500">Three phases, every time.</p>
        </motion.div>
        <div className="space-y-4">
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={item.step}
              {...fadeUp(i * 0.1)}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex gap-5 items-start"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-300 tracking-widest mb-0.5">STEP {item.step}</p>
                <h3 className="font-bold text-base mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 py-20">
        <motion.div {...fadeUp(0)} className="max-w-5xl mx-auto px-6 text-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-6">
            <img src="/lumina-logo.png" alt="Lumina" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-4xl font-black mb-4 font-display">Ready to start?</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
            No account needed. Jump straight into any course and start earning XP.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="h-12 px-10 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-base gap-2">
              Open the dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
              <img src="/lumina-logo.png" alt="Lumina" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-gray-600">Lumina Learning</span>
          </div>
          <p>Interactive STEM education - learn by doing.</p>
        </div>
      </footer>

    </div>
  );
}
