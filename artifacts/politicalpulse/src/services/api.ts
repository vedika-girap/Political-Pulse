import type { Analytics, Comment, Insight, Opportunity, PlatformAccount, Post, Topic } from '@/types';

export interface QualitySummary {
  duplicate_rows: number;
  empty_text: number;
  impossible_dates: number;
  invalid_engagement: number;
  language_uncertainty: number;
  malformed_urls: number;
  missing_platform: number;
  missing_timestamps: number;
  rows_checked: number;
}

export interface QualityReport {
  generated_at: string;
  datasets: Array<Record<string, unknown>>;
  totals: QualitySummary;
  quality_status: string;
  note: string;
}

const platforms = ['Facebook', 'Instagram', 'YouTube', 'X'];
const topics = ['Local governance', 'Agriculture', 'Education', 'Environment', 'Public events'];
const languages = ['Kannada', 'English', 'Bilingual'];
const sentiments = ['Positive', 'Neutral', 'Critical'];
const mediaTypes = ['Video', 'Image', 'Text', 'Link'];
const dates = ['2024-06-02','2024-06-07','2024-06-14','2024-06-22','2024-07-01','2024-07-09','2024-07-16','2024-07-28','2024-08-05','2024-08-14','2024-08-23','2024-09-02'];

export const DEMO_POSTS: Post[] = Array.from({ length: 36 }, (_, i) => {
  const platform = platforms[i % platforms.length]; const topic = topics[i % topics.length];
  const likes = 126 + ((i * 83) % 1200); const comments = 12 + ((i * 19) % 140); const shares = 6 + ((i * 31) % 210);
  return { id: `post-${i + 1}`, platform, date: dates[i % dates.length], title: `${topic} update from Melukote`, excerpt: i % 3 === 0 ? 'A field note on public work, local priorities, and the questions residents are asking.' : 'Notes from a public conversation in the constituency.', mediaType: mediaTypes[i % mediaTypes.length], language: languages[i % languages.length], topic, sentiment: sentiments[i % sentiments.length], likes, comments, shares, engagement: likes + comments * 2 + shares * 3 };
});
export const DEMO_COMMENTS: Comment[] = Array.from({ length: 54 }, (_, i) => ({ id: `comment-${i + 1}`, postId: `post-${(i % 36) + 1}`, platform: platforms[i % 4], date: dates[i % dates.length], author: ['Ananya R.','Ramesh K.','Megha S.','Prakash N.','Shivani M.'][i % 5], text: ['This deserves a closer look in the next meeting.','Thank you for sharing the context.','What is the expected timeline for this?','The field perspective is useful here.'][i % 4], language: languages[i % 3], sentiment: sentiments[(i + 1) % 3], likes: 2 + (i * 7) % 64 }));
export const DEMO_TOPICS: Topic[] = [{ name: 'Local governance', value: 31, color: '#2f6478' },{ name: 'Agriculture', value: 24, color: '#d59d3f' },{ name: 'Education', value: 18, color: '#5c8e7b' },{ name: 'Environment', value: 15, color: '#9a6f63' },{ name: 'Public events', value: 12, color: '#817c9f' }];

export async function getOverview(): Promise<Analytics> { return fetchAnalytics('overview', { totalPosts: DEMO_POSTS.length, totalComments: DEMO_COMMENTS.length, totalEngagement: DEMO_POSTS.reduce((a, p) => a + p.engagement, 0), averageEngagement: Math.round(DEMO_POSTS.reduce((a, p) => a + p.engagement, 0) / DEMO_POSTS.length), activePlatforms: platforms.length, dataCoverage: 92 }); }
export async function getQualityReport(): Promise<QualityReport> {
  const response = await fetch('/api/quality');
  if (!response.ok) {
    throw new Error('Failed to load data-quality report');
  }
  return response.json();
}
export async function getPosts(): Promise<Post[]> { return DEMO_POSTS; }
export async function getComments(): Promise<Comment[]> { return DEMO_COMMENTS; }
async function fetchAnalytics<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`/api/analytics/${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.warn(`Failed to fetch analytics/${endpoint}, using demo data`, error);
    return fallback;
  }
}

const engagementFallback = [
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
];

export async function getEngagement() { return fetchAnalytics('engagement', engagementFallback); }
export async function getTopics(): Promise<Topic[]> { return fetchAnalytics('topics', DEMO_TOPICS); }
export async function getSentiment() { return fetchAnalytics('sentiment', sentiments.map((name, i) => ({ name, value: [46, 39, 15][i], color: ['#5c8e7b','#8c9aa3','#9a6f63'][i] }))); }
export async function getLanguages() { return fetchAnalytics('languages', languages.map((name, i) => ({ name, value: [58, 27, 15][i] }))); }
export async function getPlatforms(): Promise<PlatformAccount[]> { return fetchAnalytics('platforms', [{ id: 'facebook', platform: 'Facebook', handle: 'Darshan Puttannaiah', followers: 18400, verified: true },{ id: 'instagram', platform: 'Instagram', handle: '@darshan_puttannaiah', followers: 9700, verified: true },{ id: 'youtube', platform: 'YouTube', handle: 'Darshan Puttannaiah', followers: 3210, verified: false },{ id: 'x', platform: 'X', handle: '@DarshanPuttannaiah', followers: 6100, verified: true }]); }
export async function getPeers() { return fetchAnalytics('peers', [{ name: 'Karnataka constituency set', posts: 144, engagement: 38420, note: 'Reference cohort' },{ name: 'Melukote public office', posts: 36, engagement: 18562, note: 'Selected subject' },{ name: 'Regional median', posts: 48, engagement: 12380, note: 'Synthetic benchmark' }]); }
export async function getInsights(): Promise<Insight[]> { return [{ id: 'i1', title: 'Video is the clearest engagement signal', body: 'Video posts account for a smaller share of output, while contributing a disproportionate share of interactions in this sample.', type: 'signal', confidence: 'High' },{ id: 'i2', title: 'Agriculture conversations persist beyond event days', body: 'Agriculture topics show the steadiest comment activity across the observed period, rather than clustering around one date.', type: 'context', confidence: 'Medium' },{ id: 'i3', title: 'Language classification needs review', body: 'Several bilingual posts contain mixed scripts. Treat language splits as directional until the source labels are checked.', type: 'caveat', confidence: 'Medium' }]; }
export async function getOpportunities(): Promise<Opportunity[]> {
  const fallback: Opportunity[] = [
    { title: 'Test more short-form video', evidence: [`Video represents 22% of posts compared with a peer median of 38%.`], potential: 'high', experiment: 'Test a higher proportion of short-form video content.', monitor: 'Median engagement per post' },
    { title: 'Review posting consistency', evidence: ['Observed weekly output varies across the collection window.'], potential: 'medium', experiment: 'Test a steadier publishing cadence across one observation period.', monitor: 'Weekly posting frequency' },
    { title: 'Explore agriculture conversation depth', evidence: ['Agriculture records show sustained comment activity in the demo sample.'], potential: 'medium', experiment: 'Compare follow-up formats on agriculture-related posts.', monitor: 'Comment volume per post' },
    { title: 'Compare channel-specific formats', evidence: ['The same topics appear with different media mixes across platforms.'], potential: 'medium', experiment: 'Test one format variation within a single platform.', monitor: 'Median engagement by platform' },
  ];
  try {
    const response = await fetch('/api/analyst/opportunities');
    if (response.ok) {
      const data = await response.json();
      return data.opportunities || fallback;
    }
  } catch (error) {
    console.warn('Opportunities API unavailable, using demo data', error);
  }
  return fallback;
}