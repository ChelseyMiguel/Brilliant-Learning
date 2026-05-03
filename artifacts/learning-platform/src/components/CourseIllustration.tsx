// SVG course illustrations inspired by Brilliant.org's card style

interface Props {
  category: string;
  iconColor: string;
  size?: number;
}

export default function CourseIllustration({ category, iconColor, size = 120 }: Props) {
  const cat = category.toLowerCase();

  if (cat === "math" || cat.includes("probability") || cat.includes("geometry")) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <rect width="120" height="120" rx="12" fill={iconColor + "15"} />
        {/* Probability grid */}
        <g opacity="0.6">
          {Array.from({ length: 5 }, (_, r) =>
            Array.from({ length: 5 }, (_, c) => (
              <rect key={`${r}-${c}`} x={20 + c * 16} y={20 + r * 16} width={13} height={13} rx={2}
                fill={(r + c) % 3 === 0 ? iconColor : iconColor + "30"} />
            ))
          )}
        </g>
        {/* Coin */}
        <circle cx={85} cy={85} r={18} fill={iconColor} opacity={0.9} />
        <circle cx={85} cy={85} r={14} fill="none" stroke="white" strokeWidth={1.5} opacity={0.6} />
        <text x="85" y="90" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">H</text>
        {/* Curve */}
        <path d="M 20 90 Q 50 60 80 75" stroke={iconColor} strokeWidth={2.5} strokeDasharray="4 3" fill="none" opacity={0.5} />
      </svg>
    );
  }

  if (cat.includes("logic") || cat.includes("critical")) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <rect width="120" height="120" rx="12" fill={iconColor + "15"} />
        {/* Logic gates */}
        <rect x="15" y="35" width="22" height="12" rx="3" fill={iconColor} opacity={0.8} />
        <rect x="15" y="73" width="22" height="12" rx="3" fill={iconColor} opacity={0.8} />
        {/* AND gate shape */}
        <path d="M 52 28 L 52 92 L 72 92 Q 98 92 98 60 Q 98 28 72 28 Z" fill={iconColor + "20"} stroke={iconColor} strokeWidth={2.5} />
        {/* Wires */}
        <line x1="37" y1="41" x2="52" y2="41" stroke={iconColor} strokeWidth={2} />
        <line x1="37" y1="79" x2="52" y2="79" stroke={iconColor} strokeWidth={2} />
        <line x1="98" y1="60" x2="110" y2="60" stroke={iconColor} strokeWidth={2.5} />
        <text x="75" y="64" textAnchor="middle" fontSize="10" fill={iconColor} fontWeight="bold">AND</text>
        {/* True/False badges */}
        <circle cx="26" cy="41" r="5" fill="hsl(150, 70%, 40%)" />
        <circle cx="26" cy="79" r="5" fill="hsl(150, 70%, 40%)" />
      </svg>
    );
  }

  if (cat.includes("computer") || cat.includes("algorithm") || cat.includes("data structures")) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <rect width="120" height="120" rx="12" fill={iconColor + "15"} />
        {/* Binary tree */}
        {/* Root */}
        <circle cx="60" cy="22" r="12" fill={iconColor} />
        <text x="60" y="26" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">1</text>
        {/* Level 2 */}
        <circle cx="30" cy="55" r="10" fill={iconColor} opacity={0.8} />
        <text x="30" y="59" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">2</text>
        <circle cx="90" cy="55" r="10" fill={iconColor} opacity={0.8} />
        <text x="90" y="59" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">3</text>
        {/* Level 3 */}
        <circle cx="15" cy="88" r="8" fill={iconColor} opacity={0.6} />
        <text x="15" y="92" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">4</text>
        <circle cx="45" cy="88" r="8" fill={iconColor} opacity={0.6} />
        <text x="45" y="92" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">5</text>
        <circle cx="75" cy="88" r="8" fill={iconColor} opacity={0.6} />
        <text x="75" y="92" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">6</text>
        <circle cx="105" cy="88" r="8" fill={iconColor} opacity={0.6} />
        <text x="105" y="92" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">7</text>
        {/* Edges */}
        <line x1="50" y1="30" x2="37" y2="46" stroke={iconColor} strokeWidth={2} opacity={0.5} />
        <line x1="70" y1="30" x2="83" y2="46" stroke={iconColor} strokeWidth={2} opacity={0.5} />
        <line x1="22" y1="63" x2="17" y2="81" stroke={iconColor} strokeWidth={1.5} opacity={0.4} />
        <line x1="38" y1="63" x2="43" y2="81" stroke={iconColor} strokeWidth={1.5} opacity={0.4} />
        <line x1="82" y1="63" x2="77" y2="81" stroke={iconColor} strokeWidth={1.5} opacity={0.4} />
        <line x1="98" y1="63" x2="103" y2="81" stroke={iconColor} strokeWidth={1.5} opacity={0.4} />
      </svg>
    );
  }

  if (cat.includes("neural") || cat.includes("ai") || cat.includes("machine")) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <rect width="120" height="120" rx="12" fill={iconColor + "15"} />
        {/* 3-layer neural net */}
        {[[20, [30, 60, 90]], [60, [20, 50, 80, 100]], [100, [40, 80]]].map(([x, ys]: any, li) =>
          (ys as number[]).map((y: number, ni: number) => (
            <circle key={`${li}-${ni}`} cx={x} cy={y} r={li === 0 ? 10 : li === 1 ? 9 : 10}
              fill={li === 0 ? iconColor : li === 2 ? "hsl(150, 70%, 40%)" : "white"}
              stroke={iconColor} strokeWidth={li === 1 ? 2 : 0} opacity={0.9} />
          ))
        )}
        {/* Connections layer 0→1 */}
        {[30, 60, 90].flatMap(fy => [20, 50, 80, 100].map(ty => (
          <line key={`${fy}-${ty}`} x1={30} y1={fy} x2={51} y2={ty} stroke={iconColor} strokeWidth={0.8} opacity={0.2} />
        )))}
        {/* Connections layer 1→2 */}
        {[20, 50, 80, 100].flatMap(fy => [40, 80].map(ty => (
          <line key={`h${fy}-${ty}`} x1={69} y1={fy} x2={90} y2={ty} stroke={iconColor} strokeWidth={0.8} opacity={0.25} />
        )))}
        {/* Pulse dot */}
        <circle cx="60" cy="50" r="5" fill={iconColor} opacity={0.9}>
          <animate attributeName="cx" values="20;60;100;60;20" dur="2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="60;50;40;80;60" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  if (cat.includes("physics")) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <rect width="120" height="120" rx="12" fill={iconColor + "15"} />
        {/* Spring-mass system */}
        <rect x="0" y="50" width="12" height="60" fill={iconColor + "30"} />
        <line x1="12" y1="50" x2="12" y2="110" stroke={iconColor} strokeWidth={1.5} opacity={0.4} />
        {/* Spring coils */}
        <path d="M 12 75 C 22 65 32 85 42 75 C 52 65 62 85 72 75" stroke={iconColor} strokeWidth={2.5} fill="none" />
        {/* Mass block */}
        <rect x="72" y="60" width="28" height="30" rx="5" fill={iconColor} opacity={0.9} />
        <text x="86" y="80" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">m</text>
        {/* Equilibrium line */}
        <line x1="60" y1="45" x2="60" y2="110" stroke={iconColor} strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />
        {/* Sine wave */}
        <path d="M 15 30 Q 28 15 41 30 Q 54 45 67 30 Q 80 15 93 30 Q 106 45 119 30"
          stroke={iconColor} strokeWidth={2} fill="none" opacity={0.5} />
        {/* Arrow */}
        <path d="M 100 65 L 110 65 M 106 60 L 112 65 L 106 70" stroke={iconColor} strokeWidth={2} fill="none" opacity={0.7} />
        <text x="108" y="85" textAnchor="middle" fontSize="9" fill={iconColor} opacity={0.7}>F</text>
      </svg>
    );
  }

  if (cat.includes("data")) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <rect width="120" height="120" rx="12" fill={iconColor + "15"} />
        {/* Bar chart */}
        {[
          { x: 15, h: 45, o: 0.5 }, { x: 35, h: 65, o: 0.65 }, { x: 55, h: 40, o: 0.45 },
          { x: 75, h: 80, o: 0.85 }, { x: 95, h: 55, o: 0.6 }
        ].map((bar, i) => (
          <rect key={i} x={bar.x} y={105 - bar.h} width={16} height={bar.h} rx={3}
            fill={iconColor} opacity={bar.o} />
        ))}
        <line x1="10" y1="105" x2="115" y2="105" stroke={iconColor} strokeWidth={2} opacity={0.4} />
        {/* Normal curve overlay */}
        <path d="M 15 104 Q 35 40 55 30 Q 75 20 95 40 Q 110 60 115 104"
          stroke={iconColor} strokeWidth={2} fill="none" opacity={0.6} />
        {/* Data points */}
        <circle cx="40" cy="70" r="4" fill="white" stroke={iconColor} strokeWidth={2} />
        <circle cx="65" cy="45" r="4" fill="white" stroke={iconColor} strokeWidth={2} />
        <circle cx="90" cy="58" r="4" fill="white" stroke={iconColor} strokeWidth={2} />
      </svg>
    );
  }

  // Default fallback
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect width="120" height="120" rx="12" fill={iconColor + "15"} />
      <circle cx="60" cy="60" r="30" fill={iconColor + "30"} />
      <circle cx="60" cy="60" r="18" fill={iconColor} opacity={0.8} />
    </svg>
  );
}
