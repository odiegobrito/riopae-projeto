-- Add updatedAt to stock movements so every required table has createdAt and updatedAt.
ALTER TABLE "stock_movements"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Basic data integrity constraints.
ALTER TABLE "products"
ADD CONSTRAINT "products_minimumStock_non_negative_check"
CHECK ("minimumStock" >= 0);

ALTER TABLE "stock_movements"
ADD CONSTRAINT "stock_movements_quantity_positive_check"
CHECK ("quantity" > 0);

-- Helpful indexes for foreign key lookups.
CREATE INDEX "stock_movements_userId_idx" ON "stock_movements"("userId");

CREATE INDEX "purchase_requests_requestedById_idx" ON "purchase_requests"("requestedById");

-- Database-level protection against duplicated pending purchase requests.
CREATE UNIQUE INDEX "purchase_requests_productId_pending_unique"
ON "purchase_requests"("productId")
WHERE "status" = 'PENDING';
