import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { ArrowUpRight, Check, ChevronDown, CircleAlert, Lightbulb, MessageCircle, Search, Sparkles, Target, TrendingUp } from 'lucide-react';
import { DEMO_POSTS, DEMO_TOPICS } from '@/services/api';
import { askAnalyst } from '@/services/aiService';
import type { AnalystResponse, Insight, PeerProfile, Post } from '@/types';

const ink = '#2f6478';
const ochre = '#d59d3f';
const green = '#5c8e7b';
const clay = '#9a6f63';
const lavender = '#817c9f';
const palette = [ink, ochre, green, clay, lavender];
const peerProfiles: PeerProfile[] = [
  { id: 'regional-median', name: 'Regional median', posts: 48, postingFrequency: 4, averageEngagement: 1320, medianEngagement: 980, engagementRate: 4.8, comments: 76, platformPresence: 4, videoShare: 38, topicMix: { 'Local governance': 28, Agriculture: 21, Education: 19, Environment: 17, 'Public events': 15 }, sentimentMix: { Positive: 42, Neutral: 40, Critical: 18 }, languageMix: { Kannada: 54, English: 30, Bilingual: 16 }, note: 'Synthetic reference median' },
  { id: 'constituency-set', name: 'Karnataka constituency set', posts: 144, postingFrequency: 12, averageEngagement: 1180, medianEngagement: 910, engagementRate: 4.2, comments: 214, platformPresence: 3, videoShare: 34, topicMix: { 'Local governance': 30, Agriculture: 24, Education: 18, Environment: 14, 'Public events': 14 }, sentimentMix: { Positive: 44, Neutral: 38, Critical: 18 }, languageMix: { Kannada: 61, English: 23, Bilingual: 16 }, note: 'Synthetic comparison cohort' },
];

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="relative block min-w-[150px]"><span className="mb-1 block font-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full appearance-none rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 pr-8 text-xs outline-none focus:border-[hsl(var(--primary))]">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-7 text-[hsl(var(--muted-foreground))]" size={12}/></label>;
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-[0_1px_0_hsl(var(--foreground)/.02)] ${className}`}>{children}</section>;
}

function PanelHead({ title, meta }: { title: string; meta?: string }) {
  return <div className="flex items-center justify-between border-b border-[hsl(var(--border)/.7)] px-5 py-4"><h2 className="text-[13px] font-semibold">{title}</h2>{meta && <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{meta}</span>}</div>;
}

function Intro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-8"><p className="mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">{eyebrow}</p><h1 className="font-serif text-4xl tracking-[-.02em] md:text-[46px]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p></div>;
}

function ChartCard({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return <Panel className={className}><PanelHead title={title} meta="synthetic comparison"/><div className="h-[280px] p-4">{children}</div></Panel>;
}

function formatGap(value: number, suffix = '') {
  return `${value > 0 ? '+' : ''}${value}${suffix}`;
}

function getSelectedMetrics(posts: Post[]) {
  const engagement = posts.map((post) => post.engagement);
  const ordered = [...engagement].sort((a, b) => a - b);
  const median = ordered.length ? ordered[Math.floor(ordered.length / 2)] : 0;
  return {
    posts: posts.length,
    frequency: posts.length / 12,
    average: posts.length ? Math.round(engagement.reduce((sum, value) => sum + value, 0) / posts.length) : 0,
    median,
    comments: posts.reduce((sum, post) => sum + post.comments, 0),
    videoShare: posts.length ? Math.round((posts.filter((post) => post.mediaType === 'Video').length / posts.length) * 100) : 0,
  };
}

export function PeerBenchmarkingPage() {
  const [peers, setPeers] = useState<any[]>(peerProfiles);
  const [peerId, setPeerId] = useState(peerProfiles[0].id);
  const [period, setPeriod] = useState('12 weeks');
  const [platform, setPlatform] = useState('All platforms');

  useEffect(() => {
    void fetch('/api/analytics/peers')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(setPeers)
      .catch(() => setPeers(peerProfiles));
  }, []);

  const peer = peers.find((item) => item.id === peerId) || peers[0];
  const posts = useMemo(() => platform === 'All platforms' ? DEMO_POSTS : DEMO_POSTS.filter((post) => post.platform === platform), [platform]);
  const selected = getSelectedMetrics(posts);
  const peerMetrics = { posts: peer.posts, frequency: peer.postingFrequency, average: peer.averageEngagement, median: peer.medianEngagement, comments: peer.comments, videoShare: peer.videoShare };
  const tableRows = [
    ['Number of posts', selected.posts, peerMetrics.posts, 48, 'Observed difference'],
    ['Posting frequency / week', selected.frequency.toFixed(1), peerMetrics.frequency.toFixed(1), peerMetrics.frequency - selected.frequency, 'Peer median'],
    ['Average engagement', selected.average.toLocaleString(), peerMetrics.average.toLocaleString(), peerMetrics.average - selected.average, 'Observed difference'],
    ['Median engagement', selected.median.toLocaleString(), peerMetrics.median.toLocaleString(), peerMetrics.median - selected.median, 'Area worth testing'],
    ['Comment volume', selected.comments, peerMetrics.comments, peerMetrics.comments - selected.comments, 'Context only'],
    ['Video content share', `${selected.videoShare}%`, `${peerMetrics.videoShare}%`, peerMetrics.videoShare - selected.videoShare, 'Potential opportunity'],
    ['Platform presence', 4, peer.platformPresence, peer.platformPresence - 4, 'Observed difference'],
  ];
  const contentData = ['Video', 'Image', 'Text', 'Link'].map((name) => ({ name, selected: posts.filter((post) => post.mediaType === name).length, peer: name === 'Video' ? peer.videoShare : name === 'Image' ? 34 : name === 'Text' ? 22 : 6 }));
  const topicData = DEMO_TOPICS.map((topic) => ({ name: topic.name.replace('Local governance', 'Governance'), selected: topic.value, peer: peer.topicMix[topic.name] }));
  const platformData = ['Facebook', 'Instagram', 'YouTube', 'X'].map((name) => ({ name, selected: posts.some((post) => post.platform === name) ? 1 : 0, peer: name === 'X' && peer.platformPresence < 4 ? 0 : 1 }));
  const sentimentData = ['Positive', 'Neutral', 'Critical'].map((name) => ({ name, selected: Math.round(posts.filter((post) => post.sentiment === name).length / Math.max(posts.length, 1) * 100), peer: peer.sentimentMix[name] }));
  return <div><Intro eyebrow="Understand / Peer benchmarking" title="Context without competition" description="Describe observed differences between the selected account and synthetic peer references. These comparisons are not rankings or judgments of political performance."/><Panel className="mb-5 p-4"><div className="flex flex-wrap items-end gap-3"><SelectField label="Peer selector" value={peer.name} onChange={(value) => setPeerId(peerProfiles.find((item) => item.name === value)?.id || peerProfiles[0].id)} options={peerProfiles.map((item) => item.name)}/><SelectField label="Comparison period" value={period} onChange={setPeriod} options={['12 weeks', 'Last 30 days', 'Last 90 days']}/><SelectField label="Platform filter" value={platform} onChange={setPlatform} options={['All platforms', 'Facebook', 'Instagram', 'YouTube', 'X']}/><div className="ml-auto rounded-lg bg-[hsl(var(--muted)/.65)] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">Selected: <b className="text-[hsl(var(--foreground))]">Darshan Puttannaiah</b></div></div></Panel><Panel className="mb-5 overflow-x-auto"><PanelHead title="Comparison table" meta={`${period} · ${platform}`}/><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b border-[hsl(var(--border))] text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]"><th className="px-5 py-3 font-mono font-normal">Metric</th><th className="px-4 py-3 font-mono font-normal">Selected politician</th><th className="px-4 py-3 font-mono font-normal">Peer</th><th className="px-4 py-3 font-mono font-normal">Peer median</th><th className="px-4 py-3 font-mono font-normal">Gap</th><th className="px-5 py-3 font-mono font-normal">Interpretation</th></tr></thead><tbody>{tableRows.map(([metric, value, peerValue, gap, interpretation]) => <tr key={String(metric)} className="border-b border-[hsl(var(--border)/.65)] last:border-0"><td className="px-5 py-4 font-medium">{metric}</td><td className="px-4 py-4 font-mono">{value}</td><td className="px-4 py-4 font-mono">{peerValue}</td><td className="px-4 py-4 font-mono">{peerValue}</td><td className="px-4 py-4 font-mono text-[hsl(var(--primary))]">{typeof gap === 'number' ? formatGap(Math.round(gap)) : formatGap(Number(gap))}</td><td className="px-5 py-4 text-[hsl(var(--muted-foreground))]">{interpretation}</td></tr>)}</tbody></table></Panel><div className="grid gap-4 lg:grid-cols-2"><ChartCard title="Engagement comparison"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: 'Average', selected: selected.average, peer: peer.averageEngagement }, { name: 'Median', selected: selected.median, peer: peer.medianEngagement }]}><CartesianGrid vertical={false} stroke="#d8e0e5"/><XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10}} tickLine={false}/><Tooltip/><Legend/><Bar dataKey="selected" name="Selected" fill={ink} radius={[4,4,0,0]}/><Bar dataKey="peer" name="Peer median" fill={ochre} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Posting frequency comparison"><ResponsiveContainer width="100%" height="100%"><LineChart data={[{ name: 'Jun', selected: 2.4, peer: peer.postingFrequency }, { name: 'Jul', selected: 3.2, peer: peer.postingFrequency }, { name: 'Aug', selected: 3.8, peer: peer.postingFrequency }, { name: 'Sep', selected: 2.9, peer: peer.postingFrequency }]}><CartesianGrid vertical={false} stroke="#d8e0e5"/><XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10}} tickLine={false}/><Tooltip/><Legend/><Line type="monotone" dataKey="selected" name="Selected" stroke={ink} strokeWidth={2.5}/><Line type="monotone" dataKey="peer" name="Peer median" stroke={ochre} strokeWidth={2}/></LineChart></ResponsiveContainer></ChartCard><ChartCard title="Content-type comparison"><ResponsiveContainer width="100%" height="100%"><BarChart data={contentData}><XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10}} tickLine={false}/><Tooltip/><Legend/><Bar dataKey="selected" name="Selected posts" fill={ink}/><Bar dataKey="peer" name="Peer median share" fill={ochre}/></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Topic comparison"><ResponsiveContainer width="100%" height="100%"><BarChart data={topicData} layout="vertical"><XAxis type="number" tick={{fontSize:10}} axisLine={false} tickLine={false}/><YAxis dataKey="name" type="category" width={100} tick={{fontSize:9}} axisLine={false} tickLine={false}/><Tooltip/><Legend/><Bar dataKey="selected" name="Selected share" fill={ink}/><Bar dataKey="peer" name="Peer median share" fill={ochre}/></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Platform presence comparison"><ResponsiveContainer width="100%" height="100%"><BarChart data={platformData}><XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/><YAxis hide domain={[0, 1]}/><Tooltip/><Legend/><Bar dataKey="selected" name="Selected" fill={green}/><Bar dataKey="peer" name="Peer median" fill={ochre}/></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Sentiment comparison"><ResponsiveContainer width="100%" height="100%"><RadarChart data={sentimentData}><PolarGrid/><PolarAngleAxis dataKey="name" tick={{fontSize:10}}/><PolarRadiusAxis tick={{fontSize:9}}/><Radar name="Selected" dataKey="selected" stroke={ink} fill={ink} fillOpacity={.22}/><Radar name="Peer median" dataKey="peer" stroke={ochre} fill={ochre} fillOpacity={.18}/><Legend/><Tooltip/></RadarChart></ResponsiveContainer></ChartCard></div><Panel className="mt-5"><PanelHead title="Competitive Gap Analysis" meta="measurable differences, not causation"/><div className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-5">{[['Platform opportunity','YouTube presence is observed across the sample; platform mix remains uneven.'],['Content format opportunity',`Video content share is ${selected.videoShare}% compared with a peer median of ${peer.videoShare}%.`],['Topic opportunity','Agriculture and local governance show distinct engagement patterns worth reading in context.'],['Engagement opportunity',`Median engagement differs by ${Math.abs(peer.medianEngagement - selected.median).toLocaleString()} observed interactions.`],['Posting consistency opportunity',`Observed frequency is ${selected.frequency.toFixed(1)} posts/week versus ${peer.postingFrequency.toFixed(1)} for the peer.`]].map(([title, text]) => <div key={title} className="rounded-lg border border-[hsl(var(--border))] p-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--primary))]">{title}</p><p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{text}</p><p className="mt-3 text-[10px] font-semibold">Potential opportunity</p></div>)}</div></Panel></div>;
}

export function TopicOpportunityMatrix() {
  const data = DEMO_TOPICS.map((topic, index) => ({ name: topic.name, frequency: topic.value, engagement: [1180, 1480, 820, 1060, 1320][index], comments: [32, 26, 18, 21, 14][index] }));
  return <Panel className="mt-5"><PanelHead title="Topic Opportunity Matrix" meta="frequency · median engagement · comment volume"/><div className="grid gap-5 p-5 lg:grid-cols-[1.6fr_1fr]"><div className="h-[340px]"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{top:10,right:20,bottom:20,left:0}}><CartesianGrid stroke="#d8e0e5"/><XAxis type="number" dataKey="frequency" name="Content frequency" unit="%" tick={{fontSize:10}} label={{value:'Content frequency',position:'insideBottom',offset:-10,fontSize:10}}/><YAxis type="number" dataKey="engagement" name="Median engagement" tick={{fontSize:10}} label={{value:'Median engagement',angle:-90,position:'insideLeft',fontSize:10}}/><ZAxis type="number" dataKey="comments" range={[70, 420]} name="Comment volume"/><Tooltip cursor={{strokeDasharray:'3 3'}}/><Scatter name="Topics" data={data} fill={ink}>{data.map((entry, index) => <Cell key={entry.name} fill={palette[index]}/>)}</Scatter></ScatterChart></ResponsiveContainer></div><div className="space-y-3"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">How to read</p>{[['High frequency / high engagement','Established topics with visible response in this sample.'],['High frequency / low engagement','Frequent topics with comparatively lower median response.'],['Low frequency / high engagement','Areas worth further testing, not automatic recommendations.'],['Low frequency / low engagement','Limited evidence in the current observation window.']].map(([title, text], index) => <div key={title} className="rounded-lg bg-[hsl(var(--muted)/.55)] p-3"><div className="flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 rounded-full" style={{background:palette[index]}}/>{title}</div><p className="mt-1 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">{text}</p></div>)}<p className="border-t border-[hsl(var(--border))] pt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Low-frequency, high-engagement topics may represent areas worth further testing. The matrix describes observed patterns and does not recommend increasing any topic.</p></div></div></Panel>;
}

export function ImprovementOpportunitiesPage() {
  const videoShare = Math.round(DEMO_POSTS.filter((post) => post.mediaType === 'Video').length / DEMO_POSTS.length * 100);
  const opportunities = [
    { title: 'Test more short-form video', evidence: `Video represents ${videoShare}% of posts compared with a peer median of 38%.`, metric: `${videoShare}% selected share`, peer: '38% peer median', experiment: 'Test a higher proportion of short-form video content.', monitor: 'Median engagement per post', confidence: 'Medium' },
    { title: 'Review posting consistency', evidence: 'Observed weekly output varies across the collection window.', metric: '2.4–3.8 posts / week', peer: '4.0 peer median', experiment: 'Test a steadier publishing cadence across one observation period.', monitor: 'Weekly posting frequency', confidence: 'Medium' },
    { title: 'Explore agriculture conversation depth', evidence: 'Agriculture records show sustained comment activity in the demo sample.', metric: '24% topic share', peer: '21% peer median', experiment: 'Compare follow-up formats on agriculture-related posts.', monitor: 'Comment volume per post', confidence: 'Directional' },
    { title: 'Compare channel-specific formats', evidence: 'The same topics appear with different media mixes across platforms.', metric: '4 platforms observed', peer: '3–4 peer presence', experiment: 'Test one format variation within a single platform.', monitor: 'Median engagement by platform', confidence: 'Directional' },
  ];
  return <div><Intro eyebrow="Understand / Improvement opportunities" title="Areas worth testing" description="A synthesis of observed patterns and peer context. These are hypotheses for measured experiments, not guaranteed improvements."/><div className="grid gap-4 lg:grid-cols-2">{opportunities.map((opportunity) => <Panel key={opportunity.title} className="p-6 transition-transform hover:-translate-y-0.5"><div className="flex items-start justify-between gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--accent)/.45)] text-[hsl(var(--primary))]"><Lightbulb size={18}/></div><span className="rounded-full bg-[hsl(var(--muted))] px-2 py-1 font-mono text-[9px] uppercase">{opportunity.confidence} confidence</span></div><h2 className="mt-5 font-serif text-2xl">{opportunity.title}</h2><div className="mt-5 space-y-4 text-xs"><div><p className="font-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Observed evidence</p><p className="mt-1 leading-5">{opportunity.evidence}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-[hsl(var(--muted)/.6)] p-3"><p className="font-mono text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Metric</p><p className="mt-1 font-semibold">{opportunity.metric}</p></div><div className="rounded-lg bg-[hsl(var(--muted)/.6)] p-3"><p className="font-mono text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Peer comparison</p><p className="mt-1 font-semibold">{opportunity.peer}</p></div></div><div className="border-t border-[hsl(var(--border))] pt-4"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Potential experiment</p><p className="mt-1 leading-5">{opportunity.experiment}</p></div><div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4"><span className="text-[hsl(var(--muted-foreground))]">Metric to monitor</span><b>{opportunity.monitor}</b></div></div></Panel>)}</div></div>;
}

export function OverallAnalysisPage() {
  const sections = [
    ['Executive summary', 'The demo shows a broad four-platform footprint, recurring local-governance and agriculture themes, and a higher observed median for video than image records.', 'Descriptive synthesis only.'],
    ['Digital strengths', 'Activity is distributed across Facebook, Instagram, YouTube, and X, with 36 posts represented in the current synthetic collection.', '4 active platforms · 36 posts'],
    ['Observed gaps', 'Video share is lower than the synthetic peer median, while weekly posting frequency varies across the window.', '22% video share · 2.4–3.8 posts/week'],
    ['Audience response', 'Comments are present across all platform samples, with neutral labels forming a substantial share of the directional response mix.', '54 comments · labels are synthetic'],
    ['Platform performance', 'Observed engagement differs by channel and content mix; platform presence alone does not indicate relative impact.', 'Channel-level comparisons'],
    ['Topic performance', 'Local governance carries the largest topic share; agriculture shows sustained comment activity in this demo.', '31% governance · 24% agriculture'],
    ['Peer differences', 'The selected account sits below the peer median on video content share in the synthetic reference set.', '22% selected · 38% peer median'],
    ['Potential opportunities', 'Format mix, posting consistency, and channel-specific topic experiments are areas worth testing.', 'Hypotheses, not guarantees'],
    ['Recommended experiments', 'Run bounded format and cadence tests, then monitor median engagement and comment volume without assuming causation.', 'Track changes over a defined period'],
    ['Data limitations', 'Synthetic records, platform-shaped observation, and directional labels cannot represent the full constituency or establish causal effects.', 'Replace with validated data before interpretation'],
  ];
  return <div><Intro eyebrow="Synthesis / Overall analysis" title="Read the whole signal" description="A neutral synthesis of engagement, platforms, topics, language, sentiment, peer context, and potential opportunities."/><div className="grid gap-4 md:grid-cols-2">{sections.map(([title, body, metric], index) => <Panel key={title} className={`${index === 0 ? 'md:col-span-2 observatory-grid' : ''} p-6`}><div className="flex items-start gap-4"><span className="font-mono text-[10px] text-[hsl(var(--primary))]">0{index + 1}</span><div className="flex-1"><h2 className="font-serif text-2xl">{title}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{body}</p><p className="mt-5 font-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--primary))]">{metric}</p></div></div></Panel>)}</div></div>;
}

export function AIAnalystPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AnalystResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const suggestions = ['What are the strongest performing topics?', 'Where is engagement weaker than peers?', 'Which platforms show the biggest observed gaps?', 'Which content types perform best?', 'What changed over the selected period?', 'What are the main themes in sampled comments?', 'Summarize the overall digital performance.', 'What areas are worth testing?'];
  const submit = async (value = question) => {
    if (!value.trim()) return;
    setQuestion(value);
    setLoading(true);
    setResponse(await askAnalyst(value, { posts: DEMO_POSTS, selectedPeer: 'Regional median', period: '12 weeks' }));
    setLoading(false);
  };
  return <div><Intro eyebrow="Analyst / AI analyst" title="Ask the dataset" description="A structured analytical assistant for this workspace. Responses are mocked from the current synthetic data and are not a general-purpose chatbot."/><div className="grid gap-4 lg:grid-cols-[.8fr_1.5fr]"><Panel className="p-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--accent)/.55)] text-[hsl(var(--primary))]"><Sparkles size={17}/></span><div><p className="text-sm font-semibold">Suggested questions</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Choose an analytical lens</p></div></div><div className="mt-5 space-y-2">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => submit(suggestion)} className="flex w-full items-start gap-2 rounded-lg border border-[hsl(var(--border))] p-3 text-left text-xs leading-5 transition-colors hover:bg-[hsl(var(--muted)/.65)]"><ArrowUpRight size={13} className="mt-1 shrink-0 text-[hsl(var(--primary))]"/>{suggestion}</button>)}</div></Panel><Panel><PanelHead title="Analyst response" meta="mock service · structured output"/><div className="p-6">{!response && !loading ? <div className="grid min-h-[380px] place-items-center text-center"><div><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"><Search size={20}/></div><h2 className="mt-4 font-serif text-3xl">Start with a question</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Ask about the observed posts, engagement, topics, content formats, or peer differences.</p></div></div> : loading ? <div className="grid min-h-[380px] place-items-center text-sm text-[hsl(var(--muted-foreground))]">Reading the synthetic observation set…</div> : response && <div className="space-y-6"><div><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">Answer</p><h2 className="mt-2 font-serif text-3xl leading-tight">{response.answer}</h2></div><div className="grid gap-4 sm:grid-cols-2">{[['Evidence', response.evidence], ['Metrics', response.metrics.map((metric) => `${metric.label}: ${metric.value}`)], ['Peer comparison', [response.peerComparison]], ['Potential opportunity', response.opportunities], ['Limitations', response.limitations]].map(([title, items]) => <div key={String(title)} className="rounded-lg bg-[hsl(var(--muted)/.6)] p-4"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">{title}</p><ul className="mt-3 space-y-2 text-xs leading-5">{(items as string[]).map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--primary))]"/>{item}</li>)}</ul></div>)}</div></div>}<form className="mt-6 flex gap-2 border-t border-[hsl(var(--border))] pt-5" onSubmit={(event) => { event.preventDefault(); void submit(); }}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about the analyzed dataset…" className="h-10 flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-xs outline-none focus:border-[hsl(var(--primary))]"/><button className="rounded-lg bg-[hsl(var(--primary))] px-4 text-xs font-semibold text-[hsl(var(--primary-foreground))]" type="submit">Ask</button></form></div></Panel></div></div>;
}

export function DataDrivenInsights({ rows }: { rows: Insight[] }) {
  const sections = [
    ['Overall performance', 'Four active platforms and 36 synthetic posts provide a broad but partial observation window.', '36 posts · 4 platforms', 'Medium'],
    ['Content strengths', 'Video records have a higher median engagement signal than image records in this sample.', 'Video vs image median', 'High'],
    ['Observed gaps', 'Video represents a smaller share of posts than the synthetic peer median.', '22% vs 38%', 'Medium'],
    ['Audience response', 'Comments appear across channels, but their labels are directional rather than representative.', '54 comments', 'Medium'],
    ['Platform opportunities', 'Channel-specific format mix is an area worth testing rather than a conclusion about platform quality.', '4 channels', 'Directional'],
    ['Topic opportunities', 'Agriculture and governance show distinct frequency and response patterns for further review.', '24% agriculture · 31% governance', 'Directional'],
    ['Peer differences', 'The clearest observed peer difference is in video share.', '−16 percentage points', 'Medium'],
    ['Data quality warnings', 'Bilingual labels and synthetic records should be reviewed before any real-world interpretation.', 'Classification caveat', 'High'],
  ];
  void rows;
  return <div className="mt-4 grid gap-4 md:grid-cols-2">{sections.map(([title, body, metric, confidence]) => <Panel key={title} className="p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{title}</h3><span className="font-mono text-[9px] uppercase text-[hsl(var(--primary))]">{confidence}</span></div><p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{body}</p><p className="mt-4 border-t border-[hsl(var(--border))] pt-3 font-mono text-[10px] uppercase tracking-[.1em]">{metric}</p></Panel>)}</div>;
}