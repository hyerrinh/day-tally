// API 공통 검증 (docs/api-spec.md 1-3)

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// YYYY-MM-DD 형식이고 실제로 존재하는 날짜면 Date(UTC 자정), 아니면 null
export const parseDate = (value: unknown): Date | null => {
	if (typeof value !== "string" || !dateRegex.test(value)) {
		return null;
	}
	const date = new Date(`${value}T00:00:00.000Z`);

	// 2026-13-01처럼 아예 잘못된 값은 Invalid Date, 2026-02-31처럼 넘치는 값은 다른 날짜가 됨
	if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
		return null;
	}

	return date;
};

// 사용자 시간대의 오늘보다 뒤면 미래 날짜. 시간대가 없으면 가장 빠른 시간대(UTC+14) 기준 (decisions.md 11, 22)
export const isFutureDate = (date: Date, timezone?: string | null): boolean => {
	const today = timezone
		? todayIn(timezone)
		: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10);

	return date.toISOString().slice(0, 10) > today;
};

// 시간대의 오늘을 YYYY-MM-DD로. 로케일 출력 형식에 의존하지 않도록 연·월·일을 따로 받아 조립
const todayIn = (timezone: string): string => {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());
	const get = (type: string) => parts.find((part) => part.type === type)?.value;

	return `${get("year")}-${get("month")}-${get("day")}`;
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// id는 UUID. 아니면 DB 조회 전에 "없음"으로 처리 (Prisma 오류 500 방지)
export const isUuid = (value: unknown): value is string =>
	typeof value === "string" && uuidRegex.test(value);

// 메모 규칙 (REC-001). 문자열을 공백 제거해 최대 500자, 빈 값은 null
export const parseMemo = (value: unknown): { memo: string | null } | { error: string } => {
	if (typeof value !== "string") {
		return { error: "메모 type string 아님" };
	}
	const memo = value.trim();

	if (memo.length > 500) {
		return { error: "메모 500자 초과" };
	}

	return { memo: memo || null };
};

// 아이콘은 최대 100자 문자열 (DB 설계서 6-2, 저장 방식은 미정)
export const isIcon = (value: unknown): value is string =>
	typeof value === "string" && value.length > 0 && value.length <= 100;

// IANA 시간대 이름 (예: Asia/Seoul)
export const isTimezone = (value: unknown): value is string => {
	if (typeof value !== "string" || value.length > 100) {
		return false;
	}
	try {
		new Intl.DateTimeFormat("en-CA", { timeZone: value });
		return true;
	} catch {
		return false;
	}
};

// 시간은 0~1439 정수. 0은 시간 없음 (COMMON-006)
export const isDurationMinutes = (value: unknown): value is number =>
	Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 1439;

// ± 단위 (ACT-004)
export const isDurationStepMinutes = (value: unknown): value is number =>
	[1, 5, 10, 15, 30, 60].includes(value as number);

// 이름 규칙 (COMMON-005). 통과하면 공백 제거·정규화한 이름, 아니면 오류 문구
export const parseName = (
	value: unknown,
): { trimmedName: string; normalizedName: string } | { error: string } => {
	if (typeof value !== "string") {
		return { error: "name 타입 오류" };
	}
	const trimmedName = value.trim();

	if (trimmedName === "") {
		return { error: "name 빈 값" };
	}
	if (trimmedName.length > 15) {
		return { error: "name 15자 초과" };
	}

	return { trimmedName, normalizedName: trimmedName.toLowerCase() };
};
