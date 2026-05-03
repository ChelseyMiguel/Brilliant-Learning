import { lazy, type ComponentType } from "react";

// Lesson ID → animation component mapping
export const LESSON_ANIMATIONS: Record<number, ReturnType<typeof lazy<ComponentType>>> = {
  1: lazy(() => import("./CoinFlipAnimation")),
  2: lazy(() => import("./CoinFlipAnimation")),
  14: lazy(() => import("./ProbabilityGridAnimation")),
  15: lazy(() => import("./MontyHallAnimation")),
  17: lazy(() => import("./NeuralNetAnimation")),
  18: lazy(() => import("./NeuralNetAnimation")),
  19: lazy(() => import("./NeuralNetAnimation")),
  21: lazy(() => import("./SpringAnimation")),
  22: lazy(() => import("./SpringAnimation")),
};
