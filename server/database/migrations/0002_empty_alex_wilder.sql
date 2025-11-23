CREATE TABLE "group_members" (
	"id" serial NOT NULL,
	"userId" varchar(36) NOT NULL,
	"groupId" varchar(36) NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_members_userId_groupId_pk" PRIMARY KEY("userId","groupId")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN "group_id" varchar(36);--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_groups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "group_members_user_id_idx" ON "group_members" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "guides" ADD CONSTRAINT "guides_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;