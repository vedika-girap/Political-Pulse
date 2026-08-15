import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import {
  buildAnalyticsContext,
  identifyOpportunities,
} from "../lib/analyticsContext";
import { generateAnalystResponse } from "../lib/aiAnalyst";

const router: IRouter = Router();

// Mock analytics data (in production, these would be database queries)
const mockAnalyticsData = {
  overview: {
    total_posts: 36,
    total_engagement: 32000,
    average_engagement: 889,
    median_engagement: 1000,
    total_comments: 54,
  },
  topics: [
    {
      topic: "Local governance",
      post_count: 11,
      share_percentage: 31,
      average_engagement: 1050,
    },
    {
      topic: "Agriculture",
      post_count: 9,
      share_percentage: 25,
      average_engagement: 920,
    },
    {
      topic: "Education",
      post_count: 6,
      share_percentage: 17,
      average_engagement: 780,
    },
    {
      topic: "Environment",
      post_count: 5,
      share_percentage: 14,
      average_engagement: 650,
    },
    {
      topic: "Public events",
      post_count: 5,
      share_percentage: 14,
      average_engagement: 900,
    },
  ],
  platforms: [
    {
      platform: "Facebook",
      post_count: 12,
      average_engagement: 950,
      content_mix: { Video: 25, Image: 50, Text: 20, Link: 5 },
    },
    {
      platform: "Instagram",
      post_count: 10,
      average_engagement: 1100,
      content_mix: { Video: 30, Image: 50, Text: 15, Link: 5 },
    },
    {
      platform: "YouTube",
      post_count: 8,
      average_engagement: 2100,
      content_mix: { Video: 100, Image: 0, Text: 0, Link: 0 },
    },
    {
      platform: "X",
      post_count: 6,
      average_engagement: 500,
      content_mix: { Video: 10, Image: 20, Text: 60, Link: 10 },
    },
  ],
  engagement: {
    content_mix: { Video: 22, Image: 44, Text: 28, Link: 6 },
    highest_engagement: 2100,
    lowest_engagement: 180,
    variability: "medium",
  },
  sentiment: {
    positive: 42,
    neutral: 40,
    critical: 18,
  },
  languages: {
    Kannada: 54,
    English: 30,
    Bilingual: 16,
  },
};

const mockQualityData = {
  quality_status: "warnings",
  issues: ["7 missing_timestamps in sample"],
};

// POST /api/analyst - Ask the AI analyst a question
router.post("/", (req: Request, res: Response) => {
  try {
    const { question, accountName = "Darshan Puttannaiah", period = "12 weeks" } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing or invalid question" });
    }

    // Build analytics context
    const selectedAccount = {
      name: accountName,
      posts: mockAnalyticsData.overview.total_posts,
      engagement: mockAnalyticsData.overview.total_engagement,
    };

    const context = buildAnalyticsContext(
      selectedAccount,
      mockAnalyticsData,
      mockQualityData,
      undefined,
      period
    );

    // Generate response
    const response = generateAnalystResponse(question, context);

    return res.json({
      question,
      response,
      context: {
        period: context.period,
        totalPosts: context.overview.totalPosts,
        dataQuality: context.dataQuality.status,
      },
    });
  } catch (error) {
    logger.error({ error }, "Failed to generate analyst response");
    return res.status(500).json({ error: "Unable to generate response" });
  }
});

// GET /api/analyst/opportunities - Get identified opportunities
router.get("/opportunities", (req: Request, res: Response) => {
  try {
    const { accountName = "Darshan Puttannaiah", period = "12 weeks" } = req.query;

    // Build context
    const selectedAccount = {
      name: String(accountName),
      posts: mockAnalyticsData.overview.total_posts,
      engagement: mockAnalyticsData.overview.total_engagement,
    };

    const context = buildAnalyticsContext(
      selectedAccount,
      mockAnalyticsData,
      mockQualityData,
      undefined,
      String(period)
    );

    // Identify opportunities
    const opportunities = identifyOpportunities(context);

    return res.json({
      accountName,
      period,
      opportunities,
      summary: {
        total: opportunities.length,
        high: opportunities.filter((o) => o.potential === "high").length,
        medium: opportunities.filter((o) => o.potential === "medium").length,
        low: opportunities.filter((o) => o.potential === "low").length,
      },
    });
  } catch (error) {
    logger.error({ error }, "Failed to identify opportunities");
    return res.status(500).json({ error: "Unable to identify opportunities" });
  }
});

// GET /api/analyst/context - Get full analytics context
router.get("/context", (req: Request, res: Response) => {
  try {
    const { accountName = "Darshan Puttannaiah", period = "12 weeks" } = req.query;

    // Build context
    const selectedAccount = {
      name: String(accountName),
      posts: mockAnalyticsData.overview.total_posts,
      engagement: mockAnalyticsData.overview.total_engagement,
    };

    const context = buildAnalyticsContext(
      selectedAccount,
      mockAnalyticsData,
      mockQualityData,
      undefined,
      String(period)
    );

    return res.json(context);
  } catch (error) {
    logger.error({ error }, "Failed to retrieve context");
    return res.status(500).json({ error: "Unable to retrieve context" });
  }
});

export default router;
