import { useState, useEffect, useMemo, useCallback } from "react";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";

const NODE_R = 22;
const UNIT_W = 62;
const LEVEL_H = 86;
const PAD = 14;

interface TNode {
  id: number;
  n: number;
  x: number;
  y: number;
  children: TNode[];
}

interface Edge {
  id: string;
  fromId: number;
  toId: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Ev {
  type: "call" | "return";
  id: number;
  value?: number;
}

function buildTree(n: number, depth: number, counter: { v: number }): TNode {
  const node: TNode = { id: counter.v++, n, x: 0, y: depth * LEVEL_H, children: [] };
  if (n > 1) {
    node.children = [
      buildTree(n - 1, depth + 1, counter),
      buildTree(n - 2, depth + 1, counter),
    ];
  }
  return node;
}

function assignX(node: TNode, startX: number): number {
  if (!node.children.length) {
    node.x = startX + UNIT_W / 2;
    return startX + UNIT_W;
  }
  let cursor = startX;
  for (const c of node.children) cursor = assignX(c, cursor);
  node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
  return cursor;
}

function fibVal(n: number): number {
  return n <= 1 ? n : fibVal(n - 1) + fibVal(n - 2);
}

function getEvents(node: TNode): Ev[] {
  const out: Ev[] = [{ type: "call", id: node.id }];
  for (const c of node.children) out.push(...getEvents(c));
  if (node.children.length) out.push({ type: "return", id: node.id, value: fibVal(node.n) });
  return out;
}

function flatNodes(node: TNode): TNode[] {
  return [node, ...node.children.flatMap(flatNodes)];
}

function flatEdges(node: TNode): Edge[] {
  return node.children.flatMap((c) => [
    { id: `${node.id}-${c.id}`, fromId: node.id, toId: c.id, x1: node.x, y1: node.y, x2: c.x, y2: c.y },
    ...flatEdges(c),
  ]);
}

export default function RecursionTreeLab() {
  const [target, setTarget] = useState(4);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const { nodes, edges, events, svgW, svgH, nodeMap } = useMemo(() => {
    const counter = { v: 0 };
    const root = buildTree(target, 0, counter);
    const totalW = assignX(root, 0);
    const nodes = flatNodes(root);
    const edges = flatEdges(root);
    const events = getEvents(root);
    const maxY = Math.max(...nodes.map((n) => n.y));
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return { nodes, edges, events, svgW: totalW, svgH: maxY + NODE_R * 2.5, nodeMap };
  }, [target]);

  useEffect(() => { setStep(0); setPlaying(false); }, [target]);

  useEffect(() => {
    if (!playing) return;
    if (step >= events.length) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 520);
    return () => clearTimeout(t);
  }, [playing, step, events.length]);

  const nodeStates = useMemo(() => {
    const st: Map<number, { visible: boolean; returned: boolean; value?: number; fresh: boolean }> = new Map();
    for (const n of nodes) st.set(n.id, { visible: false, returned: false, fresh: false });
    for (let i = 0; i < step; i++) {
      const ev = events[i];
      const s = st.get(ev.id)!;
      if (ev.type === "call") {
        st.set(ev.id, { visible: true, returned: false, fresh: i === step - 1 });
      } else {
        st.set(ev.id, { visible: true, returned: true, value: ev.value, fresh: i === step - 1 });
      }
    }
    return st;
  }, [step, events, nodes]);

  const advance = useCallback(() => { if (step < events.length) setStep((s) => s + 1); }, [step, events.length]);
  const reset = useCallback(() => { setStep(0); setPlaying(false); }, []);

  const isDone = step >= events.length;
  const lastEv = step > 0 ? events[step - 1] : null;
  const lastNode = lastEv ? nodeMap.get(lastEv.id) : null;

  const statusMsg = !lastEv
    ? "Press Step or Auto Play to begin"
    : isDone
    ? `fib(${target}) = ${fibVal(target)}. Notice how many duplicate calls were made.`
    : lastEv.type === "call"
    ? `Call: fib(${lastNode?.n}) - waiting for result`
    : `Return: fib(${lastNode?.n}) = ${lastEv.value}`;

  return (
    <div className="flex flex-col gap-5 p-5 select-none">
      {/* Target selector */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Compute:</span>
        {[3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setTarget(n)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              target === n ? "bg-[#4f46e5] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            fib({n})
          </button>
        ))}
      </div>

      {/* SVG */}
      <div className="w-full overflow-x-auto rounded-xl bg-gray-50 border border-gray-100">
        <svg
          viewBox={`${-PAD} ${-PAD} ${svgW + PAD * 2} ${svgH + PAD * 2}`}
          className="w-full"
          style={{ minHeight: 160, maxHeight: 400 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Edges */}
          {edges.map((e) => {
            const show =
              (nodeStates.get(e.fromId)?.visible ?? false) &&
              (nodeStates.get(e.toId)?.visible ?? false);
            return (
              <line
                key={e.id}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke={show ? "#d1d5db" : "transparent"}
                strokeWidth={1.5}
                strokeDasharray={show ? "none" : "0"}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const st = nodeStates.get(node.id);
            if (!st?.visible) return null;

            const leafVal = node.n <= 1 ? node.n : undefined;
            const displayVal = st.returned ? st.value : leafVal;
            const isReturned = st.returned || node.n <= 1;
            const isFresh = st.fresh;

            const fill = isReturned ? "#dcfce7" : isFresh ? "#e0e7ff" : "#f9fafb";
            const stroke = isReturned ? "#22c55e" : isFresh ? "#4f46e5" : "#e5e7eb";
            const textFill = isReturned ? "#15803d" : isFresh ? "#4338ca" : "#6b7280";
            const strokeW = isFresh ? 2.5 : 1.5;

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                />
                <text
                  x={node.x}
                  y={node.y - (displayVal !== undefined ? 5 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9.5}
                  fontWeight="600"
                  fill={textFill}
                  fontFamily="ui-monospace, monospace"
                >
                  fib({node.n})
                </text>
                {displayVal !== undefined && (
                  <text
                    x={node.x}
                    y={node.y + 9}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fontWeight="700"
                    fill={textFill}
                  >
                    = {displayVal}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Status */}
      <p className="text-sm text-center text-gray-600 min-h-[1.25rem] font-medium px-2">
        {statusMsg}
      </p>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={isDone}
          className="h-10 px-6 rounded-full bg-[#4f46e5] text-white font-bold text-sm flex items-center gap-2 disabled:opacity-40 transition-opacity"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? "Pause" : "Auto Play"}
        </button>
        <button
          onClick={advance}
          disabled={isDone || playing}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
          title="Step"
        >
          <SkipForward className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#e0e7ff] border border-[#4f46e5] inline-block" />
          Current call
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#dcfce7] border border-[#22c55e] inline-block" />
          Returned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-50 border border-gray-200 inline-block" />
          Waiting
        </span>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-sm mx-auto">
        Notice the same subproblem (like fib(2)) being computed multiple times on separate branches - that's redundant work that memoization eliminates.
      </p>
    </div>
  );
}
