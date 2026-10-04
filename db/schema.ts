import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
const date = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull(),
  usernameKey: text("username_key").notNull().unique(),
  passwordHash: text("password_hash"),
  createdAt: date("created_at").notNull().defaultNow(),
});
export const actors = pgTable("actors", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .unique(),
  username: text("username").notNull(),
  kind: text("kind").notNull(),
  createdAt: date("created_at").notNull().defaultNow(),
});
export const identities = pgTable(
  "auth_identities",
  {
    provider: text("provider").notNull(),
    subject: text("subject").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.provider, t.subject] })],
);
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => actors.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: date("expires_at").notNull(),
  lastSeenAt: date("last_seen_at").notNull().defaultNow(),
  revokedAt: date("revoked_at"),
  createdAt: date("created_at").notNull().defaultNow(),
});
export const realtimeTickets = pgTable("realtime_tickets", {
  tokenHash: text("token_hash").primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id),
  expiresAt: date("expires_at").notNull(),
  consumedAt: date("consumed_at"),
});
export const oauthStates = pgTable("oauth_states", {
  stateHash: text("state_hash").primaryKey(),
  provider: text("provider").notNull(),
  verifier: text("verifier").notNull(),
  bindingHash: text("binding_hash").notNull(),
  expiresAt: date("expires_at").notNull(),
});
export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey(),
    creatorUserId: uuid("creator_user_id")
      .notNull()
      .references(() => users.id),
    hostActorId: uuid("host_actor_id").references(() => actors.id),
    code: text("code"),
    visibility: text("visibility").notNull(),
    phase: text("phase").notNull(),
    version: integer("version").notNull().default(1),
    state: jsonb("state").notNull(),
    createdAt: date("created_at").notNull().defaultNow(),
    updatedAt: date("updated_at").notNull().defaultNow(),
    expiresAt: date("expires_at").notNull(),
  },
  (t) => [uniqueIndex("rooms_live_code").on(t.code), index("rooms_phase").on(t.phase)],
);
export const roomMembers = pgTable(
  "room_members",
  {
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => actors.id),
    role: text("role").notNull(),
    status: text("status").notNull(),
    joinedAt: date("joined_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.roomId, t.actorId] })],
);
export const invitations = pgTable("invitations", {
  tokenHash: text("token_hash").primaryKey(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id),
  expiresAt: date("expires_at").notNull(),
  consumedAt: date("consumed_at"),
  consumedBy: uuid("consumed_by").references(() => actors.id),
  revokedAt: date("revoked_at"),
});
export const races = pgTable("races", {
  id: uuid("id").primaryKey(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id),
  phase: text("phase").notNull(),
  text: text("text").notNull(),
  settings: jsonb("settings").notNull(),
  startsAt: date("starts_at").notNull(),
  endsAt: date("ends_at"),
  finishedAt: date("finished_at"),
});
export const results = pgTable(
  "results",
  {
    id: uuid("id").primaryKey(),
    raceId: uuid("race_id")
      .notNull()
      .references(() => races.id),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => actors.id),
    data: jsonb("data").notNull(),
    createdAt: date("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("results_race_actor").on(t.raceId, t.actorId),
    index("results_actor").on(t.actorId),
  ],
);
export const roomEvents = pgTable(
  "room_events",
  {
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    version: integer("version").notNull(),
    data: jsonb("data").notNull(),
    createdAt: date("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.roomId, t.version] })],
);
export const commandReceipts = pgTable(
  "command_receipts",
  {
    actorId: uuid("actor_id")
      .notNull()
      .references(() => actors.id),
    commandId: uuid("command_id").notNull(),
    roomId: uuid("room_id").references(() => rooms.id),
    response: jsonb("response").notNull(),
    createdAt: date("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.actorId, t.commandId] })],
);
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: date("window_start").notNull(),
  count: integer("count").notNull(),
});
