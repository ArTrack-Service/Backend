import express, { Request, Response } from "express";
import db from "../db";
import { coursesTable } from "../db/schema";
import { eq } from "drizzle-orm";

// 1) express()가 아닌 Router()를 사용
const courseRoute = express.Router();

/**
 * 모든 코스 정보를 가져오는 GET 요청
 */
courseRoute.get("/", async (req: Request, res: Response) => {
  try {
    const coursesData = await db.query.coursesTable.findMany();
    return res.status(200).json(coursesData);
  } catch (err) {
    // DB 조회 중 에러가 발생하면 500 반환
    return res.status(500).json({ message: "DB query error" });
  }
});

/**
 * 코스 id에 해당하는 코스 정보를 가져오는 GET 요청
 */
courseRoute.get("/:id", async (req: Request, res: Response) => {
  // 2) id를 number로 변환
  const courseId = req.params.id;

  try {
    const courseData = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.id, courseId),
    });
    if (!courseData) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json(courseData);
  } catch (err) {
    return res.status(500).json({ message: "DB query error" });
  }
});

/**
 * 새 코스를 추가하는 POST 요청
 */
courseRoute.post("/", async (req: Request, res: Response) => {
  const { name, description, points } = req.body;

  // 3) 필수 필드가 하나라도 빠졌으면 400 반환
  if (!name || !description || points === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await db.insert(coursesTable).values({
      name,
      description,
      points,
    });
    return res.status(201).json({ message: "Course created successfully" });
  } catch (err) {
    return res.status(500).json({ message: "DB insert error" });
  }
});

export default courseRoute;
