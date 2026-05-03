import DiagramaticsInteractive, { type DiagramaticsSetup } from "./DiagramaticsInteractive";

const setup: DiagramaticsSetup = (int, lib) => {
  const {
    V2, rectangle, circle, text, line, diagram_combine,
    draw_to_svg_element,
  } = lib;

  const W = 520, H = 260;
  const GRID = 10;

  int.draw_function = (inp) => {
    const pA = Math.round(inp["P(A)"] ?? 4);
    const pB = Math.round(inp["P(B)"] ?? 6);

    const svg = int.get_diagram_svg();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const gridSize = 18;
    const gap = 1;
    const originX = 20;
    const originY = 20;

    const cells = [];
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const inA = col < pA;
        const inB = row < pB;
        const inBoth = inA && inB;

        let color = "#e2e8f0"; // neither
        if (inBoth) color = "#6366f1"; // A AND B
        else if (inA) color = "#a5b4fc"; // A only
        else if (inB) color = "#c7d2fe"; // B only

        cells.push(
          rectangle(gridSize - gap, gridSize - gap)
            .fill(color)
            .stroke("none")
            .translate(V2(originX + col * gridSize + gridSize / 2, originY + row * gridSize + gridSize / 2))
        );
      }
    }

    // Labels
    const labelA = text(`P(A) = ${pA}/10`).fill("#4f46e5")
      .translate(V2(originX + pA * gridSize / 2 + 5, originY + GRID * gridSize + 20));
    const labelB = text(`P(B) = ${pB}/10`).fill("#818cf8")
      .translate(V2(originX + GRID * gridSize + 30, originY + pB * gridSize / 2));

    const andProb = pA * pB;
    const labelAnd = text(`P(A∩B) = ${pA}×${pB}/100 = ${andProb}%`).fill("#6366f1")
      .translate(V2(330, 80));

    const legendBoth = rectangle(14, 14).fill("#6366f1").stroke("none").translate(V2(330, 115));
    const legendBothText = text("A AND B").fill("#6366f1").translate(V2(350, 116));
    const legendA = rectangle(14, 14).fill("#a5b4fc").stroke("none").translate(V2(330, 135));
    const legendAText = text("A only").fill("#a5b4fc").translate(V2(350, 136));
    const legendB = rectangle(14, 14).fill("#c7d2fe").stroke("none").translate(V2(330, 155));
    const legendBText = text("B only").fill("#c7d2fe").translate(V2(350, 156));
    const legendNeither = rectangle(14, 14).fill("#e2e8f0").stroke("none").translate(V2(330, 175));
    const legendNeitherText = text("Neither").fill("#94a3b8").translate(V2(350, 176));

    const title = text("Area Model of Probability").fill("#1e293b")
      .translate(V2(120, 240));

    const all = diagram_combine(
      ...cells,
      labelA, labelB, labelAnd,
      legendBoth, legendBothText,
      legendA, legendAText,
      legendB, legendBText,
      legendNeither, legendNeitherText,
      title,
    );

    draw_to_svg_element(svg, all);
  };

  int.slider("P(A)", 1, 10, 4, 1);
  int.slider("P(B)", 1, 10, 6, 1);
  int.draw();
};

export default function AreaModelLab() {
  return (
    <div className="w-full">
      <DiagramaticsInteractive setup={setup} />
    </div>
  );
}
