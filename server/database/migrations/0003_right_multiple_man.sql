ALTER TABLE "guides" DROP CONSTRAINT "guides_group_id_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "permissions" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "guides" ADD CONSTRAINT "guides_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;