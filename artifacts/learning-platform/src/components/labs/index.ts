import { lazy } from "react";

export const LAB_COMPONENTS = {
  CoinFlipLab: lazy(() => import("./CoinFlipLab")),
  SpringLab: lazy(() => import("./SpringLab")),
  AreaModelLab: lazy(() => import("./AreaModelLab")),
  NeuralNetLab: lazy(() => import("./NeuralNetLab")),
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
  // Lesson 2: Gambler's Fallacy — coin flip & Law of Large Numbers
  2: {
    labKey: "CoinFlipLab",
    title: "Probability Playground",
    subtitle: "A coin, a slider, and a question: what do you actually expect to happen?",
    steps: [
      {
        heading: "Try just 10 flips",
        body: "Run 10 flips a few times. How much does the proportion jump around between runs? Does the first result change your expectation for the second run?",
      },
      {
        heading: "Jump to 200 flips",
        body: "Now drag all the way to 200. Compare how much the line moves around vs. at 10 flips. Why do you think the line settles down as you add more flips?",
      },
      {
        heading: "After 9 heads in a row…",
        body: "Imagine you've just flipped 9 heads. Does the coin 'owe' you a tail? Run the simulation and watch what happens on the 10th, 11th, and 12th flip.",
      },
    ],
    bridgePrompt: "Now that you've watched it happen, let's see if your intuition holds up against some tricky questions.",
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
        body: "Add the second event with the lower slider. Where do the two colors overlap? Try to predict the overlap size before you drag — then check if you were right.",
      },
      {
        heading: "Double one probability",
        body: "Double P(A). What happens to the overlap region? Does it double too? Try the same with P(B). What pattern do you see between the sliders and the overlap?",
      },
    ],
    bridgePrompt: "You've seen the overlap with your own eyes — now let's put numbers to what you found.",
  },

  // Lesson 17: Neural Networks — neurons & weights
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
    bridgePrompt: "You've found the levers — now let's see if you can predict what happens when numbers change.",
  },

  // Lesson 18: Learning Signal (backpropagation)
  18: {
    labKey: "NeuralNetLab",
    title: "Signal Propagation Lab",
    subtitle: "Follow the signal from input to output — then try to break it.",
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
        body: "If the output is too dim (wrong answer), what would you change — the weights or the threshold? Try it. Which gives you finer control over the output strength?",
      },
    ],
    bridgePrompt: "You've traced a signal and broken it on purpose — now let's formalize what you observed.",
  },

  // Lesson 21: Springs & Oscillation
  21: {
    labKey: "SpringLab",
    title: "Spring Physics Lab",
    subtitle: "Watch a spring oscillate — then start asking why.",
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
        body: "Pause the time slider at the moment the block reaches the far end. Note the PE and KE bars. Now scrub to the center. What changed — and can you explain why?",
      },
    ],
    bridgePrompt: "You've felt the rhythm of the spring — now let's put Hooke's Law into numbers.",
  },
};
