"use client";

import { useEffect, useState } from "react";
import CategoryItem from "./_components/CategoryItem";
import { Prisma } from "@/app/generated/prisma/client";

export type CategoryWithActions = Prisma.CategoryGetPayload<{
	include: {
		actions: true;
	};
}>;

async function getCategories() {
	const res = await fetch("/api/categories");
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "카테고리 로드 실패");
	}

	return data;
}

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

async function deleteCategory(id: string) {
	const res = await fetch(`/api/categories/${id}`, {
		method: "DELETE",
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "delete category 실패");
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

async function updateAction({ id, name }: { id: string; name: string }) {
	const res = await fetch(`/api/actions/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/jsion",
		},
		body: JSON.stringify({ name }),
	});

	const data = res.json();

	if (!res.ok) throw new Error("update action 실패");

	return data;
}

async function deleteAction(id: string) {
	const res = await fetch(`/api/actions/${id}`, {
		method: "DElETE",
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "action 삭제 실패");
	}

	return data;
}

const SettingCategory = () => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [categories, setCategories] = useState<CategoryWithActions[]>([]);

	useEffect(() => {
		async function loadCategories() {
			try {
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

	const addCategory = async () => {};
	const saveCategory = async ({ id, name }: { id: string; name: string }) => {
		const updatedCategory = await updateCategory({ id, name });
		console.log(updatedCategory);

		setCategories((prev) => {
			return prev.map((cat) =>
				cat.id === updatedCategory.id ? { ...cat, ...updatedCategory } : cat,
			);
		});
	};
	const removeCategory = async (id: string) => {
		await deleteCategory(id);
		setCategories((prev) => prev.filter((cat) => cat.id !== id));
	};
	const addAction = async ({ categoryId, name }: { categoryId: string; name: string }) => {
		const newAction = await postAction({ categoryId, name });
		setCategories((prev) =>
			prev.map((category) =>
				category.id === newAction.categoryId
					? { ...category, actions: [...category.actions, newAction] }
					: category,
			),
		);
	};
	const saveAction = async ({
		id,
		categoryId,
		name,
	}: {
		id: string;
		categoryId: string;
		name: string;
	}) => {
		const savedAction = await updateAction({ id, name });
		setCategories((prev) =>
			prev.map((cat) =>
				cat.id === categoryId
					? {
							...cat,
							actions: cat.actions.map((action) =>
								action.id === savedAction.id ? savedAction : action,
							),
						}
					: cat,
			),
		);
	};
	const removeAction = async ({ id, categoryId }: { id: string; categoryId: string }) => {
		await deleteAction(id);
		setCategories((prev) =>
			prev.map((cat) =>
				cat.id === categoryId
					? { ...cat, actions: cat.actions.filter((action) => action.id !== id) }
					: cat,
			),
		);
	};

	if (isLoading) return <p>로딩중</p>;

	return (
		<div>
			<div className="flex justify-end gap-2 mb-4">
				<button type="button" onClick={addCategory}>
					+ 카테고리
				</button>
				<button type="button">순서 변경</button>
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
