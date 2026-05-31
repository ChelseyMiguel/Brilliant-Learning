import { lazy } from "react";

export const LAB_COMPONENTS = {
  CoinFlipLab: lazy(() => import("./CoinFlipLab")),
  Coin3DFlipLab: lazy(() => import("./Coin3DFlipLab")),
  SpringLab: lazy(() => import("./SpringLab")),
  AreaModelLab: lazy(() => import("./AreaModelLab")),
  NeuralNetLab: lazy(() => import("./NeuralNetLab")),
  PulleyLab: lazy(() => import("./PulleyLab")),
  TruthTableLab: lazy(() => import("./TruthTableLab")),
  BinarySearchLab: lazy(() => import("./BinarySearchLab")),
  MontyHallLab: lazy(() => import("./MontyHallLab")),
  RecursionTreeLab: lazy(() => import("./RecursionTreeLab")),
  EnergyConservationLab: lazy(() => import("./EnergyConservationLab")),
  DistributionLab: lazy(() => import("./DistributionLab")),
  ScatterPlotLab: lazy(() => import("./ScatterPlotLab")),
  MarbleBagLab: lazy(() => import("./MarbleBagLab")),
  BigOLab: lazy(() => import("./BigOLab")),
  MonteCarloDartboardLab: lazy(() => import("./MonteCarloDartboardLab")),
  ExpectedValueLab: lazy(() => import("./ExpectedValueLab")),
  SortingVisualizerLab: lazy(() => import("./SortingVisualizerLab")),
  VennDiagramLab: lazy(() => import("./VennDiagramLab")),
  BayesUpdateLab: lazy(() => import("./BayesUpdateLab")),
} as const;

export type LabKey = keyof typeof LAB_COMPONENTS;

export interface LessonLab {
  labKey: LabKey;
  title: string;
  subtitle: string;
  steps: {
    heading: string;
    body: string;
  }[];
  bridgePrompt: string;
}

export const LESSON_LABS: Record<number, LessonLab> = {
  // Lesson 1: Introduction to Probability - marble bag
  1: {
    labKey: "MarbleBagLab",
    title: "Marble Bag Explorer",
    subtitle: "Adjust the marble counts, then draw and watch the observed frequency approach theory.",
    steps: [
      {
        heading: "Start with 3 red and 7 blue",
        body: "Draw 10 times. Did you get exactly 3 red out of 10? Probably not - but after 30 draws, how close is the observed frequency to the P = 3/10 formula?",
      },
      {
        heading: "Add green marbles",
        body: "Slide green up to 5. Now the probabilities shift. What happens to P(red) when you add a third color? Try predicting the new values before drawing.",
      },
      {
        heading: "Watch sampling variation",
        body: "Reset draws and click Draw 10 three times in a row. Notice how each run differs. What does that tell you about relying on small samples for probability estimates?",
      },
    ],
    bridgePrompt: "You've seen the formula and the randomness - now let's put some structure around it.",
  },

  // Lesson 7: Big-O Notation - complexity growth comparison
  7: {
    labKey: "BigOLab",
    title: "Big-O Growth Lab",
    subtitle: "Five complexity classes, one chart - toggle them and watch the gap explode.",
    steps: [
      {
        heading: "Hide everything except O(n) and O(n²)",
        body: "Turn off all other curves. At n=10, O(n²) is already 10× larger. At n=32, how many times larger is it? Drag your cursor across the chart to compare exact counts.",
      },
      {
        heading: "Turn on O(log n)",
        body: "Re-enable O(log n). At n=32, log n ≈ 5. How does that compare to n=32 and n²=1024? Why would you choose an O(log n) algorithm over O(n) when input gets big?",
      },
      {
        heading: "Find where O(n log n) overtakes O(n)",
        body: "O(n log n) starts just above O(n) but diverges. Hover to find the n where O(n log n) is more than double O(n). What sorting algorithms run in O(n log n)?",
      },
    ],
    bridgePrompt: "You've seen the gap visually - now let's put the formal definition behind it.",
  },

  // Lesson 13: Geometric Probability - Monte Carlo π estimation
  13: {
    labKey: "MonteCarloDartboardLab",
    title: "Monte Carlo π Lab",
    subtitle: "Throw random darts at a square. Count what lands in the circle. Watch π emerge.",
    steps: [
      {
        heading: "Throw 10 darts manually",
        body: "Click 'Throw 10' once. What is your π estimate? Is it anywhere near 3.14? How many darts do you think you'd need to get within 0.1 of π?",
      },
      {
        heading: "Let it run to 500",
        body: "Hit Auto and pause near 500 darts. How close is the estimate now? Notice it still jumps around. What's the trend - does it ever get worse as you add more darts?",
      },
      {
        heading: "Run to 2000 and read the error",
        body: "Let it run all the way. What is the final error compared to π = 3.14159…? Why doesn't this method give an exact answer - and what would you need to improve accuracy?",
      },
    ],
    bridgePrompt: "Randomness gave you a number from geometry - now let's formalize that connection.",
  },

  // Lesson 16: Expected Value - dice roll convergence
  16: {
    labKey: "ExpectedValueLab",
    title: "Expected Value Lab",
    subtitle: "Roll a fair die and watch the running average converge to 3.5 - the expected value.",
    steps: [
      {
        heading: "Roll 5 times and note the average",
        body: "Hit Roll 1 five times. Is your average close to 3.5? How far off can it be? Does that surprise you given that 3.5 isn't even a face on the die?",
      },
      {
        heading: "Roll to 50 total",
        body: "Click Roll 10 a few times. Watch the convergence line. Is it closer to 3.5 now? Are some faces showing up more than others in the frequency bars?",
      },
      {
        heading: "Roll all the way to 200",
        body: "Use Roll 50 to finish. How close is the final average to 3.5? The light blue bars in the frequency chart show theoretical 1/6. Are the actual bars near that now?",
      },
    ],
    bridgePrompt: "The average settled on 3.5 - now let's see how expected value lets you predict that in advance.",
  },

  // Lesson 2: Gambler's Fallacy - 3D coin flip + Law of Large Numbers
  2: {
    labKey: "Coin3DFlipLab",
    title: "3D Coin Flip Lab",
    subtitle: "Click the coin - it spins in 3D and lands on heads or tails. Track whether the coin 'remembers' anything.",
    steps: [
      {
        heading: "Flip 10 times and track the pattern",
        body: "Flip the coin 10 times. Do you notice a pattern? After 3 heads in a row, does tails feel 'due'? The history chips show every result - check if you see any real pattern or just randomness.",
      },
      {
        heading: "After 9 heads in a row…",
        body: "Imagine you've just seen 9 heads. What's the probability the next flip is tails? The coin has no memory - each flip is independent. The 'heads %' bar shows the running proportion. Does it drift back to 50%?",
      },
      {
        heading: "Watch the proportion bar settle",
        body: "Keep flipping until you have 20+ total flips. Notice the 'Heads %' bar. Is it always exactly 50%? Why does it get closer to 50% as the total grows? This is the Law of Large Numbers in action.",
      },
    ],
    bridgePrompt: "Now that you've watched randomness in action, let's ask: does the coin actually owe you a tails?",
  },

  // Lesson 14: Area Models
  14: {
    labKey: "AreaModelLab",
    title: "Area Model Lab",
    subtitle: "What does probability actually look like? Try making it visible.",
    steps: [
      {
        heading: "Set P(A) = 0.3",
        body: "Drag the first slider until 3 columns are shaded. If you picked one cell at random, how likely is it to be in the blue region? Count the cells to check yourself.",
      },
      {
        heading: "Now add P(B) = 0.5",
        body: "Add the second event with the lower slider. Where do the two colors overlap? Try to predict the overlap size before you drag - then check if you were right.",
      },
      {
        heading: "Double one probability",
        body: "Double P(A). What happens to the overlap region? Does it double too? Try the same with P(B). What pattern do you see between the sliders and the overlap?",
      },
    ],
    bridgePrompt: "You've seen the overlap with your own eyes - now let's put numbers to what you found.",
  },

  // Lesson 17: Neural Networks - neurons & weights
  17: {
    labKey: "NeuralNetLab",
    title: "Neural Network Explorer",
    subtitle: "What controls whether a signal gets through? Start pulling levers.",
    steps: [
      {
        heading: "Turn the weight all the way down",
        body: "Drag the weight slider to its minimum. Watch what happens to the hidden and output nodes. What would it mean for a real network if all weights were near zero?",
      },
      {
        heading: "Find the tipping point",
        body: "With the weight at 0.5, slowly raise the threshold until nodes start going dark. Can you find the exact threshold where the first node switches off?",
      },
      {
        heading: "Make only some nodes fire",
        body: "Try to find a weight + threshold combination where exactly half the hidden layer is active. What does that 'selective activation' pattern remind you of?",
      },
    ],
    bridgePrompt: "You've found the levers - now let's see if you can predict what happens when numbers change.",
  },

  // Lesson 18: Learning Signal (backpropagation)
  18: {
    labKey: "NeuralNetLab",
    title: "Signal Propagation Lab",
    subtitle: "Follow the signal from input to output - then try to break it.",
    steps: [
      {
        heading: "Trace one signal path",
        body: "Pick one input node and follow it to the output. How many connections does the signal pass through? Do all paths reach the output with equal strength?",
      },
      {
        heading: "Raise the threshold until the output goes dark",
        body: "Slowly increase the threshold. At what point does the output node turn off? Is it sudden or gradual? What's different about nodes that survive longer?",
      },
      {
        heading: "What would 'learning' need to fix?",
        body: "If the output is too dim (wrong answer), what would you change - the weights or the threshold? Try it. Which gives you finer control over the output strength?",
      },
    ],
    bridgePrompt: "You've traced a signal and broken it on purpose - now let's formalize what you observed.",
  },

  // Lesson 20: Forces and Acceleration - single fixed pulley
  20: {
    labKey: "PulleyLab",
    title: "Pulley Forces Lab",
    subtitle: "A rope over a wheel - drag the slider and watch what happens on the other side.",
    steps: [
      {
        heading: "Pull the rope all the way down",
        body: "Drag the slider to its maximum. How far did the load rise? Compare it to how far you pulled. Is there any difference in distance?",
      },
      {
        heading: "Notice the direction change",
        body: "You pulled downward - the load moved upward. How does a pulley 'redirect' the force without changing how much force is needed?",
      },
      {
        heading: "Think about effort vs load",
        body: "In this single fixed pulley, F_effort = F_load. Can you think of a pulley arrangement where you'd need less force? What would have to change?",
      },
    ],
    bridgePrompt: "You've seen how a pulley redirects force - now let's put Newton's second law to work.",
  },

  // Lesson 21: Springs & Oscillation
  21: {
    labKey: "SpringLab",
    title: "Spring Physics Lab",
    subtitle: "Watch a spring oscillate - then start asking why.",
    steps: [
      {
        heading: "Press play and just watch",
        body: "Let the spring run at default settings. Where does the block move fastest? Where does it slow down and reverse? Can you identify those points just by watching?",
      },
      {
        heading: "Change the stiffness (k)",
        body: "Try k = 10, then k = 150. How does the oscillation speed change? Which setting would you expect from a rubber band vs. a steel spring?",
      },
      {
        heading: "Watch PE and KE trade off",
        body: "Pause the time slider at the moment the block reaches the far end. Note the PE and KE bars. Now scrub to the center. What changed - and can you explain why?",
      },
    ],
    bridgePrompt: "You've felt the rhythm of the spring - now let's put Hooke's Law into numbers.",
  },

  // Lesson 5: Logical Connectives - truth table explorer
  5: {
    labKey: "TruthTableLab",
    title: "Truth Table Explorer",
    subtitle: "Two variables, six operations - toggle P and Q and watch every row change.",
    steps: [
      {
        heading: "Find when AND is True",
        body: "Click through all four combinations of P and Q. AND (∧) only shows T in one row. Which one? What does that tell you about what AND actually demands?",
      },
      {
        heading: "Find when OR is False",
        body: "OR (∨) is only False once. Toggle until you find it. Compare it to the AND result - why does OR let so much more through?",
      },
      {
        heading: "Read the implication column",
        body: "P → Q (if P then Q) is False in only one case. Set P = T and Q = F. Can you explain in plain language why a true antecedent with a false conclusion breaks the implication?",
      },
    ],
    bridgePrompt: "You've seen the full truth table - now let's test whether you can predict outputs without the table.",
  },

  // Lesson 8: Searching and Sorting - binary search visualizer
  8: {
    labKey: "BinarySearchLab",
    title: "Binary Search Lab",
    subtitle: "A sorted array and a target - watch how binary search slices the problem in half each step.",
    steps: [
      {
        heading: "Find a number that's in the array",
        body: "Try searching for 31. Step through each check. How many steps did it take? How many would a left-to-right linear scan need?",
      },
      {
        heading: "Search for something not in the array",
        body: "Try 10 or 100. Watch the search range shrink to nothing. How does binary search confirm absence without checking every element?",
      },
      {
        heading: "Count the worst case",
        body: "This array has 10 elements. What's the maximum number of steps binary search ever needs? Try a few targets and see if you can find one that takes the most steps.",
      },
    ],
    bridgePrompt: "You've seen the halving in action - now let's put a name to how fast it actually is.",
  },

  // Lesson 15: The Monty Hall Problem - door simulation
  15: {
    labKey: "MontyHallLab",
    title: "Monty Hall Simulator",
    subtitle: "Three doors, one car, one goat reveal - does switching actually help?",
    steps: [
      {
        heading: "Play 5 games staying",
        body: "Always click 'Stay' for your first five games. Track your win rate. Does it feel like roughly 1-in-3? Does it ever feel higher or lower?",
      },
      {
        heading: "Play 5 games switching",
        body: "Now always click 'Switch'. Keep a mental tally. Does switching feel different? Don't trust your gut yet - the sample is too small.",
      },
      {
        heading: "Run the simulation",
        body: "Click 'Auto-simulate 300 games'. What win rates appear for Stay vs Switch? Do those numbers match your intuition - and can you now explain WHY switching wins more?",
      },
    ],
    bridgePrompt: "The data has spoken - now let's see if the math agrees with what you observed.",
  },

  // Lesson 9: Recursion - step-through call tree
  9: {
    labKey: "RecursionTreeLab",
    title: "Recursion Call Tree",
    subtitle: "Watch every call and return - then spot the work that gets repeated.",
    steps: [
      {
        heading: "Step through fib(3) first",
        body: "Select fib(3) and click Step until it completes. Count how many calls are made. Does that feel like too many for such a small number?",
      },
      {
        heading: "Jump to fib(5)",
        body: "Switch to fib(5) and Auto Play. How many times does fib(2) get computed? Write down the number before checking - you might be surprised.",
      },
      {
        heading: "Spot the duplicate work",
        body: "Look for nodes with the same fib(n) label appearing on different branches. This duplicated work is exactly what memoization (caching) eliminates - the fix that turns this exponential into linear.",
      },
    ],
    bridgePrompt: "You've watched the call stack grow and collapse - now let's think about what that costs.",
  },

  // Lesson 11: Distributions - bell curve with μ and σ sliders
  11: {
    labKey: "DistributionLab",
    title: "Distribution Explorer",
    subtitle: "Slide μ and σ - watch a histogram and its curve reshape in real time.",
    steps: [
      {
        heading: "Move μ left and right",
        body: "Drag the μ slider. What changes - the shape or the position? The 68% and 95% bands move with it. Why?",
      },
      {
        heading: "Make σ very small, then very large",
        body: "Try σ = 0.4, then σ = 2.5. What happens to the peak height? What happens to the spread? Is there a sense in which the distribution is getting 'taller but narrower' or 'shorter but wider'?",
      },
      {
        heading: "Find where ~68% lives",
        body: "The shaded ±1σ band always contains ~68% of the area no matter what σ is. Drag σ to confirm it. What does this tell you about what σ actually measures?",
      },
    ],
    bridgePrompt: "You've shaped the curve with your own hands - now let's see if you can read what those numbers mean.",
  },

  // Lesson 12: Correlation vs Causation - scatter plot builder
  12: {
    labKey: "ScatterPlotLab",
    title: "Correlation Lab",
    subtitle: "Build scatter plots by clicking - watch the correlation coefficient respond.",
    steps: [
      {
        heading: "Load 'Strong positive' and study it",
        body: "Look at how the points form a band. r is close to +1. Now add 2–3 outlier points far from the trend. How much does r change? Is the relationship more or less stable than you expected?",
      },
      {
        heading: "Load 'No correlation' and try to build one",
        body: "Clear the preset and try to add your own points to make r = +0.7 or higher. How many points does it take? What pattern do you need?",
      },
      {
        heading: "Make r = 0 with structure",
        body: "Can you make r = 0 but with an obvious pattern - like a U-shape? If you succeed, what does that tell you about what r actually measures vs. what 'relationship' means?",
      },
    ],
    bridgePrompt: "You've built correlations by hand - now let's separate that from causation.",
  },

  // Lesson 22: Energy Conservation - ball drop with PE/KE bars
  22: {
    labKey: "EnergyConservationLab",
    title: "Energy Conservation Lab",
    subtitle: "Drop a ball and watch potential energy become kinetic - and back again.",
    steps: [
      {
        heading: "Press Drop and just watch",
        body: "Watch the PE (orange) bar and KE (purple) bar as the ball falls. At the very moment the ball hits the floor, what is PE? What is KE? Does anything surprise you?",
      },
      {
        heading: "Track total energy",
        body: "The striped green bar never changes. Pause at mid-fall - PE + KE should equal 100%. Try pausing at different heights and adding the percentages mentally. Do they always sum to 100?",
      },
      {
        heading: "Change the drop height",
        body: "Set h₀ to 0.4 m, then 1.0 m. Does the ball reach a higher KE when dropped from higher up? Why? What stays constant between the two scenarios?",
      },
    ],
    bridgePrompt: "You've watched the energy trade-off in action - now let's put the numbers to it.",
  },

  // Lesson 3: Compound Events - Venn Diagram
  3: {
    labKey: "VennDiagramLab",
    title: "Venn Diagram Explorer",
    subtitle: "Drag sliders to set P(A) and P(B), then explore union, intersection, and complement.",
    steps: [
      {
        heading: "Select Intersection and read the value",
        body: "Set P(A) = 0.4 and P(B) = 0.5. What is P(A∩B)? For independent events, the formula is P(A) × P(B). Does the displayed value match? Try changing P(A) and watch the intersection update.",
      },
      {
        heading: "Try Union - when does it equal 1?",
        body: "Switch to Union. When P(A) = P(B) = 0.5, is the union 0.5 + 0.5 = 1.0? Why not? The overlap is being double-counted. Try to find values where the union is closest to 1.",
      },
      {
        heading: "Find the complement of A",
        body: "Select 'A only'. What does the displayed probability represent? If P(A) = 0.3, what is P(not A)? Use the diagram to verify the rule P(A) + P(not A) = 1.",
      },
    ],
    bridgePrompt: "You've seen how the regions relate - now let's put the addition rule into a formula.",
  },

  // Lesson 4: Conditional Probability - Bayes visual
  4: {
    labKey: "BayesUpdateLab",
    title: "Bayesian Updating Lab",
    subtitle: "Watch a prior probability transform into a posterior when new evidence arrives.",
    steps: [
      {
        heading: "Set equal priors and draw",
        body: "Set P(Jar A) = 0.5 and both likelihoods to 0.5. Draw a red ball. Did the posterior change? What happens when all probabilities are equal and symmetric?",
      },
      {
        heading: "Make Jar A much more likely to have red balls",
        body: "Set P(red|A) = 0.9 and P(red|B) = 0.1. Now draw a red ball. How much does the posterior shift toward Jar A? What does this tell you about how 'surprising' evidence changes beliefs?",
      },
      {
        heading: "Start with a strong prior against A",
        body: "Set P(Jar A) = 0.1 (making Jar B much more likely). But set P(red|A) = 0.9 and P(red|B) = 0.1. Draw a red ball. Does strong evidence overcome a strong prior? By how much?",
      },
    ],
    bridgePrompt: "You've watched the update happen - now let's see the formula that drives it.",
  },

  // Lesson 10: Sorting Algorithms - animated visualizer
  10: {
    labKey: "SortingVisualizerLab",
    title: "Sorting Visualizer",
    subtitle: "Watch Bubble, Selection, and Insertion sort compete - step by step.",
    steps: [
      {
        heading: "Run Bubble Sort and count swaps",
        body: "Press Play with Bubble Sort. Watch the amber (comparing) and red (swapping) highlights. In the worst case, how many swaps does bubble sort make on 16 elements? Is it closer to 16 or 256?",
      },
      {
        heading: "Compare with Selection Sort",
        body: "Reset and switch to Selection Sort. It always makes fewer swaps than Bubble Sort - but does it make fewer comparisons? Watch both and count. Which would you pick if swaps were expensive?",
      },
      {
        heading: "Try the speed slider",
        body: "Turn the speed to Fast and run all three algorithms back to back. Which finishes first on a random array? Reset a few times and rerun. Is the winner always the same?",
      },
    ],
    bridgePrompt: "You've watched the steps pile up - now let's count them precisely with Big-O.",
  },
};
