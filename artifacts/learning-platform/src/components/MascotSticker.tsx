/**
 * MascotSticker — a static decorative mascot image with a gentle
 * floating bob animation. Drop it anywhere; parent must have
 * position: relative (or be a positioned element).
 *
 * Usage:
 *   <div className="relative">
 *     ...content...
 *     <MascotSticker pose="study" size={100} className="absolute -bottom-4 right-4" />
 *   </div>
 */

import { motion } from "framer-motion";

export type MascotPose =
  | "coins"   // holding gold coins — celebrate / rewards
  | "study"   // magnifying glass over papers — learning / courses
  | "water"   // watering plant — growth / dashboard
  | "idle"    // plain standing — general / empty states
  | "podium"; // #1 podium — leaderboard / achievements

const POSE_SRCS: Record<MascotPose, string> = {
  coins:  "/lumina-coins.png",
  study:  "/lumina-study.png",
  water:  "/lumina-water.png",
  idle:   "/lumina-idle.png",
  podium: "/lumina-podium.jpg",
};

const POSE_ALT: Record<MascotPose, string> = {
  coins:  "Lumina holding coins",
  study:  "Lumina studying with a magnifying glass",
  water:  "Lumina watering a plant",
  idle:   "Lumina mascot",
  podium: "Lumina on first place podium",
};

interface MascotStickerProps {
  pose?: MascotPose;
  size?: number;        // height in px
  delay?: number;       // animation start delay in seconds
  className?: string;
  style?: React.CSSProperties;
  /** If true, flips the image horizontally */
  flip?: boolean;
}

export default function MascotSticker({
  pose = "idle",
  size = 80,
  delay = 0,
  className = "",
  style,
  flip = false,
}: MascotStickerProps) {
  return (
    <motion.img
      src={POSE_SRCS[pose]}
      alt={POSE_ALT[pose]}
      draggable={false}
      className={`pointer-events-none select-none ${className}`}
      style={{
        height: size,
        width: "auto",
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
    />
  );
}
