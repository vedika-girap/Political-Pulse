import type { AnalystResponse, Post } from '@/types';

export interface AnalystContext {
  posts: Post[];
  selectedPeer?: string;
  period?: string;
}

function median(values: number[]) {
  const ordered = [...values].sort((a, b) => a - b);
  if (!ordered.length) return 0;
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : Math.round((ordered[middle - 1] + ordered[middle]) / 2);
}

// Fallback mock implementation
function generateMockResponse(question: string, context: AnalystContext): AnalystResponse {
  const posts = context.posts.length ? context.posts : [];
  const videoPosts = posts.filter((post) => post.mediaType === 'Video');
  const imagePosts = posts.filter((post) => post.mediaType === 'Image');
  const strongestTopic = Object.entries(posts.reduce<Record<string, number>>((acc, post) => {
    acc[post.topic] = (acc[post.topic] || 0) + post.engagement;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Local governance';
  const videoMedian = median(videoPosts.map((post) => post.engagement));
  const imageMedian = median(imagePosts.map((post) => post.engagement));
  const videoShare = posts.length ? Math.round((videoPosts.length / posts.length) * 100) : 0;
  const lower = question.toLowerCase();

  if (lower.includes('topic')) {
    return {
      answer: `${strongestTopic} shows the highest cumulative engagement in the selected demo records.`,
      evidence: [`${strongestTopic} contributes the largest observed engagement total in this view.`, `The result is based on ${posts.length} synthetic posts, not a measure of public preference.`],
      metrics: [{ label: 'Posts in view', value: String(posts.length) }, { label: 'Strongest cumulative topic', value: strongestTopic }],
      peerComparison: 'Peer topic distributions are directional reference points and should be read as observed differences.',
      opportunities: ['Low-frequency, high-engagement topics may be an area worth further testing.'],
      limitations: ['Cumulative engagement favors topics with more posts and does not establish causation.'],
    };
  }

  if (lower.includes('video') || lower.includes('content type') || lower.includes('format')) {
    return {
      answer: 'Video posts have higher median engagement than image posts in the demo dataset.',
      evidence: [`Median video engagement: ${videoMedian.toLocaleString()}`, `Median image engagement: ${imageMedian.toLocaleString()}`],
      metrics: [{ label: 'Video share', value: `${videoShare}%` }, { label: 'Video median engagement', value: videoMedian.toLocaleString() }],
      peerComparison: 'Peer median video share: 38%; selected account: 22% in the synthetic benchmark.',
      opportunities: ['Video content is an area worth testing more systematically.'],
      limitations: ['This is an observational pattern from synthetic records and does not establish causation.'],
    };
  }

  if (lower.includes('platform') || lower.includes('gap')) {
    return {
      answer: 'The largest observed platform gap is in short-form video distribution, while channel presence is otherwise broad.',
      evidence: ['All four reference platforms are represented in the selected account sample.', 'Platform-level engagement varies with content mix and posting volume.'],
      metrics: [{ label: 'Active platforms', value: '4' }, { label: 'Peer median video share', value: '38%' }],
      peerComparison: 'The selected account has a lower observed video share than the peer median in this demo.',
      opportunities: ['Platform and format mix are potential opportunities for controlled testing.'],
      limitations: ['Platform presence is not equivalent to audience reach or impact.'],
    };
  }

  return {
    answer: 'The demo dataset shows steady activity across four platforms, with video and agriculture-related records carrying distinct engagement signals.',
    evidence: [`${posts.length} posts and ${posts.reduce((sum, post) => sum + post.comments, 0)} comments are in the current view.`, 'Language and sentiment labels are directional classifications for interface demonstration.'],
    metrics: [{ label: 'Posts in view', value: String(posts.length) }, { label: 'Median engagement', value: median(posts.map((post) => post.engagement)).toLocaleString() }],
    peerComparison: `Comparison context is set to ${context.selectedPeer || 'Regional median'} for ${context.period || '12 weeks'}.`,
    opportunities: ['Use this signal as an area worth testing, not as a guaranteed improvement.'],
    limitations: ['Synthetic data is not representative of a constituency and cannot support causal claims.'],
  };
}

export async function askAnalyst(question: string, context: AnalystContext): Promise<AnalystResponse> {
  try {
    // Try to call backend analyst API
    const response = await fetch('/api/analyst', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        accountName: 'Darshan Puttannaiah',
        period: context.period || '12 weeks',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.response;
    }
  } catch (error) {
    console.warn('Analyst API unavailable, using mock data', error);
  }

  // Fallback to mock implementation
  return generateMockResponse(question, context);
}