export interface Politician { id: string; name: string; role: string; constituency: string; state: string; party: string; }
export interface PlatformAccount { id: string; platform: string; handle: string; followers: number; verified: boolean; }
export interface Post { id: string; platform: string; date: string; title: string; excerpt: string; mediaType: string; language: string; topic: string; sentiment: string; likes: number; comments: number; shares: number; engagement: number; }
export interface Comment { id: string; postId: string; platform: string; date: string; author: string; text: string; language: string; sentiment: string; likes: number; }
export interface Topic { name: string; value: number; color: string; }
export interface Analytics { totalPosts: number; totalComments: number; totalEngagement: number; averageEngagement: number; activePlatforms: number; dataCoverage: number; }
export interface Insight { id: string; title: string; body: string; type: 'signal' | 'context' | 'caveat'; confidence: string; }
export interface PeerProfile { id: string; name: string; posts: number; postingFrequency: number; averageEngagement: number; medianEngagement: number; engagementRate: number | null; comments: number; platformPresence: number; videoShare: number; topicMix: Record<string, number>; sentimentMix: Record<string, number>; languageMix: Record<string, number>; note: string; }
export interface AnalystResponse { answer: string; evidence: string[]; metrics: Array<{ label: string; value: string }>; peerComparison: string; opportunities: string[]; limitations: string[]; }
export interface Opportunity { title: string; evidence: string[]; potential: 'high' | 'medium' | 'low'; experiment: string; monitor: string; }