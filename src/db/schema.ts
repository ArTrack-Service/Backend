import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userTable = pgTable("user", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const usersRelations = relations(userTable, ({ many }) => ({
  usersToArtworks: many(usersToArtwork),
}));

export const artworksTable = pgTable("artworks", {
  id: serial("id").primaryKey(),
  // 설치 연도 (공통)
  createdAt: text("createdAt"),
  // 작품명 (공통)
  name: text("name"),
  // 작품 유형
  type: varchar("type"),
  // 공개 여부
  isPublic: boolean("isPublic"),
  // 작품 위치
  address: text("address"),
  // 작품 상세 설명
  description: text("description"),
});

export const artworkRelations = relations(artworksTable, ({ many }) => ({
  usersToArtworks: many(usersToArtwork),
}));

export const usersToArtwork = pgTable(
  "users_to_artworks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id),
    artworkId: integer("artwork_id")
      .notNull()
      .references(() => artworksTable.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.artworkId] })],
);
export const usersToGroupsRelations = relations(usersToArtwork, ({ one }) => ({
  artwork: one(artworksTable, {
    fields: [usersToArtwork.artworkId],
    references: [artworksTable.id],
  }),
  user: one(userTable, {
    fields: [usersToArtwork.userId],
    references: [userTable.id],
  }),
}));

export const coursesTable = pgTable("courses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
  points: jsonb("points").$type<string[]>(),
});
