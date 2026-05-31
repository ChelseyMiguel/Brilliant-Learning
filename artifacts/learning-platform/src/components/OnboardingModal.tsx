import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export type LearnerGoal = "explore" | "probability" | "cs" | "physics";
export type LearnerExperience = "beginner" | "some" | "comfortable";
export type LearnerTime = "light" | "medium" | "intensive";

export interface LearnerProfile {
  name?: string;
  goal: LearnerGoal;
  experience: LearnerExperience;
  timePerDay: LearnerTime;
  completedAt: string;
}

export const PROFILE_KEY = "lumina_learner_profile";

export function loadProfile(): LearnerProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: LearnerProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

// ── Step data ─────────────────────────────────────────────────────────────────

const GOALS: { value: LearnerGoal; label: string; sub: string; emoji: string }[] = [
  { value: "explore",     label: "Explore STEM",          sub: "Sample everything, stay curious",   emoji: "🔭" },
  { value: "probability", label: "Probability & Stats",    sub: "Understand data and chance",        emoji: "🎲" },
  { value: "cs",          label: "Computer Science",       sub: "Algorithms, logic, and systems",    emoji: "💻" },
  { value: "physics",     label: "Physics",                sub: "Forces, energy, and motion",        emoji: "⚡" },
];

const EXPERIENCES: { value: LearnerExperience; label: string; sub: string }[] = [
  { value: "beginner",    label: "Starting from scratch",  sub: "I haven't studied this formally"  },
  { value: "some",        label: "I know some basics",      sub: "A class or two, some self-study"  },
  { value: "comfortable", label: "Fairly comfortable",      sub: "I want to sharpen and go deeper"  },
];

const TIMES: { value: LearnerTime; label: string; sub: string }[] = [
  { value: "light",     label: "~5 min a day",   sub: "Quick lessons, steady progress" },
  { value: "medium",    label: "~20 min a day",  sub: "One lesson per session"         },
  { value: "intensive", label: "1 hour or more", sub: "Deep dives, multiple lessons"   },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onComplete: (profile: LearnerProfile) => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName]             = useState("");
  const [goal, setGoal]             = useState<LearnerGoal | null>(null);
  const [experience, setExperience] = useState<LearnerExperience | null>(null);
  const [timePerDay, setTimePerDay] = useState<LearnerTime | null>(null);

  // Step 0 (name) always allows advancing — name is optional
  const canAdvance = [true, !!goal, !!experience, !!timePerDay][step];

  const advance = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else if (goal && experience && timePerDay) {
      const profile: LearnerProfile = {
        name: name.trim() || "Learner",
        goal, experience, timePerDay,
        completedAt: new Date().toISOString(),
      };
      saveProfile(profile);
      onComplete(profile);
    }
  };

  const stepLabels = ["Your name", "Your goal", "Your background", "Your pace"];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-7 pb-0">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/lumina-logo.png" alt="Lumina" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-gray-900">Lumina Learning</span>
          </div>

          {/* Step dots */}
          <div className="flex gap-1.5 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-[#4f46e5]" : i < step ? "w-4 bg-indigo-200" : "w-4 bg-gray-100"
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Step {step + 1} of 4 · {stepLabels[step]}
          </p>
          <h2 className="text-xl font-black text-gray-900 mb-5">
            {step === 0 && "What should we call you?"}
            {step === 1 && "What do you want to learn?"}
            {step === 2 && "How much do you already know?"}
            {step === 3 && "How much time can you give it?"}
          </h2>
        </div>

        {/* Step content */}
        <div className="px-7 pb-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-2.5"
            >
              {step === 0 && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && advance()}
                  className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-100 focus:border-[#4f46e5] focus:outline-none text-gray-900 placeholder:text-gray-300 transition-all"
                />
              )}

              {step === 1 && GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    goal === g.value
                      ? "border-[#4f46e5] bg-indigo-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span className="text-2xl w-8 flex-shrink-0">{g.emoji}</span>
                  <div>
                    <p className={`font-bold text-sm ${goal === g.value ? "text-[#4f46e5]" : "text-gray-900"}`}>
                      {g.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{g.sub}</p>
                  </div>
                </button>
              ))}

              {step === 2 && EXPERIENCES.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setExperience(e.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    experience === e.value
                      ? "border-[#4f46e5] bg-indigo-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all ${
                    experience === e.value ? "border-[#4f46e5] bg-[#4f46e5]" : "border-gray-300"
                  }`} />
                  <div>
                    <p className={`font-bold text-sm ${experience === e.value ? "text-[#4f46e5]" : "text-gray-900"}`}>
                      {e.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{e.sub}</p>
                  </div>
                </button>
              ))}

              {step === 3 && TIMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTimePerDay(t.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    timePerDay === t.value
                      ? "border-[#4f46e5] bg-indigo-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all ${
                    timePerDay === t.value ? "border-[#4f46e5] bg-[#4f46e5]" : "border-gray-300"
                  }`} />
                  <div>
                    <p className={`font-bold text-sm ${timePerDay === t.value ? "text-[#4f46e5]" : "text-gray-900"}`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>

          <button
            onClick={advance}
            disabled={!canAdvance}
            className="mt-6 w-full h-12 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-30 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {step < 3 ? "Continue" : "Build my path"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
