import express, { Request, Response } from "express";
import db from "../db";
import { desc, eq, ilike } from "drizzle-orm";
import { artworksTable, usersToArtwork } from "../db/schema";
import { validateSessionToken } from "../controller/auth.controller";
import getSession from "../lib/getSession";

const artwork = express();

/**
 * 모든 작품 정보를 가져오는 GET 요청
 * 선택적으로 카테고리로 필터링 가능
 */
artwork.get("/", async (req: Request, res: Response) => {
  const { category } = req.query as { category?: string };

  try {
    const session = await validateSessionToken(req.cookies["sessionToken"]);
    if (session.user?.id) {
      const artworkData = await db.query.artworksTable.findMany({
        where: category ? ilike(artworksTable.type, category) : undefined,
        orderBy: desc(artworksTable.createdAt),
        with: {
          usersToArtworks: {
            where: eq(usersToArtwork.userId, session.user.id),
          },
        },
      });
      return void res.status(200).json(
        artworkData.map((artwork) => ({
          name: artwork.name,
          id: artwork.id,
          description: artwork.description,
          type: artwork.type,
          address: artwork.address,
          image: artwork.image,
          createdAt: artwork.createdAt,
          isPublic: artwork.isPublic,
          isFavorite: artwork.usersToArtworks.length > 0,
        })),
      );
    }
    const artworkData = await db.query.artworksTable.findMany({
      where: category ? ilike(artworksTable.type, category) : undefined,
      orderBy: desc(artworksTable.createdAt),
    });

    return void res.status(200).json(
      artworkData.map((artwork) => ({
        ...artwork,
        isFavorite: false,
      })),
    );
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Failed to fetch artworks" });
  }
});

/**
 * 작품 ID에 해당하는 작품 정보를 가져오는 GET 요청
 */
artwork.get("/favorite", async (req: Request, res: Response) => {
  const { session, user } = await getSession(req);

  if (user?.id) {
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

artwork.get("/:id", async (req: Request, res: Response) => {
  const artworkId = parseInt(req.params.id, 10);
  if (!artworkId || isNaN(artworkId)) {
    return void res.status(400).json({ message: "Invalid artwork ID" });
  }

  try {
    const session = await validateSessionToken(req.cookies["sessionToken"]);
    if (session.user?.id) {
      const artworkData = await db.query.artworksTable.findFirst({
        where: eq(artworksTable.id, artworkId),
        with: {
          usersToArtworks: {
            where: eq(usersToArtwork.userId, session.user.id),
          },
        },
      });

      if (!artworkData) {
        return void res.status(404).json({ message: "Artwork not found" });
      }

      return void res.status(200).json({
        id: artworkData.id,
        name: artworkData.name,
        description: artworkData.description,
        type: artworkData.type,
        address: artworkData.address,
        image: artworkData.image,
        createdAt: artworkData.createdAt,
        isPublic: artworkData.isPublic,
        isFavorite: artworkData.usersToArtworks.length > 0,
      });
    }
    const artworkData = await db.query.artworksTable.findFirst({
      where: eq(artworksTable.id, artworkId),
    });

    if (!artworkData) {
      return void res.status(404).json({ message: "Artwork not found" });
    }

    return void res.status(200).json({ ...artworkData, isFavorite: false });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Failed to fetch artworks" });
  }
});

/**
 * 특정 작품을 즐겨찾기에 추가하는 POST 요청
 */
artwork.post("/favorite", async (req: Request, res: Response) => {
  const sessionData = await getSession(req);
  if (!sessionData.user?.id) {
    return void res.status(401).json({ message: "Unauthorized" });
  }
  const { artworkId } = req.body as { artworkId: number };

  if (!artworkId || isNaN(artworkId)) {
    return void res.status(400).json({ message: "Invalid artwork ID" });
  }

  try {
    await db.insert(usersToArtwork).values({
      userId: sessionData?.user?.id!,
      artworkId,
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "DB Insert Error" });
  }

  return void res.status(200).json({ message: "Artwork added to favorites" });
});

export default artwork;
