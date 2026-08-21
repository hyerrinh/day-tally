export async function getCategories() {
	const res = await fetch("/api/categories");
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "카테고리 로드 실패");
	}

	return data;
}

export async function createCategory({ name }: { name: string }) {
	const res = await fetch("/api/categories", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "post category 실패");
	}

	return data;
}

export async function updateCategory({
	id,
	name,
	isHidden,
}: {
	id: string;
	name?: string;
	isHidden?: boolean;
}) {
	const res = await fetch(`/api/categories/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, isHidden }),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "카테고리 수정 실패");
	}

	return data;
}

export async function createAction({ categoryId, name }: { categoryId: string; name: string }) {
	const res = await fetch(`/api/categories/${categoryId}/actions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name }),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "액션 추가 실패");
	}

	return data;
}

export async function updateAction({
	id,
	name,
	isHidden,
}: {
	id: string;
	name?: string;
	isHidden?: boolean;
}) {
	const res = await fetch(`/api/actions/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, isHidden }),
	});

	const data = await res.json();

	if (!res.ok) throw new Error("update action 실패");

	return data;
}
