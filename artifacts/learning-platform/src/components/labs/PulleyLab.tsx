import DiagramaticsInteractive, { type DiagramaticsSetup } from "./DiagramaticsInteractive";

/**
 * Pulley Lab - single fixed pulley using Diagramatics y-up Cartesian coordinates.
 * Diagramatics negates y when rendering (point.y = -p.y), so positive y = visual top.
 * Origin (0,0) is centred; the library auto-fits content via getBBox().
 *
 * Layout (y-up):
 *   Ceiling: y ≈ 115–130  (top of display)
 *   Mount rod: y = 105 → 85
 *   Pulley:    y ≈ 70 (center of wheel)
 *   Ropes:     from y=70 downward (decreasing y)
 *   Effort:    starts at y=-20, descends to y=-140
 *   Load:      starts at y=-20, rises to y=+100 (1:1 single fixed pulley)
 */
const setup: DiagramaticsSetup = (int, lib) => {
  const {
    V2, rectangle, circle, line, text,
    diagram_combine, draw_to_svg_element,
  } = lib;

  // Structural constants (y-up Cartesian, centered at 0,0)
  const ceilingTop = 130;
  const ceilingBot = 115;
  const pulleyY    = 70;
  const pulleyR    = 18;
  const effortX    = -70;
  const loadX      = 70;
  const restY      = -20;   // starting y of effort handle and load block
  const maxDrop    = 100;   // maximum effort drop (slider range 0 → 100)

  int.draw_function = (inp: Record<string, any>) => {
    const drop: number = Math.max(0, Math.min(maxDrop, inp["pull"] ?? 0));

    const effortY = restY - drop;         // effort goes DOWN (decreasing y)
    const loadY   = restY + drop;         // load rises UP (increasing y)
    const ropeY   = pulleyY - pulleyR;    // where rope meets the pulley rim

    const svg = int.get_diagram_svg();
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // ── Ceiling ────────────────────────────────────────────────────────────
    const ceilingRect = rectangle(200, ceilingTop - ceilingBot)
      .fill("#e2e8f0").stroke("none")
      .move_origin("bottom-center").translate(V2(0, ceilingTop));

    const hatchLines = Array.from({ length: 7 }, (_, i) =>
      line(
        V2(-90 + i * 30, ceilingBot),
        V2(-105 + i * 30, ceilingTop)
      ).stroke("#cbd5e1").strokewidth(1.5)
    );

    const ceilingEdge = line(V2(-100, ceilingBot), V2(100, ceilingBot))
      .stroke("#94a3b8").strokewidth(2);

    // Mount rod from ceiling to pulley top
    const mountRod = line(
      V2(0, ceilingBot),
      V2(0, pulleyY + pulleyR)
    ).stroke("#94a3b8").strokewidth(3);

    // ── Pulley ─────────────────────────────────────────────────────────────
    const pulleyOuter = circle(pulleyR)
      .fill("white").stroke("#64748b").strokewidth(2.5)
      .translate(V2(0, pulleyY));
    const pulleyInner = circle(pulleyR - 5)
      .fill("none").stroke("#e2e8f0").strokewidth(1.5)
      .translate(V2(0, pulleyY));
    const pulleyHub = circle(4)
      .fill("#64748b").stroke("none")
      .translate(V2(0, pulleyY));

    // ── Ropes ──────────────────────────────────────────────────────────────
    const topRope = line(V2(effortX, ropeY), V2(loadX, ropeY))
      .stroke("#92400e").strokewidth(2.5);
    const effortRope = line(V2(effortX, ropeY), V2(effortX, effortY))
      .stroke("#92400e").strokewidth(2.5);
    const loadRope   = line(V2(loadX, ropeY), V2(loadX, loadY))
      .stroke("#92400e").strokewidth(2.5);

    // ── Effort handle ──────────────────────────────────────────────────────
    const hand = circle(16)
      .fill("#4f46e5").stroke("white").strokewidth(2.5)
      .translate(V2(effortX, effortY));
    const handLabel = text("F")
      .fill("white")
      .translate(V2(effortX, effortY));

    // ── Load block ─────────────────────────────────────────────────────────
    const blockH = 30;
    const loadBlock = rectangle(40, blockH)
      .fill("#f59e0b").stroke("none")
      .move_origin("bottom-center")
      .translate(V2(loadX, loadY));
    const loadLbl = text("Load")
      .fill("white")
      .translate(V2(loadX, loadY - blockH / 2));

    // ── Displacement arrows/annotations ───────────────────────────────────
    const effortAnnot = drop > 5
      ? line(V2(effortX - 26, restY), V2(effortX - 26, effortY))
          .stroke("#6366f1").strokewidth(1.5).strokedasharray([3, 2])
      : lib.empty();
    const effortAnnotDot = drop > 5
      ? circle(3).fill("#6366f1").stroke("none").translate(V2(effortX - 26, effortY))
      : lib.empty();
    const effortAnnotLbl = drop > 14
      ? text(`${Math.round(drop)}`).fill("#6366f1")
          .translate(V2(effortX - 38, restY - drop / 2))
      : lib.empty();

    const loadAnnot = drop > 5
      ? line(V2(loadX + 28, restY), V2(loadX + 28, loadY))
          .stroke("#f59e0b").strokewidth(1.5).strokedasharray([3, 2])
      : lib.empty();
    const loadAnnotDot = drop > 5
      ? circle(3).fill("#f59e0b").stroke("none").translate(V2(loadX + 28, loadY))
      : lib.empty();
    const loadAnnotLbl = drop > 14
      ? text(`${Math.round(drop)}`).fill("#f59e0b")
          .translate(V2(loadX + 38, restY + drop / 2))
      : lib.empty();

    // ── Bottom label ───────────────────────────────────────────────────────
    const caption = text(
      drop > 5
        ? `Pulled ${Math.round(drop)} → Load rose ${Math.round(drop)}  |  F = F`
        : "Drag the slider - pull the rope and watch the load rise"
    ).fill("#64748b").translate(V2(0, -130));

    const all = diagram_combine(
      ceilingRect, ...hatchLines, ceilingEdge,
      mountRod,
      topRope, effortRope, loadRope,
      pulleyInner, pulleyOuter, pulleyHub,
      hand, handLabel,
      loadBlock, loadLbl,
      effortAnnot, effortAnnotDot, effortAnnotLbl,
      loadAnnot, loadAnnotDot, loadAnnotLbl,
      caption,
    );

    draw_to_svg_element(svg, all);
  };

  int.slider("pull", 0, maxDrop, 0, 1);
  int.draw();
};

export default function PulleyLab() {
  return (
    <div className="w-full">
      <DiagramaticsInteractive setup={setup} />
    </div>
  );
}
