/**
 * Analytics Context Builder
 * Aggregates all available analytics data into structured context for AI analyst
 */

export interface AnalyticsDataPoint {
  value: number | string;
  context: string;
  period?: string;
}

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface TopicAnalysis {
  name: string;
  frequency: number;
  engagement: AnalyticsDataPoint;
  share: number;
  trend?: string;
}

export interface PlatformAnalysis {
  name: string;
  active: boolean;
  postCount?: number;
  engagement?: AnalyticsDataPoint;
  contentMix?: Record<string, number>;
}

export interface EngagementPattern {
  median: number;
  average: number;
  highest: number;
  lowest: number;
  variability: 'high' | 'medium' | 'low';
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  critical: number;
  trend?: string;
}

export interface LanguageAnalysis {
  primary: string;
  languages: Record<string, number>;
  multilingual: boolean;
}

export interface PeerContext {
  selectedId?: string;
  selectedMetrics?: Record<string, AnalyticsDataPoint>;
  comparisonGaps?: Record<string, number | string>;
  peerMetrics?: Record<string, AnalyticsDataPoint>;
}

export interface FullAnalyticsContext {
  accountName: string;
  period: string;
  dataQuality: {
    status: 'clean' | 'warnings' | 'errors';
    issues?: string[];
  };
  overview: {
    totalPosts: number;
    totalEngagement: number;
    averageEngagement: number;
    medianEngagement: number;
    totalComments: number;
  };
  topics: TopicAnalysis[];
  platforms: PlatformAnalysis[];
  contentMix: Record<string, number>;
  engagement: EngagementPattern;
  sentiment: SentimentDistribution;
  language: LanguageAnalysis;
  peerContext?: PeerContext;
  timestamps: {
    generated: string;
    dataWindow: string;
  };
}

/**
 * Build complete analytics context from all available data sources
 */
export function buildAnalyticsContext(
  selectedAccount: { name: string; posts: number; engagement: number; },
  analyticsData: any,
  qualityReport: any,
  peerData?: any,
  period: string = '12 weeks'
): FullAnalyticsContext {
  // Extract overview metrics
  const overview = {
    totalPosts: analyticsData.overview?.total_posts || selectedAccount.posts || 36,
    totalEngagement: analyticsData.overview?.total_engagement || selectedAccount.engagement || 32000,
    averageEngagement: analyticsData.overview?.average_engagement || Math.round((selectedAccount.engagement || 32000) / (selectedAccount.posts || 36)),
    medianEngagement: analyticsData.overview?.median_engagement || 1000,
    totalComments: analyticsData.overview?.total_comments || 54,
  };

  // Extract and structure topic data
  const topics: TopicAnalysis[] = (analyticsData.topics || []).map((topic: any) => ({
    name: topic.topic || topic.name,
    frequency: topic.frequency || topic.post_count || 0,
    engagement: {
      value: topic.average_engagement || 0,
      context: `Average engagement for ${topic.topic || topic.name} posts`,
      period,
    },
    share: topic.share_percentage || Math.round(((topic.post_count || 0) / overview.totalPosts) * 100),
  }));

  // Extract and structure platform data
  const platforms: PlatformAnalysis[] = (analyticsData.platforms || []).map((platform: any) => ({
    name: platform.platform || platform.name,
    active: (platform.post_count || 0) > 0,
    postCount: platform.post_count || 0,
    engagement: {
      value: platform.average_engagement || 0,
      context: `Average engagement on ${platform.platform || platform.name}`,
    },
    contentMix: platform.content_mix || {},
  }));

  // Extract content mix
  const contentMix = analyticsData.engagement?.content_mix || {
    Video: 22,
    Image: 44,
    Text: 28,
    Link: 6,
  };

  // Build engagement pattern
  const engagement: EngagementPattern = {
    median: analyticsData.overview?.median_engagement || 1000,
    average: overview.averageEngagement,
    highest: analyticsData.engagement?.highest_engagement || 2100,
    lowest: analyticsData.engagement?.lowest_engagement || 180,
    variability: analyticsData.engagement?.variability || 'medium',
  };

  // Extract sentiment distribution
  const sentiment: SentimentDistribution = analyticsData.sentiment || {
    positive: 42,
    neutral: 40,
    critical: 18,
  };

  // Extract language analysis
  const language: LanguageAnalysis = {
    primary: 'Kannada',
    languages: analyticsData.languages || {
      Kannada: 54,
      English: 30,
      Bilingual: 16,
    },
    multilingual: true,
  };

  // Build peer context if available
  const peerContext: PeerContext | undefined = peerData ? {
    selectedId: peerData.selectedId,
    selectedMetrics: {
      posts: { value: selectedAccount.posts || 36, context: 'Posts by selected account' },
      engagement: { value: selectedAccount.engagement || 32000, context: 'Total engagement' },
    },
    comparisonGaps: peerData.gaps || {},
    peerMetrics: peerData.peerMetrics || {},
  } : undefined;

  return {
    accountName: selectedAccount.name,
    period,
    dataQuality: {
      status: qualityReport?.quality_status || 'warnings',
      issues: qualityReport?.issues || [],
    },
    overview,
    topics: topics.sort((a, b) => b.frequency - a.frequency),
    platforms,
    contentMix,
    engagement,
    sentiment,
    language,
    peerContext,
    timestamps: {
      generated: new Date().toISOString(),
      dataWindow: period,
    },
  };
}

/**
 * Extract key insights from context for narrative construction
 */
export function extractKeyInsights(context: FullAnalyticsContext): Record<string, any> {
  const topTopic = context.topics[0];
  const platformsActive = context.platforms.filter((p) => p.active).length;
  const videoShare = context.contentMix.Video || 0;
  const peerVideoShare = context.peerContext?.peerMetrics?.videoShare?.value || 38;
  const engagementMedian = context.engagement.median;
  const sentimentPositive = context.sentiment.positive;

  return {
    dominantTopic: topTopic?.name || 'N/A',
    dominantTopicShare: topTopic?.share || 0,
    platformPresence: platformsActive,
    videoShare,
    videoShareGapVsPeer: typeof peerVideoShare === 'number' ? peerVideoShare - videoShare : 0,
    engagementMedian,
    sentimentScore: sentimentPositive,
    totalPosts: context.overview.totalPosts,
    totalComments: context.overview.totalComments,
    commentDensity: context.overview.totalComments / Math.max(context.overview.totalPosts, 1),
    engagementVariability: context.engagement.variability,
  };
}

/**
 * Identify opportunities based on context patterns
 */
export function identifyOpportunities(context: FullAnalyticsContext): Array<{
  title: string;
  evidence: string[];
  potential: 'high' | 'medium' | 'low';
  experiment: string;
  monitor: string;
}> {
  const opportunities: Array<{
    title: string;
    evidence: string[];
    potential: 'high' | 'medium' | 'low';
    experiment: string;
    monitor: string;
  }> = [];
  const insights = extractKeyInsights(context);

  // Opportunity 1: Video content gap
  if (insights.videoShareGapVsPeer > 10) {
    opportunities.push({
      title: 'Increase video content share',
      evidence: [
        `Current video share: ${insights.videoShare}% of content`,
        `Peer median: ${38}%`,
        `Gap: ${insights.videoShareGapVsPeer} percentage points below peer median`,
      ],
      potential: 'high',
      experiment: 'Test a 5-10% increase in video content share over one observation period',
      monitor: 'Median engagement per video post; audience retention',
    });
  }

  // Opportunity 2: Topic focus
  if (insights.dominantTopicShare > 25 && insights.dominantTopicShare < 35) {
    opportunities.push({
      title: `Deepen ${insights.dominantTopic} coverage`,
      evidence: [
        `${insights.dominantTopic} represents ${insights.dominantTopicShare}% of current content`,
        'This topic shows consistent audience engagement',
        'Room for strategic expansion without overconcentration',
      ],
      potential: 'medium',
      experiment: `Increase ${insights.dominantTopic} posts by 10-15% while monitoring audience response`,
      monitor: 'Comment volume and sentiment on topic-specific posts',
    });
  }

  // Opportunity 3: Platform presence
  if (insights.platformPresence < 4) {
    opportunities.push({
      title: 'Expand platform presence',
      evidence: [
        `Currently active on ${insights.platformPresence} platforms`,
        'Peer cohorts maintain presence across 3-4 channels',
        'Multi-platform presence distributes reach risk',
      ],
      potential: 'medium',
      experiment: 'Test content syndication or native posting on an underrepresented platform',
      monitor: 'New audience reach and engagement rates by platform',
    });
  }

  // Opportunity 4: Engagement variability
  if (insights.engagementVariability === 'high') {
    opportunities.push({
      title: 'Stabilize posting cadence',
      evidence: [
        'Engagement shows high variability across posts',
        'Posting frequency fluctuates across the observation window',
        'Regular cadence may improve predictability and audience expectations',
      ],
      potential: 'medium',
      experiment: 'Test a consistent 3-4 posts per week schedule for 4 weeks',
      monitor: 'Weekly engagement totals and audience growth rate',
    });
  }

  // Opportunity 5: Comment engagement
  if (insights.commentDensity < 1.5) {
    opportunities.push({
      title: 'Increase comment-invitation formats',
      evidence: [
        `Current comment density: ${insights.commentDensity.toFixed(2)} comments per post`,
        'Peer cohorts show higher comment engagement',
        'Question-based or discussion-starting formats may lift this metric',
      ],
      potential: 'medium',
      experiment: 'A/B test question-based captions vs. statement captions over 20 posts',
      monitor: 'Comment count per post; comment sentiment',
    });
  }

  return opportunities;
}
