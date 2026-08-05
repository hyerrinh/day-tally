"use client";
import { Action } from "@/app/generated/prisma/client";
import { useState } from "react";

type ActionItemProps = {
	action: Action;
	onSaveAction: ({ id, name }: { id: string; name: string }) => Promise<boolean>;
	onDeleteAction: (id: string) => Promise<boolean>;
};

const ActionItem = ({ action, onSaveAction, onDeleteAction }: ActionItemProps) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [editActionValue, setEditActionValue] = useState("");

	const handleSaveAction = ({ id, name }: { id: string; name: string }) => {
		onSaveAction({ id, name });
	};
	const handleDeleteAction = (id: string) => {
		onDeleteAction(id);
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
						!isEditing ? setIsEditing(true) : handleSaveAction({ id: action.id, name: action.name })
					}
				>
					{isSaving ? "저장중" : isEditing ? "저장" : "수정"}
				</button>
				<button type="button" onClick={() => handleDeleteAction(action.id)}>
					삭제
				</button>
			</div>
		</li>
	);
};

export default ActionItem;
