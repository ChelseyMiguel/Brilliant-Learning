import { Router } from "express";
import { db } from "@workspace/db";
import { userProfilesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const CURRENT_USER = "demo-user";

router.get("/", async (req, res) => {
  try {
    const profiles = await db
      .select({
        clerkId: userProfilesTable.clerkId,
        displayName: userProfilesTable.displayName,
        totalXp: userProfilesTable.totalXp,
        streakDays: userProfilesTable.streakDays,
        lastActiveDate: userProfilesTable.lastActiveDate,
      })
      .from(userProfilesTable)
      .orderBy(desc(userProfilesTable.totalXp))
      .limit(20);

    const ranked = profiles.map((p, i) => ({
      rank: i + 1,
      displayName: p.clerkId === CURRENT_USER ? "You" : p.displayName,
      totalXp: p.totalXp,
      streakDays: p.streakDays,
      isCurrentUser: p.clerkId === CURRENT_USER,
      lastActiveDate: p.lastActiveDate ?? null,
    }));

    const currentUserRank = ranked.find((r) => r.isCurrentUser);

    res.json({
      leaderboard: ranked,
      currentUser: currentUserRank ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get leaderboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
