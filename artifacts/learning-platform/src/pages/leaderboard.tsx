import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Zap, Flame, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import MascotSticker from "@/components/MascotSticker";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalXp: number;
  streakDays: number;
  isCurrentUser: boolean;
  lastActiveDate: string | null;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
}

async function fetchLeaderboard(): Promise<LeaderboardData> {
  const res = await fetch("/api/leaderboard");
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

const rankColors: Record<number, string> = {
  1: "text-amber-500",
  2: "text-gray-400",
  3: "text-amber-700",
};

const rankBg: Record<number, string> = {
  1: "bg-amber-50 border-amber-200",
  2: "bg-gray-50 border-gray-200",
  3: "bg-orange-50 border-orange-200",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
  return (
    <span className={`text-base font-black tabular-nums ${rankColors[rank] ?? "text-gray-400"}`}>
      #{rank}
    </span>
  );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const isTop3 = entry.rank <= 3;
  const rowBg = entry.isCurrentUser
    ? "bg-[#f5f4ff] border-[#4f46e5]/30"
    : isTop3
    ? rankBg[entry.rank]
    : "bg-white border-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border ${rowBg} ${
        entry.isCurrentUser ? "shadow-sm" : ""
      }`}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        <RankBadge rank={entry.rank} />
      </div>

      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${
          entry.isCurrentUser
            ? "bg-[#4f46e5] text-white"
            : isTop3
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {entry.displayName.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-bold text-sm leading-tight ${
            entry.isCurrentUser ? "text-[#4f46e5]" : "text-gray-900"
          }`}
        >
          {entry.displayName}
          {entry.isCurrentUser && (
            <span className="ml-2 text-xs font-semibold bg-[#4f46e5]/10 text-[#4f46e5] px-1.5 py-0.5 rounded-full">
              You
            </span>
          )}
        </p>
        {entry.streakDays > 0 && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Flame className="w-3 h-3 text-orange-400" />
            {entry.streakDays} day streak
          </p>
        )}
      </div>

      {/* XP */}
      <div className="flex items-center gap-1.5 text-sm font-bold text-[#4f46e5] flex-shrink-0">
        <Zap className="w-3.5 h-3.5" />
        {entry.totalXp.toLocaleString()}
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: fetchLeaderboard,
  });

  const top3 = data?.leaderboard.slice(0, 3) ?? [];
  const rest = data?.leaderboard.slice(3) ?? [];
  const currentUser = data?.currentUser;

  return (
    <div className="min-h-screen bg-white">
      <Navbar
      />

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <MascotSticker
            pose="podium"
            size={165}
            delay={0.1}
            className="absolute"
            style={{ right: 0, top: "50%", transform: "translateY(-50%)" }}
          />
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-display">Top Learners</h1>
          <p className="text-gray-500">All-time XP rankings</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Podium - top 3 */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-3 mb-8">
                {/* 2nd place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center gap-2 flex-1 max-w-[120px]"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
                    {top3[1]?.displayName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-bold text-center text-gray-700 leading-tight">
                    {top3[1]?.displayName}
                  </p>
                  <p className="text-xs font-semibold text-[#4f46e5]">
                    {top3[1]?.totalXp.toLocaleString()} XP
                  </p>
                  <div className="w-full bg-gray-200 rounded-t-xl flex items-center justify-center h-16">
                    <span className="text-2xl font-black text-gray-400">2</span>
                  </div>
                </motion.div>

                {/* 1st place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex flex-col items-center gap-2 flex-1 max-w-[130px]"
                >
                  <Crown className="w-6 h-6 text-amber-500 mb-1" />
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-2xl font-bold text-amber-700 ring-4 ring-amber-200">
                    {top3[0]?.displayName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-bold text-center text-gray-900 leading-tight">
                    {top3[0]?.displayName}
                  </p>
                  <p className="text-xs font-semibold text-[#4f46e5]">
                    {top3[0]?.totalXp.toLocaleString()} XP
                  </p>
                  <div className="w-full bg-amber-400 rounded-t-xl flex items-center justify-center h-24">
                    <span className="text-2xl font-black text-white">1</span>
                  </div>
                </motion.div>

                {/* 3rd place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-col items-center gap-2 flex-1 max-w-[120px]"
                >
                  <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-xl font-bold text-orange-600">
                    {top3[2]?.displayName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-bold text-center text-gray-700 leading-tight">
                    {top3[2]?.displayName}
                  </p>
                  <p className="text-xs font-semibold text-[#4f46e5]">
                    {top3[2]?.totalXp.toLocaleString()} XP
                  </p>
                  <div className="w-full bg-orange-200 rounded-t-xl flex items-center justify-center h-10">
                    <span className="text-2xl font-black text-orange-500">3</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Full list */}
            <div className="space-y-2">
              {data?.leaderboard.map((entry, i) => (
                <LeaderboardRow key={entry.rank} entry={entry} index={i} />
              ))}
            </div>

            {/* Current user rank callout if outside top 10 */}
            {currentUser && currentUser.rank > 10 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-[#f5f4ff] rounded-2xl border border-[#4f46e5]/20 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-[#4f46e5] rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                  {currentUser.displayName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#4f46e5]">Your rank: #{currentUser.rank}</p>
                  <p className="text-xs text-gray-500">{currentUser.totalXp.toLocaleString()} XP · keep going!</p>
                </div>
                <Link href="/courses">
                  <Button size="sm" className="bg-[#4f46e5] hover:bg-[#4338ca] rounded-full">
                    Learn more
                  </Button>
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
