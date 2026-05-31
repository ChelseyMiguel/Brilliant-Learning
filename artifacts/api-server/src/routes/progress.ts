import { Router } from "express";
import { db } from "@workspace/db";
import {
  userProfilesTable,
  userProgressTable,
  challengeAttemptsTable,
  challengesTable,
  lessonsTable,
  coursesTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { CompleteChallengeBody } from "@workspace/api-zod";

const router = Router();

function getClerkId(_req: any): string | null {
  return "demo-user";
}

async function getOrCreateProfile(clerkId: string, displayName = "Learner") {
  const [existing] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.clerkId, clerkId));
  if (existing) return existing;

  const [created] = await db.insert(userProfilesTable).values({
    clerkId,
    displayName,
    totalXp: 0,
    streakDays: 0,
    lastActiveDate: new Date().toISOString().slice(0, 10),
  }).returning();
  return created;
}

async function resetStaleStreak(clerkId: string): Promise<void> {
  const [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.clerkId, clerkId));
  if (!profile || profile.streakDays === 0 || !profile.lastActiveDate) return;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (profile.lastActiveDate !== today && profile.lastActiveDate !== yesterdayStr) {
    await db.update(userProfilesTable)
      .set({ streakDays: 0 })
      .where(eq(userProfilesTable.clerkId, clerkId));
  }
}

async function updateStreak(clerkId: string): Promise<number> {
  const [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.clerkId, clerkId));
  if (!profile) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const lastDate = profile.lastActiveDate;
  let newStreak = profile.streakDays;

  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (lastDate === yesterdayStr) {
      newStreak = profile.streakDays + 1;
    } else {
      newStreak = 1;
    }

    await db.update(userProfilesTable)
      .set({ lastActiveDate: today, streakDays: newStreak })
      .where(eq(userProfilesTable.clerkId, clerkId));
  }

  return newStreak;
}

router.get("/me", async (req, res) => {
  const clerkId = getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await getOrCreateProfile(clerkId);
    await resetStaleStreak(clerkId);
    const profile = await getOrCreateProfile(clerkId);
    const completedLessons = await db.select().from(userProgressTable)
      .where(and(eq(userProgressTable.clerkId, clerkId), eq(userProgressTable.completed, true)));
    const completedChallenges = await db.select().from(challengeAttemptsTable)
      .where(and(eq(challengeAttemptsTable.clerkId, clerkId), eq(challengeAttemptsTable.correct, true)));

    return res.json({
      userId: clerkId,
      totalXp: profile.totalXp,
      streakDays: profile.streakDays,
      lessonsCompleted: completedLessons.length,
      challengesCompleted: completedChallenges.length,
      lastActiveDate: profile.lastActiveDate ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get progress");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/complete-challenge", async (req, res) => {
  const clerkId = getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const parse = CompleteChallengeBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid request body" });

  const { challengeId, lessonId, answer, attemptNumber } = parse.data;

  try {
    const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, challengeId));
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });

    let isCorrect: boolean;
    if (challenge.type === "multiple_choice" && challenge.options) {
      const opts = challenge.options as { id: string; text: string; isCorrect: boolean }[];
      isCorrect = opts.find((o) => o.id === answer)?.isCorrect ?? false;
    } else {
      isCorrect = answer.trim().toLowerCase() === challenge.correctAnswer.trim().toLowerCase();
    }
    const xpEarned = isCorrect ? Math.max(challenge.xpReward - (attemptNumber - 1) * 2, 1) : 0;

    await db.insert(challengeAttemptsTable).values({
      clerkId,
      challengeId,
      lessonId,
      correct: isCorrect,
      attemptNumber,
      xpEarned,
    });

    let newTotalXp = 0;
    let newStreak = 0;

    if (isCorrect) {
      await getOrCreateProfile(clerkId);
      await db.update(userProfilesTable)
        .set({ totalXp: sql`${userProfilesTable.totalXp} + ${xpEarned}` })
        .where(eq(userProfilesTable.clerkId, clerkId));

      newStreak = await updateStreak(clerkId);

      // Check if lesson is now complete
      const allChallenges = await db.select().from(challengesTable).where(eq(challengesTable.lessonId, lessonId));
      const allAttempts = await db.select().from(challengeAttemptsTable)
        .where(and(
          eq(challengeAttemptsTable.clerkId, clerkId),
          eq(challengeAttemptsTable.lessonId, lessonId),
          eq(challengeAttemptsTable.correct, true)
        ));

      const completedChallengeIds = new Set(allAttempts.map(a => a.challengeId));
      const allDone = allChallenges.every(c => completedChallengeIds.has(c.id));

      if (allDone) {
        const [existing] = await db.select().from(userProgressTable)
          .where(and(
            eq(userProgressTable.clerkId, clerkId),
            eq(userProgressTable.lessonId, lessonId)
          ));

        if (!existing) {
          const totalLessonXp = allAttempts.reduce((sum, a) => sum + a.xpEarned, 0);
          await db.insert(userProgressTable).values({
            clerkId,
            lessonId,
            completed: true,
            xpEarned: totalLessonXp,
            completedAt: new Date(),
          });
        }
      }
    }

    const [updatedProfile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.clerkId, clerkId));
    newTotalXp = updatedProfile?.totalXp ?? 0;
    newStreak = updatedProfile?.streakDays ?? 0;

    return res.json({
      correct: isCorrect,
      xpEarned,
      totalXp: newTotalXp,
      explanation: challenge.explanation,
      hint: isCorrect ? null : (challenge.hint ?? null),
      streakDays: newStreak,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to complete challenge");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/lesson-progress/:lessonId", async (req, res) => {
  const clerkId = getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) return res.status(400).json({ error: "Invalid lesson ID" });

  try {
    const [lessonProgress] = await db.select().from(userProgressTable)
      .where(and(
        eq(userProgressTable.clerkId, clerkId),
        eq(userProgressTable.lessonId, lessonId)
      ));

    const correctAttempts = await db.select().from(challengeAttemptsTable)
      .where(and(
        eq(challengeAttemptsTable.clerkId, clerkId),
        eq(challengeAttemptsTable.lessonId, lessonId),
        eq(challengeAttemptsTable.correct, true)
      ));

    const completedChallengeIds = [...new Set(correctAttempts.map(a => a.challengeId))];
    const xpEarned = correctAttempts.reduce((sum, a) => sum + a.xpEarned, 0);

    return res.json({
      lessonId,
      completed: lessonProgress?.completed ?? false,
      completedChallenges: completedChallengeIds,
      xpEarned,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get lesson progress");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/course-progress/:courseId", async (req, res) => {
  const clerkId = getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const courseId = parseInt(req.params.courseId);
  if (isNaN(courseId)) return res.status(400).json({ error: "Invalid course ID" });

  try {
    const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, courseId));
    const lessonIds = lessons.map(l => l.id);

    const completedProgress = await db.select().from(userProgressTable)
      .where(and(
        eq(userProgressTable.clerkId, clerkId),
        eq(userProgressTable.completed, true)
      ));

    const completedLessonIds = new Set(completedProgress.map(p => p.lessonId));
    const completedLessons = lessons.filter(l => completedLessonIds.has(l.id)).length;
    const xpEarned = completedProgress
      .filter(p => lessonIds.includes(p.lessonId))
      .reduce((sum, p) => sum + p.xpEarned, 0);

    const nextLesson = lessons
      .sort((a, b) => a.order - b.order)
      .find(l => !completedLessonIds.has(l.id));

    const percentComplete = lessons.length > 0
      ? Math.round((completedLessons / lessons.length) * 100)
      : 0;

    return res.json({
      courseId,
      completedLessons,
      totalLessons: lessons.length,
      xpEarned,
      percentComplete,
      currentLessonId: nextLesson?.id ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get course progress");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/review", async (req, res) => {
  const clerkId = getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Challenges the user attempted but never got correct
    const wrongAttempts = await db
      .select({ challengeId: challengeAttemptsTable.challengeId })
      .from(challengeAttemptsTable)
      .where(
        and(
          eq(challengeAttemptsTable.clerkId, clerkId),
          eq(challengeAttemptsTable.correct, false)
        )
      );

    const correctAttempts = await db
      .select({ challengeId: challengeAttemptsTable.challengeId })
      .from(challengeAttemptsTable)
      .where(
        and(
          eq(challengeAttemptsTable.clerkId, clerkId),
          eq(challengeAttemptsTable.correct, true)
        )
      );

    const correctIds = new Set(correctAttempts.map((a) => a.challengeId));
    const reviewIds = [
      ...new Set(
        wrongAttempts
          .map((a) => a.challengeId)
          .filter((id) => !correctIds.has(id))
      ),
    ].slice(0, 12);

    if (reviewIds.length === 0) {
      return res.json({ challenges: [], total: 0 });
    }

    const allChallenges = await db
      .select()
      .from(challengesTable)
      .where(eq(challengesTable.id, reviewIds[0]));

    // fetch all review challenges
    const reviewChallenges = await Promise.all(
      reviewIds.map(async (id) => {
        const [c] = await db
          .select()
          .from(challengesTable)
          .where(eq(challengesTable.id, id));
        if (!c) return null;
        const [l] = await db
          .select({ title: lessonsTable.title, courseId: lessonsTable.courseId })
          .from(lessonsTable)
          .where(eq(lessonsTable.id, c.lessonId));
        return {
          id: c.id,
          lessonId: c.lessonId,
          lessonTitle: l?.title ?? "",
          type: c.type,
          question: c.question,
          options: c.options ?? null,
          correctAnswer: c.correctAnswer,
          explanation: c.explanation,
          hint: c.hint ?? null,
          xpReward: c.xpReward,
        };
      })
    );

    const filtered = reviewChallenges.filter(Boolean);
    return res.json({ challenges: filtered, total: filtered.length });
  } catch (err) {
    req.log.error({ err }, "Failed to get review challenges");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
