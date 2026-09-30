"use client";
import { useState } from "react";
import type { CategoryWithActions } from "@/app/_type/type";

type CategoryTabsProps = {
	categories: CategoryWithActions[];
	activeCategoryId: string | null;
	onChangeCategoryId: (id: string) => void;
	onAddRecord: (actionId: string) => void;
	onAddAction: (data: { categoryId: string; name: string }) => Promise<void>;
};

const CategoryTabs = ({
	categories,
	activeCategoryId,
	onChangeCategoryId,
	onAddRecord,
	onAddAction,
}: CategoryTabsProps) => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [actionName, setActionName] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [error, setError] = useState("");
	const activeCategory = categories.find((category) => category.id === activeCategoryId);
	const actions = activeCategory?.actions ?? [];

	const closeForm = () => {
		setIsFormOpen(false);
		setActionName("");
		setError("");
	};
	const changeCategory = (id: string) => {
		if (isAdding) return;
		closeForm();
		onChangeCategoryId(id);
	};
	const addAction = async () => {
		if (isAdding || !activeCategory) return;
		const name = actionName.trim();
		if (!name) {
			setError("행동 이름을 입력해주세요.");
			return;
		}
		if (name.length > 15) {
			setError("행동 이름은 15자 이내로 입력해주세요.");
			return;
		}
		if (actions.some((action) => action.name.trim().toLowerCase() === name.toLowerCase())) {
			setError("이 카테고리에 같은 이름의 행동이 있어요.");
			return;
		}

		try {
			setIsAdding(true);
			setError("");
			await onAddAction({ categoryId: activeCategory.id, name });
			closeForm();
		} catch (e) {
			setError(e instanceof Error ? e.message : "행동 추가에 실패했어요.");
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<section className="border-b border-neutral-100 py-4">
			<ul className="flex gap-1 overflow-x-auto">
				{categories.map((category) => {
					const isActive = category.id === activeCategoryId;
					return (
						<li key={category.id} className="shrink-0">
							<button
								type="button"
								disabled={isAdding}
								onClick={() => changeCategory(category.id)}
								className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
									isActive ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-neutral-700"
								}`}
							>
								{category.name}
							</button>
						</li>
					);
				})}
			</ul>

			{activeCategory && (
				<>
					<ul className="mt-2 flex items-center gap-1.5 overflow-x-auto pl-1">
						{actions.map((action) => (
							<li key={action.id} className="shrink-0">
								<button
									type="button"
									disabled={isAdding}
									className="rounded-full px-2.5 py-2 text-xs font-medium text-neutral-600 transition-colors hover:text-red-500 active:bg-red-50 disabled:opacity-50"
									onClick={() => onAddRecord(action.id)}
								>
									+ {action.name}
								</button>
							</li>
						))}
						<li className="shrink-0">
							<button
								type="button"
								aria-label="새 행동 추가"
								title="새 행동 추가"
								aria-expanded={isFormOpen}
								aria-controls="quick-add-action-form"
								disabled={isAdding}
								onClick={() => {
									if (isFormOpen) closeForm();
									else setIsFormOpen(true);
								}}
								className="flex items-center justify-center px-2.5 py-2 text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 disabled:opacity-40"
							>
								{actions.length === 0 && <span className="text-xs font-medium">행동 추가</span>}
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={1.5}
									strokeLinecap="round"
									className="h-4 w-4"
									aria-hidden="true"
								>
									<path d="M12 5v14M5 12h14" />
								</svg>
							</button>
						</li>
					</ul>

					{isFormOpen && (
						<form
							id="quick-add-action-form"
							className="mt-2 px-1"
							onSubmit={(e) => {
								e.preventDefault();
								void addAction();
							}}
						>
							<label htmlFor="quick-action-name" className="sr-only">
								{activeCategory.name}에 추가할 행동 이름
							</label>
							<div className="flex items-center gap-1">
								<input
									id="quick-action-name"
									autoFocus
									type="text"
									maxLength={15}
									disabled={isAdding}
									value={actionName}
									placeholder="새 행동 이름"
									aria-invalid={Boolean(error)}
									aria-describedby={error ? "quick-action-error" : undefined}
									onChange={(e) => {
										setActionName(e.target.value);
										setError("");
									}}
									onKeyDown={(e) => {
										if (e.key === "Escape" && !isAdding) closeForm();
									}}
									className="h-10 min-w-0 flex-1 rounded-none border-0 border-b border-neutral-300 bg-transparent px-1 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-800 disabled:opacity-50"
								/>
								<button
									type="submit"
									disabled={isAdding || !actionName.trim()}
									className="h-10 shrink-0 px-3 text-xs font-semibold text-neutral-800 transition-colors hover:text-black disabled:opacity-40"
								>
									{isAdding ? "추가 중…" : "추가"}
								</button>
								<button
									type="button"
									disabled={isAdding}
									onClick={closeForm}
									className="h-10 shrink-0 px-2 text-xs text-neutral-500 transition-colors hover:text-neutral-800 disabled:opacity-40"
								>
									취소
								</button>
							</div>
							{error && (
								<p id="quick-action-error" role="alert" className="mt-1.5 text-xs text-red-600">
									{error}
								</p>
							)}
						</form>
					)}
				</>
			)}
		</section>
	);
};

export default CategoryTabs;
