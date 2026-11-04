-- DB 설계서 V1.1 컬럼 타입·enum 이름에 맞춤

ALTER TYPE "SortOrder" RENAME TO "RecordSortOrder";

ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE VARCHAR(320);

ALTER TABLE "categories" ALTER COLUMN "icon" SET DATA TYPE VARCHAR(100);

ALTER TABLE "actions"
  ALTER COLUMN "icon" SET DATA TYPE VARCHAR(100),
  ALTER COLUMN "default_duration_minutes" SET DATA TYPE SMALLINT,
  ALTER COLUMN "duration_step_minutes" SET DATA TYPE SMALLINT;

ALTER TABLE "records" ALTER COLUMN "duration_minutes" SET DATA TYPE SMALLINT;

ALTER TABLE "user_settings" ALTER COLUMN "timezone" SET DATA TYPE VARCHAR(100);
