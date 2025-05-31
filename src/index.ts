import express, { Request, Response } from "express";
import artworks from "./artworks";
import auth from "./auth";
import course from "./course";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("API is running!");
});

app.use("/api/v1/artworks", artworks);
app.use("/api/v1/auth", auth);
app.use("/api/v1/course", course);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
