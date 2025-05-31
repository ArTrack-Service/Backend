import express, { Request, Response } from "express";
import artworks from "./artworks";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("API is running!");
});

app.use("/api/v1/artworks", artworks);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
