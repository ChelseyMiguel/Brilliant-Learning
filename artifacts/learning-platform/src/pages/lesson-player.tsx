import { useParams, useLocation } from "wouter";
import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetLesson,
  useCompleteChallenge,
  useGetLessonProgress,
  getGetLessonQueryKey,
  getGetLessonProgressQueryKey,
  getGetMyProgressQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { X, CheckCircle2, XCircle, Zap, ArrowRight, RotateCcw, FlaskConical } from "lucide-react";
import { Link } from "wouter";
import { LESSON_ANIMATIONS } from "@/components/animations";
import { LESSON_LABS } from "@/components/labs";
import LearningCenter from "@/components/labs/LearningCenter";

type ChallengeState = "idle" | "answered" | "correct" | "incorrect";

interface ChallengeOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export default function LessonPlayerPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const id = parseInt(lessonId ?? "0");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericAnswer, setNumericAnswer] = useState("");
  const [challengeState, setChallengeState] = useState<ChallengeState>("idle");
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string; hint?: string | null; xpEarned: number } | null>(null);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [showingLab, setShowingLab] = useState(true);

  const { data: lesson, isLoading } = useGetLesson(id, {
    query: { enabled: !!id, queryKey: getGetLessonQueryKey(id) },
  });
  const { data: lessonProgress } = useGetLessonProgress(id, {
    query: { enabled: !!id, queryKey: getGetLessonProgressQueryKey(id) },
  });

  const completeChallenge = useCompleteChallenge({
    mutation: {
      onSuccess: (result) => {
        setFeedback({
          correct: result.correct,
          explanation: result.explanation,
          hint: result.hint,
          xpEarned: result.xpEarned,
        });
        setChallengeState(result.correct ? "correct" : "incorrect");
        if (result.correct) {
          setTotalXpEarned(prev => prev + result.xpEarned);
          queryClient.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
      },
    },
  });

  const challenges = lesson?.challenges ?? [];
  const currentChallenge = challenges[currentIndex];
  const options = (currentChallenge?.options as ChallengeOption[] | null) ?? null;
  const progressPct = challenges.length > 0 ? ((currentIndex) / challenges.length) * 100 : 0;

  const AnimationComponent = LESSON_ANIMATIONS[id] ?? null;
  const lab = LESSON_LABS[id] ?? null;
  const inLab = lab !== null && showingLab;

  const getAnswer = (): string => {
    if (!currentChallenge) return "";
    if (currentChallenge.type === "multiple_choice") return selectedOption ?? "";
    if (currentChallenge.type === "true_false") return selectedOption ?? "";
    return numericAnswer;
  };

  const canCheck = () => {
    if (!currentChallenge) return false;
    if (currentChallenge.type === "multiple_choice" || currentChallenge.type === "true_false") return !!selectedOption;
    return numericAnswer.trim().length > 0;
  };

  const handleCheck = () => {
    if (!currentChallenge || !canCheck()) return;
    completeChallenge.mutate({
      data: {
        challengeId: currentChallenge.id,
        lessonId: id,
        answer: getAnswer(),
        attemptNumber,
      },
    });
  };

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= challenges.length) {
      setLessonComplete(true);
    } else {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setNumericAnswer("");
      setChallengeState("idle");
      setFeedback(null);
      setAttemptNumber(1);
    }
  }, [currentIndex, challenges.length]);

  const handleRetry = () => {
    setChallengeState("idle");
    setFeedback(null);
    setSelectedOption(null);
    setNumericAnswer("");
    setAttemptNumber(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Lesson not found</p>
          <Link href="/courses"><Button>Browse courses</Button></Link>
        </div>
      </div>
    );
  }

  // Learning Center — shown before practice if a lab exists for this lesson
  if (inLab) {
    return (
      <LearningCenter
        lab={lab}
        lessonTitle={lesson.title}
        onStartPractice={() => setShowingLab(false)}
      />
    );
  }

  // Lesson completion screen
  if (lessonComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
          data-testid="lesson-complete-screen"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-secondary" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-3">Lesson complete!</h1>
          <p className="text-muted-foreground mb-6">{lesson.title}</p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-primary/10 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Zap className="w-5 h-5" />
              <span className="text-3xl font-bold">+{totalXpEarned} XP</span>
            </div>
            <p className="text-sm text-muted-foreground">earned in this lesson</p>
          </motion.div>
          <div className="flex flex-col gap-3">
            <Link href={`/courses/${lesson.courseId}`}>
              <Button size="lg" className="w-full gap-2" data-testid="button-continue-after-lesson">
                Continue course
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg" className="w-full" data-testid="button-go-dashboard">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-card px-6 py-3 flex items-center gap-4">
        <Link href={`/courses/${lesson.courseId}`}>
          <button className="text-muted-foreground hover:text-foreground transition-colors" data-testid="button-close-lesson">
            <X className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1">
          <Progress value={progressPct} className="h-2" data-testid="lesson-progress-bar" />
        </div>
        {/* Return to lab button if this lesson has a lab */}
        {lab && (
          <button
            onClick={() => setShowingLab(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
            title="Return to Learning Center"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lab</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <Zap className="w-4 h-4" />
          <span data-testid="xp-counter">{totalXpEarned}</span>
        </div>
        <span className="text-xs text-muted-foreground" data-testid="challenge-counter">
          {currentIndex + 1}/{challenges.length}
        </span>
      </div>

      {/* Main layout: animation sidebar + challenge */}
      <div className="flex-1 flex">
        {/* Animation panel (desktop) */}
        {AnimationComponent && (
          <div className="hidden lg:flex flex-col w-[380px] border-r border-border bg-muted/20 p-6 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Interactive Simulation
            </p>
            <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
              <AnimationComponent />
            </Suspense>
            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Use this simulation to explore the concept before answering. Experiment freely — there are no wrong moves here.
              </p>
            </div>
          </div>
        )}

        {/* Challenge area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-2xl">
            {/* Mobile animation (shown above challenge on small screens) */}
            {AnimationComponent && (
              <div className="lg:hidden mb-6">
                <Suspense fallback={<Skeleton className="h-52 rounded-2xl" />}>
                  <AnimationComponent />
                </Suspense>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {currentChallenge && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {lesson.title}
                    </p>

                    <h2 className="text-2xl font-bold mb-8 leading-snug" data-testid="challenge-question">
                      {currentChallenge.question}
                    </h2>

                    {/* Multiple choice */}
                    {currentChallenge.type === "multiple_choice" && options && (
                      <div className="space-y-3" data-testid="multiple-choice-options">
                        {options.map((opt, i) => {
                          const label = String.fromCharCode(65 + i);
                          const isSelected = selectedOption === opt.id;
                          const showResult = challengeState !== "idle";
                          const isCorrectOpt = opt.isCorrect;

                          let optClass = "border-border hover:border-primary/50 cursor-pointer";
                          if (showResult && isSelected && challengeState === "correct") optClass = "border-secondary bg-secondary/10";
                          else if (showResult && isSelected && challengeState === "incorrect") optClass = "border-destructive bg-destructive/10";
                          else if (showResult && isCorrectOpt) optClass = "border-secondary bg-secondary/10";
                          else if (isSelected) optClass = "border-primary bg-primary/10";

                          return (
                            <motion.button
                              key={opt.id}
                              whileHover={challengeState === "idle" ? { scale: 1.01 } : {}}
                              whileTap={challengeState === "idle" ? { scale: 0.99 } : {}}
                              onClick={() => challengeState === "idle" && setSelectedOption(opt.id)}
                              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors text-left ${optClass} ${challengeState !== "idle" ? "cursor-default" : ""}`}
                              data-testid={`option-${opt.id}`}
                            >
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                {label}
                              </span>
                              <span className="font-medium">{opt.text}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* True / False */}
                    {currentChallenge.type === "true_false" && (
                      <div className="grid grid-cols-2 gap-4" data-testid="true-false-options">
                        {["true", "false"].map((val) => {
                          const isSelected = selectedOption === val;
                          const showResult = challengeState !== "idle";
                          const isCorrect = val === currentChallenge.correctAnswer;

                          let cls = "border-border hover:border-primary/50 cursor-pointer";
                          if (showResult && isSelected && challengeState === "correct") cls = "border-secondary bg-secondary/10";
                          else if (showResult && isSelected && challengeState === "incorrect") cls = "border-destructive bg-destructive/10";
                          else if (showResult && isCorrect) cls = "border-secondary bg-secondary/10";
                          else if (isSelected) cls = "border-primary bg-primary/10";

                          return (
                            <motion.button
                              key={val}
                              whileHover={challengeState === "idle" ? { scale: 1.02 } : {}}
                              whileTap={challengeState === "idle" ? { scale: 0.98 } : {}}
                              onClick={() => challengeState === "idle" && setSelectedOption(val)}
                              className={`py-8 rounded-2xl border-2 font-bold text-xl transition-colors ${cls} ${challengeState !== "idle" ? "cursor-default" : ""}`}
                              data-testid={`option-${val}`}
                            >
                              {val === "true" ? "True" : "False"}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* Numeric input */}
                    {currentChallenge.type === "numeric_input" && (
                      <div className="space-y-4" data-testid="numeric-input-area">
                        <Input
                          type="text"
                          value={numericAnswer}
                          onChange={e => challengeState === "idle" && setNumericAnswer(e.target.value)}
                          placeholder="Enter your answer..."
                          className="text-lg text-center h-14"
                          disabled={challengeState !== "idle"}
                          onKeyDown={e => e.key === "Enter" && canCheck() && challengeState === "idle" && handleCheck()}
                          data-testid="numeric-answer-input"
                        />
                        {currentChallenge.hint && challengeState === "idle" && (
                          <p className="text-xs text-center text-muted-foreground italic">{currentChallenge.hint}</p>
                        )}
                      </div>
                    )}

                    {/* Feedback */}
                    <AnimatePresence>
                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`mt-6 p-5 rounded-2xl border ${
                            feedback.correct
                              ? "bg-secondary/10 border-secondary/30"
                              : "bg-destructive/10 border-destructive/30"
                          }`}
                          data-testid="challenge-feedback"
                        >
                          <div className="flex items-start gap-3">
                            {feedback.correct
                              ? <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                              : <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            }
                            <div>
                              <p className={`font-semibold mb-1 ${feedback.correct ? "text-secondary" : "text-destructive"}`}>
                                {feedback.correct ? "Correct!" : "Not quite"}
                              </p>
                              {feedback.correct && feedback.xpEarned > 0 && (
                                <motion.p
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="text-primary font-semibold text-sm mb-2 flex items-center gap-1"
                                  data-testid="xp-earned"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  +{feedback.xpEarned} XP earned
                                </motion.p>
                              )}
                              <p className="text-sm text-foreground leading-relaxed" data-testid="challenge-explanation">
                                {feedback.explanation}
                              </p>
                              {!feedback.correct && feedback.hint && (
                                <p className="text-sm text-muted-foreground mt-2 italic" data-testid="challenge-hint">
                                  Hint: {feedback.hint}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="mt-8 flex gap-3">
                      {challengeState === "idle" && (
                        <Button
                          size="lg"
                          className="flex-1"
                          onClick={handleCheck}
                          disabled={!canCheck() || completeChallenge.isPending}
                          data-testid="button-check-answer"
                        >
                          {completeChallenge.isPending ? "Checking..." : "Check Answer"}
                        </Button>
                      )}
                      {challengeState === "correct" && (
                        <Button size="lg" className="flex-1 gap-2" onClick={handleNext} data-testid="button-next-challenge">
                          {currentIndex + 1 >= challenges.length ? "Complete Lesson" : "Continue"}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                      {challengeState === "incorrect" && (
                        <>
                          <Button size="lg" variant="outline" className="gap-2" onClick={handleRetry} data-testid="button-retry">
                            <RotateCcw className="w-4 h-4" />
                            Try Again
                          </Button>
                          <Button size="lg" variant="ghost" className="gap-2" onClick={handleNext} data-testid="button-skip">
                            Skip
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
