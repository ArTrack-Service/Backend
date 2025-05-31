import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

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

export const coursesTable = pgTable("courses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
  points: jsonb("points").$type<string[]>(),
});
