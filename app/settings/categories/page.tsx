"use client";

import { useEffect, useState } from "react";
import { Category } from "../../generated/prisma/client";

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

const SettingCategory = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [savedId, setSavedId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState("");

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

	const onEdit = ({ id, name }: { id: string; name: string }) => {
		console.log("onEdit");
		setEditingId(id);
		setEditValue(name);
	};

	const onSave = async ({ id, name }: { id: string; name: string }) => {
		const trimmedName = editValue.trim();

		if (trimmedName === "") return;
		if (trimmedName === name) {
			alert("category : 이전과 동일한 이름");
			return;
		}

		setSavedId(id);
		try {
			console.log("저장클릭");
			const newCategory = await updateCategory({ id, name: trimmedName });
			setCategories((prev) => {
				return prev.map((cat) => (cat.id === newCategory.id ? newCategory : cat));
			});
			setEditingId(null);
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setSavedId(null);
		}
	};

	const onDelete = (id: string) => {};

	if (isLoading) return <p>로딩중</p>;

	return (
		<div>
			<div className="flex justify-end gap-2 mb-4">
				<button>+ 카테고리</button>
				<button>순서 변경</button>
			</div>

			<ul>
				{categories.map((cat) => {
					const { id, name } = cat;
					return (
						<li key={id} className="border p-2 mb-2">
							<div className="flex justify-between items-center">
								<input
									type="text"
									disabled={id !== editingId}
									value={id !== editingId ? name : editValue}
									onChange={(e) => setEditValue(e.target.value)}
								/>
								<button
									type="button"
									onClick={() => (id !== editingId ? onEdit({ id, name }) : onSave({ id, name }))}
								>
									{id === savedId ? "저장중" : id === editingId ? "저장" : "수정"}
								</button>
								<button type="button" onClick={() => onDelete(id)}>
									삭제
								</button>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default SettingCategory;
