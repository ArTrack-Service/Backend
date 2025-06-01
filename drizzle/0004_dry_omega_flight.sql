CREATE TABLE "users_to_groups" (
	"user_id" text NOT NULL,
	"artwork_id" integer NOT NULL,
	CONSTRAINT "users_to_groups_user_id_artwork_id_pk" PRIMARY KEY("user_id","artwork_id")
);
--> statement-breakpoint
ALTER TABLE "users_to_groups" ADD CONSTRAINT "users_to_groups_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_groups" ADD CONSTRAINT "users_to_groups_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE no action ON UPDATE no action;