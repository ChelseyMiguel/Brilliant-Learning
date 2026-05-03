import DiagramaticsInteractive, { type DiagramaticsSetup } from "./DiagramaticsInteractive";

const setup: DiagramaticsSetup = (int, lib) => {
  const {
    V2, rectangle, circle, text, line, diagram_combine,
    mechanics, draw_to_svg_element,
  } = lib;

  const W = 520, H = 260;
  const wallX = 30;
  const equilibriumX = 200;
  const massW = 36;
  const massY = H / 2;
  const omega = 1.5;
  const TWO_PI = 2 * Math.PI;
  const period = TWO_PI / omega;

  int.draw_function = (inp) => {
    const k = inp["k"] ?? 50;
    const amplitude = inp["amplitude"] ?? 60;
    const t = inp["t"] ?? 0;

    // Oscillation physics: x(t) = A·cos(ωt), v(t) = -Aω·sin(ωt)
    const displacement = amplitude * Math.cos(omega * t);
    const velocity = -amplitude * omega * Math.sin(omega * t);
    const massX = equilibriumX + displacement;

    const svg = int.get_diagram_svg();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const wall = rectangle(12, 180)
      .fill("#e2e8f0").stroke("#94a3b8").strokewidth(1)
      .translate(V2(wallX, massY));
    const floor = line(V2(wallX, massY + 90), V2(W - 10, massY + 90))
      .stroke("#e2e8f0").strokewidth(2);

    // Spring coil
    const p1 = V2(wallX + 6, massY);
    const p2 = V2(massX - massW / 2, massY);
    const spring = mechanics.spring(p1, p2, 7, 10, 1.2)
      .stroke("#6366f1").strokewidth(2.5).fill("none");

    // Mass block
    const mass = rectangle(massW, massW)
      .fill("#6366f1").stroke("none")
      .translate(V2(massX, massY));
    const massLabel = text("m").fill("white").translate(V2(massX, massY));

    // Equilibrium line
    const eqLine = line(V2(equilibriumX, massY - 58), V2(equilibriumX, massY + 58))
      .stroke("#94a3b8").strokewidth(1).strokedasharray([4, 3]);
    const eqLabel = text("x=0").fill("#94a3b8")
      .translate(V2(equilibriumX, massY + 74));

    // Restoring force arrow (F = -kx)
    const force = -(k / 50) * displacement;
    const arrowLen = Math.min(Math.abs(force) * 1.4, 65);
    const arrowDir = force >= 0 ? 1 : -1;
    const ax1 = massX + massW / 2 + 5;
    const ax2 = ax1 + arrowDir * arrowLen;
    const forceArrow = line(V2(ax1, massY - 6), V2(ax2, massY - 6))
      .stroke("#f59e0b").strokewidth(2.5);
    const arrowDot = circle(4).fill("#f59e0b").stroke("none")
      .translate(V2(ax2, massY - 6));
    const forceLabel = text(`F=${force.toFixed(0)}`)
      .fill("#f59e0b")
      .translate(V2(ax2 + (arrowDir > 0 ? 16 : -18), massY - 6));

    // Velocity indicator
    const velColor = velocity > 0 ? "#6366f1" : "#ec4899";
    const velLen = Math.min(Math.abs(velocity) * 0.7, 50);
    const velDir = velocity >= 0 ? 1 : -1;
    const vx2 = massX + velDir * velLen;
    const velArrow = velocity !== 0
      ? line(V2(massX, massY + 8), V2(vx2, massY + 8)).stroke(velColor).strokewidth(2)
      : lib.empty();
    const velDot = velocity !== 0
      ? circle(3).fill(velColor).stroke("none").translate(V2(vx2, massY + 8))
      : lib.empty();

    // Energy bars (normalized to max PE)
    const maxPE = 0.5 * (k / 50) * amplitude * amplitude;
    const pe = 0.5 * (k / 50) * displacement * displacement;
    const ke = maxPE - pe;
    const barMax = 90;
    const peWidth = maxPE > 0 ? (pe / maxPE) * barMax : 0;
    const keWidth = maxPE > 0 ? (ke / maxPE) * barMax : 0;

    const barBg = (y: number) =>
      rectangle(barMax, 9).fill("#f1f5f9").stroke("none")
        .move_origin("center-left").translate(V2(380, y));
    const peBar = rectangle(Math.max(2, peWidth), 9)
      .fill("#f59e0b").stroke("none")
      .move_origin("center-left").translate(V2(380, massY - 28));
    const keBar = rectangle(Math.max(2, keWidth), 9)
      .fill("#10b981").stroke("none")
      .move_origin("center-left").translate(V2(380, massY - 11));

    const peLabel = text("PE").fill("#f59e0b").translate(V2(370, massY - 27));
    const keLabel = text("KE").fill("#10b981").translate(V2(370, massY - 10));
    const peVal = text(`${pe.toFixed(0)}J`).fill("#f59e0b")
      .translate(V2(380 + barMax + 8, massY - 27));
    const keVal = text(`${ke.toFixed(0)}J`).fill("#10b981")
      .translate(V2(380 + barMax + 8, massY - 10));

    // Parameters
    const kText = text(`k = ${k} N/m  |  A = ${amplitude}`)
      .fill("#64748b").translate(V2(W / 2 + 10, 20));

    const all = diagram_combine(
      floor, wall,
      barBg(massY - 28), barBg(massY - 11),
      peBar, keBar, peLabel, keLabel, peVal, keVal,
      eqLine, eqLabel,
      spring, mass, massLabel,
      forceArrow, arrowDot, forceLabel,
      velArrow, velDot,
      kText,
    );

    draw_to_svg_element(svg, all);
  };

  int.slider("k", 10, 150, 50, 5);
  int.slider("amplitude", 10, 80, 55, 1);
  int.slider("t", 0, TWO_PI, 0, 0.05, 2);
  int.draw();
};

export default function SpringLab() {
  return (
    <div className="w-full">
      <DiagramaticsInteractive setup={setup} />
    </div>
  );
}
