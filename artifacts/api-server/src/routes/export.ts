import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import {
  buildAnalyticsContext,
  identifyOpportunities,
} from "../lib/analyticsContext";

const router: IRouter = Router();

// Mock analytics data
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
    },
    {
      platform: "Instagram",
      post_count: 10,
      average_engagement: 1100,
    },
    {
      platform: "YouTube",
      post_count: 8,
      average_engagement: 2100,
    },
    {
      platform: "X",
      post_count: 6,
      average_engagement: 500,
    },
  ],
  engagement: {
    content_mix: { Video: 22, Image: 44, Text: 28, Link: 6 },
    highest_engagement: 2100,
    lowest_engagement: 180,
    variability: "medium",
  },
  sentiment: { positive: 42, neutral: 40, critical: 18 },
  languages: { Kannada: 54, English: 30, Bilingual: 16 },
};

const mockQualityData = {
  quality_status: "warnings",
  issues: ["7 missing_timestamps in sample"],
};

// Export as JSON
router.get("/json", (req: Request, res: Response) => {
  try {
    const {
      accountName = "Darshan Puttannaiah",
      period = "12 weeks",
      include = "analytics,quality,peers,opportunities",
      format = "pretty",
    } = req.query;

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

    const opportunities = identifyOpportunities(context);

    const includeList = String(include)
      .split(",")
      .map((s) => s.trim());

    const exportData: Record<string, any> = {
      metadata: {
        account: accountName,
        period,
        generated: new Date().toISOString(),
        version: "1.0",
      },
    };

    if (includeList.includes("analytics")) {
      exportData.analytics = context;
    }

    if (includeList.includes("quality")) {
      exportData.quality = mockQualityData;
    }

    if (includeList.includes("peers")) {
      exportData.peers = context.peerContext || {};
    }

    if (includeList.includes("opportunities")) {
      exportData.opportunities = opportunities;
    }

    const json = JSON.stringify(
      exportData,
      null,
      format === "pretty" ? 2 : undefined
    );

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analytics-${String(accountName).replace(/\s+/g, "_")}-${String(period)}.json"`
    );

    return res.send(json);
  } catch (error) {
    logger.error({ error }, "Failed to export JSON");
    return res.status(500).json({ error: "Unable to export JSON" });
  }
});

// Export as CSV
router.get("/csv", (req: Request, res: Response) => {
  try {
    const {
      accountName = "Darshan Puttannaiah",
      period = "12 weeks",
      include = "analytics,topics",
    } = req.query;

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

    const includeList = String(include)
      .split(",")
      .map((s) => s.trim());

    let csv = `Account,${accountName}\nPeriod,${period}\nGenerated,${new Date().toISOString()}\n\n`;

    // Analytics overview
    if (includeList.includes("analytics")) {
      csv += "ANALYTICS OVERVIEW\n";
      csv += `Total Posts,${context.overview.totalPosts}\n`;
      csv += `Total Engagement,${context.overview.totalEngagement}\n`;
      csv += `Average Engagement,${context.overview.averageEngagement}\n`;
      csv += `Median Engagement,${context.engagement.median}\n`;
      csv += `Total Comments,${context.overview.totalComments}\n\n`;
    }

    // Topics
    if (includeList.includes("topics")) {
      csv += "TOPICS\nTopic,Posts,Share %,Avg Engagement\n";
      context.topics.forEach((t) => {
        csv += `${t.name},${t.frequency},${t.share},${t.engagement.value}\n`;
      });
      csv += "\n";
    }

    // Platforms
    if (includeList.includes("platforms")) {
      csv += "PLATFORMS\nPlatform,Active,Posts\n";
      context.platforms.forEach((p) => {
        csv += `${p.name},${p.active ? "Yes" : "No"},${p.postCount || 0}\n`;
      });
      csv += "\n";
    }

    // Engagement
    if (includeList.includes("engagement")) {
      csv += "ENGAGEMENT\n";
      csv += `Content Type,Share %\n`;
      Object.entries(context.contentMix).forEach(([type, share]) => {
        csv += `${type},${share}\n`;
      });
      csv += "\n";
    }

    // Sentiment
    if (includeList.includes("sentiment")) {
      csv += "SENTIMENT\nSentiment,Share %\n";
      csv += `Positive,${context.sentiment.positive}\n`;
      csv += `Neutral,${context.sentiment.neutral}\n`;
      csv += `Critical,${context.sentiment.critical}\n\n`;
    }

    // Languages
    if (includeList.includes("languages")) {
      csv += "LANGUAGES\nLanguage,Share %\n";
      Object.entries(context.language.languages).forEach(([lang, share]) => {
        csv += `${lang},${share}\n`;
      });
      csv += "\n";
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analytics-${String(accountName).replace(/\s+/g, "_")}-${String(period)}.csv"`
    );

    return res.send(csv);
  } catch (error) {
    logger.error({ error }, "Failed to export CSV");
    return res.status(500).json({ error: "Unable to export CSV" });
  }
});

// Export summary (text)
router.get("/summary", (req: Request, res: Response) => {
  try {
    const {
      accountName = "Darshan Puttannaiah",
      period = "12 weeks",
    } = req.query;

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

    const opportunities = identifyOpportunities(context);

    let text = `
POLITICAL PULSE ANALYTICS REPORT
================================

Account: ${accountName}
Period: ${period}
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY
-----------------
This report summarizes digital communications activity for ${accountName} over ${period}.

Data Quality: ${context.dataQuality.status}
${context.dataQuality.issues && context.dataQuality.issues.length > 0 ? `Issues: ${context.dataQuality.issues.join(", ")}` : ""}

ACTIVITY OVERVIEW
-----------------
Total Posts: ${context.overview.totalPosts}
Total Engagement: ${context.overview.totalEngagement.toLocaleString()}
Average Engagement: ${context.overview.averageEngagement.toLocaleString()}
Median Engagement: ${context.engagement.median.toLocaleString()}
Total Comments: ${context.overview.totalComments}

TOP TOPICS
----------
${context.topics
  .slice(0, 3)
  .map((t) => `• ${t.name} (${t.share}% of posts, avg engagement: ${t.engagement.value})`)
  .join("\n")}

PLATFORM PRESENCE
-----------------
Active on ${context.platforms.filter((p) => p.active).length} platforms:
${context.platforms
  .filter((p) => p.active)
  .map((p) => `• ${p.name} (${p.postCount} posts)`)
  .join("\n")}

CONTENT MIX
-----------
${Object.entries(context.contentMix)
  .map(([type, share]) => `• ${type}: ${share}%`)
  .join("\n")}

SENTIMENT DISTRIBUTION
----------------------
• Positive: ${context.sentiment.positive}%
• Neutral: ${context.sentiment.neutral}%
• Critical: ${context.sentiment.critical}%

LANGUAGES
---------
• Primary: ${context.language.primary}
${Object.entries(context.language.languages)
  .map(([lang, share]) => `• ${lang}: ${share}%`)
  .join("\n")}

IDENTIFIED OPPORTUNITIES
------------------------
${opportunities
  .map(
    (o) => `
${o.title}
${o.title.replace(/./g, "-")}
Potential: ${o.potential.toUpperCase()}
Evidence: ${o.evidence.join("; ")}
Experiment: ${o.experiment}
Monitor: ${o.monitor}
`
  )
  .join("\n")}

METHODOLOGY NOTES
-----------------
• This report is based on the data currently in the system
• Topic and sentiment labels are directional classifications
• Engagement metrics are aggregated from platform-reported data
• Peer comparisons use synthetic reference cohorts
• No causal claims can be made from observed patterns
• For validation of any findings, conduct controlled experiments

RECOMMENDATIONS
----------------
1. Review this analysis with domain experts
2. Run A/B tests on identified opportunities
3. Establish baseline metrics before testing
4. Monitor outcomes over a minimum 4-week period
5. Document learnings for future strategy refinement

Data Source: PoliticalPulse Analytics v0.1
Report Format: Text Summary
---
For full data export, use JSON or CSV formats via API.
`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analytics-${String(accountName).replace(/\s+/g, "_")}-${String(period)}.txt"`
    );

    return res.send(text);
  } catch (error) {
    logger.error({ error }, "Failed to export summary");
    return res.status(500).json({ error: "Unable to export summary" });
  }
});

export default router;
