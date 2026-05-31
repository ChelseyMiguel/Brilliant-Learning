import { Router } from "express";
import { db } from "@workspace/db";
import {
  userProfilesTable,
  userProgressTable,
  challengeAttemptsTable,
  coursesTable,
  lessonsTable,
} from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";

async function resetStaleStreak(clerkId: string): Promise<void> {
  const [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.clerkId, clerkId));
  if (!profile || profile.streakDays === 0 || !profile.lastActiveDate) return;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (profile.lastActiveDate !== today && profile.lastActiveDate !== yesterdayStr) {
    await db.update(userProfilesTable).set({ streakDays: 0 }).where(eq(userProfilesTable.clerkId, clerkId));
  }
}

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

router.get("/profile", async (req, res) => {
  const clerkId = getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const profile = await getOrCreateProfile(clerkId);
    return res.json({
      id: String(profile.id),
      clerkId: profile.clerkId,
      displayName: profile.displayName,
      totalXp: profile.totalXp,
      streakDays: profile.streakDays,
      joinedAt: profile.joinedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get user profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/summary", async (req, res) => {
  const clerkId = getClerkId(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await getOrCreateProfile(clerkId);
    await resetStaleStreak(clerkId);
    const profile = await getOrCreateProfile(clerkId);

    const completedLessons = await db.select().from(userProgressTable)
      .where(and(eq(userProgressTable.clerkId, clerkId), eq(userProgressTable.completed, true)));

    const allAttempts = await db.select().from(challengeAttemptsTable)
      .where(and(eq(challengeAttemptsTable.clerkId, clerkId), eq(challengeAttemptsTable.correct, true)));

    // Build weekly activity (last 7 days)
    const days = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];
    const today = new Date();
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = days[d.getDay()];
      const dayAttempts = allAttempts.filter(a => {
        const attemptDate = a.createdAt.toISOString().slice(0, 10);
        return attemptDate === dateStr;
      });
      const xpEarned = dayAttempts.reduce((sum, a) => sum + a.xpEarned, 0);
      return {
        day: dayLabel,
        active: dayAttempts.length > 0,
        xpEarned,
      };
    });

    // Get all courses for recommendation
    const allCourses = await db.select().from(coursesTable).orderBy(coursesTable.id);

    // Find recommended course (first course user hasn't completed all lessons in)
    let recommendedCourse = allCourses[0] ?? null;
    for (const course of allCourses) {
      const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id));
      const completedInCourse = completedLessons.filter(p => lessons.some(l => l.id === p.lessonId));
      if (completedInCourse.length < lessons.length) {
        recommendedCourse = course;
        break;
      }
    }

    // Course progress for recently active courses
    const recentCourseIds = [...new Set(
      completedLessons
        .slice(-10)
        .map(p => p.lessonId)
    )];

    const recentCourses = [];
    for (const course of allCourses.slice(0, 3)) {
      const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id));
      const completedInCourse = completedLessons.filter(p => lessons.some(l => l.id === p.lessonId));
      const xpInCourse = completedInCourse.reduce((sum, p) => sum + p.xpEarned, 0);
      const percentComplete = lessons.length > 0
        ? Math.round((completedInCourse.length / lessons.length) * 100)
        : 0;
      const nextLesson = lessons.sort((a, b) => a.order - b.order).find(l =>
        !completedInCourse.some(p => p.lessonId === l.id)
      );
      recentCourses.push({
        courseId: course.id,
        completedLessons: completedInCourse.length,
        totalLessons: lessons.length,
        xpEarned: xpInCourse,
        percentComplete,
        currentLessonId: nextLesson?.id ?? null,
      });
    }

    return res.json({
      totalXp: profile.totalXp,
      streakDays: profile.streakDays,
      lessonsCompleted: completedLessons.length,
      challengesCompleted: allAttempts.length,
      weeklyActivity,
      recommendedCourse: recommendedCourse ? {
        id: recommendedCourse.id,
        title: recommendedCourse.title,
        description: recommendedCourse.description,
        category: recommendedCourse.category,
        difficulty: recommendedCourse.difficulty,
        lessonCount: recommendedCourse.lessonCount,
        totalXp: recommendedCourse.totalXp,
        iconColor: recommendedCourse.iconColor,
        createdAt: recommendedCourse.createdAt.toISOString(),
      } : null,
      recentCourses,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
