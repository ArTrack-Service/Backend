import express, { Request, Response } from "express";
import artworksRoute from "./routes/artwork.route";
import courseRoute from "./routes/course.route";
import authRouter from "./routes/auth.route";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send({ result: "API is Healthy" });
});

app.use("/api/v1/artwork", artworksRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/auth", authRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
