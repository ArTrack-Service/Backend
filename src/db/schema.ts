import { pgTable, serial, text, varchar, boolean } from "drizzle-orm/pg-core";

export const artworks = pgTable("artworks", {
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
