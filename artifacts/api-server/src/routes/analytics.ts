import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Mock analytics data - in production, this would query the database
const analyticsData = {
  overview: {
    totalPosts: 36,
    totalComments: 54,
    totalEngagement: 2847,
    averageEngagement: 79,
    activePlatforms: 4,
    dataCoverage: 92,
  },
  topics: [
    { name: "Local governance", value: 31, color: "#2f6478" },
    { name: "Agriculture", value: 24, color: "#d59d3f" },
    { name: "Education", value: 18, color: "#5c8e7b" },
    { name: "Environment", value: 15, color: "#9a6f63" },
    { name: "Public events", value: 12, color: "#817c9f" },
  ],
  sentiment: [
    { name: "Positive", value: 46, color: "#5c8e7b" },
    { name: "Neutral", value: 39, color: "#8c9aa3" },
    { name: "Critical", value: 15, color: "#9a6f63" },
  ],
  languages: [
    { name: "Kannada", value: 58 },
    { name: "English", value: 27 },
    { name: "Bilingual", value: 15 },
  ],
  platforms: [
    {
      id: "facebook",
      platform: "Facebook",
      handle: "Darshan Puttannaiah",
      followers: 18400,
      verified: true,
    },
    {
      id: "instagram",
      platform: "Instagram",
      handle: "@darshan_puttannaiah",
      followers: 9700,
      verified: true,
    },
    {
      id: "youtube",
      platform: "YouTube",
      handle: "Darshan Puttannaiah",
      followers: 3210,
      verified: false,
    },
    {
      id: "x",
      platform: "X",
      handle: "@DarshanPuttannaiah",
      followers: 6100,
      verified: true,
    },
  ],
  engagement: [
    { date: "2024-06-02", posts: 2, engagement: 920 },
    { date: "2024-06-07", posts: 3, engagement: 1103 },
    { date: "2024-06-14", posts: 4, engagement: 1286 },
    { date: "2024-06-22", posts: 2, engagement: 1469 },
    { date: "2024-07-01", posts: 3, engagement: 1652 },
    { date: "2024-07-09", posts: 4, engagement: 1835 },
    { date: "2024-07-16", posts: 2, engagement: 2018 },
    { date: "2024-07-28", posts: 3, engagement: 2201 },
    { date: "2024-08-05", posts: 4, engagement: 2384 },
    { date: "2024-08-14", posts: 2, engagement: 2567 },
    { date: "2024-08-23", posts: 3, engagement: 2750 },
    { date: "2024-09-02", posts: 2, engagement: 2847 },
  ],
};

router.get("/analytics/overview", (_req, res) => {
  try {
    res.json(analyticsData.overview);
  } catch (error) {
    logger.error({ error }, "Failed to load overview analytics");
    res.status(500).json({ error: "Unable to load analytics" });
  }
});

router.get("/analytics/topics", (_req, res) => {
  try {
    res.json(analyticsData.topics);
  } catch (error) {
    logger.error({ error }, "Failed to load topic analytics");
    res.status(500).json({ error: "Unable to load topic analytics" });
  }
});

router.get("/analytics/sentiment", (_req, res) => {
  try {
    res.json(analyticsData.sentiment);
  } catch (error) {
    logger.error({ error }, "Failed to load sentiment analytics");
    res.status(500).json({ error: "Unable to load sentiment analytics" });
  }
});

router.get("/analytics/languages", (_req, res) => {
  try {
    res.json(analyticsData.languages);
  } catch (error) {
    logger.error({ error }, "Failed to load language analytics");
    res.status(500).json({ error: "Unable to load language analytics" });
  }
});

router.get("/analytics/platforms", (_req, res) => {
  try {
    res.json(analyticsData.platforms);
  } catch (error) {
    logger.error({ error }, "Failed to load platform analytics");
    res.status(500).json({ error: "Unable to load platform analytics" });
  }
});

router.get("/analytics/engagement", (_req, res) => {
  try {
    res.json(analyticsData.engagement);
  } catch (error) {
    logger.error({ error }, "Failed to load engagement analytics");
    res.status(500).json({ error: "Unable to load engagement analytics" });
  }
});

export default router;
