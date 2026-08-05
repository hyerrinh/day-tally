"use client";
import type { Action } from "@/app/generated/prisma/client";
import { useState } from "react";
import { CategoryWithActions } from "../page";
import ActionItem from "./ActionItem";

type CategoryItemProps = {
	cat: CategoryWithActions;
	onSaveCategory: ({ id, name }: { id: string; name: string }) => Promise<boolean>;
	onDeleteCategory: (id: string) => Promise<boolean>;
	onAddAction: ({ categoryId, name }: { categoryId: string; name: string }) => Promise<boolean>;
	onSaveAction: ({ id, name }: { id: string; name: string }) => Promise<boolean>;
	onDeleteAction: (id: string) => Promise<boolean>;
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
	const [editValue, setEditValue] = useState("");
	const [newActionName, setNewActionName] = useState<string>("");
	const [isAddingAction, setIsAddingAction] = useState<boolean>(false);

	const handleAddAction = async ({ categoryId, name }: { categoryId: string; name: string }) => {
		const isSuccess = await onAddAction({ categoryId, name });
		if (isSuccess) {
			setIsAddingAction(true);
		} else setIsAddingAction(false);
	};

	const handleSaveCategory = async ({ id, name }: { id: string; name: string }) => {
		setIsSaving(true);
		const isSuccess = await onSaveCategory({ id, name });
		setIsSaving(false);

		if (!isSuccess) alert("category 저장 실패");
	};
	const handleDeleteCategory = async (id: string) => {
		const isSuccess = await onDeleteCategory(id);

		if (isSuccess) alert("category 삭제 성공");
		else alert("category 삭제 실패");
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
