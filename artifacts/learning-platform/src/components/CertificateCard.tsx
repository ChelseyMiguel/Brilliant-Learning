import { useCallback } from "react";
import { Award, Download } from "lucide-react";

interface Props {
  courseName: string;
  learnerName: string;
  xpEarned: number;
  completedDate?: Date;
}

export default function CertificateCard({
  courseName,
  learnerName,
  xpEarned,
  completedDate,
}: Props) {
  const dateStr = (completedDate ?? new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownload = useCallback(() => {
    const W = 900;
    const H = 620;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, W, H);

    // Outer border
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    // Inner border
    ctx.strokeStyle = "#c7d2fe";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // Top bar
    ctx.fillStyle = "#4f46e5";
    ctx.fillRect(16, 16, W - 32, 80);

    // White circle in top bar
    ctx.beginPath();
    ctx.arc(65, 56, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // "LL" text in circle
    ctx.fillStyle = "#4f46e5";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LL", 65, 56);

    // "LUMINA LEARNING" in top bar
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("LUMINA LEARNING", 105, 56);

    // "CERTIFICATE OF COMPLETION"
    ctx.fillStyle = "#6366f1";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    // Simulate letter spacing by drawing char by char
    const certTitle = "C E R T I F I C A T E   O F   C O M P L E T I O N";
    ctx.fillText(certTitle, W / 2, 130);

    // Thin divider
    ctx.strokeStyle = "#e0e7ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(220, 145);
    ctx.lineTo(680, 145);
    ctx.stroke();

    // "This certifies that"
    ctx.fillStyle = "#9ca3af";
    ctx.font = "italic 15px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("This certifies that", W / 2, 185);

    // Learner name
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "bold 38px Georgia";
    ctx.textAlign = "center";
    // Measure and clamp
    const nameMetrics = ctx.measureText(learnerName);
    if (nameMetrics.width > 700) {
      // Scale down font to fit 700px
      const scale = 700 / nameMetrics.width;
      ctx.font = `bold ${Math.floor(38 * scale)}px Georgia`;
    }
    ctx.fillText(learnerName, W / 2, 245);

    // Underline beneath name
    ctx.strokeStyle = "#c7d2fe";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 180, 258);
    ctx.lineTo(W / 2 + 180, 258);
    ctx.stroke();

    // "has successfully completed"
    ctx.fillStyle = "#9ca3af";
    ctx.font = "italic 15px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("has successfully completed", W / 2, 295);

    // Course name (wrap if needed)
    ctx.fillStyle = "#312e81";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "center";
    const courseMetrics = ctx.measureText(courseName);
    if (courseMetrics.width > 660) {
      // Try to wrap into two lines
      const words = courseName.split(" ");
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(" ");
      const line2 = words.slice(mid).join(" ");
      ctx.fillText(line1, W / 2, 338);
      ctx.fillText(line2, W / 2, 370);
    } else {
      ctx.fillText(courseName, W / 2, 348);
    }

    // Gold stars
    ctx.fillStyle = "#d97706";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("★  ★  ★", W / 2, 410);

    // Date
    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(dateStr, W / 2, 450);

    // XP badge (small rounded rect)
    const badgeW = 160;
    const badgeH = 36;
    const badgeX = W / 2 - badgeW / 2;
    const badgeY = 468;
    const r = 8;

    ctx.beginPath();
    ctx.moveTo(badgeX + r, badgeY);
    ctx.lineTo(badgeX + badgeW - r, badgeY);
    ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + r);
    ctx.lineTo(badgeX + badgeW, badgeY + badgeH - r);
    ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - r, badgeY + badgeH);
    ctx.lineTo(badgeX + r, badgeY + badgeH);
    ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - r);
    ctx.lineTo(badgeX, badgeY + r);
    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + r, badgeY);
    ctx.closePath();
    ctx.fillStyle = "#eef2ff";
    ctx.fill();
    ctx.strokeStyle = "#c7d2fe";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#4f46e5";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`+${xpEarned} XP earned`, W / 2, badgeY + badgeH / 2 + 5);

    // Footer branding
    ctx.fillStyle = "#a5b4fc";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText("lumina.learning", W / 2, 575);

    // Download
    const slug = courseName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const link = document.createElement("a");
    link.download = `${slug}-certificate.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [courseName, learnerName, xpEarned, dateStr]);

  return (
    <div className="w-full">
      {/* Visual certificate card */}
      <div
        className="relative bg-white rounded-sm overflow-hidden"
        style={{ border: "3px solid #4f46e5" }}
      >
        {/* Inner border inset */}
        <div
          className="absolute inset-2 pointer-events-none rounded-sm"
          style={{ border: "1px solid #c7d2fe" }}
        />

        {/* Top strip */}
        <div className="bg-[#4f46e5] px-6 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-[#4f46e5]" />
          </div>
          <span className="text-white font-bold text-sm tracking-[0.15em] uppercase">
            Lumina Learning
          </span>
        </div>

        {/* Certificate body */}
        <div className="px-8 py-7 text-center">
          <p className="text-[10px] font-bold text-indigo-400 tracking-[0.25em] uppercase mb-3">
            Certificate of Completion
          </p>

          {/* Thin divider */}
          <div className="h-px bg-indigo-100 mx-auto w-48 mb-5" />

          <p className="text-sm italic text-gray-400 mb-2">This certifies that</p>

          <p
            className="text-2xl font-bold mb-1"
            style={{ color: "#1e1b4b", fontFamily: "Georgia, serif" }}
          >
            {learnerName}
          </p>

          {/* Underline */}
          <div className="h-px bg-indigo-200 mx-auto w-48 mb-4" />

          <p className="text-sm italic text-gray-400 mb-3">has successfully completed</p>

          <p className="text-lg font-bold text-[#312e81] mb-3 leading-snug">
            {courseName}
          </p>

          <p className="text-amber-500 text-xl mb-4 tracking-widest">★ ★ ★</p>

          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-gray-400">{dateStr}</span>
            <span className="text-gray-300">|</span>
            <span className="font-bold text-[#4f46e5]">+{xpEarned} XP</span>
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="mt-4 w-full h-12 rounded-full border-2 border-[#4f46e5] text-[#4f46e5] hover:bg-indigo-50 font-bold text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Download className="w-4 h-4" />
        Download as PNG
      </button>
    </div>
  );
}
