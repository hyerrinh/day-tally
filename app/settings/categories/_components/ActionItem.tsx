"use client";
import { Action } from "@/app/generated/prisma/client";
import { useState } from "react";

type ActionItemProps = {
	categoryId: string;
	action: Action;
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

const ActionItem = ({ categoryId, action, onSaveAction, onDeleteAction }: ActionItemProps) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [editActionValue, setEditActionValue] = useState("");

	const handleSaveAction = async ({
		id,
		categoryId,
		name,
	}: {
		id: string;
		categoryId: string;
		name: string;
	}) => {
		try {
			setIsSaving(true);
			await onSaveAction({ id, categoryId, name });
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteAction = async ({ id, categoryId }: { id: string; categoryId: string }) => {
		try {
			setIsDeleting(true);
			await onDeleteAction({ id, categoryId });
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<li className="border p-2">
			<div className="flex justify-between items-center">
				{isEditing ? (
					<input
						type="text"
						disabled={!isEditing}
						value={!isEditing ? action.name : editActionValue}
						onChange={(e) => setEditActionValue(e.target.value)}
					/>
				) : (
					<button type="button">{action.name}</button>
				)}
				<button
					type="button"
					onClick={() =>
						!isEditing
							? setIsEditing(true)
							: handleSaveAction({ id: action.id, categoryId, name: action.name })
					}
				>
					{isSaving ? "저장중" : isEditing ? "저장" : "수정"}
				</button>
				<button type="button" onClick={() => handleDeleteAction({ id: action.id, categoryId })}>
					삭제
				</button>
			</div>
		</li>
	);
};

export default ActionItem;
