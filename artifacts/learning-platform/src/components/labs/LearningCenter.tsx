import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, FlaskConical, ChevronRight, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LAB_COMPONENTS, type LessonLab } from "./index";

interface Props {
  lab: LessonLab;
  lessonTitle: string;
  onStartPractice: () => void;
}

export default function LearningCenter({ lab, lessonTitle, onStartPractice }: Props) {
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());

  const LabComponent = LAB_COMPONENTS[lab.labKey];

  const handleStepClick = (i: number) => {
    setOpenStep(prev => prev === i ? null : i);
    setVisitedSteps(prev => new Set([...prev, i]));
  };

  const allVisited = visitedSteps.size >= lab.steps.length;
  const visitedCount = visitedSteps.size;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Learning Center
          </p>
          <p className="text-sm font-semibold text-foreground leading-tight">
            {lessonTitle}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Lab panel */}
        <div className="flex-1 bg-muted/10 flex flex-col min-h-0">
          <div className="px-6 pt-5 pb-2">
            <h1 className="text-xl font-bold text-foreground">{lab.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{lab.subtitle}</p>
          </div>

          <div className="flex-1 flex items-start justify-center px-4 pb-4 pt-2 overflow-y-auto">
            <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-4">
              <Suspense fallback={
                <div className="space-y-3 p-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              }>
                <LabComponent />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Guided discovery panel */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">

            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Things to explore
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Open any prompt in any order — they're starting points, not instructions.
            </p>

            <div className="space-y-2">
              {lab.steps.map((step, i) => {
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
                        <p className={`font-medium text-sm flex-1 ${
                          isOpen ? "text-primary" : "text-foreground"
                        }`}>
                          {step.heading}
                        </p>
                        <motion.div
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.15 }}
                        >
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
                              {step.body}
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

          {/* Start Practice CTA */}
          <div className="p-6 border-t border-border bg-muted/30">
            <AnimatePresence mode="wait">
              {allVisited ? (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-secondary" />
                    <p className="text-xs text-secondary font-semibold">
                      All prompts explored — ready to practice!
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    {lab.bridgePrompt}
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
                <motion.div
                  key="exploring"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">
                      {visitedCount}/{lab.steps.length} explored
                    </p>
                    {visitedCount > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-primary font-medium"
                      >
                        Keep going!
                      </motion.p>
                    )}
                  </div>
                  <div className="flex gap-1 mb-4">
                    {lab.steps.map((_, i) => (
                      <motion.div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          visitedSteps.has(i) ? "bg-primary" : "bg-muted"
                        }`}
                        animate={{ scaleX: visitedSteps.has(i) ? 1 : 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
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
