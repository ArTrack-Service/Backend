import express, { Request, Response } from "express";
import artworksRoute from "./routes/artwork.route";
import courseRoute from "./routes/course.route";
import authRouter from "./routes/auth.route";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 데이터를 JSON 형식으로 파싱하고 쿠키를 파싱하기 위한 미들웨어 설정
 */
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

/**
 * API 상태를 확인하기 위한 기본 라우트
 */
app.get("/", (req: Request, res: Response) => {
  res.send({ result: "API is Healthy" });
});

/**
 * 라우트 설정
 */
app.use("/api/v1/artwork", artworksRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/auth", authRouter);

/**
 * 404 에러 핸들링
 * 정의되지 않은 라우트에 대한 요청이 들어오면 404 응답을 반환
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

/**
 * 서버 시작
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
