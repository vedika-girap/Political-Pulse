import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const politicians = pgTable(
  "politicians",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    displayName: text("display_name"),
    role: text("role"),
    constituency: text("constituency"),
    state: text("state").notNull(),
    party: text("party"),
    bio: text("bio"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("politicians_name_idx").on(table.name),
    stateIdx: index("politicians_state_idx").on(table.state),
  }),
);

export const platforms = pgTable(
  "platforms",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("platforms_name_idx").on(table.name),
  }),
);

export const dataSources = pgTable(
  "data_sources",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    sourceType: text("source_type").notNull(),
    sourceUrl: text("source_url"),
    description: text("description"),
    coverageStart: timestamp("coverage_start", { withTimezone: true }),
    coverageEnd: timestamp("coverage_end", { withTimezone: true }),
    method: text("method").notNull(),
    legalNotes: text("legal_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("data_sources_name_idx").on(table.name),
  }),
);

export const ingestionRuns = pgTable(
  "ingestion_runs",
  {
    id: serial("id").primaryKey(),
    dataSourceId: integer("data_source_id").references(() => dataSources.id, { onDelete: "set null" }),
    status: text("status").notNull().default("queued"),
    rowsReceived: integer("rows_received").notNull().default(0),
    rowsAccepted: integer("rows_accepted").notNull().default(0),
    rowsRejected: integer("rows_rejected").notNull().default(0),
    duplicates: integer("duplicates").notNull().default(0),
    missingValues: integer("missing_values").notNull().default(0),
    invalidMetrics: integer("invalid_metrics").notNull().default(0),
    reportJson: jsonb("report_json"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    dataSourceIdx: index("ingestion_runs_data_source_idx").on(table.dataSourceId),
    statusIdx: index("ingestion_runs_status_idx").on(table.status),
  }),
);

export const platformAccounts = pgTable(
  "platform_accounts",
  {
    id: serial("id").primaryKey(),
    politicianId: integer("politician_id").notNull().references(() => politicians.id, { onDelete: "cascade" }),
    platformId: integer("platform_id").notNull().references(() => platforms.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(),
    displayName: text("display_name"),
    accountUrl: text("account_url"),
    followerCount: integer("follower_count").notNull().default(0),
    verified: boolean("verified").notNull().default(false),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    politicianIdx: index("platform_accounts_politician_idx").on(table.politicianId),
    platformIdx: index("platform_accounts_platform_idx").on(table.platformId),
    handleIdx: uniqueIndex("platform_accounts_handle_unique").on(table.platformId, table.handle),
  }),
);

export const topics = pgTable(
  "topics",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("topics_name_idx").on(table.name),
  }),
);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    politicianId: integer("politician_id").notNull().references(() => politicians.id, { onDelete: "cascade" }),
    platformAccountId: integer("platform_account_id").references(() => platformAccounts.id, { onDelete: "set null" }),
    platformId: integer("platform_id").notNull().references(() => platforms.id, { onDelete: "cascade" }),
    dataSourceId: integer("data_source_id").references(() => dataSources.id, { onDelete: "set null" }),
    ingestionRunId: integer("ingestion_run_id").references(() => ingestionRuns.id, { onDelete: "set null" }),
    sourcePostId: text("source_post_id"),
    contentType: text("content_type").notNull().default("text"),
    title: text("title"),
    body: text("body").notNull(),
    url: text("url"),
    language: text("language").notNull().default("other"),
    languageConfidence: real("language_confidence").notNull().default(0),
    topic: text("topic").notNull().default("other"),
    sentiment: text("sentiment").notNull().default("neutral"),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    collectedAt: timestamp("collected_at", { withTimezone: true }).notNull().defaultNow(),
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    politicianIdx: index("posts_politician_id_idx").on(table.politicianId),
    platformIdx: index("posts_platform_id_idx").on(table.platformId),
    publishedAtIdx: index("posts_published_at_idx").on(table.publishedAt),
    topicIdx: index("posts_topic_idx").on(table.topic),
    languageIdx: index("posts_language_idx").on(table.language),
    sourcePostIdx: uniqueIndex("posts_source_post_unique").on(table.platformId, table.sourcePostId),
  }),
);

export const postMetrics = pgTable(
  "post_metrics",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    likes: integer("likes").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    views: integer("views").default(0),
    engagements: integer("engagements").notNull().default(0),
    engagementRate: real("engagement_rate").default(0),
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    postIdx: index("post_metrics_post_id_idx").on(table.postId),
  }),
);

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    authorHandle: text("author_handle"),
    body: text("body").notNull(),
    language: text("language").notNull().default("other"),
    languageConfidence: real("language_confidence").notNull().default(0),
    sentiment: text("sentiment").notNull().default("neutral"),
    confidence: real("confidence").default(0),
    likes: integer("likes").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    postIdx: index("comments_post_id_idx").on(table.postId),
    publishedAtIdx: index("comments_published_at_idx").on(table.publishedAt),
    languageIdx: index("comments_language_idx").on(table.language),
    sentimentIdx: index("comments_sentiment_idx").on(table.sentiment),
  }),
);

export const postTopics = pgTable(
  "post_topics",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
    confidence: real("confidence").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    source: text("source").notNull().default("rule-based"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    postIdx: index("post_topics_post_id_idx").on(table.postId),
    topicIdx: index("post_topics_topic_id_idx").on(table.topicId),
    uniqueTopicPerPost: uniqueIndex("post_topics_post_topic_unique").on(table.postId, table.topicId),
  }),
);

export const commentAnalysis = pgTable(
  "comment_analysis",
  {
    id: serial("id").primaryKey(),
    commentId: integer("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
    language: text("language").notNull().default("other"),
    languageConfidence: real("language_confidence").notNull().default(0),
    sentiment: text("sentiment").notNull().default("neutral"),
    sentimentConfidence: real("sentiment_confidence").notNull().default(0),
    topicId: integer("topic_id").references(() => topics.id, { onDelete: "set null" }),
    analysisSource: text("analysis_source").notNull().default("baseline"),
    processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    commentIdx: index("comment_analysis_comment_id_idx").on(table.commentId),
    sentimentIdx: index("comment_analysis_sentiment_idx").on(table.sentiment),
  }),
);

export const peerGroups = pgTable(
  "peer_groups",
  {
    id: serial("id").primaryKey(),
    politicianId: integer("politician_id").notNull().references(() => politicians.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    politicianIdx: index("peer_groups_politician_idx").on(table.politicianId),
  }),
);

export const peerMembers = pgTable(
  "peer_members",
  {
    id: serial("id").primaryKey(),
    peerGroupId: integer("peer_group_id").notNull().references(() => peerGroups.id, { onDelete: "cascade" }),
    politicianId: integer("politician_id").notNull().references(() => politicians.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    peerGroupIdx: index("peer_members_peer_group_idx").on(table.peerGroupId),
    politicianIdx: index("peer_members_politician_idx").on(table.politicianId),
    uniquePeerMember: uniqueIndex("peer_members_group_politician_unique").on(table.peerGroupId, table.politicianId),
  }),
);

export const analysisRuns = pgTable(
  "analysis_runs",
  {
    id: serial("id").primaryKey(),
    politicianId: integer("politician_id").notNull().references(() => politicians.id, { onDelete: "cascade" }),
    peerGroupId: integer("peer_group_id").references(() => peerGroups.id, { onDelete: "set null" }),
    runType: text("run_type").notNull().default("overview"),
    status: text("status").notNull().default("queued"),
    summary: text("summary"),
    metadata: jsonb("metadata"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    politicianIdx: index("analysis_runs_politician_idx").on(table.politicianId),
    peerGroupIdx: index("analysis_runs_peer_group_idx").on(table.peerGroupId),
  }),
);

export const politiciansRelations = relations(politicians, ({ many }) => ({
  platformAccounts: many(platformAccounts),
  posts: many(posts),
  peerGroups: many(peerGroups),
  peerMembers: many(peerMembers),
  analysisRuns: many(analysisRuns),
}));

export const platformsRelations = relations(platforms, ({ many }) => ({
  accounts: many(platformAccounts),
  posts: many(posts),
}));

export const dataSourcesRelations = relations(dataSources, ({ many }) => ({
  ingestionRuns: many(ingestionRuns),
  posts: many(posts),
}));

export const ingestionRunsRelations = relations(ingestionRuns, ({ one, many }) => ({
  dataSource: one(dataSources, {
    fields: [ingestionRuns.dataSourceId],
    references: [dataSources.id],
  }),
  posts: many(posts),
}));

export const platformAccountsRelations = relations(platformAccounts, ({ one, many }) => ({
  politician: one(politicians, {
    fields: [platformAccounts.politicianId],
    references: [politicians.id],
  }),
  platform: one(platforms, {
    fields: [platformAccounts.platformId],
    references: [platforms.id],
  }),
  posts: many(posts),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  postTopics: many(postTopics),
  commentAnalysis: many(commentAnalysis),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  politician: one(politicians, {
    fields: [posts.politicianId],
    references: [politicians.id],
  }),
  platform: one(platforms, {
    fields: [posts.platformId],
    references: [platforms.id],
  }),
  platformAccount: one(platformAccounts, {
    fields: [posts.platformAccountId],
    references: [platformAccounts.id],
  }),
  dataSource: one(dataSources, {
    fields: [posts.dataSourceId],
    references: [dataSources.id],
  }),
  ingestionRun: one(ingestionRuns, {
    fields: [posts.ingestionRunId],
    references: [ingestionRuns.id],
  }),
  metrics: many(postMetrics),
  comments: many(comments),
  postTopics: many(postTopics),
}));

export const postMetricsRelations = relations(postMetrics, ({ one }) => ({
  post: one(posts, {
    fields: [postMetrics.postId],
    references: [posts.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  analyses: many(commentAnalysis),
}));

export const postTopicsRelations = relations(postTopics, ({ one }) => ({
  post: one(posts, {
    fields: [postTopics.postId],
    references: [posts.id],
  }),
  topic: one(topics, {
    fields: [postTopics.topicId],
    references: [topics.id],
  }),
}));

export const commentAnalysisRelations = relations(commentAnalysis, ({ one }) => ({
  comment: one(comments, {
    fields: [commentAnalysis.commentId],
    references: [comments.id],
  }),
  topic: one(topics, {
    fields: [commentAnalysis.topicId],
    references: [topics.id],
  }),
}));

export const peerGroupsRelations = relations(peerGroups, ({ one, many }) => ({
  politician: one(politicians, {
    fields: [peerGroups.politicianId],
    references: [politicians.id],
  }),
  members: many(peerMembers),
  analysisRuns: many(analysisRuns),
}));

export const peerMembersRelations = relations(peerMembers, ({ one }) => ({
  peerGroup: one(peerGroups, {
    fields: [peerMembers.peerGroupId],
    references: [peerGroups.id],
  }),
  politician: one(politicians, {
    fields: [peerMembers.politicianId],
    references: [politicians.id],
  }),
}));

export const analysisRunsRelations = relations(analysisRuns, ({ one }) => ({
  politician: one(politicians, {
    fields: [analysisRuns.politicianId],
    references: [politicians.id],
  }),
  peerGroup: one(peerGroups, {
    fields: [analysisRuns.peerGroupId],
    references: [peerGroups.id],
  }),
}));

export const insertPoliticianSchema = createInsertSchema(politicians).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPlatformSchema = createInsertSchema(platforms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDataSourceSchema = createInsertSchema(dataSources).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIngestionRunSchema = createInsertSchema(ingestionRuns).omit({ id: true, createdAt: true, completedAt: true });
export const insertPlatformAccountSchema = createInsertSchema(platformAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, updatedAt: true, collectedAt: true });
export const insertPostMetricSchema = createInsertSchema(postMetrics).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertPostTopicSchema = createInsertSchema(postTopics).omit({ id: true, createdAt: true });
export const insertCommentAnalysisSchema = createInsertSchema(commentAnalysis).omit({ id: true, createdAt: true, processedAt: true });
export const insertPeerGroupSchema = createInsertSchema(peerGroups).omit({ id: true, createdAt: true });
export const insertPeerMemberSchema = createInsertSchema(peerMembers).omit({ id: true, createdAt: true });
export const insertAnalysisRunSchema = createInsertSchema(analysisRuns).omit({ id: true, createdAt: true, startedAt: true, finishedAt: true });

export type Politician = typeof politicians.$inferSelect;
export type Platform = typeof platforms.$inferSelect;
export type DataSource = typeof dataSources.$inferSelect;
export type IngestionRun = typeof ingestionRuns.$inferSelect;
export type PlatformAccount = typeof platformAccounts.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostMetric = typeof postMetrics.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type PostTopic = typeof postTopics.$inferSelect;
export type CommentAnalysis = typeof commentAnalysis.$inferSelect;
export type PeerGroup = typeof peerGroups.$inferSelect;
export type PeerMember = typeof peerMembers.$inferSelect;
export type AnalysisRun = typeof analysisRuns.$inferSelect;

export type InsertPolitician = z.infer<typeof insertPoliticianSchema>;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type InsertIngestionRun = z.infer<typeof insertIngestionRunSchema>;
export type InsertPlatformAccount = z.infer<typeof insertPlatformAccountSchema>;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertPostMetric = z.infer<typeof insertPostMetricSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertPostTopic = z.infer<typeof insertPostTopicSchema>;
export type InsertCommentAnalysis = z.infer<typeof insertCommentAnalysisSchema>;
export type InsertPeerGroup = z.infer<typeof insertPeerGroupSchema>;
export type InsertPeerMember = z.infer<typeof insertPeerMemberSchema>;
export type InsertAnalysisRun = z.infer<typeof insertAnalysisRunSchema>;