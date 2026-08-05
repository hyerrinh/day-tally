"use client";

import { useEffect, useState } from "react";
import CategoryItem from "./_components/CategoryItem";
import { Prisma } from "@/app/generated/prisma/client";

export type CategoryWithActions = Prisma.CategoryGetPayload<{
	include: {
		actions: true;
	};
}>;

async function updateCategory({ id, name }: { id: string; name: string }) {
	const res = await fetch(`/api/categories/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name }),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "카테고리 수정 실패");
	}

	return data;
}

async function getCategories() {
	const res = await fetch("/api/categories");
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "카테고리 로드 실패");
	}

	return data;
}

async function postAction({ categoryId, name }: { categoryId: string; name: string }) {
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

async function deleteCategory(id: string) {
	const res = await fetch("/api/categories", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(id),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "delete category 실패");
	}

	return data;
}

const SettingCategory = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [categories, setCategories] = useState<CategoryWithActions[]>([]);

	useEffect(() => {
		async function loadCategories() {
			try {
				setIsLoading(true);
				const data = await getCategories();
				setCategories(data);
			} catch (error) {
				if (error instanceof Error) {
					alert(error.message);
				}
			} finally {
				setIsLoading(false);
			}
		}

		loadCategories();
	}, []);

	const saveCategory = async ({ id, name }: { id: string; name: string }) => {
		const trimmedName = name.trim();
		if (trimmedName === "") return false;
		if (trimmedName === name) {
			alert("category : 이전과 동일한 이름");
			return false;
		}
		try {
			console.log("저장클릭");
			const newCategory = await updateCategory({ id, name: trimmedName });
			setCategories((prev) => {
				return prev.map((cat) => (cat.id === newCategory.id ? newCategory : cat));
			});
			return true;
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		}
		return false;
	};
	const removeCategory = async (id: string) => {
		try {
			const deleted = await deleteCategory(id);
			setCategories((prev) => prev.filter((cat) => cat.id !== deleted.id));
			return true;
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		}
		return false;
	};

	const addAction = async ({ categoryId, name }: { categoryId: string; name: string }) => {
		const trimmedName = name.trim();
		if (trimmedName === "") {
			alert("new action : 빈 값");
			return false;
		}
		try {
			const newAction = await postAction({ categoryId, name: trimmedName });
			setCategories((prev) =>
				prev.map((category) =>
					categoryId === category.id
						? { ...category, actions: [...category.actions, newAction] }
						: category,
				),
			);
			return true;
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
			return false;
		}
	};
	const saveAction = async ({ id, name }: { id: string; name: string }) => {
		return false;
	};
	const removeAction = async (id: string) => {
		return false;
	};

	if (isLoading) return <p>로딩중</p>;

	return (
		<div>
			<div className="flex justify-end gap-2 mb-4">
				<button>+ 카테고리</button>
				<button>순서 변경</button>
			</div>
			<ul>
				{categories.map((cat) => (
					<CategoryItem
						key={cat.id}
						cat={cat}
						onSaveCategory={saveCategory}
						onDeleteCategory={removeCategory}
						onAddAction={addAction}
						onSaveAction={saveAction}
						onDeleteAction={removeAction}
					/>
				))}
			</ul>
		</div>
	);
};

export default SettingCategory;
