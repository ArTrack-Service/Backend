import publicArts from "./../서울시 관리 공공 미술 목록.json";
import sculpts from "./../서울시 기타조형물 현황.json";
import galleries from "./../서울시 도시갤러리 현황.json";
import statues from "./../서울시 동상 현황.json";
import { artworksTable } from "./db/schema";
import db from "./db";

export async function createData() {
  const artworksData: (typeof artworksTable.$inferInsert)[] = [];

  for (const d of publicArts.DATA) {
    artworksData.push({
      createdAt: d?.ga_ins_date,
      name: d?.ga_kname,
      type: "publicArt",
      isPublic: true,
      address: d?.ga_addr,
      description: "",
    });
  }

  for (const sculpt of sculpts.DATA) {
    artworksData.push({
      createdAt: sculpt?.ga_ins_date,
      name: sculpt?.ga_kname,
      type: "sculpture",
      isPublic: sculpt?.ga_servi === "Y",
      address: sculpt?.ga_addr1 + " " + sculpt?.ga_addr2,
      description: sculpt?.ga_detail,
    });
  }

  for (const gallery of galleries.DATA) {
    artworksData.push({
      createdAt: gallery?.ga_ins_date,
      name: gallery?.ga_kname,
      type: "gallery",
      isPublic: gallery?.ga_servi === "Y",
      address: gallery?.ga_addr1 + " " + gallery?.ga_addr2,
      description: gallery?.ga_detail,
    });
  }

  for (const statue of statues.DATA) {
    artworksData.push({
      createdAt: statue?.ga_ins_date,
      name: statue?.ga_kname,
      type: "statue",
      isPublic: statue?.ga_servi === "Y",
      address: statue?.ga_addr1 + " " + statue?.ga_addr2,
      description: statue?.ga_detail,
    });
  }

  await db.insert(artworksTable).values(artworksData);
}
