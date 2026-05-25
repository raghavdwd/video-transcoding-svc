ALTER TABLE "uploads" ADD COLUMN "transcoded_files" json DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "thumbnail" varchar(255);