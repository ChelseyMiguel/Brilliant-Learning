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
    subtitle: "Explore what really happens when you flip a coin many times",
    steps: [
      {
        heading: "Start small",
        body: "Drag the slider to 10 flips. Notice how the proportion jumps around — sometimes 70% heads, sometimes 30%. Does the coin \"remember\" past flips?",
      },
      {
        heading: "Scale it up",
        body: "Push the slider toward 200 flips. Watch how the gold line starts hugging the 50% dashed line. This is the Law of Large Numbers in action.",
      },
      {
        heading: "The key insight",
        body: "Even after 10 heads in a row, the next flip is still 50/50. The proportion converges over many trials — but each individual flip is always independent.",
      },
    ],
    bridgePrompt: "Now that you've seen the Law of Large Numbers, let's test your intuition with a few challenges.",
  },

  // Lesson 14: Area Models
  14: {
    labKey: "AreaModelLab",
    title: "Area Model Lab",
    subtitle: "Visualize probability as area — how much of the grid is shaded?",
    steps: [
      {
        heading: "Build your intuition",
        body: "Use the P(A) slider to set how many columns are colored. Each column out of 10 represents 1/10 probability. Try setting P(A) = 3.",
      },
      {
        heading: "Combine two events",
        body: "Now adjust P(B) with the second slider. The darker region where both colors overlap is P(A AND B). Notice it equals P(A) × P(B).",
      },
      {
        heading: "Why area works",
        body: "Probability IS area. When events are independent, you multiply probabilities — just as you'd multiply width × height to get the area of a rectangle.",
      },
    ],
    bridgePrompt: "You've seen how area models make probability visual. Now apply it to solve these problems.",
  },

  // Lesson 17: Neural Networks — neurons & weights
  17: {
    labKey: "NeuralNetLab",
    title: "Neural Network Explorer",
    subtitle: "See how signals flow through a network and how weights control activation",
    steps: [
      {
        heading: "Adjust the weights",
        body: "Drag the weight slider left (weaker connections) and watch how the hidden layer nodes switch off. Higher weights = stronger signal propagation.",
      },
      {
        heading: "Tune the threshold",
        body: "The threshold is the minimum signal a neuron needs to fire. Raise it and nodes start turning off one by one. Lower it and the whole network lights up.",
      },
      {
        heading: "The balance",
        body: "Real neural networks learn by adjusting thousands of these weights automatically during training — finding the combination where useful patterns activate.",
      },
    ],
    bridgePrompt: "Now that you've felt how weights and thresholds interact, let's tackle the theory behind it.",
  },

  // Lesson 18: Learning Signal (backpropagation)
  18: {
    labKey: "NeuralNetLab",
    title: "Signal Propagation Lab",
    subtitle: "Experiment with how information flows forward through a neural network",
    steps: [
      {
        heading: "Observe the flow",
        body: "With default settings, follow the signal from the input nodes (left) through the hidden layer to the output. Green connections carry active signals.",
      },
      {
        heading: "Kill a signal",
        body: "Raise the threshold above the weight value. Notice how the output nodes go dark — this is how a network \"forgets\" to respond.",
      },
      {
        heading: "Think about learning",
        body: "Training adjusts weights so useful signals get through. If the output is wrong, the error travels backward to update weights — that's backpropagation.",
      },
    ],
    bridgePrompt: "Ready to test your understanding of learning signals and backpropagation?",
  },

  // Lesson 21: Springs & Oscillation
  21: {
    labKey: "SpringLab",
    title: "Spring Physics Lab",
    subtitle: "Explore how spring stiffness and displacement affect force and energy",
    steps: [
      {
        heading: "Stretch the spring",
        body: "Move the displacement slider to the right. Watch how the restoring force arrow (in amber) grows — this is Hooke's Law: F = −kx.",
      },
      {
        heading: "Change the stiffness",
        body: "Now adjust the spring constant k. A stiffer spring (high k) generates much more force for the same displacement. Does the PE bar grow faster?",
      },
      {
        heading: "Energy transfer",
        body: "At maximum displacement, PE is highest and KE is zero (momentarily stopped). At equilibrium, PE is zero and KE is maximum. Energy is conserved throughout.",
      },
    ],
    bridgePrompt: "You've felt Hooke's Law and seen energy conservation. Now let's put numbers to it.",
  },
};
