/**
 * QuizBlock — "Check Your Understanding" section rendered at the bottom
 * of each resource article. Steps through questions one at a time with
 * instant ✅ / ❌ feedback and a short explanation.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Props {
  questions: QuizQuestion[];
}

export default function QuizBlock({ questions }: Props) {
  const [step, setStep]           = useState(0);          // which question we're on
  const [selected, setSelected]   = useState<number | null>(null);
  const [done, setDone]           = useState(false);
  const [correct, setCorrect]     = useState(0);          // running score

  const q = questions[step];

  function choose(i: number) {
    if (selected !== null) return;                         // already answered
    setSelected(i);
    if (i === q.correctIndex) setCorrect(c => c + 1);
  }

  function next() {
    if (step + 1 >= questions.length) {
      setDone(true);
    } else {
      setStep(s => s + 1);
      setSelected(null);
    }
  }

  if (done) {
    const allRight = correct === questions.length;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-5 text-center space-y-2"
        style={{
          background: allRight ? "hsl(143 76% 97%)" : "hsl(220 20% 97%)",
          borderColor: allRight ? "hsl(143 50% 80%)" : "hsl(220 15% 88%)",
        }}
      >
        <PartyPopper
          className="w-8 h-8 mx-auto"
          style={{ color: allRight ? "#16a34a" : "#6366f1" }}
        />
        <p className="font-semibold text-base">
          {allRight
            ? "Perfect — you nailed it! 🎉"
            : `${correct} / ${questions.length} correct — nice work!`}
        </p>
        <p className="text-xs text-muted-foreground">
          {allRight
            ? "All concepts confirmed. You're ready for the practice lesson."
            : "Review the highlighted sections above, then try the practice lesson."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Check your understanding
        </p>
        <span className="text-xs text-muted-foreground">
          {step + 1} / {questions.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              background: i < step
                ? "hsl(var(--primary))"
                : i === step
                  ? "hsl(var(--primary) / 0.4)"
                  : "hsl(var(--muted))",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* Question */}
          <p className="font-semibold text-sm leading-snug">{q.question}</p>

          {/* Options */}
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const answered  = selected !== null;
              const isCorrect = i === q.correctIndex;
              const isPicked  = i === selected;

              let bg = "bg-card hover:bg-muted/50";
              let border = "border-card-border";
              let icon = null;

              if (answered) {
                if (isCorrect) {
                  bg = "bg-emerald-50";
                  border = "border-emerald-300";
                  icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
                } else if (isPicked) {
                  bg = "bg-rose-50";
                  border = "border-rose-300";
                  icon = <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm transition-all ${bg} border-${border} ${
                    answered ? "cursor-default" : "cursor-pointer"
                  }`}
                  style={{
                    borderColor: answered && isCorrect
                      ? "#86efac"
                      : answered && isPicked && !isCorrect
                        ? "#fca5a5"
                        : undefined,
                    background: answered && isCorrect
                      ? "#f0fdf4"
                      : answered && isPicked && !isCorrect
                        ? "#fff1f2"
                        : undefined,
                  }}
                >
                  {icon ?? (
                    <span
                      className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: "hsl(var(--border))" }}
                    />
                  )}
                  <span className={answered && isCorrect ? "font-medium text-emerald-800" : ""}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation + Next */}
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div
                className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background:
                    selected === q.correctIndex
                      ? "hsl(143 76% 96%)"
                      : "hsl(0 86% 97%)",
                  color:
                    selected === q.correctIndex
                      ? "#166534"
                      : "#991b1b",
                }}
              >
                <span className="font-semibold mr-1">
                  {selected === q.correctIndex ? "Correct! " : "Not quite. "}
                </span>
                {q.explanation}
              </div>

              <Button
                size="sm"
                onClick={next}
                className="w-full gap-1.5 rounded-full"
              >
                {step + 1 < questions.length ? (
                  <>Next question <ChevronRight className="w-3.5 h-3.5" /></>
                ) : (
                  <>See results <ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
