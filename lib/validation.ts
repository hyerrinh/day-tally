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
		? new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date())
		: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10);

	return date.toISOString().slice(0, 10) > today;
};

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
