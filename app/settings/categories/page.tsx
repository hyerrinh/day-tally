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

async function postCategory({ name }: { name: string }) {
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
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name }),
	});

	const data = await res.json();

	if (!res.ok) throw new Error("update action 실패");

	return data;
}

async function deleteAction(id: string) {
	const res = await fetch(`/api/actions/${id}`, {
		method: "DELETE",
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "action 삭제 실패");
	}

	return data;
}

const SettingCategory = () => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isAddingCategory, setIsAddingCategory] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [categoryValue, setCategoryValue] = useState("");
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

	const isDuplicateCategoryName = ({ excludeId, name }: { excludeId?: string; name: string }) => {
		const isDuplicate = categories.some((cat) => {
			return cat.id !== excludeId && cat.normalizedName === name.toLowerCase();
		});

		return isDuplicate;
	};

	const isDuplicateActionName = ({
		name,
		categoryId,
		excludedId,
	}: {
		name: string;
		categoryId: string;
		excludedId?: string;
	}) => {
		const isDuplicate = categories.some(
			(cat) =>
				cat.id === categoryId &&
				cat.actions.some(
					(action) =>
						action.id !== excludedId && action.normalizedName === name.toLocaleLowerCase(),
				),
		);

		return isDuplicate;
	};

	const addCategory = async ({ name }: { name: string }) => {
		const newCategory = await postCategory({ name });
		setCategories((prev) => [...prev, newCategory]);
	};
	const saveCategory = async ({ id, name }: { id: string; name: string }) => {
		const updatedCategory = await updateCategory({ id, name });

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
	const handleAddCategory = async () => {
		const name = categoryValue.trim();
		if (name === "") {
			alert("category 빈 값");
			return;
		}

		const isDuplicate = isDuplicateCategoryName({ name });
		if (isDuplicate) {
			alert("front: category 이름 중복");
			return;
		}

		try {
			setIsAdding(true);
			await addCategory({ name });
			setIsAddingCategory(false);
			setCategoryValue("");
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsAdding(false);
		}
	};

	if (isLoading) return <p>로딩중</p>;

	return (
		<div>
			<div className="flex justify-end gap-2 mb-4">
				<button type="button" onClick={() => setIsAddingCategory(true)}>
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
						isDuplicateCategoryName={isDuplicateCategoryName}
						isDuplicateActionName={isDuplicateActionName}
					/>
				))}
				{isAddingCategory && (
					<li>
						<input
							type="text"
							id=""
							value={categoryValue}
							onChange={(e) => setCategoryValue(e.target.value)}
						/>
						<button type="button" onClick={handleAddCategory} disabled={isAdding}>
							{!isAdding ? "추가" : "추가중"}
						</button>
						<button
							type="button"
							onClick={() => {
								setIsAddingCategory(false);
								setCategoryValue("");
							}}
						>
							취소
						</button>
					</li>
				)}
			</ul>
		</div>
	);
};

export default SettingCategory;
