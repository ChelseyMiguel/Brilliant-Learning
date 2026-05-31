import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

router.post("/explain", async (req, res) => {
  const { question, lessonTitle, correctAnswer, incorrectAnswer } = req.body as {
    question: string;
    lessonTitle: string;
    correctAnswer: string;
    incorrectAnswer?: string;
  };

  if (!question || !lessonTitle) {
    res.status(400).json({ error: "question and lessonTitle are required" });
    return;
  }

  if (!client) {
    res.json({
      explanation: `Let's break this down. The correct answer is "${correctAnswer}". Review the core concept from "${lessonTitle}" and look for the key relationship in the question. Try re-reading that lesson section focusing on the underlying principle — once it clicks, similar questions become much easier.`,
    });
    return;
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `A student is reviewing the lesson "${lessonTitle}" and got this question wrong:

Question: ${question}
${incorrectAnswer ? `Their answer: ${incorrectAnswer}` : ""}
Correct answer: ${correctAnswer}

Give a concise, encouraging explanation (2-3 sentences) of why the correct answer is right, and one tip to remember it. No bullet points, just plain prose.`,
        },
      ],
    });

    const text = message.content[0]?.type === "text" ? message.content[0].text : "";
    res.json({ explanation: text });
  } catch (err) {
    res.json({
      explanation: `The correct answer is "${correctAnswer}". Review the core concept from "${lessonTitle}" — focus on the underlying principle, and similar questions will become much easier.`,
    });
  }
});

export default router;
