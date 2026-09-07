export const getCategories = async () => {
	const res = await fetch("/api/categories");
	const data = await res.json();

	if (!res.ok) {
		throw Error(data.message);
	}

	return data;
};

export const getRecords = async (date: string) => {
	const res = await fetch(`/api/records?date=${date}`);
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "front - records 조회 오류");
	}

	return data;
};

export const createRecord = async ({
	recordDate,
	actionId,
	durationMinutes,
	memo,
}: {
	recordDate: string;
	actionId: string;
	durationMinutes?: number;
	memo?: string;
}) => {
	const res = await fetch(`/api/records`, {
		method: "POST",
		body: JSON.stringify({ recordDate, actionId, durationMinutes, memo }),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "front - record 생성 오류");
	}

	return data;
};

export const deleteRecord = async ({ id }: { id: string }) => {
	const res = await fetch(`/api/records/${id}`, {
		method: "DELETE",
	});
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "front - record 삭제 오류");
	}

	return data;
};
