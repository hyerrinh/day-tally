"use client";
import { useEffect, useState } from "react";
import { Category } from "./generated/prisma/client";

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

export default function Home() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [editingId, setEditingId] = useState<string | null>(null);
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

	if (isLoading) return <p>로딩중</p>;

	return (
		<div>
			<ul>
				{categories.map((category) => {
					const isEdit = category.id === editingId;
					return (
						<li key={category.id}>
							<input
								type="text"
								value={isEdit ? editValue : category.name}
								disabled={!isEdit}
								onChange={(e) => {
									setEditValue(e.target.value);
								}}
							/>
							<button
								type="button"
								className="ml-2"
								onClick={async () => {
									if (isEdit) {
										const trimmedName = editValue.trim();

										if (trimmedName === "") return setEditingId(null);
										if (trimmedName === category.name) {
											alert("카테고리 : 같은 이름 입력");
											return;
										}

										try {
											setIsSaving(true);
											const updatedCategory = await updateCategory({
												id: category.id,
												name: trimmedName,
											});

											setCategories((prev) => {
												return prev.map((cat) => {
													if (cat.id === category.id) {
														return updatedCategory;
													}

													return cat;
												});
											});
										} catch (error) {
											if (error instanceof Error) {
												alert(error.message);
											}
											return;
										} finally {
											setIsSaving(false);
										}

										setEditingId(null);
									} else {
										setEditingId(category.id);
										setEditValue(category.name);
									}
								}}
							>
								{isEdit && isSaving ? "저장중" : isEdit ? "저장" : "수정"}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
