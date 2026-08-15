import { Router, type IRouter } from "express";
import { readQualityReport } from "../lib/quality";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/quality", async (_req, res) => {
  try {
    const report = await readQualityReport();
    res.json(report);
  } catch (error) {
    logger.error({ error }, "Failed to load quality report");
    res.status(500).json({
      error: "Unable to load data quality report",
      quality_status: "error",
      totals: {},
    });
  }
});

export default router;
