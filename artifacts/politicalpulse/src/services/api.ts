import type { Analytics, Comment, Insight, PlatformAccount, Post, Topic } from '@/types';

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

export async function getOverview(): Promise<Analytics> { return { totalPosts: DEMO_POSTS.length, totalComments: DEMO_COMMENTS.length, totalEngagement: DEMO_POSTS.reduce((a, p) => a + p.engagement, 0), averageEngagement: Math.round(DEMO_POSTS.reduce((a, p) => a + p.engagement, 0) / DEMO_POSTS.length), activePlatforms: platforms.length, dataCoverage: 92 }; }
export async function getPosts(): Promise<Post[]> { return DEMO_POSTS; }
export async function getComments(): Promise<Comment[]> { return DEMO_COMMENTS; }
export async function getEngagement() { return dates.map((date, i) => ({ date, posts: 2 + (i % 5), engagement: 920 + i * 183 + (i % 3) * 230 })); }
export async function getTopics(): Promise<Topic[]> { return DEMO_TOPICS; }
export async function getSentiment() { return sentiments.map((name, i) => ({ name, value: [46, 39, 15][i], color: ['#5c8e7b','#8c9aa3','#9a6f63'][i] })); }
export async function getLanguages() { return languages.map((name, i) => ({ name, value: [58, 27, 15][i] })); }
export async function getPlatforms(): Promise<PlatformAccount[]> { return [{ id: 'facebook', platform: 'Facebook', handle: 'Darshan Puttannaiah', followers: 18400, verified: true },{ id: 'instagram', platform: 'Instagram', handle: '@darshan_puttannaiah', followers: 9700, verified: true },{ id: 'youtube', platform: 'YouTube', handle: 'Darshan Puttannaiah', followers: 3210, verified: false },{ id: 'x', platform: 'X', handle: '@DarshanPuttannaiah', followers: 6100, verified: true }]; }
export async function getPeers() { return [{ name: 'Karnataka constituency set', posts: 144, engagement: 38420, note: 'Reference cohort' },{ name: 'Melukote public office', posts: 36, engagement: 18562, note: 'Selected subject' },{ name: 'Regional median', posts: 48, engagement: 12380, note: 'Synthetic benchmark' }]; }
export async function getInsights(): Promise<Insight[]> { return [{ id: 'i1', title: 'Video is the clearest engagement signal', body: 'Video posts account for a smaller share of output, while contributing a disproportionate share of interactions in this sample.', type: 'signal', confidence: 'High' },{ id: 'i2', title: 'Agriculture conversations persist beyond event days', body: 'Agriculture topics show the steadiest comment activity across the observed period, rather than clustering around one date.', type: 'context', confidence: 'Medium' },{ id: 'i3', title: 'Language classification needs review', body: 'Several bilingual posts contain mixed scripts. Treat language splits as directional until the source labels are checked.', type: 'caveat', confidence: 'Medium' }]; }