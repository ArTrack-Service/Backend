import express, { Request, Response } from "express";

const course = express();

/**
 * 모든 코스 정보를 가져오는 GET 요청
 */
course.get("/", (req: Request, res: Response) => {
  res.send("Favorite artwork endpoint");
});

/**
 * 코스 id에 해당하는 코스 정보를 가져오는 GET 요청
 */
course.get("/:id", (req: Request, res: Response) => {
  const courseId = req.params.id;
  res.send(`Details of course with ID: ${courseId}`);
});

export default course;
