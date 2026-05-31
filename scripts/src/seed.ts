import {
  db,
  pool,
  coursesTable,
  lessonsTable,
  challengesTable,
  userProfilesTable,
  userProgressTable,
  challengeAttemptsTable,
} from "@workspace/db";

// Convert plain string options to {id, text, isCorrect}[] that the lesson player expects
function mc(opts: string[], correct: string) {
  return opts.map((text, i) => ({
    id: String.fromCharCode(97 + i), // "a", "b", "c", "d"
    text,
    isCorrect: text === correct,
  }));
}

async function seed() {
  console.log("Seeding database...");

  // Clear existing data (order matters — delete child tables before parents)
  await db.delete(challengeAttemptsTable);
  await db.delete(userProgressTable);
  await db.delete(challengesTable);
  await db.delete(userProfilesTable);
  await db.delete(lessonsTable);
  await db.delete(coursesTable);

  // Reset sequences so IDs match animation/lab registries
  await pool.query(`
    ALTER SEQUENCE courses_id_seq RESTART WITH 1;
    ALTER SEQUENCE lessons_id_seq RESTART WITH 1;
    ALTER SEQUENCE challenges_id_seq RESTART WITH 1;
  `);

  // ── Courses ──────────────────────────────────────────────────────────────
  const courses = await db.insert(coursesTable).values([
    { title: "Foundations of Probability", description: "Build intuition for chance, randomness, and the rules that govern uncertain events.", category: "Math", difficulty: "beginner", lessonCount: 3, totalXp: 120, iconColor: "#4F46E5" },
    { title: "Logic & Critical Thinking", description: "Sharpen your reasoning skills with formal logic, truth tables, and argument analysis.", category: "Math", difficulty: "beginner", lessonCount: 3, totalXp: 120, iconColor: "#7C3AED" },
    { title: "Computer Science Fundamentals", description: "Explore algorithms, data structures, and the ideas that power modern computing.", category: "Computer Science", difficulty: "beginner", lessonCount: 3, totalXp: 120, iconColor: "#0EA5E9" },
    { title: "Data Analysis Essentials", description: "Learn to summarize, visualize, and draw conclusions from real-world datasets.", category: "Data Analysis", difficulty: "intermediate", lessonCount: 3, totalXp: 150, iconColor: "#10B981" },
    { title: "The Geometry of Chance", description: "Visualize probability as area, tackle the Monty Hall problem, and master expected value.", category: "Math", difficulty: "intermediate", lessonCount: 4, totalXp: 160, iconColor: "#F59E0B" },
    { title: "Neural Networks from Scratch", description: "Build a neural network from neurons up — weights, backprop, layers, and all.", category: "Computer Science", difficulty: "intermediate", lessonCount: 3, totalXp: 150, iconColor: "#EF4444" },
    { title: "Physics of Motion", description: "Explore forces, springs, and energy conservation through interactive simulations.", category: "Physics", difficulty: "beginner", lessonCount: 3, totalXp: 120, iconColor: "#8B5CF6" },
  ]).returning();

  const [c1, c2, c3, c4, c5, c6, c7] = courses;

  // ── Lessons ───────────────────────────────────────────────────────────────
  // IDs must match animation/lab registries:
  //   Animations: 1,2 (coin) | 14 (grid) | 15 (monty) | 17,18,19 (neural) | 21,22 (spring)
  //   Labs:       2 (coin)   | 14 (area)  | 17,18 (neural) | 20 (pulley) | 21 (spring)
  const lessons = await db.insert(lessonsTable).values([
    // Course 1 — lessons 1–3
    { courseId: c1.id, title: "What is Probability?", description: "Outcomes, sample spaces, and the language of chance.", order: 1, xpReward: 40, challengeCount: 3 },
    { courseId: c1.id, title: "Gambler's Fallacy", description: "Why streaks don't change the odds — and the Law of Large Numbers.", order: 2, xpReward: 40, challengeCount: 3 },
    { courseId: c1.id, title: "Conditional Probability", description: "How new information updates the probability of an event.", order: 3, xpReward: 40, challengeCount: 3 },
    // Course 2 — lessons 4–6
    { courseId: c2.id, title: "Propositions and Truth", description: "Statements, truth values, and how logic builds from atomic facts.", order: 1, xpReward: 40, challengeCount: 3 },
    { courseId: c2.id, title: "Logical Connectives", description: "AND, OR, NOT, and the truth tables that define them.", order: 2, xpReward: 40, challengeCount: 3 },
    { courseId: c2.id, title: "Arguments and Validity", description: "What makes an argument valid — and what makes it just convincing.", order: 3, xpReward: 40, challengeCount: 3 },
    // Course 3 — lessons 7–9
    { courseId: c3.id, title: "Algorithms and Efficiency", description: "What an algorithm is, and how to measure how fast it runs.", order: 1, xpReward: 40, challengeCount: 3 },
    { courseId: c3.id, title: "Searching and Sorting", description: "Binary search and why sorted data is fundamentally different.", order: 2, xpReward: 40, challengeCount: 3 },
    { courseId: c3.id, title: "Recursion", description: "Functions that call themselves — and why they're surprisingly powerful.", order: 3, xpReward: 40, challengeCount: 3 },
    // Course 4 — lessons 10–12
    { courseId: c4.id, title: "Descriptive Statistics", description: "Summarize a dataset with mean, median, mode, and spread.", order: 1, xpReward: 50, challengeCount: 3 },
    { courseId: c4.id, title: "Distributions", description: "Normal, skewed, and why shape matters as much as the average.", order: 2, xpReward: 50, challengeCount: 3 },
    { courseId: c4.id, title: "Correlation vs Causation", description: "When two things move together — and when one causes the other.", order: 3, xpReward: 50, challengeCount: 3 },
    // Course 5 — lessons 13–16
    { courseId: c5.id, title: "Geometric Probability", description: "Use areas and lengths to calculate the likelihood of random events.", order: 1, xpReward: 40, challengeCount: 3 },
    { courseId: c5.id, title: "Area Models of Probability", description: "Visualize joint probability as overlapping rectangles on a grid.", order: 2, xpReward: 40, challengeCount: 3 },
    { courseId: c5.id, title: "The Monty Hall Problem", description: "Should you switch doors? The answer surprises almost everyone.", order: 3, xpReward: 40, challengeCount: 3 },
    { courseId: c5.id, title: "Expected Value", description: "The long-run average outcome — and how to calculate it.", order: 4, xpReward: 40, challengeCount: 3 },
    // Course 6 — lessons 17–19
    { courseId: c6.id, title: "Neurons and Weights", description: "How artificial neurons fire, and what weights actually control.", order: 1, xpReward: 50, challengeCount: 3 },
    { courseId: c6.id, title: "The Learning Signal", description: "Error, gradients, and how backpropagation adjusts the weights.", order: 2, xpReward: 50, challengeCount: 3 },
    { courseId: c6.id, title: "Layers and Depth", description: "Why stacking layers lets networks learn complex patterns.", order: 3, xpReward: 50, challengeCount: 3 },
    // Course 7 — lessons 20–22
    { courseId: c7.id, title: "Forces and Acceleration", description: "Newton's second law — and how pulleys redirect force.", order: 1, xpReward: 40, challengeCount: 3 },
    { courseId: c7.id, title: "Springs and Oscillation", description: "Hooke's Law, simple harmonic motion, and why springs bounce.", order: 2, xpReward: 40, challengeCount: 3 },
    { courseId: c7.id, title: "Energy Conservation", description: "Kinetic and potential energy trading off — and where it always ends up.", order: 3, xpReward: 40, challengeCount: 3 },
  ]).returning();

  const byOrder = (courseId: number) =>
    lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);

  const [l1, l2, l3] = byOrder(c1.id);
  const [l4, l5, l6] = byOrder(c2.id);
  const [l7, l8, l9] = byOrder(c3.id);
  const [l10, l11, l12] = byOrder(c4.id);
  const [l13, l14, l15, l16] = byOrder(c5.id);
  const [l17, l18, l19] = byOrder(c6.id);
  const [l20, l21, l22] = byOrder(c7.id);

  // ── Challenges ────────────────────────────────────────────────────────────
  // mc() wraps string options into {id,text,isCorrect}[] that the lesson player expects.
  // true_false correctAnswer must be lowercase "true"/"false" to match the UI's selectedOption.
  const challenges = await db.insert(challengesTable).values([
    // L1 — What is Probability?
    { lessonId: l1.id, order: 1, type: "multiple_choice", xpReward: 10, question: "A bag has 3 red and 7 blue marbles. What is the probability of drawing red?", options: mc(["0.3", "0.7", "3/7", "1/3"], "0.3"), correctAnswer: "0.3", explanation: "P = favorable / total = 3/10 = 0.3", hint: "Count total marbles first." },
    { lessonId: l1.id, order: 2, type: "true_false", xpReward: 10, question: "The probability of any event must be between 0 and 1 inclusive.", options: null, correctAnswer: "true", explanation: "0 = impossible, 1 = certain. All probabilities live in [0, 1].", hint: "Think about the extremes." },
    { lessonId: l1.id, order: 3, type: "multiple_choice", xpReward: 10, question: "You roll a fair six-sided die. What is the probability of an even number?", options: mc(["1/6", "1/3", "1/2", "2/3"], "1/2"), correctAnswer: "1/2", explanation: "Even faces: {2,4,6} — 3 out of 6 = 1/2.", hint: "List the even numbers on a die." },
    // L2 — Gambler's Fallacy
    { lessonId: l2.id, order: 1, type: "multiple_choice", xpReward: 10, question: "A fair coin has landed heads 5 times in a row. What is the probability of heads on the next flip?", options: mc(["Less than 0.5 — tails is due", "More than 0.5 — on a streak", "Exactly 0.5", "Cannot be determined"], "Exactly 0.5"), correctAnswer: "Exactly 0.5", explanation: "Each flip is independent. The coin has no memory.", hint: "Coins don't remember past results." },
    { lessonId: l2.id, order: 2, type: "true_false", xpReward: 10, question: "The Law of Large Numbers says that with enough flips, the proportion of heads converges to 0.5.", options: null, correctAnswer: "true", explanation: "The LLN guarantees convergence to the expected value — but only in the long run.", hint: "Think about 10 vs 10,000 flips." },
    { lessonId: l2.id, order: 3, type: "multiple_choice", xpReward: 10, question: "The Gambler's Fallacy is the mistaken belief that:", options: mc(["Past random events affect future independent events", "Probability is always 0.5", "More trials give more accurate results", "Streaks are impossible"], "Past random events affect future independent events"), correctAnswer: "Past random events affect future independent events", explanation: "Independent events have no memory. Past streaks do not affect future outcomes.", hint: "What does 'independent' mean?" },
    // L3 — Conditional Probability
    { lessonId: l3.id, order: 1, type: "multiple_choice", xpReward: 10, question: "P(A|B) means:", options: mc(["P(A) × P(B)", "Probability of A given B has occurred", "Probability of both A and B", "P(A) + P(B)"], "Probability of A given B has occurred"), correctAnswer: "Probability of A given B has occurred", explanation: "The | symbol means 'given'. P(A|B) is the probability of A knowing B already happened.", hint: "The bar | means 'given that'." },
    { lessonId: l3.id, order: 2, type: "true_false", xpReward: 10, question: "If A and B are independent, then P(A|B) = P(A).", options: null, correctAnswer: "true", explanation: "Independence means B gives no information about A.", hint: "What does independence mean?" },
    { lessonId: l3.id, order: 3, type: "multiple_choice", xpReward: 10, question: "40% of students play sports; 25% play sports AND are in the science club. What fraction of sports players are in the science club?", options: mc(["10%", "25%", "62.5%", "40%"], "62.5%"), correctAnswer: "62.5%", explanation: "P(club|sports) = P(both)/P(sports) = 0.25/0.40 = 62.5%", hint: "P(A|B) = P(A∩B) / P(B)" },
    // L4 — Propositions
    { lessonId: l4.id, order: 1, type: "true_false", xpReward: 10, question: '"The sky is green" is a proposition.', options: null, correctAnswer: "true", explanation: "It's false, but it still has a definite truth value — so it's a proposition.", hint: "Does the statement have a truth value?" },
    { lessonId: l4.id, order: 2, type: "multiple_choice", xpReward: 10, question: "Which of these is NOT a proposition?", options: mc(["2 + 2 = 4", "Close the door!", "Paris is in France", "All birds can fly"], "Close the door!"), correctAnswer: "Close the door!", explanation: "Commands have no truth value. Only declarative statements are propositions.", hint: "Can you say it's true or false?" },
    { lessonId: l4.id, order: 3, type: "true_false", xpReward: 10, question: "A proposition can be both true and false at the same time.", options: null, correctAnswer: "false", explanation: "The law of non-contradiction: no statement can be both true and false simultaneously.", hint: "Law of non-contradiction." },
    // L5 — Connectives
    { lessonId: l5.id, order: 1, type: "multiple_choice", xpReward: 10, question: "P = True, Q = False. What is P AND Q?", options: mc(["True", "False", "Undefined", "Depends"], "False"), correctAnswer: "False", explanation: "AND is only True when BOTH inputs are True.", hint: "AND requires both to be true." },
    { lessonId: l5.id, order: 2, type: "multiple_choice", xpReward: 10, question: "P = False, Q = False. What is P OR Q?", options: mc(["True", "False", "Undefined", "True only if P is True"], "False"), correctAnswer: "False", explanation: "OR is False only when BOTH inputs are False.", hint: "OR is only false when both are false." },
    { lessonId: l5.id, order: 3, type: "true_false", xpReward: 10, question: "NOT (NOT P) is equivalent to P.", options: null, correctAnswer: "true", explanation: "Double negation cancels out.", hint: "Try it with P = True and P = False." },
    // L6 — Validity
    { lessonId: l6.id, order: 1, type: "multiple_choice", xpReward: 10, question: "A valid argument is one where:", options: mc(["The conclusion is true", "If the premises are true, the conclusion must be true", "All premises are true", "The conclusion follows from majority opinion"], "If the premises are true, the conclusion must be true"), correctAnswer: "If the premises are true, the conclusion must be true", explanation: "Validity is about logical structure, not whether premises actually are true.", hint: "Validity is about form, not fact." },
    { lessonId: l6.id, order: 2, type: "true_false", xpReward: 10, question: "A valid argument can have false premises.", options: null, correctAnswer: "true", explanation: "Validity only requires: IF premises were true, THEN conclusion would follow.", hint: "Validity ≠ soundness." },
    { lessonId: l6.id, order: 3, type: "multiple_choice", xpReward: 10, question: "A sound argument is:", options: mc(["Valid with true premises", "Invalid but convincing", "Valid with false premises", "Any argument that sounds reasonable"], "Valid with true premises"), correctAnswer: "Valid with true premises", explanation: "Soundness = validity + true premises. It guarantees a true conclusion.", hint: "Sound = valid + actually true premises." },
    // L7 — Algorithms
    { lessonId: l7.id, order: 1, type: "multiple_choice", xpReward: 10, question: "An algorithm is best described as:", options: mc(["A programming language", "A step-by-step procedure for solving a problem", "A type of hardware", "A mathematical formula"], "A step-by-step procedure for solving a problem"), correctAnswer: "A step-by-step procedure for solving a problem", explanation: "An algorithm is a finite sequence of well-defined instructions.", hint: "Think about recipes." },
    { lessonId: l7.id, order: 2, type: "multiple_choice", xpReward: 10, question: "An O(n²) algorithm takes 1 second for 100 items. How long for 200 items?", options: mc(["2 seconds", "4 seconds", "100 seconds", "0.5 seconds"], "4 seconds"), correctAnswer: "4 seconds", explanation: "O(n²) scales with the square of input. 2× items → 2² = 4× time.", hint: "Square the increase in input size." },
    { lessonId: l7.id, order: 3, type: "true_false", xpReward: 10, question: "O(log n) algorithms are faster than O(n) for large inputs.", options: null, correctAnswer: "true", explanation: "log(1,000,000) = 20. Logarithmic growth is far slower than linear.", hint: "log(1,000,000) = 20." },
    // L8 — Searching & Sorting
    { lessonId: l8.id, order: 1, type: "multiple_choice", xpReward: 10, question: "Binary search requires the input to be:", options: mc(["Unsorted", "Sorted", "Numeric only", "Shorter than 100 items"], "Sorted"), correctAnswer: "Sorted", explanation: "Binary search halves the search space each step, which only works on sorted data.", hint: "You need to know which half to eliminate." },
    { lessonId: l8.id, order: 2, type: "multiple_choice", xpReward: 10, question: "How many comparisons does binary search need (worst case) for 1024 items?", options: mc(["1024", "512", "10", "32"], "10"), correctAnswer: "10", explanation: "O(log₂ n): log₂(1024) = 10.", hint: "How many times can you halve 1024?" },
    { lessonId: l8.id, order: 3, type: "true_false", xpReward: 10, question: "Bubble sort is generally faster than merge sort for large datasets.", options: null, correctAnswer: "false", explanation: "Bubble sort O(n²); merge sort O(n log n). Merge sort wins for large n.", hint: "Compare O(n²) vs O(n log n)." },
    // L9 — Recursion
    { lessonId: l9.id, order: 1, type: "multiple_choice", xpReward: 10, question: "Every recursive function must have:", options: mc(["At least two recursive calls", "A base case", "A loop inside it", "An even number of lines"], "A base case"), correctAnswer: "A base case", explanation: "Without a base case, recursion never stops — causing a stack overflow.", hint: "What stops the recursion?" },
    { lessonId: l9.id, order: 2, type: "true_false", xpReward: 10, question: "Any problem solvable with recursion can also be solved with iteration.", options: null, correctAnswer: "true", explanation: "Recursion and iteration are equivalent in power. Every recursive solution has an iterative counterpart.", hint: "Think about a stack data structure." },
    { lessonId: l9.id, order: 3, type: "multiple_choice", xpReward: 10, question: "What is 5! (5 factorial)?", options: mc(["25", "120", "15", "720"], "120"), correctAnswer: "120", explanation: "5! = 5×4×3×2×1 = 120.", hint: "Multiply 5 × 4 × 3 × 2 × 1." },
    // L10 — Descriptive Statistics
    { lessonId: l10.id, order: 1, type: "multiple_choice", xpReward: 10, question: "For {2, 4, 4, 6, 8}, what is the mean?", options: mc(["4", "4.8", "5", "6"], "4.8"), correctAnswer: "4.8", explanation: "(2+4+4+6+8)/5 = 24/5 = 4.8", hint: "Add all values, divide by count." },
    { lessonId: l10.id, order: 2, type: "multiple_choice", xpReward: 10, question: "For {1, 3, 3, 6, 100}, which measure is most resistant to the outlier 100?", options: mc(["Mean", "Median", "Mode", "Range"], "Median"), correctAnswer: "Median", explanation: "Median = 3, unaffected by 100. The mean is pulled to 22.6.", hint: "Which measure doesn't use the actual values?" },
    { lessonId: l10.id, order: 3, type: "true_false", xpReward: 10, question: "Standard deviation measures the spread (variability) of a dataset.", options: null, correctAnswer: "true", explanation: "Standard deviation quantifies average deviation from the mean.", hint: "What does 'deviation' mean?" },
    // L11 — Distributions
    { lessonId: l11.id, order: 1, type: "true_false", xpReward: 10, question: "In a perfectly normal distribution, the mean, median, and mode are equal.", options: null, correctAnswer: "true", explanation: "Perfect symmetry means all three measures of center coincide.", hint: "Think about symmetry." },
    { lessonId: l11.id, order: 2, type: "multiple_choice", xpReward: 10, question: "A distribution with a long tail to the right is called:", options: mc(["Left-skewed", "Right-skewed", "Symmetric", "Bimodal"], "Right-skewed"), correctAnswer: "Right-skewed", explanation: "The tail points right → right-skewed (positively skewed).", hint: "The tail points in the direction of the skew." },
    { lessonId: l11.id, order: 3, type: "multiple_choice", xpReward: 10, question: "What percentage of data falls within one standard deviation of the mean in a normal distribution?", options: mc(["50%", "68%", "95%", "99.7%"], "68%"), correctAnswer: "68%", explanation: "Empirical rule: ~68% within 1σ, ~95% within 2σ, ~99.7% within 3σ.", hint: "68-95-99.7 rule." },
    // L12 — Correlation
    { lessonId: l12.id, order: 1, type: "multiple_choice", xpReward: 10, question: "Correlation measures:", options: mc(["Whether A causes B", "Strength and direction of a linear relationship", "Difference between two variables", "Whether data is normally distributed"], "Strength and direction of a linear relationship"), correctAnswer: "Strength and direction of a linear relationship", explanation: "r ranges from -1 to 1, measuring how linearly related two variables are.", hint: "Correlation ≠ causation." },
    { lessonId: l12.id, order: 2, type: "true_false", xpReward: 10, question: "A strong correlation between A and B proves that A causes B.", options: null, correctAnswer: "false", explanation: "Both might share a confound, or the correlation could be coincidental.", hint: "Think about ice cream and drowning rates." },
    { lessonId: l12.id, order: 3, type: "multiple_choice", xpReward: 10, question: "The most reliable way to establish causation is:", options: mc(["High correlation", "A controlled randomized experiment", "Observational study", "Large sample size"], "A controlled randomized experiment"), correctAnswer: "A controlled randomized experiment", explanation: "Random assignment eliminates confounding variables, enabling causal claims.", hint: "Random assignment is the key." },
    // L13 — Geometric Probability
    { lessonId: l13.id, order: 1, type: "multiple_choice", xpReward: 10, question: "A point is chosen randomly in a 10×10 square. A circle of radius 3 sits at the center. P(point inside circle)?", options: mc(["9π/100", "π/9", "3/10", "9/100"], "9π/100"), correctAnswer: "9π/100", explanation: "P = π(3²)/100 = 9π/100 ≈ 0.283", hint: "P = favorable area / total area." },
    { lessonId: l13.id, order: 2, type: "true_false", xpReward: 10, question: "In geometric probability, probability equals the ratio of favorable area to total area.", options: null, correctAnswer: "true", explanation: "Geometric probability generalizes counting probability to continuous spaces using measure.", hint: "What fraction of the space is favorable?" },
    { lessonId: l13.id, order: 3, type: "multiple_choice", xpReward: 10, question: "A stick is broken at a random point. P(left piece is longer than right)?", options: mc(["0.25", "0.5", "0.75", "Depends on length"], "0.5"), correctAnswer: "0.5", explanation: "Break point is uniform on [0,1]. P(break > 0.5) = 0.5.", hint: "The break point is equally likely anywhere." },
    // L14 — Area Models
    { lessonId: l14.id, order: 1, type: "multiple_choice", xpReward: 10, question: "P(A) = 0.4, P(B) = 0.3, A and B independent. What is P(A and B)?", options: mc(["0.7", "0.12", "0.1", "0.4"], "0.12"), correctAnswer: "0.12", explanation: "P(A∩B) = P(A) × P(B) = 0.4 × 0.3 = 0.12", hint: "Multiply probabilities for independent events." },
    { lessonId: l14.id, order: 2, type: "true_false", xpReward: 10, question: "In an area model, P(A∩B) is represented by the overlapping rectangle.", options: null, correctAnswer: "true", explanation: "The overlap rectangle has area = P(A) × P(B) for independent events.", hint: "Think about the grid overlap." },
    { lessonId: l14.id, order: 3, type: "multiple_choice", xpReward: 10, question: "If P(A) doubles while P(B) stays the same, what happens to P(A∩B)?", options: mc(["Doubles", "Quadruples", "Stays same", "Halves"], "Doubles"), correctAnswer: "Doubles", explanation: "P(A∩B) = P(A)×P(B). Doubling P(A) doubles the product.", hint: "Remember the multiplication rule." },
    // L15 — Monty Hall
    { lessonId: l15.id, order: 1, type: "multiple_choice", xpReward: 10, question: "After the host reveals a goat, what is P(winning) if you switch doors?", options: mc(["1/3", "1/2", "2/3", "3/4"], "2/3"), correctAnswer: "2/3", explanation: "Your initial pick was wrong 2/3 of the time. The host's reveal concentrates that probability on the other door.", hint: "Your initial pick has a 1/3 chance of being right." },
    { lessonId: l15.id, order: 2, type: "true_false", xpReward: 10, question: "It makes no difference whether you switch or stay in the Monty Hall problem.", options: null, correctAnswer: "false", explanation: "Switching wins 2/3 of the time. Staying wins only 1/3.", hint: "Run a simulation to see." },
    { lessonId: l15.id, order: 3, type: "multiple_choice", xpReward: 10, question: "Why does switching help? The host:", options: mc(["Opens a random door", "Always reveals a goat behind a door you didn't pick", "Sometimes reveals the car", "Picks randomly"], "Always reveals a goat behind a door you didn't pick"), correctAnswer: "Always reveals a goat behind a door you didn't pick", explanation: "The host's knowledge and constraint is what transfers probability to the other door.", hint: "The host knows where the car is." },
    // L16 — Expected Value
    { lessonId: l16.id, order: 1, type: "multiple_choice", xpReward: 10, question: "A die pays $6 for rolling 6, $0 otherwise. Expected value per roll?", options: mc(["$1", "$3", "$6", "$0.50"], "$1"), correctAnswer: "$1", explanation: "E[X] = (1/6)(6) + (5/6)(0) = $1", hint: "Multiply each outcome by its probability." },
    { lessonId: l16.id, order: 2, type: "true_false", xpReward: 10, question: "Expected value is the most likely outcome of a random variable.", options: null, correctAnswer: "false", explanation: "EV is the long-run average, not necessarily the mode. A fair die has EV = 3.5 — impossible to roll.", hint: "EV of a fair die = 3.5." },
    { lessonId: l16.id, order: 3, type: "multiple_choice", xpReward: 10, question: "A game costs $2. Heads wins $5, tails wins $0. Expected profit?", options: mc(["-$2", "-$0.50", "$0.50", "$1.50"], "$0.50"), correctAnswer: "$0.50", explanation: "E[win] = 0.5×$5 = $2.50. Profit = $2.50 − $2.00 = $0.50.", hint: "Expected profit = expected winnings − cost." },
    // L17 — Neurons and Weights
    { lessonId: l17.id, order: 1, type: "multiple_choice", xpReward: 10, question: "In an artificial neuron, weights control:", options: mc(["The activation function", "How strongly each input influences the output", "The number of layers", "The learning rate"], "How strongly each input influences the output"), correctAnswer: "How strongly each input influences the output", explanation: "Each weight multiplies its input. Larger weights make that input more influential.", hint: "Think of weights as dials for each input." },
    { lessonId: l17.id, order: 2, type: "true_false", xpReward: 10, question: "A neuron fires when its weighted sum exceeds a threshold.", options: null, correctAnswer: "true", explanation: "This is the basic threshold neuron model.", hint: "Think about the activation function." },
    { lessonId: l17.id, order: 3, type: "multiple_choice", xpReward: 10, question: "If all weights are zero, the network:", options: mc(["Learns faster", "Outputs the same value regardless of input", "Randomly activates neurons", "Becomes more accurate"], "Outputs the same value regardless of input"), correctAnswer: "Outputs the same value regardless of input", explanation: "0 × input = 0 for every neuron. No input can affect the output.", hint: "0 × anything = 0." },
    // L18 — Learning Signal
    { lessonId: l18.id, order: 1, type: "multiple_choice", xpReward: 10, question: "Backpropagation computes:", options: mc(["The forward pass output", "How much each weight contributed to the error", "The optimal architecture", "The number of epochs needed"], "How much each weight contributed to the error"), correctAnswer: "How much each weight contributed to the error", explanation: "Backprop uses the chain rule to compute the gradient of loss w.r.t. each weight.", hint: "Think about blame assignment." },
    { lessonId: l18.id, order: 2, type: "true_false", xpReward: 10, question: "Gradient descent moves weights in the direction of steepest ascent of the loss.", options: null, correctAnswer: "false", explanation: "It moves in the direction of steepest DESCENT (negative gradient) to minimize loss.", hint: "We want to minimize loss." },
    { lessonId: l18.id, order: 3, type: "multiple_choice", xpReward: 10, question: "The learning rate controls:", options: mc(["The number of neurons", "How large each weight update step is", "The batch size", "The loss function shape"], "How large each weight update step is"), correctAnswer: "How large each weight update step is", explanation: "Too high = overshoot; too low = slow convergence.", hint: "Too big = overshoot; too small = slow." },
    // L19 — Layers and Depth
    { lessonId: l19.id, order: 1, type: "multiple_choice", xpReward: 10, question: "Why do deep networks outperform shallow ones on complex tasks?", options: mc(["More neurons total", "Each layer learns increasingly abstract features", "Less training data needed", "Better optimizers"], "Each layer learns increasingly abstract features"), correctAnswer: "Each layer learns increasingly abstract features", explanation: "Early layers detect edges; later layers combine these into complex concepts.", hint: "Pixels → edges → shapes → objects." },
    { lessonId: l19.id, order: 2, type: "true_false", xpReward: 10, question: "Without non-linear activations, a deep network is equivalent to a single-layer network.", options: null, correctAnswer: "true", explanation: "Composing linear functions is still linear: A×(B×x) = (AB)×x.", hint: "A×(B×x) = (AB)×x — just one matrix." },
    { lessonId: l19.id, order: 3, type: "multiple_choice", xpReward: 10, question: "ReLU activation outputs:", options: mc(["Values between 0 and 1", "max(0, x)", "The sigmoid of x", "A random value"], "max(0, x)"), correctAnswer: "max(0, x)", explanation: "ReLU = max(0, x): zero for negatives, x for positives. Fast and avoids vanishing gradients.", hint: "ReLU = Rectified Linear Unit." },
    // L20 — Forces and Acceleration
    { lessonId: l20.id, order: 1, type: "multiple_choice", xpReward: 10, question: "If you double the force on an object (same mass), acceleration:", options: mc(["Stays the same", "Doubles", "Quadruples", "Halves"], "Doubles"), correctAnswer: "Doubles", explanation: "F = ma → a = F/m. Double F, double a.", hint: "a = F/m" },
    { lessonId: l20.id, order: 2, type: "true_false", xpReward: 10, question: "A single fixed pulley reduces the force needed to lift a load.", options: null, correctAnswer: "false", explanation: "A fixed pulley only redirects force — it doesn't change its magnitude.", hint: "Think about what a fixed pulley actually does." },
    { lessonId: l20.id, order: 3, type: "multiple_choice", xpReward: 10, question: "Mass = 5 kg, force = 20 N, frictionless surface. Acceleration?", options: mc(["100 m/s²", "4 m/s²", "0.25 m/s²", "25 m/s²"], "4 m/s²"), correctAnswer: "4 m/s²", explanation: "a = F/m = 20/5 = 4 m/s²", hint: "Use F = ma, solve for a." },
    // L21 — Springs
    { lessonId: l21.id, order: 1, type: "multiple_choice", xpReward: 10, question: "Hooke's Law states the restoring force is:", options: mc(["Proportional to velocity", "F = -kx (proportional to displacement)", "Constant regardless of stretch", "Proportional to mass"], "F = -kx (proportional to displacement)"), correctAnswer: "F = -kx (proportional to displacement)", explanation: "The negative sign shows the force opposes displacement. k is the spring constant.", hint: "The stiffer the spring, the larger k." },
    { lessonId: l21.id, order: 2, type: "true_false", xpReward: 10, question: "The period of oscillation of a spring-mass system depends on amplitude.", options: null, correctAnswer: "false", explanation: "T = 2π√(m/k) — independent of amplitude for an ideal spring.", hint: "T = 2π√(m/k)" },
    { lessonId: l21.id, order: 3, type: "multiple_choice", xpReward: 10, question: "Doubling k (stiffer spring) changes the period by a factor of:", options: mc(["2", "1/2", "√2", "1/√2"], "1/√2"), correctAnswer: "1/√2", explanation: "T = 2π√(m/k). Doubling k → T × √(1/2) = T/√2 — shorter period.", hint: "k is under the square root in the denominator." },
    // L22 — Energy Conservation
    { lessonId: l22.id, order: 1, type: "multiple_choice", xpReward: 10, question: "At the lowest point of a pendulum swing, which energy is maximum?", options: mc(["Potential energy", "Kinetic energy", "Both equal", "Neither — energy is lost"], "Kinetic energy"), correctAnswer: "Kinetic energy", explanation: "At the bottom, height = 0 so PE = 0. All energy is kinetic — maximum speed.", hint: "Height = potential energy." },
    { lessonId: l22.id, order: 2, type: "true_false", xpReward: 10, question: "In a frictionless spring-mass system, total mechanical energy (KE + PE) is constant.", options: null, correctAnswer: "true", explanation: "Without friction, KE + PE = constant. They trade off but the sum never changes.", hint: "Conservation of energy." },
    { lessonId: l22.id, order: 3, type: "multiple_choice", xpReward: 10, question: "Spring k = 100 N/m, compressed 0.2 m. Stored PE?", options: mc(["10 J", "2 J", "20 J", "4 J"], "2 J"), correctAnswer: "2 J", explanation: "PE = ½kx² = ½ × 100 × 0.04 = 2 J", hint: "PE = ½kx²" },
  ]).returning();

  console.log(`Seeded ${courses.length} courses, ${lessons.length} lessons, ${challenges.length} challenges.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
