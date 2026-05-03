import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coursesRouter from "./courses";
import lessonsRouter from "./lessons";
import progressRouter from "./progress";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/courses", coursesRouter);
router.use("/lessons", lessonsRouter);
router.use("/progress", progressRouter);
router.use("/user", userRouter);
router.use("/dashboard", userRouter);

export default router;
