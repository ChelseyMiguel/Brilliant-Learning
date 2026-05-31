/**
 * Formula sheets — one per course (indexed by course ID 1–7).
 * Courses without pure math get a "Key Rules" format instead.
 */

export interface FormulaBlock {
  label: string;
  formula: string;
  note?: string;
}

export interface FormulaSheet {
  courseId: number;
  courseTitle: string;
  sections: {
    heading: string;
    blocks: FormulaBlock[];
  }[];
}

export const FORMULA_SHEETS: Record<number, FormulaSheet> = {
  // ── Course 1: Foundations of Probability ───────────────────────────────────
  1: {
    courseId: 1,
    courseTitle: "Foundations of Probability",
    sections: [
      {
        heading: "Basic Probability",
        blocks: [
          { label: "Classical probability", formula: "P(A) = |A| / |S|", note: "Favorable outcomes ÷ total outcomes in sample space S" },
          { label: "Complement rule", formula: "P(A′) = 1 − P(A)", note: "Probability of the event NOT occurring" },
          { label: "Valid range", formula: "0 ≤ P(A) ≤ 1", note: "All probabilities live in [0, 1]" },
        ],
      },
      {
        heading: "Conditional Probability",
        blocks: [
          { label: "Conditional probability", formula: "P(A | B) = P(A ∩ B) / P(B)", note: "Probability of A given B has occurred" },
          { label: "Independence test", formula: "P(A | B) = P(A)  ↔  A ⊥ B", note: "B gives no information about A" },
          { label: "Multiplication rule (independent)", formula: "P(A ∩ B) = P(A) × P(B)", note: "Only valid when A and B are independent" },
        ],
      },
      {
        heading: "Law of Large Numbers",
        blocks: [
          { label: "LLN (informal)", formula: "x̄ₙ → μ  as  n → ∞", note: "Sample proportion converges to true probability" },
        ],
      },
    ],
  },

  // ── Course 2: Logic & Critical Thinking ────────────────────────────────────
  2: {
    courseId: 2,
    courseTitle: "Logic & Critical Thinking",
    sections: [
      {
        heading: "Logical Connectives",
        blocks: [
          { label: "Conjunction (AND)", formula: "P ∧ Q  — true iff both P and Q are true" },
          { label: "Disjunction (OR)", formula: "P ∨ Q  — true iff at least one is true" },
          { label: "Negation (NOT)", formula: "¬P  — flips truth value" },
          { label: "Implication", formula: "P → Q  — false only when P is true and Q is false" },
          { label: "Biconditional", formula: "P ↔ Q  — true iff P and Q have the same value" },
        ],
      },
      {
        heading: "Key Laws",
        blocks: [
          { label: "Double negation", formula: "¬(¬P) ≡ P" },
          { label: "De Morgan's (AND)", formula: "¬(P ∧ Q) ≡ ¬P ∨ ¬Q" },
          { label: "De Morgan's (OR)", formula: "¬(P ∨ Q) ≡ ¬P ∧ ¬Q" },
          { label: "Modus ponens", formula: "P, (P → Q) ⊢ Q", note: "Classic valid argument form" },
        ],
      },
      {
        heading: "Argument Quality",
        blocks: [
          { label: "Validity", formula: "True premises → must yield true conclusion" },
          { label: "Soundness", formula: "Valid + premises are actually true" },
        ],
      },
    ],
  },

  // ── Course 3: Computer Science Fundamentals ────────────────────────────────
  3: {
    courseId: 3,
    courseTitle: "CS Fundamentals",
    sections: [
      {
        heading: "Big-O Complexity",
        blocks: [
          { label: "Constant", formula: "O(1)", note: "Runtime independent of input size" },
          { label: "Logarithmic", formula: "O(log n)", note: "e.g. binary search — halves search space each step" },
          { label: "Linear", formula: "O(n)", note: "e.g. linear search" },
          { label: "Linearithmic", formula: "O(n log n)", note: "e.g. merge sort, heap sort" },
          { label: "Quadratic", formula: "O(n²)", note: "e.g. bubble sort, selection sort" },
        ],
      },
      {
        heading: "Search & Sort",
        blocks: [
          { label: "Binary search comparisons", formula: "⌈log₂ n⌉  comparisons (worst case)" },
          { label: "Merge sort runtime", formula: "O(n log n)" },
          { label: "Bubble sort runtime", formula: "O(n²)" },
        ],
      },
      {
        heading: "Recursion",
        blocks: [
          { label: "Factorial (recursive)", formula: "n! = n × (n−1)!,  base: 0! = 1" },
          { label: "Fibonacci (recursive)", formula: "F(n) = F(n−1) + F(n−2),  base: F(0)=0, F(1)=1" },
        ],
      },
    ],
  },

  // ── Course 4: Data Analysis Essentials ────────────────────────────────────
  4: {
    courseId: 4,
    courseTitle: "Data Analysis Essentials",
    sections: [
      {
        heading: "Measures of Center",
        blocks: [
          { label: "Mean", formula: "x̄ = (Σxᵢ) / n" },
          { label: "Median", formula: "Middle value of sorted data (resistant to outliers)" },
          { label: "Mode", formula: "Most frequently occurring value" },
        ],
      },
      {
        heading: "Measures of Spread",
        blocks: [
          { label: "Range", formula: "Range = max − min" },
          { label: "Variance", formula: "σ² = Σ(xᵢ − x̄)² / n" },
          { label: "Standard deviation", formula: "σ = √[ Σ(xᵢ − x̄)² / n ]" },
        ],
      },
      {
        heading: "Normal Distribution",
        blocks: [
          { label: "68-95-99.7 rule", formula: "±1σ → 68%  |  ±2σ → 95%  |  ±3σ → 99.7%" },
          { label: "Z-score", formula: "z = (x − μ) / σ", note: "Standard deviations from the mean" },
        ],
      },
      {
        heading: "Correlation",
        blocks: [
          { label: "Pearson's r", formula: "−1 ≤ r ≤ 1", note: "−1 perfect negative, 0 none, +1 perfect positive" },
        ],
      },
    ],
  },

  // ── Course 5: Geometry of Chance ──────────────────────────────────────────
  5: {
    courseId: 5,
    courseTitle: "The Geometry of Chance",
    sections: [
      {
        heading: "Geometric Probability",
        blocks: [
          { label: "Geometric probability", formula: "P = favorable area / total area" },
          { label: "Circle area", formula: "A = πr²" },
        ],
      },
      {
        heading: "Area Models",
        blocks: [
          { label: "Joint probability (independent)", formula: "P(A ∩ B) = P(A) × P(B)" },
          { label: "Union (general)", formula: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)" },
        ],
      },
      {
        heading: "Expected Value",
        blocks: [
          { label: "Expected value", formula: "E[X] = Σ xᵢ · P(xᵢ)", note: "Sum of (value × probability) for each outcome" },
          { label: "Expected profit", formula: "E[profit] = E[winnings] − cost" },
        ],
      },
      {
        heading: "Monty Hall",
        blocks: [
          { label: "Stay strategy", formula: "P(win | stay) = 1/3" },
          { label: "Switch strategy", formula: "P(win | switch) = 2/3" },
        ],
      },
    ],
  },

  // ── Course 6: Neural Networks from Scratch ────────────────────────────────
  6: {
    courseId: 6,
    courseTitle: "Neural Networks from Scratch",
    sections: [
      {
        heading: "Neuron",
        blocks: [
          { label: "Weighted sum", formula: "z = w₁x₁ + w₂x₂ + … + b", note: "b is the bias term" },
          { label: "Activation (ReLU)", formula: "ReLU(z) = max(0, z)" },
          { label: "Activation (sigmoid)", formula: "σ(z) = 1 / (1 + e^(−z))" },
        ],
      },
      {
        heading: "Training",
        blocks: [
          { label: "Loss (MSE)", formula: "L = (1/n) Σ (ŷᵢ − yᵢ)²" },
          { label: "Gradient descent update", formula: "w ← w − α · ∂L/∂w", note: "α is the learning rate" },
        ],
      },
      {
        heading: "Depth",
        blocks: [
          { label: "Key insight", formula: "linear ∘ linear = linear  →  need non-linear activations" },
        ],
      },
    ],
  },

  // ── Course 7: Physics of Motion ───────────────────────────────────────────
  7: {
    courseId: 7,
    courseTitle: "Physics of Motion",
    sections: [
      {
        heading: "Newton's Laws",
        blocks: [
          { label: "Second Law", formula: "F = ma  (N = kg·m/s²)" },
          { label: "Acceleration", formula: "a = F / m" },
        ],
      },
      {
        heading: "Springs (Hooke's Law)",
        blocks: [
          { label: "Restoring force", formula: "F = −kx", note: "Negative sign: force opposes displacement" },
          { label: "Elastic PE", formula: "PE = ½ k x²" },
          { label: "Period of oscillation", formula: "T = 2π √(m/k)", note: "Independent of amplitude" },
          { label: "Frequency", formula: "f = 1/T = (1/2π) √(k/m)" },
        ],
      },
      {
        heading: "Energy",
        blocks: [
          { label: "Kinetic energy", formula: "KE = ½ mv²" },
          { label: "Gravitational PE", formula: "PE = mgh" },
          { label: "Conservation (frictionless)", formula: "KE + PE = constant" },
        ],
      },
    ],
  },
};
