CREATE TABLE "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"createdAt" timestamp,
	"points" jsonb
);
