import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable, challengesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:lessonId", async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) return res.status(400).json({ error: "Invalid lesson ID" });

  try {
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId));
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    const challenges = await db.select().from(challengesTable)
      .where(eq(challengesTable.lessonId, lessonId))
      .orderBy(challengesTable.order);

    return res.json({
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      xpReward: lesson.xpReward,
      challenges: challenges.map((c) => ({
        id: c.id,
        lessonId: c.lessonId,
        order: c.order,
        type: c.type,
        question: c.question,
        explanation: c.explanation,
        xpReward: c.xpReward,
        options: c.options ?? null,
        correctAnswer: c.correctAnswer,
        hint: c.hint ?? null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get lesson");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
