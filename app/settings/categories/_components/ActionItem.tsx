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

	const handleSaveAction = async () => {
		try {
			setIsSaving(true);
			await onSaveAction({ id: action.id, categoryId, name: editActionValue });
			setIsEditing(false);
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteAction = async () => {
		try {
			setIsDeleting(true);
			await onDeleteAction({ id: action.id, categoryId });
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
						value={editActionValue}
						onChange={(e) => setEditActionValue(e.target.value)}
					/>
				) : (
					<button type="button">{action.name}</button>
				)}
				<button
					type="button"
					onClick={() => {
						if (!isEditing) {
							setEditActionValue(action.name);
							setIsEditing(true);
						} else handleSaveAction();
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
					<button type="button" onClick={handleDeleteAction} disabled={isDeleting}>
						{!isDeleting ? "삭제" : "삭제중"}
					</button>
				)}
			</div>
		</li>
	);
};

export default ActionItem;
