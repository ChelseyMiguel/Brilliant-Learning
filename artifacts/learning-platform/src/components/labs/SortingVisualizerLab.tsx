import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const BAR_COUNT = 16;
const MAX_VAL = 100;

type SortStep = {
  arr: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
};

function randomArray(): number[] {
  return Array.from({ length: BAR_COUNT }, () => Math.floor(Math.random() * 90) + 10);
}

function* bubbleSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: number[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      yield { arr: [...a], comparing: [j, j + 1], swapping: [], sorted: [...sorted] };
      if (a[j] > a[j + 1]) {
        yield { arr: [...a], comparing: [], swapping: [j, j + 1], sorted: [...sorted] };
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
    }
    sorted.push(a.length - 1 - i);
  }
  sorted.push(0);
  yield { arr: [...a], comparing: [], swapping: [], sorted: [...sorted] };
}

function* selectionSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: number[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      yield { arr: [...a], comparing: [minIdx, j], swapping: [], sorted: [...sorted] };
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      yield { arr: [...a], comparing: [], swapping: [i, minIdx], sorted: [...sorted] };
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
    sorted.push(i);
  }
  sorted.push(a.length - 1);
  yield { arr: [...a], comparing: [], swapping: [], sorted: [...sorted] };
}

function* insertionSort(arr: number[]): Generator<SortStep> {
  const a = [...arr];
  const sorted: number[] = [0];
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      yield { arr: [...a], comparing: [j - 1, j], swapping: [], sorted: [...sorted] };
      if (a[j] < a[j - 1]) {
        yield { arr: [...a], comparing: [], swapping: [j - 1, j], sorted: [...sorted] };
        [a[j], a[j - 1]] = [a[j - 1], a[j]];
        j--;
      } else break;
    }
    sorted.push(i);
  }
  yield { arr: [...a], comparing: [], swapping: [], sorted: Array.from({ length: a.length }, (_, k) => k) };
}

type Algorithm = "bubble" | "selection" | "insertion";
const ALG_LABELS: Record<Algorithm, string> = {
  bubble: "Bubble Sort",
  selection: "Selection Sort",
  insertion: "Insertion Sort",
};

function computeSteps(alg: Algorithm, arr: number[]): SortStep[] {
  const gen =
    alg === "bubble" ? bubbleSort(arr) :
    alg === "selection" ? selectionSort(arr) :
    insertionSort(arr);
  const steps: SortStep[] = [];
  for (const step of gen) steps.push(step);
  return steps;
}

export default function SortingVisualizerLab() {
  const [baseArr] = useState<number[]>(randomArray);
  const [currentArr, setCurrentArr] = useState<number[]>(randomArray);
  const [algorithm, setAlgorithm] = useState<Algorithm>("bubble");
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepsRef = useRef<SortStep[]>([]);
  const stepIdxRef = useRef(0);

  const currentStep: SortStep = steps[stepIdx] ?? { arr: currentArr, comparing: [], swapping: [], sorted: [] };

  const speedMs = [500, 250, 120, 60, 20][speed - 1];

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopInterval();
    setPlaying(false);
    const arr = randomArray();
    setCurrentArr(arr);
    const newSteps = computeSteps(algorithm, arr);
    setSteps(newSteps);
    stepsRef.current = newSteps;
    setStepIdx(0);
    stepIdxRef.current = 0;
  }, [algorithm, stopInterval]);

  // Recompute steps when algorithm changes
  useEffect(() => {
    stopInterval();
    setPlaying(false);
    const newSteps = computeSteps(algorithm, currentArr);
    setSteps(newSteps);
    stepsRef.current = newSteps;
    setStepIdx(0);
    stepIdxRef.current = 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm]);

  useEffect(() => {
    const initial = randomArray();
    setCurrentArr(initial);
    const initSteps = computeSteps("bubble", initial);
    setSteps(initSteps);
    stepsRef.current = initSteps;
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      stopInterval();
      setPlaying(false);
    } else {
      if (stepIdxRef.current >= stepsRef.current.length - 1) {
        stepIdxRef.current = 0;
        setStepIdx(0);
      }
      setPlaying(true);
      intervalRef.current = setInterval(() => {
        const next = stepIdxRef.current + 1;
        if (next >= stepsRef.current.length) {
          stopInterval();
          setPlaying(false);
        } else {
          stepIdxRef.current = next;
          setStepIdx(next);
        }
      }, speedMs);
    }
  }, [playing, speedMs, stopInterval]);

  // Restart interval when speed changes while playing
  useEffect(() => {
    if (playing) {
      stopInterval();
      intervalRef.current = setInterval(() => {
        const next = stepIdxRef.current + 1;
        if (next >= stepsRef.current.length) {
          stopInterval();
          setPlaying(false);
        } else {
          stepIdxRef.current = next;
          setStepIdx(next);
        }
      }, speedMs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speedMs]);

  useEffect(() => () => stopInterval(), [stopInterval]);

  const barColor = (i: number) => {
    if (currentStep.sorted.includes(i)) return "#58cc02";
    if (currentStep.swapping.includes(i)) return "#fb7185";
    if (currentStep.comparing.includes(i)) return "#fbbf24";
    return "#4f46e5";
  };

  return (
    <div className="flex flex-col gap-5 p-5 select-none">
      {/* Algorithm selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        {(Object.keys(ALG_LABELS) as Algorithm[]).map((alg) => (
          <button
            key={alg}
            onClick={() => { if (!playing) setAlgorithm(alg); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              algorithm === alg
                ? "bg-[#4f46e5] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {ALG_LABELS[alg]}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-center gap-1 h-44 px-2">
        {currentStep.arr.map((val, i) => (
          <div
            key={i}
            className="flex-1 rounded-t transition-all duration-75"
            style={{
              height: `${(val / MAX_VAL) * 160}px`,
              backgroundColor: barColor(i),
              maxWidth: "28px",
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center flex-wrap text-xs">
        {[
          { color: "#4f46e5", label: "Unsorted" },
          { color: "#fbbf24", label: "Comparing" },
          { color: "#fb7185", label: "Swapping" },
          { color: "#58cc02", label: "Sorted" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Step counter */}
      <p className="text-center text-sm font-mono text-gray-500">
        Step {stepIdx} / {steps.length > 0 ? steps.length - 1 : 0}
      </p>

      {/* Speed slider */}
      <div className="flex items-center gap-3 max-w-xs mx-auto w-full">
        <span className="text-xs text-gray-400 w-8">Slow</span>
        <input
          type="range"
          min={1}
          max={5}
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
          className="flex-1"
          style={{ accentColor: "#4f46e5" }}
        />
        <span className="text-xs text-gray-400 w-8">Fast</span>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={togglePlay}
          className="h-10 px-6 rounded-full bg-[#4f46e5] text-white font-bold text-sm flex items-center gap-2"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        Watch amber bars (comparing) and red bars (swapping). Green means sorted in place.
        Reset shuffles a new random array.
      </p>
    </div>
  );
}
