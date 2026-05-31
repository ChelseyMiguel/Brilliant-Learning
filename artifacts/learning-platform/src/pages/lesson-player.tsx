import { useParams, useLocation } from "wouter";
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import {
  useGetLesson,
  useCompleteChallenge,
  useGetLessonProgress,
  useGetCourseProgress,
  useGetCourse,
  getGetLessonQueryKey,
  getGetLessonProgressQueryKey,
  getGetMyProgressQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetCourseProgressQueryKey,
  getGetCourseQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { X, Check, Zap, ArrowRight, FlaskConical, CheckCircle2, Lightbulb, GraduationCap, Star, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LESSON_ANIMATIONS } from "@/components/animations";
import { LESSON_LABS } from "@/components/labs";
import LearningCenter from "@/components/labs/LearningCenter";
import LessonIntro from "@/components/labs/LessonIntro";
import { BottomFeedbackPanel, CheckAnswerButton } from "@/components/AnswerFeedback";
import CertificateCard from "@/components/CertificateCard";
import { loadProfile } from "@/components/OnboardingModal";
import FormulaSheet from "@/components/FormulaSheet";

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
  const [courseJustCompleted, setCourseJustCompleted] = useState(false);
  const [showingPrePhase, setShowingPrePhase] = useState(true);
  const [hintVisible, setHintVisible] = useState(false);

  const { data: lesson, isLoading } = useGetLesson(id, {
    query: { enabled: !!id, queryKey: getGetLessonQueryKey(id) },
  });
  useGetLessonProgress(id, {
    query: { enabled: !!id, queryKey: getGetLessonProgressQueryKey(id) },
  });
  const courseId = lesson?.courseId ?? 0;
  const { data: courseProgress } = useGetCourseProgress(courseId, {
    query: {
      enabled: !!courseId && lessonComplete,
      queryKey: getGetCourseProgressQueryKey(courseId),
    },
  });
  const { data: course } = useGetCourse(courseId, {
    query: { enabled: !!courseId, queryKey: getGetCourseQueryKey(courseId) },
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

  useEffect(() => {
    if (!lessonComplete) return;
    const end = Date.now() + 1800;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#4f46e5", "#7c3aed", "#22c55e", "#f59e0b"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#4f46e5", "#7c3aed", "#22c55e", "#f59e0b"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [lessonComplete]);

  useEffect(() => {
    if (lessonComplete && (courseProgress?.percentComplete ?? 0) >= 100) {
      setCourseJustCompleted(true);
    }
  }, [lessonComplete, courseProgress?.percentComplete]);

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
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          if (lesson?.courseId) {
            queryClient.invalidateQueries({ queryKey: getGetCourseProgressQueryKey(lesson.courseId) });
          }
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
      setHintVisible(false);
    }
  }, [currentIndex, challenges.length]);

  const handleRetry = () => {
    setChallengeState("idle");
    setFeedback(null);
    setSelectedOption(null);
    setNumericAnswer("");
    setAttemptNumber((prev) => prev + 1);
    setHintVisible(false);
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
          courseId={lesson.courseId}
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
        courseId={lesson.courseId}
      />
    );
  }

  // ── Course completion ──────────────────────────────────────────────────────
  if (lessonComplete && courseJustCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg w-full"
          data-testid="course-complete-screen"
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 16 }}
            className="w-28 h-28 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <GraduationCap className="w-14 h-14 text-amber-500" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-2">Course Complete</p>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">You did it!</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              You've finished every lesson in this course. That's a real achievement.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white border border-gray-100 rounded-3xl p-6 mb-6 shadow-sm"
          >
            <div className="flex justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[#4f46e5] mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-2xl font-bold">+{totalXpEarned}</span>
                </div>
                <p className="text-xs text-gray-400">XP earned</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-2xl font-bold">{courseProgress?.completedLessons ?? 0}</span>
                </div>
                <p className="text-xs text-gray-400">lessons done</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <CertificateCard
              courseName={course?.title ?? "this course"}
              learnerName={loadProfile()?.name || "Learner"}
              xpEarned={totalXpEarned}
              completedDate={new Date()}
            />
          </motion.div>

          <div className="flex flex-col gap-3">
            <Link href="/courses">
              <Button
                size="lg"
                className="w-full h-14 rounded-full gap-2 text-base font-bold bg-[#4f46e5] hover:bg-[#4338ca]"
                data-testid="button-explore-after-course"
              >
                Explore more courses
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
      ? "bg-[#d7f5e3]"
      : feedback && !feedback.correct
      ? "bg-[#ffdfe0]"
      : "bg-white";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-4">
        <Link href={`/courses/${lesson.courseId}`}>
          <button
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700"
            data-testid="button-close-lesson"
            title="Back to course"
          >
            <X className="w-5 h-5" />
          </button>
        </Link>

        {/* Lesson title breadcrumb */}
        <span className="text-xs text-gray-400 font-medium hidden sm:block truncate max-w-[140px]">
          {lesson.title}
        </span>

        {/* Progress bar */}
        <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden" data-testid="lesson-progress-bar">
          <motion.div
            className="h-full bg-[#58cc02] rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {progressPct > 0 && (
              <span className="absolute right-0 top-0 h-full w-3 bg-white/30 rounded-full" />
            )}
          </motion.div>
        </div>

        {/* Return to lab/warm-up */}
        <button
          onClick={() => setShowingPrePhase(true)}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#4f46e5] transition-colors"
          title={lab ? "Return to Learning Center" : "Return to warm-up"}
        >
          <FlaskConical className="w-4.5 h-4.5" />
        </button>

        {/* Formula Sheet */}
        <FormulaSheet
          courseId={courseId}
          trigger={
            <button
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#4f46e5] transition-colors"
              title="Formula Sheet"
            >
              <ScrollText className="w-4 h-4" />
            </button>
          }
        />

        {/* XP + counter */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#4f46e5] min-w-[3.5rem] justify-end">
          <Zap className="w-4 h-4" />
          <span data-testid="xp-counter">{totalXpEarned}</span>
        </div>
        <span className="text-xs text-gray-400 tabular-nums" data-testid="challenge-counter">
          {currentIndex + 1}/{challenges.length}
        </span>
      </div>

      {/* Scrollable challenge area - padded at bottom so fixed panel doesn't cover content */}
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
                    <motion.div
                      animate={
                        challengeState === "incorrect"
                          ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                          : {}
                      }
                      transition={{ duration: 0.45 }}
                      className="space-y-3"
                      data-testid="multiple-choice-options"
                    >
                      {options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const isSelected = selectedOption === opt.id;
                        const showResult = challengeState !== "idle";
                        const isCorrectOpt = opt.isCorrect;
                        const isWrongSelected = showResult && isSelected && challengeState === "incorrect";
                        const isRevealedCorrect = showResult && isCorrectOpt;

                        // Card border + bg + shadow
                        let cardCls = "border-gray-200 bg-white shadow-[0_4px_0_0_#d1d5db]";
                        if (isRevealedCorrect)
                          cardCls = "border-[#58cc02] bg-[#edffd8] shadow-[0_4px_0_0_#3a9900]";
                        else if (isWrongSelected)
                          cardCls = "border-[#ff4b4b] bg-[#ffdfe0] shadow-[0_4px_0_0_#cc0000]";
                        else if (!showResult && isSelected)
                          cardCls = "border-[#4f46e5] bg-[#f0efff] shadow-[0_4px_0_0_#3730a3]";
                        else if (!showResult)
                          cardCls = "border-gray-200 bg-white shadow-[0_4px_0_0_#d1d5db] hover:border-[#4f46e5]/50 hover:bg-[#f5f4ff]";

                        // Letter badge
                        let badgeCls = "bg-gray-100 text-gray-500";
                        if (!showResult && isSelected) badgeCls = "bg-[#4f46e5] text-white";
                        else if (isRevealedCorrect) badgeCls = "bg-[#58cc02] text-white";
                        else if (isWrongSelected) badgeCls = "bg-[#ff4b4b] text-white";

                        return (
                          <motion.button
                            key={opt.id}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + i * 0.07, type: "spring", stiffness: 380, damping: 28 }}
                            whileHover={challengeState === "idle" ? { y: -1 } : {}}
                            whileTap={challengeState === "idle" ? { y: 4, boxShadow: "0 0px 0 0 #d1d5db" } : {}}
                            onClick={() => challengeState === "idle" && setSelectedOption(opt.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors text-left ${cardCls} ${
                              challengeState !== "idle" ? "cursor-default" : "cursor-pointer"
                            }`}
                            data-testid={`option-${opt.id}`}
                          >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${badgeCls}`}>
                              {letter}
                            </span>
                            <span className="font-semibold text-gray-800 flex-1">{opt.text}</span>
                            {showResult && isRevealedCorrect && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                                className="w-6 h-6 rounded-full bg-[#58cc02] flex items-center justify-center flex-shrink-0"
                              >
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                              </motion.span>
                            )}
                            {showResult && isWrongSelected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                                className="w-6 h-6 rounded-full bg-[#ff4b4b] flex items-center justify-center flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                              </motion.span>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* True / False */}
                  {currentChallenge.type === "true_false" && (
                    <motion.div
                      animate={
                        challengeState === "incorrect"
                          ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                          : {}
                      }
                      transition={{ duration: 0.45 }}
                      className="grid grid-cols-2 gap-4"
                      data-testid="true-false-options"
                    >
                      {["true", "false"].map((val, i) => {
                        const isSelected = selectedOption === val;
                        const showResult = challengeState !== "idle";
                        const isCorrectVal = val === String(currentChallenge.correctAnswer);
                        const isWrongSelected = showResult && isSelected && challengeState === "incorrect";

                        let cardCls = "border-gray-200 bg-white shadow-[0_4px_0_0_#d1d5db] hover:border-[#4f46e5]/50 hover:bg-[#f5f4ff]";
                        if (showResult && isCorrectVal)
                          cardCls = "border-[#58cc02] bg-[#edffd8] shadow-[0_4px_0_0_#3a9900]";
                        else if (isWrongSelected)
                          cardCls = "border-[#ff4b4b] bg-[#ffdfe0] shadow-[0_4px_0_0_#cc0000]";
                        else if (!showResult && isSelected)
                          cardCls = "border-[#4f46e5] bg-[#f0efff] shadow-[0_4px_0_0_#3730a3]";

                        return (
                          <motion.button
                            key={val}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + i * 0.09, type: "spring", stiffness: 380, damping: 28 }}
                            whileHover={challengeState === "idle" ? { y: -1 } : {}}
                            whileTap={challengeState === "idle" ? { y: 4, boxShadow: "0 0px 0 0 #d1d5db" } : {}}
                            onClick={() => challengeState === "idle" && setSelectedOption(val)}
                            className={`relative py-10 rounded-2xl border-2 font-extrabold text-2xl transition-colors flex flex-col items-center justify-center gap-2 ${cardCls} ${
                              challengeState !== "idle" ? "cursor-default" : "cursor-pointer"
                            }`}
                            data-testid={`option-${val}`}
                          >
                            {val === "true" ? "True" : "False"}
                            {showResult && isCorrectVal && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                                className="w-6 h-6 rounded-full bg-[#58cc02] flex items-center justify-center"
                              >
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                              </motion.span>
                            )}
                            {isWrongSelected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                                className="w-6 h-6 rounded-full bg-[#ff4b4b] flex items-center justify-center"
                              >
                                <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                              </motion.span>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
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
                    </div>
                  )}

                  {/* Hint button - shown for all types before answering */}
                  {(currentChallenge as any).hint && challengeState === "idle" && (
                    <div className="mt-6">
                      {!hintVisible ? (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          onClick={() => setHintVisible(true)}
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#4f46e5] transition-colors mx-auto"
                          data-testid="button-show-hint"
                        >
                          <Lightbulb className="w-4 h-4" />
                          Show hint
                        </motion.button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl"
                          data-testid="hint-text"
                        >
                          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800 leading-relaxed">
                            {(currentChallenge as any).hint}
                          </p>
                        </motion.div>
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
                className="h-14 px-5 rounded-2xl text-[#d62e2e] font-bold transition-colors flex items-center gap-1.5 hover:bg-[#ff4b4b]/10"
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
