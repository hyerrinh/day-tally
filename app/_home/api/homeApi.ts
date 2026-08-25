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
