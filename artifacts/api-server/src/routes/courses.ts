import { Router } from "express";
import { db } from "@workspace/db";
import {
  coursesTable,
  lessonsTable,
  challengesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const courses = await db.select().from(coursesTable).orderBy(coursesTable.id);
    res.json(courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      difficulty: c.difficulty,
      lessonCount: c.lessonCount,
      totalXp: c.totalXp,
      iconColor: c.iconColor,
      createdAt: c.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list courses");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:courseId", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  if (isNaN(courseId)) return res.status(400).json({ error: "Invalid course ID" });

  try {
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
    if (!course) return res.status(404).json({ error: "Course not found" });

    const lessons = await db.select().from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId))
      .orderBy(lessonsTable.order);

    res.json({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      lessonCount: course.lessonCount,
      totalXp: course.totalXp,
      iconColor: course.iconColor,
      createdAt: course.createdAt.toISOString(),
      lessons: lessons.map((l) => ({
        id: l.id,
        courseId: l.courseId,
        title: l.title,
        description: l.description,
        order: l.order,
        xpReward: l.xpReward,
        challengeCount: l.challengeCount,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get course");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:courseId/lessons", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  if (isNaN(courseId)) return res.status(400).json({ error: "Invalid course ID" });

  try {
    const lessons = await db.select().from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId))
      .orderBy(lessonsTable.order);

    res.json(lessons.map((l) => ({
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      description: l.description,
      order: l.order,
      xpReward: l.xpReward,
      challengeCount: l.challengeCount,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list lessons");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
