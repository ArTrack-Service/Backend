import express, { Request, Response } from "express";

const artworks = express();

artworks.get("/", (req: Request, res: Response) => {
  res.send("Hello, Artworks!");
});

artworks.post("/favorite", (req: Request, res: Response) => {
  res.send("Favorite artwork endpoint");
});

export default artworks;
