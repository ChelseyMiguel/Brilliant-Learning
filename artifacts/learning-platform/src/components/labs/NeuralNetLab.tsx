import DiagramaticsInteractive, { type DiagramaticsSetup } from "./DiagramaticsInteractive";

const setup: DiagramaticsSetup = (int, lib) => {
  const {
    V2, circle, text, line, diagram_combine,
    draw_to_svg_element, rectangle,
  } = lib;

  const W = 520, H = 280;

  const LAYERS = [
    [V2(60, 90), V2(60, 160), V2(60, 230)],
    [V2(200, 70), V2(200, 140), V2(200, 210)],
    [V2(340, 115), V2(340, 205)],
  ];

  int.draw_function = (inp) => {
    const w01 = (inp["weight 1→2"] ?? 0.7);
    const threshold = (inp["threshold"] ?? 0.5);

    const svg = int.get_diagram_svg();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Compute weighted sums for layer 1→2
    const inputs = [1, 0, 1]; // fixed demo inputs
    const hiddenSums = LAYERS[1].map((_, j) => {
      return inputs.reduce((sum, inp_val, i) => sum + inp_val * w01, 0) / 3;
    });
    const hiddenActivated = hiddenSums.map(s => s >= threshold ? 1 : 0);
    const outputSums = LAYERS[2].map((_, k) => {
      return hiddenActivated.reduce((sum, h) => sum + h * w01, 0) / LAYERS[1].length;
    });
    const outputActivated = outputSums.map(s => s >= threshold ? 1 : 0);

    // Draw connections
    const connections: any[] = [];
    LAYERS[0].forEach((from, fi) => {
      LAYERS[1].forEach((to, ti) => {
        const alpha = Math.abs(w01).toFixed(1);
        connections.push(
          line(from, to)
            .stroke(`rgba(99,102,241,${alpha})`)
            .strokewidth(Math.abs(w01) * 3 + 0.5)
        );
      });
    });
    LAYERS[1].forEach((from, fi) => {
      LAYERS[2].forEach((to, ti) => {
        const a = hiddenActivated[fi];
        connections.push(
          line(from, to)
            .stroke(a ? `rgba(16,185,129,0.8)` : `rgba(148,163,184,0.3)`)
            .strokewidth(a ? 2.5 : 1)
        );
      });
    });

    // Draw nodes
    const nodes: any[] = [];
    LAYERS[0].forEach((pos, i) => {
      const active = inputs[i] === 1;
      nodes.push(
        circle(16)
          .fill(active ? "#6366f1" : "white")
          .stroke("#6366f1").strokewidth(2)
          .translate(pos)
      );
      nodes.push(
        text(String(inputs[i])).fill(active ? "white" : "#6366f1")
          .translate(pos)
      );
    });
    LAYERS[1].forEach((pos, i) => {
      const active = hiddenActivated[i] === 1;
      nodes.push(
        circle(16)
          .fill(active ? "#10b981" : "white")
          .stroke(active ? "#10b981" : "#94a3b8").strokewidth(2)
          .translate(pos)
      );
      nodes.push(
        text(active ? "1" : "0").fill(active ? "white" : "#94a3b8")
          .translate(pos)
      );
    });
    LAYERS[2].forEach((pos, i) => {
      const active = outputActivated[i] === 1;
      nodes.push(
        circle(18)
          .fill(active ? "#f59e0b" : "white")
          .stroke("#f59e0b").strokewidth(2.5)
          .translate(pos)
      );
      nodes.push(
        text(active ? "ON" : "off").fill(active ? "white" : "#f59e0b")
          .translate(pos)
      );
    });

    // Layer labels
    const labels = [
      text("Input").fill("#94a3b8").translate(V2(60, 258)),
      text("Hidden").fill("#94a3b8").translate(V2(200, 258)),
      text("Output").fill("#94a3b8").translate(V2(340, 258)),
    ];

    // Stats
    const weightLabel = text(`Weight: ${w01.toFixed(2)}`).fill("#6366f1").translate(V2(430, 100));
    const threshLabel = text(`Threshold: ${threshold.toFixed(2)}`).fill("#94a3b8").translate(V2(430, 120));
    const activeHidden = hiddenActivated.filter(x => x === 1).length;
    const statLabel = text(`${activeHidden}/${LAYERS[1].length} hidden active`).fill("#10b981").translate(V2(430, 145));

    const all = diagram_combine(
      ...connections, ...nodes, ...labels,
      weightLabel, threshLabel, statLabel,
    );

    draw_to_svg_element(svg, all);
  };

  int.slider("weight 1→2", 0, 1, 0.7, 0.05);
  int.slider("threshold", 0.1, 1.0, 0.5, 0.05);
  int.draw();
};

export default function NeuralNetLab() {
  return (
    <div className="w-full">
      <DiagramaticsInteractive setup={setup} />
    </div>
  );
}
