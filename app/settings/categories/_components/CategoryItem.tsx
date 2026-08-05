"use client";
import type { Action } from "@/app/generated/prisma/client";
import { useState } from "react";
import { CategoryWithActions } from "../page";

type CategoryItemProps = {
	cat: CategoryWithActions;
	editValue: string;
	editingId: string | null;
	savedId: string | null;
	onSave: ({ id, name }: { id: string; name: string }) => void;
	onEdit: ({ id, name }: { id: string; name: string }) => void;
	onDelete: (id: string) => void;
	onEditValue: (value: string) => void;
	addAction: ({ categoryId, name }: { categoryId: string; name: string }) => Promise<boolean>;
};

const CategoryItem = ({
	cat,
	editValue,
	editingId,
	savedId,
	onSave,
	onEdit,
	onDelete,
	onEditValue,
	addAction,
}: CategoryItemProps) => {
	const [editingActionId, setEditingActionId] = useState<string | null>(null);
	const [savedActionId, setSavedActionId] = useState<string | null>(null);
	const [editActionValue, setEditActionValue] = useState("");
	const [isAddingAction, setIsAddingAction] = useState<boolean>(false);
	const [newActionName, setNewActionName] = useState<string>("");

	const handleAddAction = async ({ categoryId, name }: { categoryId: string; name: string }) => {
		const isSuccess = await addAction({ categoryId, name });
		if (isSuccess) {
			setIsAddingAction(true);
		} else setIsAddingAction(false);
	};

	return (
		<li>
			<div className="flex justify-between items-center border p-2">
				{cat.id === editingId ? (
					<input
						type="text"
						disabled={cat.id !== editingId}
						value={cat.id !== editingId ? cat.name : editValue}
						onChange={(e) => onEditValue(e.target.value)}
					/>
				) : (
					<button type="button">{cat.name}</button>
				)}
				<button
					type="button"
					onClick={() =>
						cat.id !== editingId
							? onEdit({ id: cat.id, name: cat.name })
							: onSave({ id: cat.id, name: cat.name })
					}
				>
					{cat.id === savedId ? "저장중" : cat.id === editingId ? "저장" : "수정"}
				</button>
				<button type="button" onClick={() => onDelete(cat.id)}>
					삭제
				</button>
			</div>
			<ul>
				{cat.actions?.map((action: Action) => {
					return (
						<li key={action.id} className="border p-2">
							<div className="flex justify-between items-center">
								{action.id === editingActionId ? (
									<input
										type="text"
										disabled={action.id !== editingActionId}
										value={action.id !== editingActionId ? action.name : editActionValue}
										onChange={(e) => setEditActionValue(e.target.value)}
									/>
								) : (
									<button type="button">{action.name}</button>
								)}
								<button
									type="button"
									onClick={() =>
										action.id !== editingActionId
											? onActionEdit({ id: action.id, name: action.name })
											: onActionSave({ id: action.id, name: action.name })
									}
								>
									{action.id === savedActionId
										? "저장중"
										: action.id === editingActionId
											? "저장"
											: "수정"}
								</button>
								<button type="button" onClick={() => onActionDelete(action.id)}>
									삭제
								</button>
							</div>
						</li>
					);
				})}
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
