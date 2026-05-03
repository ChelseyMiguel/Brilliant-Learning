import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Zap, ArrowRight, RotateCcw } from "lucide-react";

interface FeedbackData {
  correct: boolean;
  explanation: string;
  hint?: string | null;
  xpEarned: number;
}

interface PanelProps {
  feedback: FeedbackData;
}

export function BottomFeedbackPanel({ feedback }: PanelProps) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 420 }}
      className={`px-6 pt-5 pb-4 ${
        feedback.correct
          ? "bg-[#e8faf0] border-t-2 border-[#b7efd0]"
          : "bg-[#fef2f2] border-t-2 border-[#fecaca]"
      }`}
      data-testid="challenge-feedback"
    >
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2.5 mb-1.5">
          {feedback.correct
            ? <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            : <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />}
          <span
            className={`text-[1.1rem] font-bold leading-tight ${
              feedback.correct ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {feedback.correct ? "Correct!" : "Not quite"}
          </span>
          {feedback.correct && feedback.xpEarned > 0 && (
            <span
              className="ml-auto text-sm font-semibold text-emerald-600 flex items-center gap-1"
              data-testid="xp-earned"
            >
              <Zap className="w-3.5 h-3.5" />
              +{feedback.xpEarned} XP
            </span>
          )}
        </div>
        <p
          className="text-sm text-gray-700 leading-relaxed"
          data-testid="challenge-explanation"
        >
          {feedback.explanation}
        </p>
        {!feedback.correct && feedback.hint && (
          <p
            className="text-sm text-gray-500 mt-1.5 italic"
            data-testid="challenge-hint"
          >
            Hint: {feedback.hint}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface CheckButtonProps {
  challengeState: "idle" | "answered" | "correct" | "incorrect";
  disabled: boolean;
  pending: boolean;
  onClick: () => void;
  onNext?: () => void;
  onRetry?: () => void;
  isLastChallenge?: boolean;
}

export function CheckAnswerButton({
  challengeState,
  disabled,
  pending,
  onClick,
  onNext,
  onRetry,
  isLastChallenge,
}: CheckButtonProps) {
  const handleClick = () => {
    if (challengeState === "idle") onClick();
    else if (challengeState === "correct" && onNext) onNext();
    else if (challengeState === "incorrect" && onRetry) onRetry();
  };

  const label = pending
    ? "Checking…"
    : challengeState === "correct"
    ? isLastChallenge
      ? "Complete lesson"
      : "Continue"
    : challengeState === "incorrect"
    ? "Try again"
    : "Check";

  const btnClass =
    challengeState === "correct"
      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200"
      : challengeState === "incorrect"
      ? "bg-white text-rose-600 border-2 border-rose-300 hover:bg-rose-50"
      : disabled
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-sm shadow-indigo-200";

  const TrailingIcon =
    challengeState === "correct"
      ? ArrowRight
      : challengeState === "incorrect"
      ? RotateCcw
      : null;

  return (
    <motion.button
      animate={
        challengeState === "incorrect"
          ? { x: [0, -9, 9, -7, 7, -4, 4, 0] }
          : challengeState === "correct"
          ? { scale: [1, 1.04, 0.98, 1] }
          : {}
      }
      transition={
        challengeState === "incorrect"
          ? { duration: 0.45 }
          : { duration: 0.3 }
      }
      whileHover={!disabled || challengeState !== "idle" ? { scale: 1.01 } : {}}
      whileTap={!disabled || challengeState !== "idle" ? { scale: 0.98 } : {}}
      onClick={handleClick}
      disabled={disabled && challengeState === "idle"}
      data-testid={
        challengeState === "correct"
          ? "button-next-challenge"
          : challengeState === "incorrect"
          ? "button-retry"
          : "button-check-answer"
      }
      className={`flex-1 h-14 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 ${btnClass}`}
    >
      {label}
      {TrailingIcon && <TrailingIcon className="w-4 h-4" />}
    </motion.button>
  );
}

export default BottomFeedbackPanel;
