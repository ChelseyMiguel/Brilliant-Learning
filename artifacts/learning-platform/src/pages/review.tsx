import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import confetti from "canvas-confetti";
import {
  getGetDashboardSummaryQueryKey,
  getGetMyProgressQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { X, Zap, RotateCcw, Trophy, Brain, Lightbulb, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomFeedbackPanel, CheckAnswerButton } from "@/components/AnswerFeedback";
import MascotSticker from "@/components/MascotSticker";

interface ReviewChallenge {
  id: number;
  lessonId: number;
  lessonTitle: string;
  type: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[] | null;
  correctAnswer: string;
  explanation: string;
  hint: string | null;
  xpReward: number;
}

type ChallengeState = "idle" | "correct" | "incorrect";

async function fetchReview(): Promise<{ challenges: ReviewChallenge[]; total: number }> {
  const res = await fetch("/api/progress/review");
  if (!res.ok) throw new Error("Failed to fetch review");
  return res.json();
}

async function submitAnswer(body: {
  challengeId: number;
  lessonId: number;
  answer: string;
  attemptNumber: number;
}) {
  const res = await fetch("/api/progress/complete-challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to submit");
  return res.json() as Promise<{
    correct: boolean;
    xpEarned: number;
    explanation: string;
    hint: string | null;
  }>;
}

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["/api/progress/review"],
    queryFn: fetchReview,
  });

  const [idx, setIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericAnswer, setNumericAnswer] = useState("");
  const [state, setState] = useState<ChallengeState>("idle");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    explanation: string;
    hint?: string | null;
    xpEarned: number;
  } | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [done, setDone] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const challenges = data?.challenges ?? [];
  const current = challenges[idx] ?? null;
  const options = current?.options ?? null;
  const progressPct = challenges.length > 0 ? (idx / challenges.length) * 100 : 0;

  useEffect(() => {
    if (done) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 }, colors: ["#4f46e5", "#7c3aed", "#22c55e", "#f59e0b"] });
    }
  }, [done]);

  const getAnswer = () => {
    if (!current) return "";
    if (current.type === "multiple_choice" || current.type === "true_false")
      return selectedOption ?? "";
    return numericAnswer;
  };

  const canCheck = () => {
    if (!current) return false;
    if (current.type === "multiple_choice" || current.type === "true_false")
      return !!selectedOption;
    return numericAnswer.trim().length > 0;
  };

  const evaluateLocally = useCallback(() => {
    if (!current) return;
    const answer = getAnswer();
    let correct = false;
    if (current.type === "multiple_choice" && options) {
      correct = options.find((o) => o.isCorrect)?.id === answer;
    } else {
      correct = answer.trim().toLowerCase() === current.correctAnswer.trim().toLowerCase();
    }
    setFeedback({ correct, explanation: current.explanation, hint: current.hint, xpEarned: 0 });
    setState(correct ? "correct" : "incorrect");
  }, [current, options, selectedOption, numericAnswer]);

  const evalRef = useRef(evaluateLocally);
  useEffect(() => { evalRef.current = evaluateLocally; }, [evaluateLocally]);

  const submit = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (result) => {
      setFeedback({ correct: result.correct, explanation: result.explanation, hint: result.hint, xpEarned: result.xpEarned });
      setState(result.correct ? "correct" : "incorrect");
      if (result.correct) {
        setTotalXp((p) => p + result.xpEarned);
        queryClient.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["/api/progress/review"] });
      }
    },
    onError: () => evalRef.current(),
  });

  const handleCheck = () => {
    if (!current || !canCheck()) return;
    submit.mutate({ challengeId: current.id, lessonId: current.lessonId, answer: getAnswer(), attemptNumber });
  };

  const handleNext = () => {
    const next = idx + 1;
    if (next >= challenges.length) {
      setDone(true);
    } else {
      setIdx(next);
      setSelectedOption(null);
      setNumericAnswer("");
      setState("idle");
      setFeedback(null);
      setAttemptNumber(1);
      setHintVisible(false);
      setAiExplanation(null);
    }
  };

  const handleRetry = () => {
    setState("idle");
    setFeedback(null);
    setSelectedOption(null);
    setNumericAnswer("");
    setAttemptNumber((p) => p + 1);
    setHintVisible(false);
    setAiExplanation(null);
  };

  const handleAiExplain = async () => {
    if (!current || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: current.question,
          lessonTitle: current.lessonTitle,
          correctAnswer: current.correctAnswer,
          incorrectAnswer: getAnswer(),
        }),
      });
      const data = await res.json() as { explanation?: string };
      setAiExplanation(data.explanation ?? "Unable to generate explanation right now.");
    } catch {
      setAiExplanation("Unable to reach the AI service. Review the lesson to reinforce this concept.");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="h-14 border-b border-gray-100 px-6 flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="flex-1 h-2 rounded-full" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xl px-6 space-y-6">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <MascotSticker pose="water" size={150} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Nothing to review!</h1>
          <p className="text-gray-500 mb-8">
            You've answered every attempted challenge correctly. Keep learning to
            build up a review queue.
          </p>
          <Link href="/courses">
            <Button size="lg" className="rounded-full px-8 bg-[#4f46e5] hover:bg-[#4338ca]">
              Keep learning
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full"
        >
          <MascotSticker pose="podium" size={160} delay={0.1} className="mx-auto mb-2" />
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Review complete!</h1>
          <p className="text-gray-500 mb-8">You worked through {challenges.length} challenge{challenges.length !== 1 ? "s" : ""}.</p>
          <div className="bg-[#f0f4ff] rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-[#4f46e5] mb-1">
              <Zap className="w-5 h-5" />
              <span className="text-3xl font-bold">+{totalXp} XP</span>
            </div>
            <p className="text-sm text-gray-500">earned this session</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/courses">
              <Button size="lg" className="w-full h-14 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] font-bold text-base">
                Keep learning
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg" className="w-full h-14 rounded-full text-gray-500 text-base">
                Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const bottomBg =
    feedback?.correct ? "bg-[#e8faf0]" : feedback ? "bg-[#fef2f2]" : "bg-white";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-4">
        <Link href="/dashboard">
          <button
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            title="Back to dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </Link>
        {/* Page label */}
        <span className="text-xs font-semibold text-[#4f46e5] bg-[#4f46e5]/10 px-2.5 py-1 rounded-full">
          Spaced Review
        </span>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#4f46e5] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#4f46e5] min-w-[3.5rem] justify-end">
          <Zap className="w-4 h-4" />
          <span>{totalXp}</span>
        </div>
        <span className="text-xs text-gray-400 tabular-nums">
          {idx + 1}/{challenges.length}
        </span>
      </div>

      {/* Challenge area */}
      <div className="flex-1 overflow-y-auto pb-52">
        <div className="max-w-xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.25 }}
            >
              {current && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-[#4f46e5] bg-[#4f46e5]/10 px-2.5 py-1 rounded-full">
                      Review
                    </span>
                    <span className="text-xs text-gray-400">{current.lessonTitle}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-8">
                    {current.question}
                  </h2>

                  {/* Multiple choice */}
                  {current.type === "multiple_choice" && options && (
                    <div className="space-y-3">
                      {options.map((opt, i) => {
                        const label = String.fromCharCode(65 + i);
                        const isSelected = selectedOption === opt.id;
                        const showResult = state !== "idle";
                        const isCorrectOpt = opt.isCorrect;

                        let cls = "border-gray-200 hover:border-[#4f46e5]/50 hover:bg-[#f5f4ff] cursor-pointer";
                        if (showResult && isSelected && state === "correct") cls = "border-emerald-400 bg-[#e8faf0]";
                        else if (showResult && isSelected && state === "incorrect") cls = "border-rose-400 bg-[#fef2f2]";
                        else if (showResult && isCorrectOpt) cls = "border-emerald-400 bg-[#e8faf0]";
                        else if (isSelected) cls = "border-[#4f46e5] bg-[#f5f4ff]";

                        return (
                          <motion.button
                            key={opt.id}
                            whileHover={state === "idle" ? { scale: 1.01 } : {}}
                            whileTap={state === "idle" ? { scale: 0.99 } : {}}
                            onClick={() => state === "idle" && setSelectedOption(opt.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${cls} ${state !== "idle" ? "cursor-default" : ""}`}
                          >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${isSelected ? "bg-[#4f46e5] text-white" : showResult && isCorrectOpt ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                              {label}
                            </span>
                            <span className="font-medium text-gray-800">{opt.text}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* True / False */}
                  {current.type === "true_false" && (
                    <div className="grid grid-cols-2 gap-4">
                      {["true", "false"].map((val) => {
                        const isSelected = selectedOption === val;
                        const showResult = state !== "idle";
                        const isCorrect = val === String(current.correctAnswer);

                        let cls = "border-gray-200 hover:border-[#4f46e5]/50 hover:bg-[#f5f4ff] cursor-pointer";
                        if (showResult && isSelected && state === "correct") cls = "border-emerald-400 bg-[#e8faf0]";
                        else if (showResult && isSelected && state === "incorrect") cls = "border-rose-400 bg-[#fef2f2]";
                        else if (showResult && isCorrect) cls = "border-emerald-400 bg-[#e8faf0]";
                        else if (isSelected) cls = "border-[#4f46e5] bg-[#f5f4ff]";

                        return (
                          <motion.button
                            key={val}
                            whileHover={state === "idle" ? { scale: 1.02 } : {}}
                            whileTap={state === "idle" ? { scale: 0.98 } : {}}
                            onClick={() => state === "idle" && setSelectedOption(val)}
                            className={`py-8 rounded-2xl border-2 font-bold text-xl transition-all ${cls} ${state !== "idle" ? "cursor-default" : ""}`}
                          >
                            {val === "true" ? "True" : "False"}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Numeric */}
                  {current.type === "numeric_input" && (
                    <Input
                      type="text"
                      value={numericAnswer}
                      onChange={(e) => state === "idle" && setNumericAnswer(e.target.value)}
                      placeholder="Type your answer…"
                      className="text-lg text-center h-14 rounded-2xl border-2 border-gray-200 focus:border-[#4f46e5] focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={state !== "idle"}
                      onKeyDown={(e) => e.key === "Enter" && canCheck() && state === "idle" && handleCheck()}
                    />
                  )}

                  {/* AI explanation panel */}
                  {aiExplanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex items-start gap-3 p-4 bg-[#f0f4ff] border border-[#4f46e5]/20 rounded-2xl"
                    >
                      <Brain className="w-5 h-5 text-[#4f46e5] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#4f46e5] mb-1">AI Explanation</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{aiExplanation}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Hint button */}
                  {current.hint && state === "idle" && (
                    <div className="mt-6">
                      {!hintVisible ? (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          onClick={() => setHintVisible(true)}
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#4f46e5] transition-colors mx-auto"
                        >
                          <Lightbulb className="w-4 h-4" />
                          Show hint
                        </motion.button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl"
                        >
                          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800 leading-relaxed">{current.hint}</p>
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
              challengeState={state}
              disabled={state === "idle" && !canCheck()}
              pending={submit.isPending}
              onClick={handleCheck}
              onNext={handleNext}
              onRetry={handleRetry}
              isLastChallenge={idx + 1 >= challenges.length}
            />
            {state === "incorrect" && (
              <motion.button
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleNext}
                className="h-14 px-6 rounded-full text-gray-500 hover:bg-gray-100 font-medium transition-colors flex items-center gap-1.5"
              >
                Skip <RotateCcw className="w-4 h-4" />
              </motion.button>
            )}
            {state === "incorrect" && !aiExplanation && (
              <motion.button
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={handleAiExplain}
                disabled={aiLoading}
                className="h-14 px-5 rounded-full text-[#4f46e5] hover:bg-[#f5f4ff] font-medium transition-colors flex items-center gap-1.5 border border-[#4f46e5]/20 disabled:opacity-50"
              >
                {aiLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Thinking…</>
                ) : (
                  <><HelpCircle className="w-4 h-4" /> Why am I struggling?</>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
