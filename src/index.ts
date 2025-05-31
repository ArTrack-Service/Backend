import express, { Request, Response } from "express";
import artworksRoute from "./routes/artworks.route";
import courseRoute from "./routes/course.route";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send({ result: "API is Healthy" });
});

app.use("/api/v1/artworks", artworksRoute);
app.use("/api/v1/course", courseRoute);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
