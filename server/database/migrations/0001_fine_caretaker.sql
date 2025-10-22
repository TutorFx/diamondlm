CREATE TABLE "guides" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"embedding" vector(1024)
);
--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "guides" USING hnsw ("embedding" vector_cosine_ops);