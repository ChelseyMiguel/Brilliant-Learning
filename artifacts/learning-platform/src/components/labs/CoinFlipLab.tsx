import DiagramaticsInteractive, { type DiagramaticsSetup } from "./DiagramaticsInteractive";

const setup: DiagramaticsSetup = (int, lib) => {
  const {
    V2, rectangle, circle, text, line, diagram_combine,
    bar, draw_to_svg_element, range_inc, distribute_vertical_and_align,
    plotf, xyaxes, mechanics,
  } = lib;

  const WIDTH = 600;
  const HEIGHT = 280;
  const N_MAX = 200;

  // Generate flips upfront so they're stable across slider moves
  const flips = Array.from({ length: N_MAX }, () => Math.random() < 0.5 ? 1 : 0);

  int.draw_function = (inp) => {
    const n = Math.max(1, Math.round(inp["n"] ?? 10));
    const subset = flips.slice(0, n);
    const heads = subset.filter(x => x === 1).length;
    const proportion = heads / n;

    const svg = int.get_diagram_svg();
    svg.setAttribute("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // --- Left: Coin result chips ---
    const displayCount = Math.min(n, 20);
    const chips = Array.from({ length: displayCount }, (_, i) => {
      const isH = subset[i] === 1;
      const chip = circle(10)
        .fill(isH ? "#10b981" : "#94a3b8")
        .stroke("none")
        .translate(V2(-260 + (i % 10) * 26, i < 10 ? 60 : 90));
      return chip;
    });

    const ellipsis = n > 20
      ? text("...").fill("#64748b").translate(V2(-260 + 5 * 26, 110))
      : lib.empty();

    // Proportion text
    const propText = text(`${heads}/${n} = ${(proportion * 100).toFixed(1)}%`)
      .fill("#1e293b")
      .translate(V2(-200, 130));

    const hLabel = circle(8).fill("#10b981").stroke("none").translate(V2(-270, 150));
    const hLabelText = text("Heads").fill("#10b981").translate(V2(-252, 151));
    const tLabel = circle(8).fill("#94a3b8").stroke("none").translate(V2(-270, 168));
    const tLabelText = text("Tails").fill("#94a3b8").translate(V2(-252, 169));

    // --- Right: Convergence line chart ---
    // Compute running proportion
    const runningProps: [number, number][] = [];
    let h = 0;
    for (let i = 0; i < n; i++) {
      h += subset[i];
      runningProps.push([i + 1, h / (i + 1)]);
    }

    const chartX0 = 60, chartX1 = 280;
    const chartY0 = 30, chartY1 = 230;
    const cx = (x: number) => chartX0 + (x / n) * (chartX1 - chartX0);
    const cy = (y: number) => chartY0 + (1 - y) * (chartY1 - chartY0);

    // Axes
    const xAxis = line(V2(chartX0, chartY1), V2(chartX1, chartY1)).stroke("#cbd5e1").strokewidth(1);
    const yAxis = line(V2(chartX0, chartY0), V2(chartX0, chartY1)).stroke("#cbd5e1").strokewidth(1);
    const midLine = line(V2(chartX0, cy(0.5)), V2(chartX1, cy(0.5)))
      .stroke("#6366f1").strokewidth(1).strokedasharray([4, 4]);
    const midLabel = text("50%").fill("#6366f1").translate(V2(chartX0 - 20, cy(0.5)));
    const yLabel0 = text("0%").fill("#94a3b8").translate(V2(chartX0 - 22, chartY1));
    const yLabel100 = text("100%").fill("#94a3b8").translate(V2(chartX0 - 28, chartY0));
    const xLabelN = text(`${n}`).fill("#94a3b8").translate(V2(chartX1, chartY1 + 14));
    const chartTitle = text("Proportion of Heads").fill("#475569").translate(V2((chartX0 + chartX1) / 2, chartY0 - 14));

    // Line segments
    const lineSegs = [];
    for (let i = 1; i < runningProps.length; i++) {
      const [x0, y0] = runningProps[i - 1];
      const [x1, y1] = runningProps[i];
      lineSegs.push(
        line(V2(cx(x0), cy(y0)), V2(cx(x1), cy(y1)))
          .stroke("#f59e0b").strokewidth(2)
      );
    }

    // Current point
    const lastProp = runningProps[runningProps.length - 1];
    const currentDot = circle(5)
      .fill("#f59e0b")
      .stroke("white")
      .strokewidth(2)
      .translate(V2(cx(lastProp[0]), cy(lastProp[1])));

    const all = diagram_combine(
      ...chips, ellipsis,
      propText, hLabel, hLabelText, tLabel, tLabelText,
      xAxis, yAxis, midLine, midLabel, yLabel0, yLabel100, xLabelN, chartTitle,
      ...lineSegs, currentDot,
    );

    draw_to_svg_element(svg, all);
  };

  int.slider("n", 1, N_MAX, 10, 1);
  int.draw();
};

export default function CoinFlipLab() {
  return (
    <div className="w-full">
      <DiagramaticsInteractive setup={setup} />
    </div>
  );
}
