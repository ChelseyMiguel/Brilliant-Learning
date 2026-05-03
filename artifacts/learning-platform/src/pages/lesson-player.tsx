import { useParams, useLocation } from "wouter";
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { X, Zap, ArrowRight, FlaskConical, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LESSON_ANIMATIONS } from "@/components/animations";
import { LESSON_LABS } from "@/components/labs";
import LearningCenter from "@/components/labs/LearningCenter";
import LessonIntro from "@/components/labs/LessonIntro";
import { BottomFeedbackPanel, CheckAnswerButton } from "@/components/AnswerFeedback";

type ChallengeState = "idle" | "answered" | "correct" | "incorrect";

interface ChallengeOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export default function LessonPlayerPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const id = parseInt(lessonId ?? "0");
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericAnswer, setNumericAnswer] = useState("");
  const [challengeState, setChallengeState] = useState<ChallengeState>("idle");
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    explanation: string;
    hint?: string | null;
    xpEarned: number;
  } | null>(null);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [showingPrePhase, setShowingPrePhase] = useState(true);

  const { data: lesson, isLoading } = useGetLesson(id, {
    query: { enabled: !!id, queryKey: getGetLessonQueryKey(id) },
  });
  useGetLessonProgress(id, {
    query: { enabled: !!id, queryKey: getGetLessonProgressQueryKey(id) },
  });

  const challenges = lesson?.challenges ?? [];
  const currentChallenge = challenges[currentIndex];
  const options = (currentChallenge?.options as ChallengeOption[] | null) ?? null;
  const progressPct = challenges.length > 0 ? (currentIndex / challenges.length) * 100 : 0;

  const AnimationComponent = LESSON_ANIMATIONS[id] ?? null;
  const lab = LESSON_LABS[id] ?? null;

  const getAnswer = (): string => {
    if (!currentChallenge) return "";
    if (currentChallenge.type === "multiple_choice") return selectedOption ?? "";
    if (currentChallenge.type === "true_false") return selectedOption ?? "";
    return numericAnswer;
  };

  const canCheck = () => {
    if (!currentChallenge) return false;
    if (
      currentChallenge.type === "multiple_choice" ||
      currentChallenge.type === "true_false"
    )
      return !!selectedOption;
    return numericAnswer.trim().length > 0;
  };

  const evaluateLocally = useCallback(() => {
    if (!currentChallenge) return;
    const answer = getAnswer();
    let correct = false;

    if (currentChallenge.type === "multiple_choice" && options) {
      correct = options.find((o) => o.isCorrect)?.id === answer;
    } else if (currentChallenge.type === "true_false") {
      correct = answer === String(currentChallenge.correctAnswer);
    } else {
      correct =
        answer.trim().toLowerCase() ===
        String(currentChallenge.correctAnswer ?? "").trim().toLowerCase();
    }

    const explanation =
      (currentChallenge as any).explanation ??
      (correct
        ? "Well done!"
        : `The correct answer is: ${currentChallenge.correctAnswer}`);

    setFeedback({
      correct,
      explanation: correct ? `${explanation} (Sign in to save XP)` : explanation,
      hint: (currentChallenge as any).hint ?? null,
      xpEarned: 0,
    });
    setChallengeState(correct ? "correct" : "incorrect");
  }, [currentChallenge, options, selectedOption, numericAnswer]);

  const evaluateLocallyRef = useRef(evaluateLocally);
  useEffect(() => {
    evaluateLocallyRef.current = evaluateLocally;
  }, [evaluateLocally]);

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
          setTotalXpEarned((prev) => prev + result.xpEarned);
          queryClient.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
          queryClient.invalidateQueries({
            queryKey: getGetDashboardSummaryQueryKey(),
          });
        }
      },
      onError: () => evaluateLocallyRef.current(),
    },
  });

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
    setAttemptNumber((prev) => prev + 1);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="h-14 border-b border-gray-100 px-6 flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="flex-1 h-2 rounded-full" />
          <Skeleton className="w-16 h-6 rounded-lg" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xl px-6 space-y-6">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Lesson not found</p>
          <Link href="/courses">
            <Button>Browse courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Pre-practice phase ─────────────────────────────────────────────────────
  if (showingPrePhase) {
    if (lab) {
      return (
        <LearningCenter
          lab={lab}
          lessonTitle={lesson.title}
          onStartPractice={() => setShowingPrePhase(false)}
        />
      );
    }
    return (
      <LessonIntro
        lesson={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          category: (lesson as any).category ?? null,
        }}
        AnimationComponent={AnimationComponent}
        onStartPractice={() => setShowingPrePhase(false)}
      />
    );
  }

  // ── Lesson completion ──────────────────────────────────────────────────────
  if (lessonComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full"
          data-testid="lesson-complete-screen"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
            className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Lesson complete!</h1>
          <p className="text-gray-500 mb-8">{lesson.title}</p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#f0f4ff] rounded-3xl p-7 mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-[#4f46e5] mb-1">
              <Zap className="w-5 h-5" />
              <span className="text-3xl font-bold">+{totalXpEarned} XP</span>
            </div>
            <p className="text-sm text-gray-500">earned this lesson</p>
          </motion.div>
          <div className="flex flex-col gap-3">
            <Link href={`/courses/${lesson.courseId}`}>
              <Button
                size="lg"
                className="w-full h-14 rounded-full gap-2 text-base font-bold bg-[#4f46e5] hover:bg-[#4338ca]"
                data-testid="button-continue-after-lesson"
              >
                Continue course
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="lg"
                className="w-full h-14 rounded-full text-base text-gray-500"
                data-testid="button-go-dashboard"
              >
                Back to dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Challenge player ───────────────────────────────────────────────────────
  const bottomBg =
    feedback?.correct
      ? "bg-[#e8faf0]"
      : feedback && !feedback.correct
      ? "bg-[#fef2f2]"
      : "bg-white";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-4">
        <Link href={`/courses/${lesson.courseId}`}>
          <button
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700"
            data-testid="button-close-lesson"
          >
            <X className="w-5 h-5" />
          </button>
        </Link>

        {/* Progress bar */}
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden" data-testid="lesson-progress-bar">
          <motion.div
            className="h-full bg-[#4f46e5] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Return to lab/warm-up */}
        <button
          onClick={() => setShowingPrePhase(true)}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#4f46e5] transition-colors"
          title={lab ? "Return to Learning Center" : "Return to warm-up"}
        >
          <FlaskConical className="w-4.5 h-4.5" />
        </button>

        {/* XP + counter */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#4f46e5] min-w-[3.5rem] justify-end">
          <Zap className="w-4 h-4" />
          <span data-testid="xp-counter">{totalXpEarned}</span>
        </div>
        <span className="text-xs text-gray-400 tabular-nums" data-testid="challenge-counter">
          {currentIndex + 1}/{challenges.length}
        </span>
      </div>

      {/* Scrollable challenge area — padded at bottom so fixed panel doesn't cover content */}
      <div className="flex-1 overflow-y-auto pb-52">
        <div className="max-w-xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.25 }}
            >
              {currentChallenge && (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    {lesson.title}
                  </p>
                  <h2
                    className="text-2xl font-bold text-gray-900 leading-snug mb-8"
                    data-testid="challenge-question"
                  >
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

                        let cls =
                          "border-gray-200 hover:border-[#4f46e5]/50 hover:bg-[#f5f4ff] cursor-pointer";
                        if (showResult && isSelected && challengeState === "correct")
                          cls = "border-emerald-400 bg-[#e8faf0]";
                        else if (showResult && isSelected && challengeState === "incorrect")
                          cls = "border-rose-400 bg-[#fef2f2]";
                        else if (showResult && isCorrectOpt)
                          cls = "border-emerald-400 bg-[#e8faf0]";
                        else if (isSelected)
                          cls = "border-[#4f46e5] bg-[#f5f4ff]";

                        const circleClass = isSelected
                          ? "bg-[#4f46e5] text-white"
                          : showResult && isCorrectOpt
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-500";

                        return (
                          <motion.button
                            key={opt.id}
                            whileHover={challengeState === "idle" ? { scale: 1.01 } : {}}
                            whileTap={challengeState === "idle" ? { scale: 0.99 } : {}}
                            onClick={() =>
                              challengeState === "idle" && setSelectedOption(opt.id)
                            }
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${cls} ${
                              challengeState !== "idle" ? "cursor-default" : ""
                            }`}
                            data-testid={`option-${opt.id}`}
                          >
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${circleClass}`}
                            >
                              {label}
                            </span>
                            <span className="font-medium text-gray-800">{opt.text}</span>
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
                        const isCorrect =
                          val === String(currentChallenge.correctAnswer);

                        let cls =
                          "border-gray-200 hover:border-[#4f46e5]/50 hover:bg-[#f5f4ff] cursor-pointer";
                        if (showResult && isSelected && challengeState === "correct")
                          cls = "border-emerald-400 bg-[#e8faf0]";
                        else if (
                          showResult &&
                          isSelected &&
                          challengeState === "incorrect"
                        )
                          cls = "border-rose-400 bg-[#fef2f2]";
                        else if (showResult && isCorrect)
                          cls = "border-emerald-400 bg-[#e8faf0]";
                        else if (isSelected) cls = "border-[#4f46e5] bg-[#f5f4ff]";

                        return (
                          <motion.button
                            key={val}
                            whileHover={challengeState === "idle" ? { scale: 1.02 } : {}}
                            whileTap={challengeState === "idle" ? { scale: 0.98 } : {}}
                            onClick={() =>
                              challengeState === "idle" && setSelectedOption(val)
                            }
                            className={`py-8 rounded-2xl border-2 font-bold text-xl transition-all ${cls} ${
                              challengeState !== "idle" ? "cursor-default" : ""
                            }`}
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
                    <div className="space-y-3" data-testid="numeric-input-area">
                      <Input
                        type="text"
                        value={numericAnswer}
                        onChange={(e) =>
                          challengeState === "idle" && setNumericAnswer(e.target.value)
                        }
                        placeholder="Type your answer…"
                        className="text-lg text-center h-14 rounded-2xl border-2 border-gray-200 focus:border-[#4f46e5] focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={challengeState !== "idle"}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          canCheck() &&
                          challengeState === "idle" &&
                          handleCheck()
                        }
                        data-testid="numeric-answer-input"
                      />
                      {currentChallenge.hint && challengeState === "idle" && (
                        <p className="text-xs text-center text-gray-400 italic">
                          {currentChallenge.hint}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed bottom panel */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <AnimatePresence>
          {feedback && <BottomFeedbackPanel feedback={feedback} />}
        </AnimatePresence>
        <div className={`px-6 py-4 transition-colors ${bottomBg} ${!feedback ? "border-t border-gray-100" : ""}`}>
          <div className="max-w-xl mx-auto flex gap-3">
            <CheckAnswerButton
              challengeState={challengeState}
              disabled={challengeState === "idle" && !canCheck()}
              pending={completeChallenge.isPending}
              onClick={handleCheck}
              onNext={handleNext}
              onRetry={handleRetry}
              isLastChallenge={currentIndex + 1 >= challenges.length}
            />
            {challengeState === "incorrect" && (
              <motion.button
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleNext}
                className="h-14 px-6 rounded-full text-gray-500 hover:bg-gray-100 font-medium transition-colors flex items-center gap-1.5"
                data-testid="button-skip"
              >
                Skip <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
