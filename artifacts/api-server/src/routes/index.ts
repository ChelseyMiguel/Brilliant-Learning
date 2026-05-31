import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coursesRouter from "./courses";
import lessonsRouter from "./lessons";
import progressRouter from "./progress";
import userRouter from "./user";
import leaderboardRouter from "./leaderboard";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/courses", coursesRouter);
router.use("/lessons", lessonsRouter);
router.use("/progress", progressRouter);
router.use("/user", userRouter);
router.use("/dashboard", userRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/ai", aiRouter);

export default router;
