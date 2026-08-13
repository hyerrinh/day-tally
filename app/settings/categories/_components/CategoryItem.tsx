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
	isDuplicateCategoryName: ({ excludeId, name }: { excludeId?: string; name: string }) => boolean;
	isDuplicateActionName: ({
		categoryId,
		name,
	}: {
		categoryId: string;
		name: string;
		excludedId?: string;
	}) => boolean;
};

const CategoryItem = ({
	cat,
	onSaveCategory,
	onDeleteCategory,
	onAddAction,
	onSaveAction,
	onDeleteAction,
	isDuplicateCategoryName,
	isDuplicateActionName,
}: CategoryItemProps) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [categoryValue, setCategoryValue] = useState("");
	const [actionValue, setActionValue] = useState<string>("");
	const [isAddingAction, setIsAddingAction] = useState<boolean>(false);

	const handleSaveCategory = async () => {
		const name = categoryValue.trim();
		if (name === "") {
			alert("front : category 빈 값");
			return;
		}
		if (name === cat.name) {
			alert("front : category 이전과 동일한 이름");
			return;
		}

		const isDuplicate = isDuplicateCategoryName({ excludeId: cat.id, name });

		if (isDuplicate) {
			alert("front: category 이미 있는 이름");
			return;
		}

		try {
			setIsSaving(true);
			await onSaveCategory({ id: cat.id, name });
			setIsEditing(false);
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteCategory = async () => {
		try {
			setIsDeleting(true);
			await onDeleteCategory(cat.id);
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsDeleting(false);
		}
	};

	const handleAddAction = async () => {
		const name = actionValue.trim();
		if (name === "") {
			alert("new action : 빈 값");
			return;
		}

		const isDuplicate = isDuplicateActionName({ name, categoryId: cat.id });
		if (isDuplicate) {
			alert("front : 이미 존재하는 action name");
			return;
		}

		try {
			setIsAdding(true);
			await onAddAction({ categoryId: cat.id, name });
			setIsAddingAction(false);
			setActionValue("");
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<li>
			<div className="flex justify-between items-center border p-2">
				{isEditing ? (
					<input
						type="text"
						value={categoryValue}
						onChange={(e) => setCategoryValue(e.target.value)}
					/>
				) : (
					<button type="button">{cat.name}</button>
				)}
				<button
					type="button"
					disabled={isSaving}
					onClick={() => {
						if (!isEditing) {
							setCategoryValue(cat.name);
							setIsEditing(true);
						} else handleSaveCategory();
					}}
				>
					{isSaving ? "저장중" : isEditing ? "저장" : "수정"}
				</button>
				{isEditing && (
					<button type="button" onClick={() => setIsEditing(false)}>
						취소
					</button>
				)}
				{!isEditing && (
					<button type="button" onClick={handleDeleteCategory} disabled={isDeleting}>
						{!isDeleting ? "삭제" : "삭제중"}
					</button>
				)}
			</div>
			<ul>
				{cat.actions?.map((action: Action) => (
					<ActionItem
						categoryId={cat.id}
						key={action.id}
						action={action}
						onSaveAction={onSaveAction}
						onDeleteAction={onDeleteAction}
						isDuplicateActionName={isDuplicateActionName}
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
								value={actionValue}
								onChange={(e) => setActionValue(e.target.value)}
							/>
							<button type="button" onClick={handleAddAction} disabled={isAdding}>
								{!isAdding ? "추가" : "추가중"}
							</button>
							<button
								type="button"
								onClick={() => {
									setIsAddingAction(false);
									setActionValue("");
								}}
							>
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
