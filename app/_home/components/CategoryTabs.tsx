import type { CategoryWithActions } from "@/app/_type/type";

type CategoryTabsProps = {
	categories: CategoryWithActions[];
	activeCategoryId: string | null;
	onChangeCategoryId: (id: string) => void;
	onAddRecord: (actionId: string) => void;
};

const CategoryTabs = ({
	categories,
	activeCategoryId,
	onChangeCategoryId,
	onAddRecord,
}: CategoryTabsProps) => {
	const actions = categories.find((category) => category.id === activeCategoryId)?.actions ?? [];

	return (
		<section className="border-b border-slate-100 py-4">
			<p className="mb-3 text-sm font-semibold text-slate-800">빠른 기록</p>
			<ul className="flex gap-1 overflow-x-auto">
				{categories.map((category) => {
					const isActive = category.id === activeCategoryId;

					return (
						<li key={category.id} className="shrink-0">
							<button
								type="button"
								onClick={() => onChangeCategoryId(category.id)}
								className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
									isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-700"
								}`}
							>
								{category.name}
							</button>
						</li>
					);
				})}
			</ul>

			<ul className="mt-2 flex gap-1.5 overflow-x-auto pl-1">
				{actions.map((action) => (
					<li key={action.id} className="shrink-0">
						<button
							type="button"
							className="rounded-full px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-red-300 hover:text-red-500 active:bg-red-50"
							onClick={() => onAddRecord(action.id)}
						>
							+ {action.name}
						</button>
					</li>
				))}
			</ul>
		</section>
	);
};

export default CategoryTabs;
