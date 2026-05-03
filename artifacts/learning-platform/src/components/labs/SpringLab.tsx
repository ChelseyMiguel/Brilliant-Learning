import DiagramaticsInteractive, { type DiagramaticsSetup } from "./DiagramaticsInteractive";

const setup: DiagramaticsSetup = (int, lib) => {
  const {
    V2, rectangle, circle, text, line, diagram_combine,
    mechanics, draw_to_svg_element, arc,
  } = lib;

  const W = 500, H = 260;

  int.draw_function = (inp) => {
    const k = inp["k"] ?? 50;
    const x = inp["x"] ?? 80;

    const svg = int.get_diagram_svg();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Wall on left
    const wallX = 30;
    const equilibriumX = 200;
    const massX = equilibriumX + x * 1.2;
    const massW = 40;
    const massY = H / 2;

    const wall = rectangle(12, 180).fill("#e2e8f0").stroke("#94a3b8").strokewidth(1)
      .translate(V2(wallX, massY));
    const floor = line(V2(wallX, massY + 90), V2(W - 20, massY + 90)).stroke("#e2e8f0").strokewidth(2);

    // Spring
    const p1 = V2(wallX + 6, massY);
    const p2 = V2(massX - massW / 2, massY);
    const spring = mechanics.spring(p1, p2, 8, 10, 1.2).stroke("#6366f1").strokewidth(2.5).fill("none");

    // Mass block
    const mass = rectangle(massW, massW).fill("#6366f1").stroke("none")
      .translate(V2(massX, massY));
    const massLabel = text("m").fill("white").translate(V2(massX, massY));

    // Equilibrium dashed line
    const eqLine = line(V2(equilibriumX, massY - 55), V2(equilibriumX, massY + 55))
      .stroke("#94a3b8").strokewidth(1).strokedasharray([4, 3]);
    const eqLabel = text("eq.").fill("#94a3b8").translate(V2(equilibriumX, massY + 70));

    // Force arrow
    const forceVal = -(k / 50) * x;
    const arrowLen = Math.min(Math.abs(forceVal) * 1.5, 60);
    const arrowDir = forceVal >= 0 ? 1 : -1;
    const arrowX1 = massX + massW / 2 + 6;
    const arrowX2 = arrowX1 + arrowDir * arrowLen;
    const forceArrow = line(V2(arrowX1, massY), V2(arrowX2, massY))
      .stroke("#f59e0b").strokewidth(3);
    const arrowTip = circle(4).fill("#f59e0b").stroke("none")
      .translate(V2(arrowX2, massY));
    const forceLabel = text(`F = ${forceVal.toFixed(0)}N`).fill("#f59e0b")
      .translate(V2(arrowX2 + (arrowDir > 0 ? 18 : -20), massY));

    // Energy display
    const pe = (0.5 * k * (x / 80) * (x / 80) * 100).toFixed(0);
    const ke_approx = Math.max(0, 50 - parseInt(pe));
    const peBar = rectangle(Math.min(90, parseInt(pe) * 0.9), 10)
      .fill("#f59e0b").stroke("none")
      .move_origin("center-left")
      .translate(V2(370, massY - 28));
    const keBal = rectangle(Math.min(90, ke_approx * 0.9), 10)
      .fill("#10b981").stroke("none")
      .move_origin("center-left")
      .translate(V2(370, massY - 10));
    const peLabel = text("PE").fill("#f59e0b").translate(V2(360, massY - 27));
    const keLabel = text("KE").fill("#10b981").translate(V2(360, massY - 9));

    // k label
    const kText = text(`k = ${k} N/m`).fill("#475569")
      .translate(V2(W / 2, massY - 85));
    const xText = text(`displacement = ${x.toFixed(0)} units`).fill("#475569")
      .translate(V2(W / 2, massY - 68));

    const all = diagram_combine(
      floor, wall, eqLine, eqLabel,
      spring, mass, massLabel,
      forceArrow, arrowTip, forceLabel,
      peBar, keBal, peLabel, keLabel,
      kText, xText,
    );

    draw_to_svg_element(svg, all);
  };

  int.slider("k", 10, 150, 50, 5);
  int.slider("x", -80, 80, 40, 1);
  int.draw();
};

export default function SpringLab() {
  return (
    <div className="w-full">
      <DiagramaticsInteractive setup={setup} />
    </div>
  );
}
