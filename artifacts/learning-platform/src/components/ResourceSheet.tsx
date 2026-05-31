import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, Clock, ArrowRight, Lightbulb, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import QuizBlock, { type QuizQuestion } from "@/components/resource/QuizBlock";
import InlineSim, { type SimType } from "@/components/resource/InlineSim";

// ── Data types ────────────────────────────────────────────────────────────────

export interface ResourceSection {
  heading: string;
  body: string;
  items?: string[];
  highlight?: string;
  /** Render an inline simulation widget below this section */
  simulation?: SimType;
}

export interface Resource {
  id: string;
  type: "Concept" | "Guide" | "Deep Dive" | "Tutorial";
  topic: string;
  title: string;
  description: string;
  readTime: string;
  sections: ResourceSection[];
  categories: string[];
  relatedLessonId?: number;
  /** Comprehension check questions shown after the article body */
  quiz?: QuizQuestion[];
}

// ── Resource content ──────────────────────────────────────────────────────────

export const LEARNING_RESOURCES: Resource[] = [
  // ── Probability ─────────────────────────────────────────────────────────────
  {
    id: "prob-basics",
    type: "Concept",
    topic: "Probability",
    title: "What Is Probability?",
    description: "A friendly introduction to measuring uncertainty - from coin flips to weather forecasts.",
    readTime: "4 min",
    categories: ["probability", "math"],
    relatedLessonId: 1,
    sections: [
      {
        heading: "Measuring the Uncertain",
        body: "Probability is a number between 0 and 1 that describes how likely an event is to occur. An impossible event has probability 0. A certain event has probability 1. Most interesting situations sit somewhere in between - and that's exactly where probability earns its keep.",
      },
      {
        heading: "The Sample Space",
        body: "Before calculating any probability, you need to define your sample space: the complete set of all possible outcomes. For a coin flip, the sample space is {Heads, Tails}. For a six-sided die, it's {1, 2, 3, 4, 5, 6}. The sample space is the universe your event lives in.",
        highlight: "P(event) = (number of favorable outcomes) ÷ (total outcomes in sample space)",
        simulation: "coin-proportion",
      },
      {
        heading: "Addition & Complement Rules",
        body: "Two useful shortcuts: if events can't happen at the same time (mutually exclusive), you can add their probabilities. And if you know P(A), you instantly know P(not A) = 1 − P(A). This complement rule is deceptively powerful - sometimes it's much easier to count what you don't want.",
      },
      {
        heading: "Why This Matters",
        body: "Probability underpins weather forecasting, medical diagnosis, financial risk models, and machine learning. Anywhere decisions must be made with incomplete information, probability gives us a precise language for reasoning clearly about uncertainty.",
        items: [
          "Weather: '70% chance of rain' means roughly 7 in 10 similar days had rain",
          "Medicine: screening test accuracy is described with sensitivity and specificity",
          "Finance: portfolio risk is quantified through probability distributions",
          "AI: language models assign probabilities to every possible next word",
        ],
      },
    ],
    quiz: [
      {
        question: "A fair six-sided die is rolled. What is the probability of rolling a number greater than 4?",
        options: ["1/6", "1/3", "1/2", "2/3"],
        correctIndex: 1,
        explanation: "Numbers greater than 4 on a die are 5 and 6 — that's 2 out of 6 possible outcomes, which simplifies to 1/3.",
      },
      {
        question: "If P(A) = 0.3, what is P(not A)?",
        options: ["0.3", "0.6", "0.7", "1.3"],
        correctIndex: 2,
        explanation: "The complement rule: P(not A) = 1 − P(A) = 1 − 0.3 = 0.7. The event and its complement always sum to 1.",
      },
      {
        question: "Which of these is the correct definition of a sample space?",
        options: [
          "The most likely outcome of an experiment",
          "The set of all possible outcomes",
          "The number of times an event occurs",
          "The probability of the most common outcome",
        ],
        correctIndex: 1,
        explanation: "The sample space is the complete set of all possible outcomes — the universe your event lives in. For a coin flip it's {H, T}; for a die it's {1, 2, 3, 4, 5, 6}.",
      },
    ],
  },
  {
    id: "conditional-prob",
    type: "Concept",
    topic: "Probability",
    title: "Conditional Probability & Bayes",
    description: "How does new information change the odds? This is the idea behind Bayes' theorem - and almost all of modern AI.",
    readTime: "6 min",
    categories: ["probability", "statistics"],
    relatedLessonId: 15,
    sections: [
      {
        heading: "Updating Your Beliefs",
        body: "Conditional probability answers the question: given that I already know B happened, how likely is A? Learning new information changes what's possible. If you know a card drawn from a standard deck is red, the probability it's a heart doubles from 1/4 to 1/2 - because half of all red cards are hearts.",
        highlight: "P(A | B) = P(A and B) ÷ P(B)   - read as \"probability of A given B\"",
      },
      {
        heading: "The Monty Hall Problem",
        body: "A contestant picks door #1. The host (who knows what's behind every door) opens door #3 to reveal a goat. Should the contestant switch to door #2? Conditional probability says yes - switching wins 2/3 of the time. The host's action carries information that updates the probabilities.",
      },
      {
        heading: "Bayes' Theorem",
        body: "Bayes' theorem flips conditional probability around. If you know P(B | A), it tells you how to compute P(A | B). Medical testing is the classic example: a positive result updates your prior probability of having a disease by the test's accuracy rates.",
        highlight: "P(A | B) = P(B | A) × P(A) ÷ P(B)",
      },
      {
        heading: "Bayes in the Real World",
        body: "Bayesian reasoning is foundational to spam filters, medical diagnosis, and the algorithms that power language models. The core idea is always the same: start with a prior belief, observe new evidence, and update your belief accordingly.",
        items: [
          "Spam filters: P(spam | contains 'free money') is computed via Bayes",
          "COVID tests: interpreting a positive result requires the base rate of infection",
          "Navigation systems: GPS combines noisy sensor readings using Bayesian filters",
        ],
      },
    ],
    quiz: [
      {
        question: "In the Monty Hall problem, what is the probability of winning if you always switch doors?",
        options: ["1/3", "1/2", "2/3", "3/4"],
        correctIndex: 2,
        explanation: "Your initial pick is wrong 2/3 of the time. When the host reveals a goat, switching gives you the car in those 2/3 of cases. Staying wins only when your initial pick was correct (1/3 of the time).",
      },
      {
        question: "P(A | B) reads as:",
        options: [
          "Probability of A and B happening together",
          "Probability of A given that B has occurred",
          "Probability of B given that A has occurred",
          "Probability of A divided by probability of B",
        ],
        correctIndex: 1,
        explanation: "The vertical bar | means 'given that.' P(A | B) is the probability of event A, given that we already know event B occurred.",
      },
      {
        question: "A test for a rare disease is 99% accurate. If only 1 in 1,000 people have the disease, a positive result is:",
        options: [
          "Almost certainly a true positive",
          "Likely a false positive",
          "Exactly 50/50",
          "Always conclusive",
        ],
        correctIndex: 1,
        explanation: "Even with 99% accuracy, the base rate matters. Out of 1,000 people, ~1 has the disease (true positive) but ~10 healthy people also test positive falsely. So most positives are false — this is Bayes' theorem in action.",
      },
    ],
  },
  {
    id: "expected-value",
    type: "Guide",
    topic: "Probability",
    title: "Expected Value: Making Better Decisions",
    description: "The single number that summarizes what to expect from any risky choice - and why intuition often gets it wrong.",
    readTime: "5 min",
    categories: ["probability", "statistics", "math"],
    relatedLessonId: 16,
    sections: [
      {
        heading: "What Is Expected Value?",
        body: "Expected value (EV) is the probability-weighted average of all possible outcomes. It answers: if you could repeat this decision thousands of times, what would you earn on average? It's not what will happen on any single trial - it's the long-run average.",
        highlight: "EV = Σ (probability of outcome × value of outcome)",
        simulation: "ev-calculator",
      },
      {
        heading: "A Simple Example",
        body: "A game costs $2 to play. You roll a die: if you roll a 6, you win $10; otherwise, nothing. EV = (1/6 × $10) + (5/6 × $0) = $1.67. Since $1.67 < $2, this is a losing game in the long run - even though you occasionally win $10.",
      },
      {
        heading: "The St. Petersburg Paradox",
        body: "A coin is flipped until it lands heads. You win $2^n where n is the number of flips. The expected value is infinite - yet most people would only pay a few dollars to play. This paradox shows EV alone doesn't capture everything; humans also care about variance and risk.",
      },
      {
        heading: "Where EV Guides Real Decisions",
        body: "EV is central to insurance pricing, poker strategy, investment analysis, and clinical trial design. Good decision-makers don't always maximize EV (risk tolerance matters), but they always calculate it first.",
        items: [
          "Insurance: charge premiums slightly above EV of claims",
          "Poker: call a bet when the pot odds exceed the probability of winning",
          "Business: rank projects by expected return on investment",
        ],
      },
    ],
    quiz: [
      {
        question: "A game costs $3 to play. You flip a coin: heads wins $8, tails wins nothing. What is the EV?",
        options: ["-$1", "+$1", "+$4", "+$8"],
        correctIndex: 1,
        explanation: "EV = (0.5 × $8) + (0.5 × $0) − $3 = $4 − $3 = +$1. A positive EV means this game is profitable in the long run.",
      },
      {
        question: "Why doesn't expected value fully capture a person's decision-making?",
        options: [
          "Because expected value can only be calculated for games",
          "Because people also care about variance, risk, and diminishing returns",
          "Because expected value is always incorrect",
          "Because people can't do the math",
        ],
        correctIndex: 1,
        explanation: "The St. Petersburg Paradox shows this: infinite EV but people won't pay much to play. Humans are risk-averse and weigh large losses more heavily than equivalent gains — EV alone misses that.",
      },
    ],
  },

  // ── Computer Science ─────────────────────────────────────────────────────────
  {
    id: "big-o",
    type: "Concept",
    topic: "Algorithms",
    title: "Big-O Notation Explained",
    description: "A way to describe how an algorithm's speed scales as input grows - the vocabulary every developer needs.",
    readTime: "5 min",
    categories: ["computer science", "algorithms"],
    relatedLessonId: 7,
    sections: [
      {
        heading: "Why Constant Time Isn't Enough",
        body: "An algorithm that takes 1 ms on 10 items might take 1 second on 10,000 items - or a century on a billion. Big-O notation captures this scaling behavior precisely, ignoring hardware differences and focusing purely on how work grows as the input size n grows.",
      },
      {
        heading: "The Most Common Classes",
        body: "From fastest to slowest scaling:",
        items: [
          "O(1) - Constant: looking up a value in a hash map",
          "O(log n) - Logarithmic: binary search halves the problem each step",
          "O(n) - Linear: scanning every item in a list",
          "O(n log n) - Linearithmic: efficient sorting (mergesort, quicksort)",
          "O(n²) - Quadratic: comparing every pair of items (nested loops)",
          "O(2ⁿ) - Exponential: exploring every subset (brute-force problems)",
        ],
        highlight: "Rule of thumb: if doubling n doubles your time, you're O(n). If it multiplies time by 4, you're O(n²).",
        simulation: "big-o-bars",
      },
      {
        heading: "Drop the Constants",
        body: "Big-O ignores constants and lower-order terms. O(3n + 100) and O(n) are the same class. Why? Because for large n, the linear term dominates everything else. Big-O is about long-term growth, not exact speed.",
      },
      {
        heading: "Practical Impact",
        body: "O(n²) sounds abstract until you try to sort a million records. Sorting with O(n²) is 1,000,000,000,000 operations vs 20,000,000 for O(n log n) - a 50,000x difference. Choosing the right algorithm frequently matters more than any hardware upgrade.",
      },
    ],
    quiz: [
      {
        question: "Binary search runs in O(log n). What does this mean if you double the input size?",
        options: [
          "The algorithm runs twice as fast",
          "The number of operations doubles",
          "The number of operations increases by just 1",
          "The algorithm becomes O(n)",
        ],
        correctIndex: 2,
        explanation: "O(log n) grows very slowly. Doubling n adds only one more step (log₂(2n) = log₂(n) + 1). That's why binary search on 1 billion items takes only ~30 steps.",
      },
      {
        question: "An algorithm has two nested loops, each iterating n times. What is its Big-O complexity?",
        options: ["O(n)", "O(2n)", "O(n²)", "O(n log n)"],
        correctIndex: 2,
        explanation: "Two nested loops each running n times means n × n = n² total operations. This is O(n²) — quadratic complexity.",
      },
      {
        question: "Which of the following Big-O classes scales best as n grows very large?",
        options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
        correctIndex: 3,
        explanation: "O(log n) is logarithmic — it grows the slowest of all these options. At n = 1,000,000, log₂(n) ≈ 20, while n = 1,000,000 and n² = 10¹².",
      },
    ],
  },
  {
    id: "recursion",
    type: "Guide",
    topic: "Computer Science",
    title: "Recursion: Thinking in Patterns",
    description: "Every recursive solution sees the same shape at every scale. Here's the mental model for making recursion click.",
    readTime: "6 min",
    categories: ["computer science", "algorithms"],
    relatedLessonId: 9,
    sections: [
      {
        heading: "The Core Idea",
        body: "A recursive function solves a problem by calling itself on a smaller version of the same problem. The trick is identifying: (1) the base case - a tiny input you can answer directly, and (2) the recursive case - how to reduce a bigger input to a smaller one.",
      },
      {
        heading: "The Call Stack",
        body: "When a function calls itself, the current call is paused and pushed onto a stack. When the base case is reached, calls begin returning and the stack unwinds. For factorial(5): calls go 5→4→3→2→1, then return values multiply back up: 1→1→2→6→24→120.",
        highlight: "factorial(n) = n × factorial(n − 1)   with base case: factorial(0) = 1",
      },
      {
        heading: "When to Use It",
        body: "Recursion shines for naturally self-similar structures: trees, graphs, fractals, and divide-and-conquer algorithms. If you can describe a problem as 'a small version of itself plus something extra,' recursion is likely a clean fit.",
      },
      {
        heading: "Common Pitfalls",
        body: "The most common mistake is forgetting the base case, causing infinite recursion and a stack overflow. The second is redundant work - computing fibonacci(40) recursively recalculates the same values billions of times. Memoization (caching results) fixes this.",
        items: [
          "Always define a base case that stops the recursion",
          "Ensure each recursive call moves closer to the base case",
          "Use memoization or dynamic programming for overlapping subproblems",
        ],
      },
    ],
    quiz: [
      {
        question: "What is the base case in a recursive function?",
        options: [
          "The first call to the function",
          "The condition that stops recursion and returns directly",
          "The largest input the function handles",
          "The function that calls itself",
        ],
        correctIndex: 1,
        explanation: "The base case is the stopping condition — a simple input that can be answered directly without another recursive call. Without it, the function would call itself forever (stack overflow).",
      },
      {
        question: "Why is naive recursive Fibonacci slow for large n?",
        options: [
          "It uses too much memory",
          "It repeatedly computes the same subproblems",
          "Recursion is always slow",
          "It doesn't have a base case",
        ],
        correctIndex: 1,
        explanation: "fib(40) recalculates fib(2) billions of times because each branch independently recomputes it. Memoization stores and reuses results, turning the exponential complexity into linear.",
      },
    ],
  },
  {
    id: "binary-search",
    type: "Tutorial",
    topic: "Algorithms",
    title: "Binary Search: Divide & Conquer",
    description: "Cut your search space in half with every step. One of the most elegant algorithms in all of computer science.",
    readTime: "4 min",
    categories: ["computer science", "algorithms"],
    relatedLessonId: 8,
    sections: [
      {
        heading: "The Linear Search Problem",
        body: "To find a name in a phone book by checking every entry from the beginning, you'd check up to 10 million entries. There's an obvious improvement: open to the middle, decide which half the name is in, and repeat. That's binary search.",
        highlight: "Each comparison eliminates half the remaining candidates - you need at most log₂(n) steps.",
      },
      {
        heading: "The Algorithm",
        body: "Given a sorted array and target value: (1) Look at the middle element. (2) If it's the target, done. (3) If target is smaller, search the left half. (4) If target is larger, search the right half. (5) Repeat until found or the range is empty.",
      },
      {
        heading: "Why Sorted Order Is Required",
        body: "Binary search depends on being able to say 'the target must be in this half.' That reasoning only works if the data is ordered. Applying binary search to unsorted data silently produces wrong answers.",
      },
      {
        heading: "Real-World Applications",
        body: "Binary search underlies database index lookups, git bisect (finding the commit that introduced a bug), and many standard library functions. Whenever you have a large sorted dataset and need fast lookups, binary search is the tool.",
        items: [
          "Database B-tree indexes use binary search at every level",
          "git bisect performs binary search over commit history",
          "std::lower_bound in C++ and bisect in Python implement it",
        ],
      },
    ],
    quiz: [
      {
        question: "How many steps does binary search need to find a value in a sorted array of 1,024 items?",
        options: ["At most 10", "At most 100", "At most 512", "Exactly 1,024"],
        correctIndex: 0,
        explanation: "log₂(1024) = 10. Binary search halves the remaining search space each step, so 1,024 → 512 → 256 → … → 1 takes at most 10 comparisons.",
      },
      {
        question: "Why does binary search require a sorted array?",
        options: [
          "It's faster to read sorted data from disk",
          "It needs to decide which half contains the target",
          "Sorted arrays use less memory",
          "It's a historical convention only",
        ],
        correctIndex: 1,
        explanation: "The core logic is: if the target < middle, it must be in the left half; if larger, in the right half. This only works if elements are in order — unsorted data breaks this reasoning.",
      },
    ],
  },

  // ── Physics ──────────────────────────────────────────────────────────────────
  {
    id: "energy-conservation",
    type: "Concept",
    topic: "Physics",
    title: "Conservation of Energy",
    description: "Energy can't be created or destroyed - only transformed. This single law explains everything from roller coasters to nuclear reactions.",
    readTime: "5 min",
    categories: ["physics"],
    relatedLessonId: 22,
    sections: [
      {
        heading: "The First Law of Thermodynamics",
        body: "The total energy in an isolated system never changes. Energy can move from kinetic to potential, from chemical to thermal, from electrical to light - but the total always stays the same. This is one of the most tested principles in all of physics.",
        highlight: "KE + PE = constant   (in a frictionless system)",
      },
      {
        heading: "Kinetic and Potential Energy",
        body: "Kinetic energy is the energy of motion: KE = ½mv². Potential energy is stored energy waiting to be released: gravitational PE = mgh (mass × g × height). As an object falls, PE converts to KE. At the bottom, all PE has become KE. At the top, all KE has become PE.",
      },
      {
        heading: "Where Does the Energy 'Go' in Real Life?",
        body: "Real systems lose energy to friction, air resistance, and heat - but the energy isn't destroyed. It converts to thermal energy (microscopic random motion of molecules). The total still balances; it's just spread out in a less useful form.",
      },
      {
        heading: "Applications Everywhere",
        body: "Energy conservation is why roller coasters need that first big drop, why regenerative braking works in electric cars, and why nuclear power can produce so much energy (E = mc² is just conservation of mass-energy).",
        items: [
          "Roller coasters: gravitational PE at the top becomes KE at the bottom",
          "Pendulums: KE and PE trade off continuously at fixed total",
          "Electric cars: braking converts KE back into electrical PE (battery charge)",
          "Springs: elastic PE → KE → elastic PE in an oscillating loop",
        ],
      },
    ],
    quiz: [
      {
        question: "A 2 kg ball is dropped from 5 m height. Which statement is true at the moment just before it hits the ground?",
        options: [
          "All energy is potential energy",
          "All energy is kinetic energy",
          "Energy is split 50/50",
          "All energy has been lost to friction",
        ],
        correctIndex: 1,
        explanation: "Just before impact, height = 0, so PE = mgh = 0. All the original PE (= mgh = 2 × 10 × 5 = 100 J) has converted to KE. In a frictionless system, KE + PE = constant throughout.",
      },
      {
        question: "When a pendulum swings, where does it move fastest?",
        options: [
          "At the highest point of its swing",
          "At the middle (lowest point) of its swing",
          "Halfway between top and middle",
          "It moves at constant speed throughout",
        ],
        correctIndex: 1,
        explanation: "At the highest point, the pendulum has maximum PE and zero KE (it momentarily stops). As it swings to the lowest point, all PE converts to KE — so it's moving fastest at the bottom.",
      },
    ],
  },
  {
    id: "newtons-laws",
    type: "Guide",
    topic: "Physics",
    title: "Newton's Three Laws",
    description: "Inertia, force, and equal-opposite reactions. These three laws define all of classical mechanics.",
    readTime: "4 min",
    categories: ["physics"],
    sections: [
      {
        heading: "First Law: Inertia",
        body: "An object at rest stays at rest; an object in motion stays in motion at the same speed and direction - unless acted on by a net external force. Objects don't stop by themselves. They keep going until something acts on them. Friction in everyday life hides this.",
        highlight: "Net force = 0 → constant velocity (including rest)",
      },
      {
        heading: "Second Law: F = ma",
        body: "Force equals mass times acceleration. More force → more acceleration. More mass → less acceleration for the same force. This is why it takes more effort to push a car than a bicycle, and why heavier objects fall at the same rate (gravity provides proportionally more force for more mass).",
        highlight: "F = ma   (force in Newtons, mass in kg, acceleration in m/s²)",
      },
      {
        heading: "Third Law: Action-Reaction",
        body: "For every force there's an equal and opposite force on a different object. You push down on the ground; the ground pushes up on you. A rocket expels gas downward; the gas pushes the rocket upward. These forces are always equal in magnitude, opposite in direction, and always on different objects.",
      },
      {
        heading: "Why Newton's Laws Matter",
        body: "Classical mechanics built on these three laws predicted planetary orbits, designed bridges and buildings, and guided spacecraft for centuries before quantum mechanics and general relativity revealed the edges of their validity.",
        items: [
          "Structural engineering: bridges stay up because forces balance",
          "Orbital mechanics: Newton predicted planetary motion precisely",
          "Rocketry: thrust (action) produces motion (reaction)",
        ],
      },
    ],
    quiz: [
      {
        question: "A 10 kg object has a net force of 30 N applied to it. What is its acceleration?",
        options: ["0.33 m/s²", "3 m/s²", "30 m/s²", "300 m/s²"],
        correctIndex: 1,
        explanation: "From Newton's second law: a = F/m = 30 N / 10 kg = 3 m/s².",
      },
      {
        question: "Why don't heavier objects fall faster than lighter ones (ignoring air resistance)?",
        options: [
          "Heavier objects have more gravity pulling them",
          "Gravity increases mass as objects accelerate",
          "Gravity exerts proportionally more force on more mass, keeping acceleration constant",
          "This is just an approximation — heavier objects do fall faster",
        ],
        correctIndex: 2,
        explanation: "F = ma and F_gravity = mg. So a = F/m = mg/m = g. The mass cancels — all objects fall at the same rate g ≈ 9.8 m/s² regardless of mass.",
      },
    ],
  },

  // ── Logic / Math ─────────────────────────────────────────────────────────────
  {
    id: "boolean-logic",
    type: "Concept",
    topic: "Logic",
    title: "Boolean Logic: The Language of Computers",
    description: "Everything a computer computes reduces to AND, OR, and NOT. Here's how three simple operators build all of digital logic.",
    readTime: "4 min",
    categories: ["computer science", "math"],
    relatedLessonId: 5,
    sections: [
      {
        heading: "True, False, and Three Operators",
        body: "Boolean logic uses two values - True and False - and three fundamental operations. AND requires both inputs to be true. OR requires at least one input to be true. NOT inverts the value. Every logic gate in every computer chip is built from these.",
      },
      {
        heading: "Truth Tables",
        body: "A truth table lists every possible combination of inputs and the resulting output. AND: True only when both inputs are True. OR: False only when both inputs are False. NOT: always the opposite.",
        items: [
          "AND: T∧T=T, T∧F=F, F∧T=F, F∧F=F",
          "OR:  T∨T=T, T∨F=T, F∨T=T, F∨F=F",
          "NOT: ¬T=F, ¬F=T",
        ],
        highlight: "Any logical expression, however complex, can be built from AND, OR, and NOT.",
        simulation: "truth-toggle",
      },
      {
        heading: "De Morgan's Laws",
        body: "Two important equivalences: NOT(A AND B) equals (NOT A) OR (NOT B). NOT(A OR B) equals (NOT A) AND (NOT B). These laws let you rewrite expressions in simpler forms - they come up constantly in programming and circuit design.",
      },
      {
        heading: "From Logic to Circuits",
        body: "Digital circuits implement AND, OR, NOT as physical gates using transistors. Modern CPUs contain billions of these gates. Every if-statement in your code, every database query with WHERE conditions, every search filter relies on Boolean logic operating billions of times per second.",
      },
    ],
    quiz: [
      {
        question: "What is the result of TRUE AND FALSE?",
        options: ["TRUE", "FALSE", "Undefined", "TRUE if repeated"],
        correctIndex: 1,
        explanation: "AND requires BOTH inputs to be True. Since one input is False, the result is False.",
      },
      {
        question: "According to De Morgan's Law, NOT(A OR B) equals:",
        options: [
          "(NOT A) OR (NOT B)",
          "(NOT A) AND (NOT B)",
          "A AND B",
          "NOT A OR B",
        ],
        correctIndex: 1,
        explanation: "De Morgan's second law: NOT(A OR B) = (NOT A) AND (NOT B). This lets you 'push' the NOT inside and flip the operator.",
      },
      {
        question: "Which Boolean expression is True when P = False, Q = True?",
        options: ["P AND Q", "NOT P AND NOT Q", "NOT P AND Q", "P OR NOT Q"],
        correctIndex: 2,
        explanation: "NOT P = True (since P is False), Q = True. So NOT P AND Q = True AND True = True.",
      },
    ],
  },

  // ── Statistics ────────────────────────────────────────────────────────────────
  {
    id: "distributions",
    type: "Deep Dive",
    topic: "Statistics",
    title: "Probability Distributions",
    description: "From bell curves to Poisson counts - distributions describe the shape of randomness itself.",
    readTime: "6 min",
    categories: ["statistics", "probability", "math"],
    relatedLessonId: 11,
    sections: [
      {
        heading: "What Is a Distribution?",
        body: "A probability distribution assigns a probability (or probability density) to each possible value a random variable can take. It's the complete description of a random quantity - not just the average, but the full picture of what values are likely and how spread out they are.",
      },
      {
        heading: "The Normal Distribution",
        body: "The bell curve appears everywhere: heights, test scores, measurement errors. This comes from the Central Limit Theorem - averages of many independent random variables converge to a normal distribution, regardless of each variable's original shape.",
        highlight: "~68% of values fall within 1 standard deviation of the mean; ~95% within 2σ; ~99.7% within 3σ",
        simulation: "normal-68",
      },
      {
        heading: "Discrete vs Continuous",
        body: "Discrete distributions describe countable outcomes (number of emails per hour, number of heads in 10 flips). Continuous distributions describe outcomes that can take any value in a range (heights, temperatures, times). The Poisson distribution models rare count events; the Exponential distribution models waiting times.",
      },
      {
        heading: "Why Distributions Matter",
        body: "Knowing a distribution lets you calculate exact probabilities, set confidence intervals, detect outliers, and simulate realistic data. A/B testing, quality control, risk modeling, and scientific experiments all depend on choosing the right distribution for the data.",
        items: [
          "Normal: exam scores, heights, measurement noise",
          "Binomial: number of successes in n independent yes/no trials",
          "Poisson: number of events in a fixed time interval (calls to a call center)",
          "Exponential: time between events in a Poisson process",
        ],
      },
    ],
    quiz: [
      {
        question: "In a normal distribution with mean 100 and standard deviation 15, approximately what percentage of values fall between 85 and 115?",
        options: ["50%", "68%", "95%", "99.7%"],
        correctIndex: 1,
        explanation: "85 to 115 is exactly ±1 standard deviation from the mean (100 ± 15). The 68-95-99.7 rule tells us ~68% of values fall within ±1σ.",
      },
      {
        question: "Which distribution would best model the number of customer calls received per hour?",
        options: ["Normal", "Binomial", "Poisson", "Exponential"],
        correctIndex: 2,
        explanation: "The Poisson distribution models count events occurring in a fixed interval of time — like calls per hour, emails per day, or typos per page. It's designed exactly for this use case.",
      },
      {
        question: "The Central Limit Theorem says that averages of large samples:",
        options: [
          "Always follow the same distribution as the original data",
          "Are always exactly equal to the population mean",
          "Converge to a normal distribution regardless of the original distribution",
          "Have infinite variance",
        ],
        correctIndex: 2,
        explanation: "This is the power of the CLT: no matter how skewed or unusual the original distribution, the distribution of sample means approaches a normal (bell curve) as sample size grows.",
      },
    ],
  },
];

// ── Category filter helper ────────────────────────────────────────────────────

export function getResourcesForGoal(goal: string): Resource[] {
  const goalToCategories: Record<string, string[]> = {
    probability: ["probability", "statistics", "math"],
    cs:          ["computer science", "algorithms"],
    physics:     ["physics"],
    explore:     [],
  };
  const cats = goalToCategories[goal] ?? [];
  if (cats.length === 0) return LEARNING_RESOURCES;
  return LEARNING_RESOURCES.filter((r) =>
    r.categories.some((c) => cats.includes(c))
  );
}

// ── Type badge colors ─────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Concept:    "bg-violet-50 text-violet-700 border border-violet-100",
  Guide:      "bg-blue-50 text-blue-700 border border-blue-100",
  "Deep Dive":"bg-amber-50 text-amber-700 border border-amber-100",
  Tutorial:   "bg-emerald-50 text-emerald-700 border border-emerald-100",
};

// ── Resource card ─────────────────────────────────────────────────────────────

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
  delay?: number;
}

export function ResourceCard({ resource, onClick, delay = 0 }: ResourceCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="text-left w-full bg-card border border-card-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-sm transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[resource.type] ?? "bg-gray-100 text-gray-600"}`}>
          {resource.type}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
          <Clock className="w-3 h-3" />
          {resource.readTime}
        </span>
      </div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {resource.topic}
      </p>
      <h3 className="font-semibold text-sm leading-snug mb-1.5 group-hover:text-primary transition-colors">
        {resource.title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {resource.description}
      </p>
      {resource.quiz && (
        <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-primary/70">
          <span>✦</span>
          <span>{resource.quiz.length} check question{resource.quiz.length !== 1 ? "s" : ""}</span>
        </div>
      )}
      <div className="flex items-center gap-1 mt-2.5 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Read <ChevronRight className="w-3 h-3" />
      </div>
    </motion.button>
  );
}

// ── Article reader sheet ──────────────────────────────────────────────────────

interface ResourceSheetProps {
  resource: Resource | null;
  open: boolean;
  onClose: () => void;
}

export function ResourceSheet({ resource, open, onClose }: ResourceSheetProps) {
  if (!resource) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg xl:max-w-xl p-0 flex flex-col overflow-hidden"
      >
        {/* Visually hidden title for accessibility */}
        <SheetTitle className="sr-only">{resource.title}</SheetTitle>
        <SheetDescription className="sr-only">{resource.description}</SheetDescription>

        {/* Article header */}
        <div className="px-6 pt-8 pb-5 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${TYPE_COLORS[resource.type] ?? "bg-gray-100 text-gray-600"}`}>
              {resource.type}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-muted-foreground">{resource.topic}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> {resource.readTime} read
            </span>
          </div>
          <SheetHeader className="space-y-0">
            <h2 className="text-xl font-bold leading-snug text-foreground">{resource.title}</h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{resource.description}</p>
          </SheetHeader>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
          {resource.sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="space-y-2.5"
            >
              <h3 className="font-semibold text-base text-foreground">{section.heading}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{section.body}</p>
              {section.items && (
                <ul className="space-y-1.5 mt-1">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.highlight && (
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-xl p-3.5 mt-1">
                  <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-mono font-medium text-primary leading-relaxed">
                    {section.highlight}
                  </p>
                </div>
              )}
              {/* Inline simulation widget */}
              {section.simulation && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 + 0.15 }}
                >
                  <InlineSim type={section.simulation} />
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Quiz section */}
          {resource.quiz && resource.quiz.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: resource.sections.length * 0.06 + 0.2 }}
              className="pt-2 border-t border-border/60 space-y-4"
            >
              <QuizBlock questions={resource.quiz} />
            </motion.div>
          )}
        </div>

        {/* Footer CTA */}
        {resource.relatedLessonId && (
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <Link href={`/lessons/${resource.relatedLessonId}`} onClick={onClose}>
              <Button size="lg" className="w-full gap-2 rounded-full">
                <BookOpen className="w-4 h-4" />
                Practice this topic
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
