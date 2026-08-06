"use client";
import type { Action } from "@/app/generated/prisma/client";
import { useState } from "react";
import { CategoryWithActions } from "../page";
import ActionItem from "./ActionItem";

type CategoryItemProps = {
	cat: CategoryWithActions;
	onSaveCategory: ({ id, name }: { id: string; name: string }) => Promise<void>;
	onDeleteCategory: (id: string) => Promise<void>;
	onAddAction: ({ categoryId, name }: { categoryId: string; name: string }) => Promise<void>;
	onSaveAction: ({
		id,
		categoryId,
		name,
	}: {
		id: string;
		categoryId: string;
		name: string;
	}) => Promise<void>;
	onDeleteAction: ({ id, categoryId }: { id: string; categoryId: string }) => Promise<void>;
};

const CategoryItem = ({
	cat,
	onSaveCategory,
	onDeleteCategory,
	onAddAction,
	onSaveAction,
	onDeleteAction,
}: CategoryItemProps) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [editValue, setEditValue] = useState("");
	const [newActionName, setNewActionName] = useState<string>("");
	const [isAddingAction, setIsAddingAction] = useState<boolean>(false);

	const handleSaveCategory = async ({ id, name }: { id: string; name: string }) => {
		const trimmedName = name.trim();
		if (trimmedName === "") return;
		if (trimmedName === name) {
			alert("category : 이전과 동일한 이름");
			return;
		}

		try {
			setIsSaving(true);
			await onSaveCategory({ id, name });
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteCategory = async (id: string) => {
		try {
			setIsDeleting(true);
			await onDeleteCategory(id);
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsDeleting(false);
		}
	};

	const handleAddAction = async ({ categoryId, name }: { categoryId: string; name: string }) => {
		const trimmedName = name.trim();
		if (trimmedName === "") {
			alert("new action : 빈 값");
			return;
		}

		try {
			setIsAddingAction(true);
			await onAddAction({ categoryId, name });
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsAddingAction(false);
		}
	};

	return (
		<li>
			<div className="flex justify-between items-center border p-2">
				{isEditing ? (
					<input
						type="text"
						disabled={!isEditing}
						value={!isEditing ? cat.name : editValue}
						onChange={(e) => setEditValue(e.target.value)}
					/>
				) : (
					<button type="button">{cat.name}</button>
				)}
				<button
					type="button"
					onClick={() =>
						!isEditing ? setIsEditing(false) : handleSaveCategory({ id: cat.id, name: cat.name })
					}
				>
					{isSaving ? "저장중" : isEditing ? "저장" : "수정"}
				</button>
				<button type="button" onClick={() => handleDeleteCategory(cat.id)}>
					삭제
				</button>
			</div>
			<ul>
				{cat.actions?.map((action: Action) => (
					<ActionItem
						categoryId={cat.id}
						key={action.id}
						action={action}
						onSaveAction={onSaveAction}
						onDeleteAction={onDeleteAction}
					/>
				))}
				<li>
					{!isAddingAction ? (
						<button
							type="button"
							className="w-full p-2 border"
							onClick={() => setIsAddingAction(true)}
						>
							action 추가
						</button>
					) : (
						<div>
							<input
								type="text"
								value={newActionName}
								onChange={(e) => setNewActionName(e.target.value)}
							/>
							<button
								type="button"
								onClick={() => handleAddAction({ categoryId: cat.id, name: newActionName })}
							>
								추가
							</button>
							<button type="button" onClick={() => setIsAddingAction(false)}>
								취소
							</button>
						</div>
					)}
				</li>
			</ul>
		</li>
	);
};

export default CategoryItem;
