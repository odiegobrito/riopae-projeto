-- Rename product availability field from active to status.
ALTER TABLE "products" RENAME COLUMN "active" TO "status";

ALTER INDEX "products_active_idx" RENAME TO "products_status_idx";
