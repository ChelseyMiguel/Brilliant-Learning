import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("beginner"),
  lessonCount: integer("lesson_count").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0),
  iconColor: text("icon_color").notNull().default("#4F46E5"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull().default(0),
  xpReward: integer("xp_reward").notNull().default(50),
  challengeCount: integer("challenge_count").notNull().default(0),
});

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessonsTable.id),
  order: integer("order").notNull().default(0),
  type: varchar("type", { length: 30 }).notNull().default("multiple_choice"),
  question: text("question").notNull(),
  explanation: text("explanation").notNull(),
  xpReward: integer("xp_reward").notNull().default(10),
  options: jsonb("options"),
  correctAnswer: text("correct_answer").notNull(),
  hint: text("hint"),
});

export const userProfilesTable = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  totalXp: integer("total_xp").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const userProgressTable = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull(),
  lessonId: integer("lesson_id").notNull().references(() => lessonsTable.id),
  completed: boolean("completed").notNull().default(false),
  xpEarned: integer("xp_earned").notNull().default(0),
  completedAt: timestamp("completed_at"),
});

export const challengeAttemptsTable = pgTable("challenge_attempts", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull(),
  challengeId: integer("challenge_id").notNull().references(() => challengesTable.id),
  lessonId: integer("lesson_id").notNull(),
  correct: boolean("correct").notNull(),
  attemptNumber: integer("attempt_number").notNull().default(1),
  xpEarned: integer("xp_earned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true });
export const insertChallengeSchema = createInsertSchema(challengesTable).omit({ id: true });
export const insertUserProfileSchema = createInsertSchema(userProfilesTable).omit({ id: true, joinedAt: true });

export type Course = typeof coursesTable.$inferSelect;
export type Lesson = typeof lessonsTable.$inferSelect;
export type Challenge = typeof challengesTable.$inferSelect;
export type UserProfile = typeof userProfilesTable.$inferSelect;
export type UserProgress = typeof userProgressTable.$inferSelect;
export type ChallengeAttempt = typeof challengeAttemptsTable.$inferSelect;
