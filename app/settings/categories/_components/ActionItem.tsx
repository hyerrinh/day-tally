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
	onHideAction: ({ id, categoryId }: { id: string; categoryId: string }) => Promise<void>;
	isDuplicateActionName: ({
		categoryId,
		name,
		excludedId,
	}: {
		categoryId: string;
		name: string;
		excludedId?: string;
	}) => boolean;
};

const ActionItem = ({
	categoryId,
	action,
	onSaveAction,
	onHideAction,
	isDuplicateActionName,
}: ActionItemProps) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isHiding, setIsHiding] = useState(false);
	const [editActionValue, setEditActionValue] = useState("");

	const handleSaveAction = async () => {
		const name = editActionValue.trim();

		if (name === "") {
			alert("front : action 빈 값");
			return;
		}

		if (name === action.name) {
			alert("front : 이전과 동일한 값");
			return;
		}

		const isDuplicate = isDuplicateActionName({ categoryId, name, excludedId: action.id });

		if (isDuplicate) {
			alert("front : action 값 같은 카테고리에서 중복");
			return;
		}

		try {
			setIsSaving(true);
			await onSaveAction({ id: action.id, categoryId, name });
			setIsEditing(false);
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleHideAction = async () => {
		try {
			setIsHiding(true);
			await onHideAction({ id: action.id, categoryId });
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsHiding(false);
		}
	};

	return (
		<li className="border p-2 ml-4">
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
					disabled={isSaving}
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
					<button type="button" onClick={handleHideAction} disabled={isHiding}>
						{!isHiding ? "숨김" : "숨김중"}
					</button>
				)}
			</div>
		</li>
	);
};

export default ActionItem;
