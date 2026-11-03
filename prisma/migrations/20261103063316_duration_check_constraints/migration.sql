-- 0분은 시간 없음(null)으로 변환 (COMMON-006)
UPDATE "Record" SET "durationMinutes" = NULL WHERE "durationMinutes" = 0;
UPDATE "Action" SET "defaultDurationMinutes" = NULL WHERE "defaultDurationMinutes" = 0;

-- 행동 기본 시간
ALTER TABLE "Action"
ADD CONSTRAINT actions_default_duration_check
CHECK (
  "defaultDurationMinutes" IS NULL
  OR "defaultDurationMinutes" BETWEEN 1 AND 1439
);

-- 행동 ± 단위
ALTER TABLE "Action"
ADD CONSTRAINT actions_duration_step_check
CHECK ("durationStepMinutes" IN (1, 5, 10, 15, 30, 60));

-- 기록 소요 시간
ALTER TABLE "Record"
ADD CONSTRAINT records_duration_check
CHECK (
  "durationMinutes" IS NULL
  OR "durationMinutes" BETWEEN 1 AND 1439
);
