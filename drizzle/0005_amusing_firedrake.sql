ALTER TABLE "users_to_groups" RENAME TO "users_to_artworks";--> statement-breakpoint
ALTER TABLE "users_to_artworks" DROP CONSTRAINT "users_to_groups_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_artworks" DROP CONSTRAINT "users_to_groups_artwork_id_artworks_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_artworks" DROP CONSTRAINT "users_to_groups_user_id_artwork_id_pk";--> statement-breakpoint
ALTER TABLE "users_to_artworks" ADD CONSTRAINT "users_to_artworks_user_id_artwork_id_pk" PRIMARY KEY("user_id","artwork_id");--> statement-breakpoint
ALTER TABLE "users_to_artworks" ADD CONSTRAINT "users_to_artworks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_artworks" ADD CONSTRAINT "users_to_artworks_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE no action ON UPDATE no action;