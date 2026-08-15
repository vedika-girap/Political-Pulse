/**
 * AI Analyst Response Generator
 * Produces evidence-driven, structured responses based on analytics context
 */

import type {
  FullAnalyticsContext,
  AnalyticsMetric,
} from './analyticsContext';

export interface AnalystEvidence {
  statement: string;
  source: 'observed_data' | 'peer_comparison' | 'statistical_pattern';
  confidence: 'high' | 'medium' | 'low';
}

export interface AnalystResponse {
  answer: string;
  evidence: AnalystEvidence[];
  metrics: AnalyticsMetric[];
  peerComparison?: string;
  opportunities: string[];
  limitations: string[];
  nextSteps?: string[];
}

/**
 * Generate AI analyst response to a question
 */
export function generateAnalystResponse(
  question: string,
  context: FullAnalyticsContext
): AnalystResponse {
  const lowerQuestion = question.toLowerCase();

  // Route to appropriate analysis based on question keywords
  if (
    lowerQuestion.includes('topic') ||
    lowerQuestion.includes('content') ||
    lowerQuestion.includes('theme')
  ) {
    return analyzeTopics(context);
  }

  if (
    lowerQuestion.includes('video') ||
    lowerQuestion.includes('format') ||
    lowerQuestion.includes('media') ||
    lowerQuestion.includes('content type')
  ) {
    return analyzeContentFormats(context);
  }

  if (
    lowerQuestion.includes('platform') ||
    lowerQuestion.includes('facebook') ||
    lowerQuestion.includes('instagram') ||
    lowerQuestion.includes('youtube') ||
    lowerQuestion.includes('gap') ||
    lowerQuestion.includes('channel')
  ) {
    return analyzePlatforms(context);
  }

  if (
    lowerQuestion.includes('engagement') ||
    lowerQuestion.includes('audience') ||
    lowerQuestion.includes('perform') ||
    lowerQuestion.includes('response')
  ) {
    return analyzeEngagement(context);
  }

  if (
    lowerQuestion.includes('sentiment') ||
    lowerQuestion.includes('tone') ||
    lowerQuestion.includes('positive') ||
    lowerQuestion.includes('critical')
  ) {
    return analyzeSentiment(context);
  }

  if (
    lowerQuestion.includes('language') ||
    lowerQuestion.includes('kannada') ||
    lowerQuestion.includes('english')
  ) {
    return analyzeLanguage(context);
  }

  if (
    lowerQuestion.includes('changed') ||
    lowerQuestion.includes('trend') ||
    lowerQuestion.includes('pattern')
  ) {
    return analyzeTrends(context);
  }

  if (
    lowerQuestion.includes('comment') ||
    lowerQuestion.includes('conversation') ||
    lowerQuestion.includes('theme')
  ) {
    return analyzeComments(context);
  }

  if (
    lowerQuestion.includes('test') ||
    lowerQuestion.includes('experiment') ||
    lowerQuestion.includes('opportun')
  ) {
    return analyzeOpportunities(context);
  }

  return generateGeneralAnalysis(context);
}

/**
 * Topic analysis
 */
function analyzeTopics(context: FullAnalyticsContext): AnalystResponse {
  const topTopic = context.topics[0];
  const topThree = context.topics.slice(0, 3);
  const topicDistribution = topThree.map((t) => `${t.name} (${t.share}%)`).join(', ');

  return {
    answer: `${topTopic?.name || 'N/A'} is the dominant topic in this dataset, accounting for ${topTopic?.share || 0}% of posts. The top three topics—${topicDistribution}—represent diverse coverage areas.`,
    evidence: [
      {
        statement: `${topTopic?.name || 'N/A'} represents ${topTopic?.share || 0}% of posts (${topTopic?.frequency || 0} of ${context.overview.totalPosts})`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: `Median engagement for ${topTopic?.name || 'N/A'}: ${topTopic?.engagement?.value || 0}`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: 'Topic diversification reduces platform algorithm risk and broadens audience appeal',
        source: 'statistical_pattern',
        confidence: 'medium',
      },
    ],
    metrics: [
      { label: 'Dominant topic', value: topTopic?.name || 'N/A' },
      { label: 'Share', value: `${topTopic?.share || 0}%` },
      { label: 'Posts', value: topTopic?.frequency || 0 },
      { label: 'Engagement (median)', value: `${topTopic?.engagement?.value || 0}` },
    ],
    opportunities: [
      'Low-frequency topics with high engagement may warrant expanded coverage',
      `Analyze comment sentiment on ${topTopic?.name || 'N/A'} posts to identify audience interests`,
    ],
    limitations: [
      'Topic classification is directional for this demo',
      'Engagement correlation with topic does not establish causation',
      'Single observation window may not represent seasonal patterns',
    ],
    nextSteps: [
      `Monitor ${topTopic?.name || 'N/A'} coverage sustainability`,
      'Track audience growth on topic-specific posts',
    ],
  };
}

/**
 * Content format analysis
 */
function analyzeContentFormats(context: FullAnalyticsContext): AnalystResponse {
  const videoShare = context.contentMix.Video || 0;
  const imageShare = context.contentMix.Image || 0;
  const textShare = context.contentMix.Text || 0;
  const peerVideoShare = context.peerContext?.peerMetrics?.videoShare?.value || 38;
  const videoDifference = Number(peerVideoShare) - videoShare;

  return {
    answer: `Video content represents ${videoShare}% of posts, compared with a peer median of ${peerVideoShare}%. Image (${imageShare}%) and text (${textShare}%) form the remainder. Video content shows a higher median engagement signal in this sample.`,
    evidence: [
      {
        statement: `Current video share: ${videoShare}% (${Math.round(context.overview.totalPosts * (videoShare / 100))} posts)`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: `Peer median video share: ${peerVideoShare}% (gap: ${videoDifference} percentage points)`,
        source: 'peer_comparison',
        confidence: 'high',
      },
      {
        statement: 'Short-form video formats typically show higher engagement than image or text on social platforms',
        source: 'statistical_pattern',
        confidence: 'medium',
      },
    ],
    metrics: [
      { label: 'Video share', value: `${videoShare}%` },
      { label: 'Image share', value: `${imageShare}%` },
      { label: 'Text share', value: `${textShare}%` },
      { label: 'Peer video median', value: `${peerVideoShare}%`, unit: 'percentage points' },
    ],
    peerComparison: `Selected account is ${Math.abs(videoDifference)} percentage points ${videoDifference < 0 ? 'below' : 'above'} peer median on video share.`,
    opportunities: [
      'Test a 5-10% increase in short-form video over one observation period',
      'Analyze highest-engagement posts to identify format patterns',
      'Experiment with platform-specific formats (e.g., Reels vs. Stories)',
    ],
    limitations: [
      'Content performance depends on multiple factors beyond format',
      'Platform algorithms change; historical patterns may not predict future performance',
      'Synthetic data does not reflect audience diversity or platform reach',
    ],
  };
}

/**
 * Platform analysis
 */
function analyzePlatforms(context: FullAnalyticsContext): AnalystResponse {
  const activePlatforms = context.platforms.filter((p) => p.active);
  const platformList = activePlatforms.map((p) => p.name).join(', ');

  return {
    answer: `The selected account maintains presence across ${activePlatforms.length} platforms: ${platformList}. Multi-platform presence distributes reach and reduces dependence on algorithm changes.`,
    evidence: [
      {
        statement: `Active on: ${platformList}`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: `Average engagement varies by platform; content mix differs by channel`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: 'Multi-platform presence increases audience reach and provides resilience against individual platform algorithm changes',
        source: 'statistical_pattern',
        confidence: 'medium',
      },
    ],
    metrics: [
      { label: 'Active platforms', value: activePlatforms.length },
      { label: 'Platforms', value: platformList },
      ...activePlatforms.map((p) => ({
        label: `${p.name} posts`,
        value: p.postCount || 0,
      })),
    ],
    opportunities: [
      'Audit underperforming platform channels for content-platform mismatch',
      'Test platform-specific content variations (native formats)',
      'Cross-platform syndication may extend reach without doubling effort',
    ],
    limitations: [
      'Platform presence does not equal audience reach or impact',
      'Platform-specific metrics are limited in this demo',
      'Audience demographics vary significantly by platform',
    ],
  };
}

/**
 * Engagement analysis
 */
function analyzeEngagement(context: FullAnalyticsContext): AnalystResponse {
  const { median, average, highest, variability } = context.engagement;

  return {
    answer: `Engagement shows ${variability} variability with a median of ${median.toLocaleString()} and average of ${average.toLocaleString()}. The highest-performing post reached ${highest.toLocaleString()} engagements, while lowest was ${context.engagement.lowest.toLocaleString()}.`,
    evidence: [
      {
        statement: `Median engagement: ${median.toLocaleString()} per post`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: `Engagement range: ${context.engagement.lowest.toLocaleString()} to ${highest.toLocaleString()}`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: `${variability === 'high' ? 'High variability suggests content-specific factors influence engagement' : 'Stable engagement indicates consistent audience interest'}`,
        source: 'statistical_pattern',
        confidence: 'medium',
      },
    ],
    metrics: [
      { label: 'Median engagement', value: median.toLocaleString() },
      { label: 'Average engagement', value: average.toLocaleString() },
      { label: 'Highest engagement', value: highest.toLocaleString() },
      { label: 'Variability', value: variability },
    ],
    opportunities: [
      'Analyze highest-engagement posts to identify winning patterns',
      `${variability === 'high' ? 'Test consistent posting cadence to stabilize engagement' : 'Maintain current patterns while testing incremental variations'}`,
      'Track engagement trends over time to identify momentum',
    ],
    limitations: [
      'Engagement metrics do not measure audience sentiment or conversion',
      'High engagement does not guarantee positive outcomes',
      'External events may explain unusual engagement spikes',
    ],
  };
}

/**
 * Sentiment analysis
 */
function analyzeSentiment(context: FullAnalyticsContext): AnalystResponse {
  const { positive, neutral, critical } = context.sentiment;

  return {
    answer: `Sentiment distribution shows ${positive}% positive, ${neutral}% neutral, and ${critical}% critical responses. Neutral sentiment comprises a significant share, suggesting diverse audience perspectives.`,
    evidence: [
      {
        statement: `Positive sentiment: ${positive}%`,
        source: 'observed_data',
        confidence: 'medium',
      },
      {
        statement: `Neutral sentiment: ${neutral}%`,
        source: 'observed_data',
        confidence: 'medium',
      },
      {
        statement: `Critical sentiment: ${critical}%`,
        source: 'observed_data',
        confidence: 'medium',
      },
    ],
    metrics: [
      { label: 'Positive', value: `${positive}%` },
      { label: 'Neutral', value: `${neutral}%` },
      { label: 'Critical', value: `${critical}%` },
    ],
    opportunities: [
      'Analyze critical feedback to identify legitimate concerns or areas for improvement',
      'Amplify topics and formats that consistently receive positive responses',
      'Track sentiment evolution across topics and platforms',
    ],
    limitations: [
      'Sentiment labels are directional classifications for this demo, not validated analysis',
      'Sentiment does not capture nuance or context',
      'Platform dynamics influence which responses are visible',
    ],
  };
}

/**
 * Language analysis
 */
function analyzeLanguage(context: FullAnalyticsContext): AnalystResponse {
  const { primary, languages, multilingual } = context.language;
  const langList = Object.entries(languages)
    .map(([lang, pct]) => `${lang} (${pct}%)`)
    .join(', ');

  return {
    answer: `${primary} is the primary language (${languages[primary] || 54}%), with ${multilingual ? 'significant' : 'minimal'} multilingual content. Language mix: ${langList}.`,
    evidence: [
      {
        statement: `Primary language: ${primary} (${languages[primary] || 54}%)`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: `Multilingual content: ${Object.keys(languages).length} languages detected`,
        source: 'observed_data',
        confidence: 'high',
      },
    ],
    metrics: [
      { label: 'Primary language', value: primary },
      { label: 'Languages', value: Object.keys(languages).length },
      ...Object.entries(languages).map(([lang, pct]) => ({
        label: lang,
        value: `${pct}%`,
      })),
    ],
    opportunities: [
      'Test audience response to content in secondary languages',
      'Consider bilingual formats for cross-cultural reach',
    ],
    limitations: [
      'Language classification does not equal audience language proficiency',
      'Multilingual content strategy depends on target audience composition',
    ],
  };
}

/**
 * Trends and patterns
 */
function analyzeTrends(context: FullAnalyticsContext): AnalystResponse {
  return {
    answer: 'Observable patterns in the current dataset include stable multi-platform presence, diversified topic coverage, and engagement variability. Longer observation windows are needed to identify sustained trends.',
    evidence: [
      {
        statement: `${context.overview.totalPosts} posts over ${context.period}`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: 'Topic distribution and platform presence remain relatively consistent across available data',
        source: 'observed_data',
        confidence: 'medium',
      },
    ],
    metrics: [
      { label: 'Observation window', value: context.period },
      { label: 'Total posts', value: context.overview.totalPosts },
      { label: 'Average posts per week', value: (context.overview.totalPosts / 12).toFixed(1) },
    ],
    opportunities: [
      'Establish baseline metrics before testing format or content changes',
      'Compare current patterns against 6-month and 12-month historical data',
      'Monitor leading indicators (engagement, comment volume) for early trend signals',
    ],
    limitations: [
      'Single observation window cannot establish true trends',
      'External events (elections, news) may distort patterns',
      'Synthetic data does not reflect real-world seasonal variations',
    ],
  };
}

/**
 * Comments and conversation
 */
function analyzeComments(context: FullAnalyticsContext): AnalystResponse {
  const commentDensity = (context.overview.totalComments / Math.max(context.overview.totalPosts, 1)).toFixed(2);

  return {
    answer: `${context.overview.totalComments} comments across ${context.overview.totalPosts} posts yield a density of ${commentDensity} comments per post. This indicates moderate audience conversation engagement.`,
    evidence: [
      {
        statement: `Total comments: ${context.overview.totalComments}`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: `Comment density: ${commentDensity} per post`,
        source: 'observed_data',
        confidence: 'high',
      },
    ],
    metrics: [
      { label: 'Total comments', value: context.overview.totalComments },
      { label: 'Posts', value: context.overview.totalPosts },
      { label: 'Density', value: `${commentDensity} per post` },
    ],
    opportunities: [
      'Test question-based captions to invite comments',
      'Respond to comments to encourage further conversation',
      'Analyze highest-comment posts for format and topic patterns',
    ],
    limitations: [
      'Comment volume does not measure comment quality or sentiment',
      'Platform algorithms may suppress or promote comment visibility',
      'Comment density varies significantly by platform',
    ],
  };
}

/**
 * Opportunities summary
 */
function analyzeOpportunities(context: FullAnalyticsContext): AnalystResponse {
  const insights = [];

  if ((context.contentMix.Video || 0) < 30) {
    insights.push('Video content expansion is a high-potential opportunity based on peer comparison');
  }
  if (context.topics[0] && context.topics[0].share > 25) {
    insights.push(`Deepen ${context.topics[0].name} coverage while maintaining topic diversification`);
  }
  if ((context.platforms.filter((p) => p.active).length || 0) < 4) {
    insights.push('Platform presence expansion could reduce dependence on individual channels');
  }

  const answerText =
    insights.length > 0
      ? `Key opportunities: ${insights.join('; ')}.`
      : 'Current performance is well-balanced; incremental testing in content format, topic depth, or platform presence are reasonable next steps.';

  return {
    answer: answerText,
    evidence: insights.map((insight) => ({
      statement: insight,
      source: 'statistical_pattern' as const,
      confidence: 'medium' as const,
    })),
    metrics: [
      { label: 'Observation window', value: context.period },
      { label: 'Posts analyzed', value: context.overview.totalPosts },
    ],
    opportunities: [
      'Run controlled experiments for each identified opportunity',
      'Establish baseline metrics before testing',
      'Monitor leading indicators weekly',
      'Document learnings for future strategy',
    ],
    limitations: [
      'Opportunities are hypotheses, not guarantees',
      'External factors may influence results',
      'Synthetic data does not reflect real-world complexity',
    ],
  };
}

/**
 * General analysis for unmatched questions
 */
function generateGeneralAnalysis(context: FullAnalyticsContext): AnalystResponse {
  return {
    answer: `This dataset shows ${context.overview.totalPosts} posts across ${context.platforms.filter((p) => p.active).length} platforms with median engagement of ${context.engagement.median.toLocaleString()}. Topic distribution is diversified, with ${context.topics[0]?.name || 'multiple'} topics represented.`,
    evidence: [
      {
        statement: `${context.overview.totalPosts} posts, ${context.overview.totalComments} comments`,
        source: 'observed_data',
        confidence: 'high',
      },
      {
        statement: `Active on ${context.platforms.filter((p) => p.active).length} platforms`,
        source: 'observed_data',
        confidence: 'high',
      },
    ],
    metrics: [
      { label: 'Posts', value: context.overview.totalPosts },
      { label: 'Total engagement', value: context.overview.totalEngagement.toLocaleString() },
      { label: 'Median engagement', value: context.engagement.median.toLocaleString() },
      { label: 'Active platforms', value: context.platforms.filter((p) => p.active).length },
    ],
    opportunities: [
      'Dig deeper into topics, content formats, or platforms of interest',
      'Use specific questions to explore patterns in more detail',
    ],
    limitations: [
      'General analysis provides overview; specific questions yield more actionable insights',
      'This demo uses synthetic data for illustration',
    ],
  };
}
