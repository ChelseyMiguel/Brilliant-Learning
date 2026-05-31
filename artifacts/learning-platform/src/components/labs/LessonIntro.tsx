import { Suspense, useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Lightbulb, ChevronRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface Lesson {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
}

interface Props {
  lesson: Lesson;
  AnimationComponent: ComponentType | null;
  onStartPractice: () => void;
  courseId?: number;
}

// Category-specific warm-up prompts
const CATEGORY_PROMPTS: Record<string, { heading: string; body: string }[]> = {
  mathematics: [
    {
      heading: "What patterns do you notice?",
      body: "Before diving into the questions, take a moment to think about patterns you might expect. What relationships could be involved? Your intuition often knows more than you think.",
    },
    {
      heading: "When would this come up in real life?",
      body: "Think of a situation where this concept would matter. Grounding abstract math in a concrete scenario makes the challenges much easier to reason through.",
    },
  ],
  statistics: [
    {
      heading: "What does your gut say?",
      body: "Probability and statistics are famous for surprising us. Before the practice questions, think of an outcome you'd expect - it might be exactly right, or dramatically wrong.",
    },
    {
      heading: "Think about sample size",
      body: "In this lesson, consider how the number of trials or data points changes things. What do you think happens as that number grows very large?",
    },
  ],
  physics: [
    {
      heading: "Imagine it in motion",
      body: "Physics is best understood through visualisation. Before the questions, close your eyes and picture the physical scenario in motion. What forces are acting? What changes over time?",
    },
    {
      heading: "What stays constant?",
      body: "Many physics problems hinge on what's conserved - energy, momentum, charge. Think about what quantity might remain the same throughout this lesson's scenario.",
    },
  ],
  "computer science": [
    {
      heading: "Trace through a small example",
      body: "Computer science concepts become clear when you work through a tiny concrete case. Think of the smallest possible input and walk through what would happen step by step.",
    },
    {
      heading: "What could go wrong?",
      body: "Good programmers think about edge cases. What unusual or extreme inputs might break the expected behaviour? Keeping this in mind sharpens your understanding.",
    },
  ],
  "machine learning": [
    {
      heading: "Think about what the model 'sees'",
      body: "Machine learning models only see numbers. Before the practice, consider: how would you translate this problem into numbers that a system could learn from?",
    },
    {
      heading: "What does 'learning' mean here?",
      body: "In this context, learning means adjusting something based on feedback. What might be getting adjusted, and what counts as feedback?",
    },
  ],
};

const FALLBACK_PROMPTS = [
  {
    heading: "What do you already know?",
    body: "Before jumping into questions, spend 30 seconds activating what you know about this topic. Even partial knowledge helps - your brain connects new ideas to existing ones.",
  },
  {
    heading: "What would surprise you?",
    body: "The most memorable insights are the ones that defy expectations. As you go through the challenges, keep an eye out for the result that feels most counterintuitive.",
  },
];

function getPrompts(category: string | null | undefined) {
  if (!category) return FALLBACK_PROMPTS;
  const key = category.toLowerCase();
  for (const [cat, prompts] of Object.entries(CATEGORY_PROMPTS)) {
    if (key.includes(cat)) return prompts;
  }
  return FALLBACK_PROMPTS;
}

export default function LessonIntro({ lesson, AnimationComponent, onStartPractice, courseId }: Props) {
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());
  const prompts = getPrompts(lesson.category);

  const handleStepClick = (i: number) => {
    setOpenStep(prev => prev === i ? null : i);
    setVisitedSteps(prev => new Set([...prev, i]));
  };

  const allVisited = visitedSteps.size >= prompts.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center gap-3">
        {courseId && (
          <Link href={`/courses/${courseId}`}>
            <button
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Back to course"
            >
              <X className="w-4 h-4" />
            </button>
          </Link>
        )}
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Warm Up
          </p>
          <p className="text-sm font-semibold text-foreground leading-tight">
            {lesson.title}
          </p>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-1.5"
            onClick={onStartPractice}
          >
            Skip to practice
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Visual panel */}
        <div className="flex-1 bg-muted/10 flex flex-col min-h-0">
          <div className="px-6 pt-5 pb-2">
            <h1 className="text-xl font-bold text-foreground">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{lesson.description}</p>
            )}
          </div>

          <div className="flex-1 flex items-start justify-center px-3 pb-3 pt-2 overflow-y-auto">
            {AnimationComponent ? (
              <div className="w-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 pt-4 pb-0">
                  Interactive Simulation
                </p>
                <Suspense fallback={
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-72 w-full rounded-xl" />
                  </div>
                }>
                  <AnimationComponent />
                </Suspense>
              </div>
            ) : (
              <div className="w-full max-w-2xl">
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5"
                  >
                    <Lightbulb className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h2 className="text-lg font-semibold mb-3">Before you start</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    Open the prompts on the right and take a moment to think - even 60 seconds of preparation
                    makes the practice questions much more memorable.
                  </p>

                  <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    {["Think", "Explore", "Practice"].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.12 }}
                        className="space-y-2"
                      >
                        <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm font-bold ${
                          i === 0 ? "bg-primary/10 text-primary" : i === 1 ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                        }`}>
                          {i + 1}
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discovery prompts panel */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Think First
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Open these to activate your thinking before the challenges.
            </p>

            <div className="space-y-2">
              {prompts.map((prompt, i) => {
                const isOpen = openStep === i;
                const isVisited = visitedSteps.has(i);

                return (
                  <motion.div key={i} layout>
                    <button
                      onClick={() => handleStepClick(i)}
                      className={`w-full text-left rounded-xl border-2 transition-all duration-150 overflow-hidden ${
                        isOpen
                          ? "border-primary bg-primary/5"
                          : isVisited
                          ? "border-secondary/30 bg-secondary/5 hover:border-secondary/50"
                          : "border-border bg-background hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                          isOpen
                            ? "bg-primary text-primary-foreground"
                            : isVisited
                            ? "bg-secondary/60 text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isVisited && !isOpen ? "✓" : i + 1}
                        </div>
                        <p className={`font-medium text-sm flex-1 ${isOpen ? "text-primary" : "text-foreground"}`}>
                          {prompt.heading}
                        </p>
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </motion.div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm text-muted-foreground leading-relaxed px-4 pb-4">
                              {prompt.body}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="p-6 border-t border-border bg-muted/30">
            <AnimatePresence mode="wait">
              {allVisited ? (
                <motion.div key="ready" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-secondary" />
                    <p className="text-xs text-secondary font-semibold">You're primed - let's go!</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    Apply what you just thought about to the practice challenges.
                  </p>
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={onStartPractice}
                    data-testid="button-start-practice"
                  >
                    Start Practice
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="exploring" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">
                      {visitedSteps.size}/{prompts.length} prompts opened
                    </p>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {prompts.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          visitedSteps.has(i) ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={onStartPractice}
                  >
                    Skip to Practice
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
