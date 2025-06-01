import express, { Request, Response } from "express";
import db from "../db";
import { desc, eq, ilike } from "drizzle-orm";
import { artworksTable, usersToArtwork } from "../db/schema";
import { validateSessionToken } from "../controller/auth.controller";
import protectRoute from "../lib/protect-route";

const artwork = express();

/**
 * 모든 작품 정보를 가져오는 GET 요청
 * 선택적으로 카테고리로 필터링 가능
 */
artwork.get("/", async (req: Request, res: Response) => {
  const { category } = req.query as { category?: string };

  try {
    const artworkData = await db.query.artworksTable.findMany({
      where: category ? ilike(artworksTable.type, category) : undefined,
      orderBy: desc(artworksTable.createdAt),
    });

    return void res.status(200).json(artworkData);
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Failed to fetch artworks" });
  }
});

/**
 * 작품 ID에 해당하는 작품 정보를 가져오는 GET 요청
 */
artwork.get("/favorite", async (req: Request, res: Response) => {
  const token = req.cookies["sessionToken"];
  if (token !== null) {
    const { session, user } = await validateSessionToken(token);
    const favoriteArtworks = await db.query.usersToArtwork.findMany({
      where: eq(usersToArtwork.userId, user?.id!),
      with: {
        artwork: true,
      },
    });
    return void res
      .status(200)
      .json(favoriteArtworks.map((fav) => fav.artwork));
  }
  return void res.status(401).json({ message: "Unauthorized" });
});

/**
 * 특정 작품을 즐겨찾기에 추가하는 POST 요청
 */
artwork.post("/favorite", async (req: Request, res: Response) => {
  const sessionData = await protectRoute(req, res);
  const { artworkId } = req.body as { artworkId: number };

  await db.insert(usersToArtwork).values({
    userId: sessionData?.user?.id!,
    artworkId,
  });

  return void res.status(200).json({ message: "Artwork added to favorites" });
});

export default artwork;
