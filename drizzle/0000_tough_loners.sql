CREATE TABLE "artworks" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" text,
	"name" text,
	"type" varchar,
	"isPublic" boolean,
	"address" text,
	"description" text
);
