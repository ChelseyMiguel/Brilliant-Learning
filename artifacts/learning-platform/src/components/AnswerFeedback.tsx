import { motion } from "framer-motion";
import { Check, X, Zap, ArrowRight, RotateCcw } from "lucide-react";

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
  const isCorrect = feedback.correct;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 400 }}
      className={`px-6 pt-5 pb-5 border-t-4 ${
        isCorrect
          ? "bg-[#d7f5e3] border-[#58cc02]"
          : "bg-[#ffdfe0] border-[#ff4b4b]"
      }`}
      data-testid="challenge-feedback"
    >
      <div className="max-w-xl mx-auto flex items-start gap-4">
        {/* Animated icon circle */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.05 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
            isCorrect ? "bg-[#58cc02] shadow-green-200" : "bg-[#ff4b4b] shadow-red-200"
          }`}
        >
          {isCorrect
            ? <Check className="w-6 h-6 text-white" strokeWidth={3} />
            : <X className="w-6 h-6 text-white" strokeWidth={3} />}
        </motion.div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-lg font-extrabold tracking-tight ${
                isCorrect ? "text-[#2a7a00]" : "text-[#d62e2e]"
              }`}
            >
              {isCorrect ? "Great job!" : "Oops!"}
            </motion.span>

            {isCorrect && feedback.xpEarned > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.22, type: "spring", stiffness: 380 }}
                className="flex items-center gap-1 bg-[#58cc02] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
                data-testid="xp-earned"
              >
                <Zap className="w-3 h-3" />
                +{feedback.xpEarned} XP
              </motion.span>
            )}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className={`text-sm leading-relaxed ${
              isCorrect ? "text-[#2a7a00]" : "text-[#d62e2e]"
            }`}
            data-testid="challenge-explanation"
          >
            {feedback.explanation}
          </motion.p>

          {!isCorrect && feedback.hint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22 }}
              className="text-xs text-[#d62e2e]/70 mt-1.5 font-medium"
              data-testid="challenge-hint"
            >
              Hint: {feedback.hint}
            </motion.p>
          )}
        </div>
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
    ? "Checking..."
    : challengeState === "correct"
    ? isLastChallenge
      ? "Finish lesson"
      : "Continue"
    : challengeState === "incorrect"
    ? "Try again"
    : "Check answer";

  const isIdle = challengeState === "idle";
  const isCorrect = challengeState === "correct";
  const isIncorrect = challengeState === "incorrect";

  const btnStyle = isCorrect
    ? "bg-[#58cc02] hover:bg-[#4db802] text-white shadow-[0_4px_0_#3a9900] active:shadow-[0_2px_0_#3a9900] active:translate-y-[2px]"
    : isIncorrect
    ? "bg-white text-[#d62e2e] border-2 border-[#ff9999] shadow-[0_4px_0_#ffcccc] active:shadow-[0_2px_0_#ffcccc] active:translate-y-[2px] hover:bg-rose-50"
    : disabled
    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
    : "bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-[0_4px_0_#3730a3] active:shadow-[0_2px_0_#3730a3] active:translate-y-[2px]";

  const Icon =
    isCorrect ? ArrowRight
    : isIncorrect ? RotateCcw
    : null;

  return (
    <motion.button
      layout
      animate={
        isIncorrect
          ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
          : isCorrect
          ? { scale: [1, 1.05, 0.97, 1.02, 1] }
          : {}
      }
      transition={
        isIncorrect
          ? { duration: 0.5, ease: "easeInOut" }
          : isCorrect
          ? { duration: 0.4, ease: "easeOut" }
          : {}
      }
      whileHover={isIdle && !disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={handleClick}
      disabled={disabled && isIdle}
      data-testid={
        isCorrect ? "button-next-challenge"
        : isIncorrect ? "button-retry"
        : "button-check-answer"
      }
      className={`flex-1 h-14 rounded-2xl font-extrabold text-base transition-all flex items-center justify-center gap-2 select-none ${btnStyle}`}
    >
      {label}
      {Icon && <Icon className="w-4 h-4" />}
    </motion.button>
  );
}

export default BottomFeedbackPanel;
