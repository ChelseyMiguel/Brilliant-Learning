import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, FlaskConical, ChevronRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LAB_COMPONENTS, type LessonLab } from "./index";

interface Props {
  lab: LessonLab;
  lessonTitle: string;
  onStartPractice: () => void;
}

export default function LearningCenter({ lab, lessonTitle, onStartPractice }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [discoveredSteps, setDiscoveredSteps] = useState<Set<number>>(new Set([0]));

  const LabComponent = LAB_COMPONENTS[lab.labKey];

  const handleStepClick = (i: number) => {
    setActiveStep(i);
    setDiscoveredSteps(prev => new Set([...prev, i]));
  };

  const handleNext = () => {
    if (activeStep < lab.steps.length - 1) {
      handleStepClick(activeStep + 1);
    }
  };

  const allDiscovered = discoveredSteps.size >= lab.steps.length;

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
        <div className="flex-1 bg-muted/10 flex flex-col">
          <div className="px-6 pt-5 pb-2">
            <h1 className="text-xl font-bold text-foreground">{lab.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{lab.subtitle}</p>
          </div>

          {/* Diagramatics canvas area */}
          <div className="flex-1 flex items-center justify-center px-4 pb-4 min-h-[300px]">
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
            <div className="flex items-center gap-2 mb-5">
              <Compass className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Guided Discovery
              </p>
            </div>

            <div className="space-y-3">
              {lab.steps.map((step, i) => {
                const isActive = activeStep === i;
                const isDone = discoveredSteps.has(i) && i < activeStep;
                const isLocked = !discoveredSteps.has(i - 1 >= 0 ? i - 1 : 0) && i !== 0;

                return (
                  <motion.button
                    key={i}
                    layout
                    onClick={() => !isLocked && handleStepClick(i)}
                    className={`w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : isDone
                        ? "border-secondary/40 bg-secondary/5 cursor-pointer hover:border-secondary/60"
                        : "border-border bg-background cursor-pointer hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start gap-3 p-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isDone
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm mb-1 ${isActive ? "text-primary" : "text-foreground"}`}>
                          {step.heading}
                        </p>
                        <AnimatePresence>
                          {(isActive || isDone) && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-sm text-muted-foreground leading-relaxed"
                            >
                              {step.body}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {activeStep < lab.steps.length - 1 && (
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleNext}
                >
                  Next observation
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Start Practice CTA */}
          <div className="p-6 border-t border-border bg-muted/30">
            <AnimatePresence mode="wait">
              {allDiscovered ? (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-xs text-secondary font-semibold mb-3">
                    Great exploring! You're ready.
                  </p>
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
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Work through all {lab.steps.length} observations to unlock the practice challenges.
                  </p>
                  <div className="flex gap-1.5 mb-4">
                    {lab.steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          discoveredSteps.has(i) ? "bg-primary" : "bg-muted"
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
