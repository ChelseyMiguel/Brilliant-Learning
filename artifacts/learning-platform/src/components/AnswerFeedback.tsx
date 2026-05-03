import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Zap, ArrowRight, RotateCcw } from "lucide-react";

type FeedbackType = "correct" | "incorrect";

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

const CORRECT_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#059669", "#a7f3d0"];
const INCORRECT_COLORS = ["#ef4444", "#f87171", "#fca5a5", "#dc2626"];

function ConfettiBurst({ type }: { type: FeedbackType }) {
  const colors = type === "correct" ? CORRECT_COLORS : INCORRECT_COLORS;
  const count = type === "correct" ? 16 : 10;

  const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360 + Math.random() * (360 / count),
    distance: 55 + Math.random() * 35,
    size: 5 + Math.random() * 5,
    color: colors[i % colors.length],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {particles.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: "50%",
              top: "50%",
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: Math.cos(rad) * p.distance,
              y: Math.sin(rad) * p.distance,
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 0.9, 0],
            }}
            transition={{
              duration: 0.7,
              delay: Math.random() * 0.08,
              ease: [0.2, 0, 0.6, 1],
            }}
          />
        );
      })}
    </div>
  );
}

interface Props {
  feedback: {
    correct: boolean;
    explanation: string;
    hint?: string | null;
    xpEarned: number;
  };
}

export default function AnswerFeedback({ feedback }: Props) {
  const [showBurst, setShowBurst] = useState(true);

  useEffect(() => {
    setShowBurst(true);
    const t = setTimeout(() => setShowBurst(false), 900);
    return () => clearTimeout(t);
  }, []);

  const type: FeedbackType = feedback.correct ? "correct" : "incorrect";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`mt-6 p-5 rounded-2xl border relative overflow-hidden ${
        feedback.correct
          ? "bg-secondary/10 border-secondary/30"
          : "bg-destructive/10 border-destructive/30"
      }`}
      data-testid="challenge-feedback"
    >
      <AnimatePresence>
        {showBurst && <ConfettiBurst type={type} />}
      </AnimatePresence>

      <div className="flex items-start gap-3 relative">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.05 }}
        >
          {feedback.correct
            ? <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            : <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          }
        </motion.div>
        <div>
          <motion.p
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className={`font-semibold mb-1 ${feedback.correct ? "text-secondary" : "text-destructive"}`}
          >
            {feedback.correct ? "Correct!" : "Not quite"}
          </motion.p>

          {feedback.correct && feedback.xpEarned > 0 && (
            <motion.p
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
              className="text-primary font-semibold text-sm mb-2 flex items-center gap-1"
              data-testid="xp-earned"
            >
              <Zap className="w-3.5 h-3.5" />
              +{feedback.xpEarned} XP earned
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-foreground leading-relaxed"
            data-testid="challenge-explanation"
          >
            {feedback.explanation}
          </motion.p>

          {!feedback.correct && feedback.hint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground mt-2 italic"
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
  const isShaking = challengeState === "incorrect";
  const isPopping = challengeState === "correct";
  const isIdle = challengeState === "idle";

  const handleClick = () => {
    if (challengeState === "idle") onClick();
    else if (challengeState === "correct" && onNext) onNext();
    else if (challengeState === "incorrect" && onRetry) onRetry();
  };

  const label = pending
    ? "Checking…"
    : challengeState === "correct"
    ? isLastChallenge ? "Complete Lesson" : "Continue"
    : challengeState === "incorrect"
    ? "Try Again"
    : "Check Answer";

  const buttonClass = challengeState === "correct"
    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
    : challengeState === "incorrect"
    ? "bg-background text-foreground border-2 border-border hover:border-primary/40 hover:bg-muted/40"
    : disabled
    ? "bg-muted text-muted-foreground cursor-not-allowed"
    : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer";

  const TrailingIcon = challengeState === "correct"
    ? ArrowRight
    : challengeState === "incorrect"
    ? RotateCcw
    : null;

  return (
    <motion.div
      className="flex-1 relative"
      animate={
        isShaking
          ? { x: [0, -9, 9, -7, 7, -4, 4, 0] }
          : isPopping
          ? { scale: [1, 1.06, 0.97, 1] }
          : { x: 0, scale: 1 }
      }
      transition={
        isShaking
          ? { duration: 0.45, ease: "easeInOut" }
          : isPopping
          ? { duration: 0.32, ease: [0.2, 0, 0.4, 1] }
          : { duration: 0.15 }
      }
    >
      <motion.button
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        onClick={handleClick}
        disabled={disabled && isIdle}
        data-testid={
          challengeState === "correct"
            ? "button-next-challenge"
            : challengeState === "incorrect"
            ? "button-retry"
            : "button-check-answer"
        }
        className={`w-full h-12 px-6 rounded-xl font-semibold text-sm transition-colors relative overflow-hidden flex items-center justify-center gap-2 ${buttonClass} ${
          isShaking ? "ring-2 ring-destructive/40" : ""
        }`}
      >
        {/* Idle pulse ring */}
        {isIdle && !disabled && (
          <motion.span
            className="absolute inset-0 rounded-xl border-2 border-primary/40"
            animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
        )}
        <span>{label}</span>
        {TrailingIcon && <TrailingIcon className="w-4 h-4" />}
      </motion.button>
    </motion.div>
  );
}
