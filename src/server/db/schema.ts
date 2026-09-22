import { relations, sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTableCreator,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `butter_${name}`);

/* ------------------------------------------------------------------ *
 * Enums
 * ------------------------------------------------------------------ */

export const reviewStatus = pgEnum("review_status", [
  "recording",
  "processing",
  "ready",
  "closed",
]);

export const findingType = pgEnum("finding_type", [
  "issue",
  "suggestion",
  "question",
  "observation",
]);

export const findingSeverity = pgEnum("finding_severity", [
  "blocking",
  "high",
  "medium",
  "low",
  "informational",
]);

/**
 * Labels, not decimals. Nothing here is calibrated, and a number like 0.89
 * implies a precision the model does not have (spec §19).
 */
export const findingConfidence = pgEnum("finding_confidence", [
  "strong",
  "some",
  "needs_investigation",
]);

export const findingStatus = pgEnum("finding_status", [
  "open",
  "accepted",
  "dismissed",
  "resolved",
]);

export const decisionKind = pgEnum("decision_kind", [
  "accepted",
  "dismissed",
  "deferred",
]);

/** Captured so it can later train ranking — why a human said no (§13). */
export const dismissReason = pgEnum("dismiss_reason", [
  "intentional",
  "not_relevant",
  "incorrect_interpretation",
  "already_fixed",
  "insufficient_evidence",
  "other",
]);

export const evidenceSource = pgEnum("evidence_source", [
  "recording",
  "transcript",
  "keyframe",
  "interaction",
  "analytics",
  "session_replay",
  "github",
  "linear",
  "decision_graph",
]);

export const eventType = pgEnum("event_type", [
  "click",
  "route_change",
  "scroll",
  "input_focus",
  "form_submit",
  "viewport_resize",
  "navigation",
  "console_error",
  "network_failure",
]);

export const stageName = pgEnum("stage_name", [
  "upload",
  "transcription",
  "keyframes",
  "analysis",
  "finalization",
]);

export const stageStatus = pgEnum("stage_status", [
  "pending",
  "running",
  "complete",
  "failed",
]);

export const memberRole = pgEnum("member_role", ["owner", "admin", "member"]);

export const reviewVisibility = pgEnum("review_visibility", [
  "workspace",
  "link",
  "invite",
]);

/* ------------------------------------------------------------------ *
 * Auth (NextAuth adapter tables)
 * ------------------------------------------------------------------ */

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({ mode: "date", withTimezone: true })
    .$defaultFn(() => new Date()),
  image: d.varchar({ length: 255 }),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* ------------------------------------------------------------------ *
 * Workspace / project scoping
 * ------------------------------------------------------------------ */

const id = (d: { varchar: (c: { length: number }) => any }) =>
  d.varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID());

export const workspaces = createTable("workspace", (d) => ({
  id: id(d),
  name: d.varchar({ length: 255 }).notNull(),
  slug: d.varchar({ length: 64 }).notNull(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
}), (t) => [uniqueIndex("workspace_slug_idx").on(t.slug)]);

export const workspaceMembers = createTable(
  "workspace_member",
  (d) => ({
    workspaceId: d.varchar({ length: 36 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    userId: d.varchar({ length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    role: memberRole("role").default("member").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.workspaceId, t.userId] }),
    index("member_user_idx").on(t.userId),
  ],
);

export const projects = createTable(
  "project",
  (d) => ({
    id: id(d),
    workspaceId: d.varchar({ length: 36 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 255 }).notNull(),
    applicationUrl: d.varchar({ length: 1024 }),
    repoFullName: d.varchar({ length: 255 }),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("project_workspace_idx").on(t.workspaceId)],
);

/* ------------------------------------------------------------------ *
 * Review + capture (§28, §5)
 * ------------------------------------------------------------------ */

export const reviews = createTable(
  "review",
  (d) => ({
    id: id(d),
    workspaceId: d.varchar({ length: 36 }).notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: d.varchar({ length: 36 }).references(() => projects.id, { onDelete: "set null" }),
    title: d.varchar({ length: 255 }).notNull(),
    description: d.text(),
    applicationUrl: d.varchar({ length: 1024 }),
    gitBranch: d.varchar({ length: 255 }),
    gitCommit: d.varchar({ length: 64 }),
    createdById: d.varchar({ length: 255 }).notNull().references(() => users.id),
    status: reviewStatus("status").default("recording").notNull(),
    visibility: reviewVisibility("visibility").default("workspace").notNull(),
    /** Unguessable; the id in a share link is the credential. */
    shareToken: d.varchar({ length: 64 }).$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
    durationMs: d.integer(),
    summary: d.text(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("review_workspace_idx").on(t.workspaceId),
    index("review_project_idx").on(t.projectId),
    uniqueIndex("review_share_token_idx").on(t.shareToken),
  ],
);

export const recordings = createTable(
  "recording",
  (d) => ({
    id: id(d),
    reviewId: d.varchar({ length: 36 }).notNull().references(() => reviews.id, { onDelete: "cascade" }),
    storageKey: d.varchar({ length: 1024 }).notNull(),
    contentType: d.varchar({ length: 128 }).default("video/mp4").notNull(),
    bytes: d.bigint({ mode: "number" }),
    durationMs: d.integer(),
    width: d.integer(),
    height: d.integer(),
    /** Native app vs browser tab — the two capture clients (§42). */
    source: d.varchar({ length: 32 }).default("browser").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("recording_review_idx").on(t.reviewId)],
);

/**
 * Every captured stream shares one session-relative clock (§5). That is the
 * only thing tying transcript, events, frames and findings together, so it is
 * indexed everywhere it appears.
 */
export const transcriptSegments = createTable(
  "transcript_segment",
  (d) => ({
    id: id(d),
    reviewId: d.varchar({ length: 36 }).notNull().references(() => reviews.id, { onDelete: "cascade" }),
    startMs: d.integer().notNull(),
    endMs: d.integer().notNull(),
    text: d.text().notNull(),
    /** Raw stays immutable; cleaned may fix punctuation without changing meaning (§7). */
    cleanedText: d.text(),
    speaker: d.varchar({ length: 64 }),
  }),
  (t) => [index("transcript_review_time_idx").on(t.reviewId, t.startMs)],
);

export const interactionEvents = createTable(
  "interaction_event",
  (d) => ({
    id: id(d),
    reviewId: d.varchar({ length: 36 }).notNull().references(() => reviews.id, { onDelete: "cascade" }),
    type: eventType("type").notNull(),
    timestampMs: d.integer().notNull(),
    x: d.integer(),
    y: d.integer(),
    route: d.varchar({ length: 1024 }),
    viewportWidth: d.integer(),
    viewportHeight: d.integer(),
    /** Never holds input values — §6 forbids capturing what users type. */
    metadata: d.jsonb().$type<Record<string, unknown>>(),
  }),
  (t) => [index("event_review_time_idx").on(t.reviewId, t.timestampMs)],
);

export const keyframes = createTable(
  "keyframe",
  (d) => ({
    id: id(d),
    reviewId: d.varchar({ length: 36 }).notNull().references(() => reviews.id, { onDelete: "cascade" }),
    timestampMs: d.integer().notNull(),
    storageKey: d.varchar({ length: 1024 }).notNull(),
    width: d.integer(),
    height: d.integer(),
    /** Why this frame was picked: scene_change | click | route_change | narration | sample */
    reason: d.varchar({ length: 32 }).notNull(),
    sceneScore: d.real(),
  }),
  (t) => [index("keyframe_review_time_idx").on(t.reviewId, t.timestampMs)],
);

export const analysisWindows = createTable(
  "analysis_window",
  (d) => ({
    id: id(d),
    reviewId: d.varchar({ length: 36 }).notNull().references(() => reviews.id, { onDelete: "cascade" }),
    startMs: d.integer().notNull(),
    endMs: d.integer().notNull(),
    route: d.varchar({ length: 1024 }),
    keyframeIds: d.jsonb().$type<string[]>(),
    model: d.varchar({ length: 64 }),
    inputTokens: d.integer(),
    outputTokens: d.integer(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("window_review_time_idx").on(t.reviewId, t.startMs)],
);

/* ------------------------------------------------------------------ *
 * Findings (§11), evidence (§18), decisions (§29)
 * ------------------------------------------------------------------ */

export const findings = createTable(
  "finding",
  (d) => ({
    id: id(d),
    reviewId: d.varchar({ length: 36 }).notNull().references(() => reviews.id, { onDelete: "cascade" }),
    windowId: d.varchar({ length: 36 }).references(() => analysisWindows.id, { onDelete: "set null" }),
    type: findingType("type").notNull(),
    title: d.varchar({ length: 512 }).notNull(),
    body: d.text().notNull(),
    timestampMs: d.integer().notNull(),
    endTimestampMs: d.integer(),
    severity: findingSeverity("severity").default("medium").notNull(),
    confidence: findingConfidence("confidence").default("some").notNull(),
    route: d.varchar({ length: 1024 }),
    suggestedAction: d.text(),
    /** What would settle an open question (§17) — not an answer, a shopping list. */
    neededEvidence: d.jsonb().$type<string[]>(),
    /** §32: a concern the presenter voiced outranks one the model found alone. */
    presenterRaised: d.boolean().default(false).notNull(),
    rankScore: d.real(),
    status: findingStatus("status").default("open").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [
    index("finding_review_time_idx").on(t.reviewId, t.timestampMs),
    index("finding_review_status_idx").on(t.reviewId, t.status),
  ],
);

/**
 * Provenance is a row, not a prose sentence (§2.2). A finding with no evidence
 * rows is an opinion, and the UI should be able to say so.
 */
export const findingEvidence = createTable(
  "finding_evidence",
  (d) => ({
    id: id(d),
    findingId: d.varchar({ length: 36 }).notNull().references(() => findings.id, { onDelete: "cascade" }),
    source: evidenceSource("source").notNull(),
    sourceId: d.varchar({ length: 255 }),
    timestampMs: d.integer(),
    label: d.varchar({ length: 512 }).notNull(),
    summary: d.text(),
    metadata: d.jsonb().$type<Record<string, unknown>>(),
  }),
  (t) => [index("evidence_finding_idx").on(t.findingId)],
);

export const findingComments = createTable(
  "finding_comment",
  (d) => ({
    id: id(d),
    findingId: d.varchar({ length: 36 }).notNull().references(() => findings.id, { onDelete: "cascade" }),
    authorId: d.varchar({ length: 255 }).notNull().references(() => users.id),
    body: d.text().notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("comment_finding_idx").on(t.findingId)],
);

/**
 * The seed of the decision graph (§14). Today it records accept/dismiss on a
 * finding; a ProductDecision later points back at these rows rather than
 * replacing them, which is what keeps §14 additive instead of a migration.
 */
export const findingDecisions = createTable(
  "finding_decision",
  (d) => ({
    id: id(d),
    findingId: d.varchar({ length: 36 }).notNull().references(() => findings.id, { onDelete: "cascade" }),
    decision: decisionKind("decision").notNull(),
    dismissReason: dismissReason("dismiss_reason"),
    rationale: d.text(),
    createdById: d.varchar({ length: 255 }).notNull().references(() => users.id),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("decision_finding_idx").on(t.findingId)],
);

/** §25: each job idempotent, retryable, observable, independently restartable. */
export const processingStages = createTable(
  "processing_stage",
  (d) => ({
    id: id(d),
    reviewId: d.varchar({ length: 36 }).notNull().references(() => reviews.id, { onDelete: "cascade" }),
    stage: stageName("stage").notNull(),
    status: stageStatus("status").default("pending").notNull(),
    attempts: d.integer().default(0).notNull(),
    error: d.text(),
    startedAt: d.timestamp({ withTimezone: true }),
    finishedAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [uniqueIndex("stage_review_stage_idx").on(t.reviewId, t.stage)],
);

/* ------------------------------------------------------------------ *
 * Relations
 * ------------------------------------------------------------------ */

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  memberships: many(workspaceMembers),
  reviews: many(reviews),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  projects: many(projects),
  reviews: many(reviews),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [projects.workspaceId], references: [workspaces.id] }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [reviews.workspaceId], references: [workspaces.id] }),
  project: one(projects, { fields: [reviews.projectId], references: [projects.id] }),
  author: one(users, { fields: [reviews.createdById], references: [users.id] }),
  recordings: many(recordings),
  transcript: many(transcriptSegments),
  events: many(interactionEvents),
  keyframes: many(keyframes),
  windows: many(analysisWindows),
  findings: many(findings),
  stages: many(processingStages),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  review: one(reviews, { fields: [recordings.reviewId], references: [reviews.id] }),
}));

export const transcriptSegmentsRelations = relations(transcriptSegments, ({ one }) => ({
  review: one(reviews, { fields: [transcriptSegments.reviewId], references: [reviews.id] }),
}));

export const interactionEventsRelations = relations(interactionEvents, ({ one }) => ({
  review: one(reviews, { fields: [interactionEvents.reviewId], references: [reviews.id] }),
}));

export const keyframesRelations = relations(keyframes, ({ one }) => ({
  review: one(reviews, { fields: [keyframes.reviewId], references: [reviews.id] }),
}));

export const analysisWindowsRelations = relations(analysisWindows, ({ one, many }) => ({
  review: one(reviews, { fields: [analysisWindows.reviewId], references: [reviews.id] }),
  findings: many(findings),
}));

export const findingsRelations = relations(findings, ({ one, many }) => ({
  review: one(reviews, { fields: [findings.reviewId], references: [reviews.id] }),
  window: one(analysisWindows, { fields: [findings.windowId], references: [analysisWindows.id] }),
  evidence: many(findingEvidence),
  comments: many(findingComments),
  decisions: many(findingDecisions),
}));

export const findingEvidenceRelations = relations(findingEvidence, ({ one }) => ({
  finding: one(findings, { fields: [findingEvidence.findingId], references: [findings.id] }),
}));

export const findingCommentsRelations = relations(findingComments, ({ one }) => ({
  finding: one(findings, { fields: [findingComments.findingId], references: [findings.id] }),
  author: one(users, { fields: [findingComments.authorId], references: [users.id] }),
}));

export const findingDecisionsRelations = relations(findingDecisions, ({ one }) => ({
  finding: one(findings, { fields: [findingDecisions.findingId], references: [findings.id] }),
  author: one(users, { fields: [findingDecisions.createdById], references: [users.id] }),
}));

export const processingStagesRelations = relations(processingStages, ({ one }) => ({
  review: one(reviews, { fields: [processingStages.reviewId], references: [reviews.id] }),
}));

export { sql };
