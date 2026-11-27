-- Sprint 2 - Bộ 2 (TV7 + TV8): package-level manifest, delivery, COD, incidents and notifications.
-- A ManifestItem represents one physical Package, following KienHang / ChiTietPhieuKe in the ERD.

ALTER TABLE "trips" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING_RECEIPT','RECEIVED','WAITING_FOR_DISPATCH','IN_TRANSIT',
  'AT_DESTINATION','OUT_FOR_DELIVERY','DELIVERY_FAILED','INCIDENT_HOLD',
  'RETURNING','DELIVERED','RETURNED','CANCELLED'
);
CREATE TYPE "ServiceLevel" AS ENUM ('STANDARD','EXPRESS');
CREATE TYPE "ManifestStatus" AS ENUM ('OPEN','CLOSED');
CREATE TYPE "ManifestItemStatus" AS ENUM ('PENDING_LOAD','LOADED','UNLOADED','MISSING','DAMAGED');
CREATE TYPE "DeliveryAttemptStatus" AS ENUM ('DELIVERED','FAILED');
CREATE TYPE "DeliveryFailureReason" AS ENUM ('RECIPIENT_ABSENT','INVALID_ADDRESS','REFUSED','OTHER');
CREATE TYPE "CodTransactionStatus" AS ENUM ('PENDING_REMITTANCE','REMITTED','RECONCILED');
CREATE TYPE "CodReconciliationStatus" AS ENUM ('MATCHED','MISMATCH_PENDING_REVIEW');
CREATE TYPE "IncidentType" AS ENUM ('DELAY','ACCIDENT','DAMAGED_PACKAGE','LOST_PACKAGE','VEHICLE_FAILURE','RECIPIENT_ISSUE','OTHER');
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN','IN_PROGRESS','RESOLVED','CLOSED');
CREATE TYPE "NotificationType" AS ENUM ('ORDER_STATUS','DELIVERY','COD','INCIDENT','TRIP','SYSTEM');
CREATE TYPE "MediaPurpose" AS ENUM ('DELIVERY_PROOF','INCIDENT_EVIDENCE','OTHER');

CREATE TABLE "orders" (
  "id" UUID NOT NULL,
  "tracking_code" TEXT NOT NULL,
  "customer_id" UUID NOT NULL,
  "recipient_name" TEXT NOT NULL,
  "recipient_phone" TEXT NOT NULL,
  "origin_station_id" UUID NOT NULL,
  "destination_station_id" UUID NOT NULL,
  "description" TEXT NOT NULL,
  "package_count" INTEGER NOT NULL,
  "weight_grams" INTEGER NOT NULL,
  "service_level" "ServiceLevel" NOT NULL,
  "cod_amount_vnd" INTEGER NOT NULL DEFAULT 0,
  "shipping_fee_vnd" INTEGER NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_RECEIPT',
  "version" INTEGER NOT NULL DEFAULT 1,
  "delivered_at" TIMESTAMPTZ(3),
  "returned_at" TIMESTAMPTZ(3),
  "note" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "orders_tracking_code_key" ON "orders"("tracking_code");
CREATE INDEX "orders_customer_id_created_at_idx" ON "orders"("customer_id","created_at");
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status","created_at");
CREATE INDEX "orders_origin_station_id_destination_station_id_idx" ON "orders"("origin_station_id","destination_station_id");

CREATE TABLE "packages" (
  "id" UUID NOT NULL,
  "order_id" UUID NOT NULL,
  "package_code" TEXT NOT NULL,
  "qr_code" TEXT NOT NULL,
  "description" TEXT,
  "weight_grams" INTEGER NOT NULL,
  "length_cm" DOUBLE PRECISION,
  "width_cm" DOUBLE PRECISION,
  "height_cm" DOUBLE PRECISION,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "packages_package_code_key" ON "packages"("package_code");
CREATE UNIQUE INDEX "packages_qr_code_key" ON "packages"("qr_code");
CREATE INDEX "packages_order_id_idx" ON "packages"("order_id");

CREATE TABLE "manifests" (
  "id" UUID NOT NULL,
  "trip_id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "created_by_id" UUID NOT NULL,
  "status" "ManifestStatus" NOT NULL DEFAULT 'OPEN',
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "manifests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "manifests_trip_id_key" ON "manifests"("trip_id");
CREATE UNIQUE INDEX "manifests_code_key" ON "manifests"("code");

CREATE TABLE "manifest_items" (
  "id" UUID NOT NULL,
  "manifest_id" UUID NOT NULL,
  "package_id" UUID NOT NULL,
  "status" "ManifestItemStatus" NOT NULL DEFAULT 'PENDING_LOAD',
  "scanned_by_id" UUID,
  "loaded_at" TIMESTAMPTZ(3),
  "unloaded_at" TIMESTAMPTZ(3),
  "scanned_at" TIMESTAMPTZ(3),
  "note" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "manifest_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "manifest_items_manifest_id_package_id_key" ON "manifest_items"("manifest_id","package_id");
CREATE INDEX "manifest_items_package_id_status_idx" ON "manifest_items"("package_id","status");

CREATE TABLE "order_status_history" (
  "id" UUID NOT NULL,
  "order_id" UUID NOT NULL,
  "changed_by_id" UUID NOT NULL,
  "from_status" "OrderStatus",
  "to_status" "OrderStatus" NOT NULL,
  "reason" TEXT,
  "changed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "order_status_history_order_id_changed_at_idx" ON "order_status_history"("order_id","changed_at");

CREATE TABLE "delivery_otps" (
  "id" UUID NOT NULL,
  "order_id" UUID NOT NULL,
  "driver_id" UUID NOT NULL,
  "requested_by_id" UUID NOT NULL,
  "code_hash" TEXT NOT NULL,
  "code_ciphertext" TEXT NOT NULL,
  "idempotency_key" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  "sent_at" TIMESTAMPTZ(3) NOT NULL,
  "consumed_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "delivery_otps_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "delivery_otps_idempotency_key_key" ON "delivery_otps"("idempotency_key");
CREATE INDEX "delivery_otps_order_id_created_at_idx" ON "delivery_otps"("order_id","created_at");

CREATE TABLE "delivery_attempts" (
  "id" UUID NOT NULL,
  "order_id" UUID NOT NULL,
  "driver_id" UUID NOT NULL,
  "actor_id" UUID NOT NULL,
  "status" "DeliveryAttemptStatus" NOT NULL,
  "recipient_name" TEXT,
  "cod_collected_vnd" INTEGER,
  "failure_reason" "DeliveryFailureReason",
  "note" TEXT,
  "photo_object_keys" JSONB,
  "delivered_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "delivery_attempts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "delivery_attempts_order_id_created_at_idx" ON "delivery_attempts"("order_id","created_at");

CREATE TABLE "cod_transactions" (
  "id" UUID NOT NULL,
  "order_id" UUID NOT NULL,
  "trip_id" UUID,
  "driver_id" UUID,
  "amount_vnd" INTEGER NOT NULL,
  "status" "CodTransactionStatus" NOT NULL DEFAULT 'PENDING_REMITTANCE',
  "collected_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "note" TEXT,
  CONSTRAINT "cod_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cod_transactions_trip_id_status_idx" ON "cod_transactions"("trip_id","status");
CREATE INDEX "cod_transactions_collected_at_idx" ON "cod_transactions"("collected_at");

CREATE TABLE "cod_reconciliations" (
  "id" UUID NOT NULL,
  "trip_id" UUID NOT NULL,
  "reconciled_by_id" UUID NOT NULL,
  "expected_amount_vnd" INTEGER NOT NULL,
  "counted_amount_vnd" INTEGER NOT NULL,
  "difference_vnd" INTEGER NOT NULL,
  "status" "CodReconciliationStatus" NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cod_reconciliations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cod_reconciliations_trip_id_created_at_idx" ON "cod_reconciliations"("trip_id","created_at");

CREATE TABLE "cod_reconciliation_items" (
  "id" UUID NOT NULL,
  "reconciliation_id" UUID NOT NULL,
  "transaction_id" UUID NOT NULL,
  CONSTRAINT "cod_reconciliation_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cod_reconciliation_items_reconciliation_id_transaction_id_key" ON "cod_reconciliation_items"("reconciliation_id","transaction_id");
CREATE INDEX "cod_reconciliation_items_transaction_id_idx" ON "cod_reconciliation_items"("transaction_id");

CREATE TABLE "incidents" (
  "id" UUID NOT NULL,
  "type" "IncidentType" NOT NULL,
  "severity" "IncidentSeverity" NOT NULL,
  "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
  "order_id" UUID,
  "trip_id" UUID,
  "reported_by_id" UUID NOT NULL,
  "description" TEXT NOT NULL,
  "resolution" TEXT,
  "order_previous_status" "OrderStatus",
  "photo_object_keys" JSONB,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "incidents_status_created_at_idx" ON "incidents"("status","created_at");
CREATE INDEX "incidents_order_id_idx" ON "incidents"("order_id");
CREATE INDEX "incidents_trip_id_idx" ON "incidents"("trip_id");

CREATE TABLE "notifications" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "order_id" UUID,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "resource_type" TEXT,
  "resource_id" UUID,
  "read_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id","read_at","created_at");

CREATE TABLE "media_objects" (
  "id" UUID NOT NULL,
  "object_key" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "content_type" TEXT NOT NULL,
  "purpose" "MediaPurpose" NOT NULL,
  "uploaded_by_id" UUID NOT NULL,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_objects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "media_objects_object_key_key" ON "media_objects"("object_key");
CREATE INDEX "media_objects_uploaded_by_id_purpose_created_at_idx" ON "media_objects"("uploaded_by_id","purpose","created_at");

ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_origin_station_id_fkey" FOREIGN KEY ("origin_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_destination_station_id_fkey" FOREIGN KEY ("destination_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "packages" ADD CONSTRAINT "packages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "manifest_items" ADD CONSTRAINT "manifest_items_manifest_id_fkey" FOREIGN KEY ("manifest_id") REFERENCES "manifests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manifest_items" ADD CONSTRAINT "manifest_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "manifest_items" ADD CONSTRAINT "manifest_items_scanned_by_id_fkey" FOREIGN KEY ("scanned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "delivery_otps" ADD CONSTRAINT "delivery_otps_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_otps" ADD CONSTRAINT "delivery_otps_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "delivery_otps" ADD CONSTRAINT "delivery_otps_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cod_transactions" ADD CONSTRAINT "cod_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cod_transactions" ADD CONSTRAINT "cod_transactions_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cod_transactions" ADD CONSTRAINT "cod_transactions_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cod_reconciliations" ADD CONSTRAINT "cod_reconciliations_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cod_reconciliations" ADD CONSTRAINT "cod_reconciliations_reconciled_by_id_fkey" FOREIGN KEY ("reconciled_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cod_reconciliation_items" ADD CONSTRAINT "cod_reconciliation_items_reconciliation_id_fkey" FOREIGN KEY ("reconciliation_id") REFERENCES "cod_reconciliations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cod_reconciliation_items" ADD CONSTRAINT "cod_reconciliation_items_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "cod_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "media_objects" ADD CONSTRAINT "media_objects_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
