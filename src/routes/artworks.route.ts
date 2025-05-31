import express, { Request, Response } from "express";

const artworksRoute = express();

artworksRoute.get("/", (req: Request, res: Response) => {
  res.send("Hello, Artworks!");
});

artworksRoute.post("/favorite", (req: Request, res: Response) => {
  res.send("Favorite artwork endpoint");
});

export default artworksRoute;
