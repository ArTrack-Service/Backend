import express, { Request, Response } from "express";

const artworks = express();

artworks.get("/", (req: Request, res: Response) => {
  res.send("Hello, Artworks!");
});

export default artworks;
