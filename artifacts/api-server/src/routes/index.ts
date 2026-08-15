import { Router, type IRouter } from "express";
import healthRouter from "./health";
import qualityRouter from "./quality";
import analyticsRouter from "./analytics";
import peersRouter from "./peers";
import analystRouter from "./analyst";
import exportRouter from "./export";

const router: IRouter = Router();

router.use(healthRouter);
router.use(qualityRouter);
router.use(analyticsRouter);
router.use("/analytics", peersRouter);
router.use("/analyst", analystRouter);
router.use("/export", exportRouter);

export default router;
