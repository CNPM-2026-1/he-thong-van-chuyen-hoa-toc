-- Sprint 2 - Bộ 2 (TV7): chuyến xe và lịch sử GPS.
-- Manifest/Package intentionally excluded until the team confirms its aggregate model.

CREATE TYPE "TripStatus" AS ENUM (
  'PLANNED',
  'BOARDING',
  'DISPATCHED',
  'IN_TRANSIT',
  'ARRIVED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE "trips" (
  "id" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "route_id" UUID NOT NULL,
  "vehicle_id" UUID NOT NULL,
  "driver_id" UUID NOT NULL,
  "planned_departure_at" TIMESTAMPTZ(3) NOT NULL,
  "planned_arrival_at" TIMESTAMPTZ(3),
  "actual_departure_at" TIMESTAMPTZ(3),
  "actual_arrival_at" TIMESTAMPTZ(3),
  "status" "TripStatus" NOT NULL DEFAULT 'PLANNED',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trip_locations" (
  "id" UUID NOT NULL,
  "trip_id" UUID NOT NULL,
  "vehicle_id" UUID NOT NULL,
  "driver_id" UUID NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "speed_kph" DOUBLE PRECISION,
  "heading_degrees" DOUBLE PRECISION,
  "recorded_at" TIMESTAMPTZ(3) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "trip_locations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trip_status_history" (
  "id" UUID NOT NULL,
  "trip_id" UUID NOT NULL,
  "changed_by_id" UUID NOT NULL,
  "from_status" "TripStatus",
  "to_status" "TripStatus" NOT NULL,
  "note" TEXT,
  "changed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "trip_status_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "trips_code_key" ON "trips"("code");
CREATE INDEX "trips_driver_id_status_idx" ON "trips"("driver_id", "status");
CREATE INDEX "trips_vehicle_id_status_idx" ON "trips"("vehicle_id", "status");
CREATE INDEX "trips_planned_departure_at_idx" ON "trips"("planned_departure_at");
CREATE INDEX "trip_locations_trip_id_recorded_at_idx" ON "trip_locations"("trip_id", "recorded_at");
CREATE INDEX "trip_status_history_trip_id_changed_at_idx" ON "trip_status_history"("trip_id", "changed_at");

ALTER TABLE "trips"
  ADD CONSTRAINT "trips_route_id_fkey"
  FOREIGN KEY ("route_id") REFERENCES "routes"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "trips"
  ADD CONSTRAINT "trips_vehicle_id_fkey"
  FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "trips"
  ADD CONSTRAINT "trips_driver_id_fkey"
  FOREIGN KEY ("driver_id") REFERENCES "drivers"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "trip_locations"
  ADD CONSTRAINT "trip_locations_trip_id_fkey"
  FOREIGN KEY ("trip_id") REFERENCES "trips"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trip_locations"
  ADD CONSTRAINT "trip_locations_vehicle_id_fkey"
  FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "trip_locations"
  ADD CONSTRAINT "trip_locations_driver_id_fkey"
  FOREIGN KEY ("driver_id") REFERENCES "drivers"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "trip_status_history"
  ADD CONSTRAINT "trip_status_history_trip_id_fkey"
  FOREIGN KEY ("trip_id") REFERENCES "trips"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trip_status_history"
  ADD CONSTRAINT "trip_status_history_changed_by_id_fkey"
  FOREIGN KEY ("changed_by_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
