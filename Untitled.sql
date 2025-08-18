CREATE TABLE "users" (
  "id" integer,
  "name" varchar,
  "email" varchar,
  "password_hash" varchar,
  "role_id" integer,
  "created_at" date
);

CREATE TABLE "roles" (
  "id" integer,
  "name" varchar
);

CREATE TABLE "resources" (
  "id" integer,
  "name" varchar,
  "type" varchar,
  "description" varchar,
  "price_per_hour" varchar,
  "status" varchar,
  "created_at" date
);

CREATE TABLE "bookings" (
  "id" integer,
  "user_id" integer,
  "resurce_id" integer
);

CREATE TABLE "payments" (
  "id" integer,
  "booking_id" integer,
  "amount" varchar,
  "status" varchar,
  "payment_method" varchar,
  "transaction_id" varchar,
  "created_at" date
);

CREATE TABLE "logs" (
  "id" integer,
  "user_id" integer,
  "action" varchard,
  "details" varchar,
  "created_at" date
);

ALTER TABLE "users" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("id") REFERENCES "users" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("resurce_id") REFERENCES "resources" ("id");

ALTER TABLE "payments" ADD FOREIGN KEY ("id") REFERENCES "bookings" ("id");

ALTER TABLE "logs" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
