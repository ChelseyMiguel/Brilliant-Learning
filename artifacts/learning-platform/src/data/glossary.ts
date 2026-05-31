/**
 * Glossary data — ~50 key terms drawn from all 7 courses.
 * Each term has a one-sentence definition, the lesson ID where it's
 * introduced, and the lesson/course titles for display.
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
  lessonId: number;
  lessonTitle: string;
  courseTitle: string;
  courseId: number;
}

export const GLOSSARY: GlossaryTerm[] = [
  // ── Probability ────────────────────────────────────────────────────────────
  {
    term: "Algorithm",
    definition: "A finite, step-by-step procedure that solves a well-defined computational problem.",
    lessonId: 7, lessonTitle: "Algorithms and Efficiency", courseId: 3, courseTitle: "CS Fundamentals",
  },
  {
    term: "AND (conjunction)",
    definition: "A logical connective that is true only when both of its operands are true.",
    lessonId: 5, lessonTitle: "Logical Connectives", courseId: 2, courseTitle: "Logic & Critical Thinking",
  },
  {
    term: "Argument (logic)",
    definition: "A set of premises offered in support of a conclusion.",
    lessonId: 6, lessonTitle: "Arguments and Validity", courseId: 2, courseTitle: "Logic & Critical Thinking",
  },
  {
    term: "Area model",
    definition: "A visual tool that represents joint probability as the overlap of two rectangles on a grid.",
    lessonId: 14, lessonTitle: "Area Models of Probability", courseId: 5, courseTitle: "Geometry of Chance",
  },
  {
    term: "Backpropagation",
    definition: "An algorithm that computes how much each weight in a neural network contributed to the prediction error, using the chain rule.",
    lessonId: 18, lessonTitle: "The Learning Signal", courseId: 6, courseTitle: "Neural Networks",
  },
  {
    term: "Base case",
    definition: "The terminating condition in a recursive function that stops further recursive calls.",
    lessonId: 9, lessonTitle: "Recursion", courseId: 3, courseTitle: "CS Fundamentals",
  },
  {
    term: "Binary search",
    definition: "A search algorithm that halves the search space at each step, requiring sorted input; runs in O(log n).",
    lessonId: 8, lessonTitle: "Searching and Sorting", courseId: 3, courseTitle: "CS Fundamentals",
  },
  {
    term: "Big-O notation",
    definition: "A mathematical notation describing the upper-bound growth rate of an algorithm's runtime as input size increases.",
    lessonId: 7, lessonTitle: "Algorithms and Efficiency", courseId: 3, courseTitle: "CS Fundamentals",
  },
  {
    term: "Causation",
    definition: "A relationship where one variable directly produces a change in another, established only through controlled experiments.",
    lessonId: 12, lessonTitle: "Correlation vs Causation", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
  {
    term: "Conditional probability",
    definition: "The probability of event A given that event B has already occurred, written P(A|B) = P(A∩B) / P(B).",
    lessonId: 3, lessonTitle: "Conditional Probability", courseId: 1, courseTitle: "Foundations of Probability",
  },
  {
    term: "Correlation",
    definition: "A statistical measure of the strength and direction of the linear relationship between two variables, ranging from -1 to 1.",
    lessonId: 12, lessonTitle: "Correlation vs Causation", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
  {
    term: "Distribution",
    definition: "A function that describes all possible values a random variable can take and how likely each value is.",
    lessonId: 11, lessonTitle: "Distributions", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
  {
    term: "Energy conservation",
    definition: "The principle that total mechanical energy (kinetic + potential) remains constant in a frictionless system.",
    lessonId: 22, lessonTitle: "Energy Conservation", courseId: 7, courseTitle: "Physics of Motion",
  },
  {
    term: "Expected value",
    definition: "The long-run average outcome of a random variable, calculated as Σ(value × probability) across all outcomes.",
    lessonId: 16, lessonTitle: "Expected Value", courseId: 5, courseTitle: "Geometry of Chance",
  },
  {
    term: "Factorial",
    definition: "The product of all positive integers up to n, written n! — e.g. 5! = 5×4×3×2×1 = 120.",
    lessonId: 9, lessonTitle: "Recursion", courseId: 3, courseTitle: "CS Fundamentals",
  },
  {
    term: "Force",
    definition: "An interaction that changes the motion of an object; measured in Newtons (N = kg·m/s²).",
    lessonId: 20, lessonTitle: "Forces and Acceleration", courseId: 7, courseTitle: "Physics of Motion",
  },
  {
    term: "Gambler's Fallacy",
    definition: "The mistaken belief that past independent random outcomes influence future ones (e.g., expecting tails after a streak of heads).",
    lessonId: 2, lessonTitle: "Gambler's Fallacy", courseId: 1, courseTitle: "Foundations of Probability",
  },
  {
    term: "Geometric probability",
    definition: "A method that calculates probability as a ratio of favorable area (or length) to total area in a continuous sample space.",
    lessonId: 13, lessonTitle: "Geometric Probability", courseId: 5, courseTitle: "Geometry of Chance",
  },
  {
    term: "Gradient descent",
    definition: "An optimization algorithm that iteratively adjusts weights in the direction of steepest loss decrease.",
    lessonId: 18, lessonTitle: "The Learning Signal", courseId: 6, courseTitle: "Neural Networks",
  },
  {
    term: "Hooke's Law",
    definition: "The restoring force of a spring is proportional and opposite to its displacement: F = -kx.",
    lessonId: 21, lessonTitle: "Springs and Oscillation", courseId: 7, courseTitle: "Physics of Motion",
  },
  {
    term: "Independence",
    definition: "Two events are independent when knowing one gives no information about the other: P(A|B) = P(A).",
    lessonId: 1, lessonTitle: "What is Probability?", courseId: 1, courseTitle: "Foundations of Probability",
  },
  {
    term: "Kinetic energy",
    definition: "The energy an object possesses due to its motion: KE = ½mv².",
    lessonId: 22, lessonTitle: "Energy Conservation", courseId: 7, courseTitle: "Physics of Motion",
  },
  {
    term: "Law of Large Numbers",
    definition: "As the number of trials grows, the sample proportion converges to the true probability.",
    lessonId: 2, lessonTitle: "Gambler's Fallacy", courseId: 1, courseTitle: "Foundations of Probability",
  },
  {
    term: "Learning rate",
    definition: "A hyperparameter controlling the step size of each weight update in gradient descent; too large overshoots, too small is slow.",
    lessonId: 18, lessonTitle: "The Learning Signal", courseId: 6, courseTitle: "Neural Networks",
  },
  {
    term: "Mean",
    definition: "The arithmetic average of a dataset: sum of all values divided by the count.",
    lessonId: 10, lessonTitle: "Descriptive Statistics", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
  {
    term: "Median",
    definition: "The middle value of a sorted dataset; resistant to outliers unlike the mean.",
    lessonId: 10, lessonTitle: "Descriptive Statistics", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
  {
    term: "Mode",
    definition: "The most frequently occurring value in a dataset.",
    lessonId: 10, lessonTitle: "Descriptive Statistics", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
  {
    term: "Monty Hall Problem",
    definition: "A probability puzzle where switching doors after a goat is revealed wins 2/3 of the time, not 1/2.",
    lessonId: 15, lessonTitle: "The Monty Hall Problem", courseId: 5, courseTitle: "Geometry of Chance",
  },
  {
    term: "Newton's Second Law",
    definition: "The net force on an object equals its mass times acceleration: F = ma.",
    lessonId: 20, lessonTitle: "Forces and Acceleration", courseId: 7, courseTitle: "Physics of Motion",
  },
  {
    term: "Normal distribution",
    definition: "A symmetric, bell-shaped probability distribution fully described by its mean and standard deviation.",
    lessonId: 11, lessonTitle: "Distributions", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
  {
    term: "NOT (negation)",
    definition: "A logical operator that flips a proposition's truth value: NOT True = False and vice versa.",
    lessonId: 5, lessonTitle: "Logical Connectives", courseId: 2, courseTitle: "Logic & Critical Thinking",
  },
  {
    term: "O(log n)",
    definition: "Logarithmic time complexity — the algorithm's runtime grows by one step each time the input doubles (e.g. binary search).",
    lessonId: 7, lessonTitle: "Algorithms and Efficiency", courseId: 3, courseTitle: "CS Fundamentals",
  },
  {
    term: "O(n)",
    definition: "Linear time complexity — runtime grows proportionally with input size.",
    lessonId: 7, lessonTitle: "Algorithms and Efficiency", courseId: 3, courseTitle: "CS Fundamentals",
  },
  {
    term: "O(n²)",
    definition: "Quadratic time complexity — runtime scales with the square of input size (e.g. bubble sort).",
    lessonId: 7, lessonTitle: "Algorithms and Efficiency", courseId: 3, courseTitle: "CS Fundamentals",
  },
  {
    term: "OR (disjunction)",
    definition: "A logical connective that is true when at least one of its operands is true.",
    lessonId: 5, lessonTitle: "Logical Connectives", courseId: 2, courseTitle: "Logic & Critical Thinking",
  },
  {
    term: "Oscillation",
    definition: "Repetitive back-and-forth motion around an equilibrium point, as in a spring-mass system.",
    lessonId: 21, lessonTitle: "Springs and Oscillation", courseId: 7, courseTitle: "Physics of Motion",
  },
  {
    term: "Potential energy",
    definition: "Stored energy due to position or configuration; for a spring: PE = ½kx².",
    lessonId: 22, lessonTitle: "Energy Conservation", courseId: 7, courseTitle: "Physics of Motion",
  },
  {
    term: "Probability",
    definition: "A number between 0 and 1 expressing how likely an event is: P = favorable outcomes / total outcomes.",
    lessonId: 1, lessonTitle: "What is Probability?", courseId: 1, courseTitle: "Foundations of Probability",
  },
  {
    term: "Proposition",
    definition: "A declarative statement that has a definite truth value (true or false), but not both.",
    lessonId: 4, lessonTitle: "Propositions and Truth", courseId: 2, courseTitle: "Logic & Critical Thinking",
  },
  {
    term: "Recursion",
    definition: "A programming technique where a function calls itself with a smaller subproblem until a base case is reached.",
    lessonId: 9, lessonTitle: "Recursion", courseId: 3, courseTitle: "CS Fundamentals",
  },
  {
    term: "ReLU",
    definition: "Rectified Linear Unit — an activation function that outputs max(0, x), introducing non-linearity without vanishing gradients.",
    lessonId: 19, lessonTitle: "Layers and Depth", courseId: 6, courseTitle: "Neural Networks",
  },
  {
    term: "Sample space",
    definition: "The set of all possible outcomes of a random experiment.",
    lessonId: 1, lessonTitle: "What is Probability?", courseId: 1, courseTitle: "Foundations of Probability",
  },
  {
    term: "Simple harmonic motion",
    definition: "Oscillation where the restoring force is proportional to displacement, producing sinusoidal motion with period T = 2π√(m/k).",
    lessonId: 21, lessonTitle: "Springs and Oscillation", courseId: 7, courseTitle: "Physics of Motion",
  },
  {
    term: "Skewness",
    definition: "A measure of asymmetry in a distribution; right-skewed means a long tail extends to the right.",
    lessonId: 11, lessonTitle: "Distributions", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
  {
    term: "Soundness",
    definition: "An argument is sound when it is both valid and has true premises, guaranteeing a true conclusion.",
    lessonId: 6, lessonTitle: "Arguments and Validity", courseId: 2, courseTitle: "Logic & Critical Thinking",
  },
  {
    term: "Standard deviation",
    definition: "A measure of the spread of a dataset; the average distance of each data point from the mean.",
    lessonId: 10, lessonTitle: "Descriptive Statistics", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
  {
    term: "Truth table",
    definition: "A table listing all possible truth value combinations for a logical expression and its resulting value.",
    lessonId: 5, lessonTitle: "Logical Connectives", courseId: 2, courseTitle: "Logic & Critical Thinking",
  },
  {
    term: "Validity (logic)",
    definition: "An argument is valid when its conclusion must follow if all premises are assumed to be true.",
    lessonId: 6, lessonTitle: "Arguments and Validity", courseId: 2, courseTitle: "Logic & Critical Thinking",
  },
  {
    term: "Weight (neural net)",
    definition: "A learnable parameter that scales an input signal entering a neuron, controlling its influence on the output.",
    lessonId: 17, lessonTitle: "Neurons and Weights", courseId: 6, courseTitle: "Neural Networks",
  },
  {
    term: "68-95-99.7 Rule",
    definition: "In a normal distribution, ~68% of data falls within 1σ of the mean, ~95% within 2σ, and ~99.7% within 3σ.",
    lessonId: 11, lessonTitle: "Distributions", courseId: 4, courseTitle: "Data Analysis Essentials",
  },
].sort((a, b) => a.term.localeCompare(b.term));
