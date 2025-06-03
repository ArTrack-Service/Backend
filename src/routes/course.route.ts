import express, { Request, Response } from "express";
import db from "../db";
import { coursesTable } from "../db/schema";
import { and, desc, eq, gte, lt, lte } from "drizzle-orm";
import getSession from "../lib/getSession";

const courseRoute = express.Router();

/**
 * 모든 코스 정보를 가져오는 GET 요청
 */
courseRoute.get("/", async (req: Request, res: Response) => {
  const maxLocations = req.query.max;
  const timeMax = req.query.timeMax;
  const timeMin = req.query.timeMin;

  try {
    if (maxLocations && !isNaN(Number(maxLocations))) {
      const coursesData = await db.query.coursesTable.findMany({
        orderBy: desc(coursesTable.createdAt),
        where: and(
          timeMin ? gte(coursesTable.time, Number(timeMin)) : undefined,
          timeMax ? lt(coursesTable.time, Number(timeMax)) : undefined,
        ),
      });
      return void res
        .status(200)
        .json(
          coursesData.filter(
            (data) =>
              data.points?.length &&
              data.points?.length <= Number(maxLocations),
          ),
        );
    } else {
      const coursesData = await db.query.coursesTable.findMany({
        orderBy: desc(coursesTable.createdAt),
        where: and(
          timeMin ? gte(coursesTable.time, Number(timeMin)) : undefined,
          timeMax ? lt(coursesTable.time, Number(timeMax)) : undefined,
        ),
      });
      return void res.status(200).json(coursesData);
    }
  } catch (err) {
    // DB 조회 중 에러가 발생하면 500 반환
    return void res.status(500).json({ message: "DB query error" });
  }
});

/**
 * 코스 id에 해당하는 코스 정보를 가져오는 GET 요청
 */
courseRoute.get("/:id", async (req: Request, res: Response) => {
  // id를 number로 변환
  const courseId = req.params.id;

  try {
    const courseData = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.id, courseId),
    });
    if (!courseData) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.status(200).json(courseData);
    return;
  } catch (err) {
    res.status(500).json({ message: "DB query error" });
    return;
  }
});

/**
 * 새 코스를 추가하는 POST 요청
 */
courseRoute.post("/", async (req: Request, res: Response) => {
  const session = await getSession(req);
  if (!session?.user?.id) {
    return void res.status(401).json({ message: "Unauthorized" });
  }

  const { name, description, points, canShare, time } = req.body as {
    name: string;
    description: string;
    points: number[];
    canShare?: boolean;
    time: number;
  };
  console.log(name, description, points, session);

  // 필수 필드가 하나라도 빠졌으면 400 반환
  if (!name || !description || points === undefined) {
    return void res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const createCourse = await db
      .insert(coursesTable)
      .values({
        name,
        description,
        points,
        userId: session?.user?.id,
        canShare: canShare ? canShare : false,
        time: time,
      })
      .returning();
    return void res.status(201).json({
      message: "Course created successfully",
      courseId: createCourse[0].id,
    });
  } catch (err) {
    console.log(err);
    return void res.status(500).json({ message: "DB insert error" });
  }
});

/**
 * 코스를 수정하는 PUT 요청
 */
courseRoute.put("/", async (req: Request, res: Response) => {
  const session = await getSession(req);
  if (!session?.user?.id) {
    return void res.status(401).json({ message: "Unauthorized" });
  }

  const { id, name, description, points, canShare, time } = req.body as {
    id: string;
    name: string;
    description: string;
    points: number[];
    canShare?: boolean;
    time: number;
  };

  // 필수 필드가 하나라도 빠졌으면 400 반환
  if (!id || !name || !description || points === undefined) {
    return void res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const checkUserCanUpdate = await db.query.coursesTable.findFirst({
      where: and(
        eq(coursesTable.id, id),
        eq(coursesTable.userId, session.user.id),
      ),
    });
    if (!checkUserCanUpdate) {
      return void res.status(403).json({ message: "Forbidden" });
    }
    await db
      .update(coursesTable)
      .set({
        name,
        description,
        points,
        canShare: canShare ? canShare : false,
        time: time,
      })
      .where(eq(coursesTable.id, checkUserCanUpdate.id));
    return void res.status(201).json({
      message: "Course updated successfully",
    });
  } catch (err) {
    console.log(err);
    return void res.status(500).json({ message: "DB insert error" });
  }
});

/**
 * 코스를 삭제하는 요청
 *
 * 본인이 만든 코스가 아니라면 403 Forbidden
 */
courseRoute.delete("/:id", async (req: Request, res: Response) => {
  const session = await getSession(req);

  if (!session?.user?.id) {
    return void res.status(401).json({ message: "Unauthorized" });
  }

  const courseId = req.params.id;

  // id가 없으면 400 반환
  if (!courseId) {
    return void res.status(400).json({ message: "Course ID is required" });
  }

  try {
    // 해당 코스가 존재하는지 확인
    const courseData = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.id, courseId),
    });

    if (!courseData) {
      return void res.status(404).json({ message: "Course not found" });
    }

    // 현재 로그인한 유저가 해당 코스의 작성자인지 확인
    if (courseData.userId !== session?.user?.id) {
      return void res.status(403).json({ message: "Forbidden" });
    }

    // 코스 삭제
    await db.delete(coursesTable).where(eq(coursesTable.id, courseId));
    return void res
      .status(200)
      .json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "DB delete error" });
  }
});

export default courseRoute;
