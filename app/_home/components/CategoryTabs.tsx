import type { CategoryWithActions } from "@/app/_type/type";

type CategoryTabsProps = {
	categories: CategoryWithActions[];
	activeCategoryId: string | null;
	onChangeCategoryId: (id: string) => void;
};

const CategoryTabs = ({ categories, activeCategoryId, onChangeCategoryId }: CategoryTabsProps) => {
	const actions = categories.find((cat) => cat.id === activeCategoryId)?.actions ?? [];
	return (
		<div>
			<p>카테고리</p>
			<div>
				<ul className="flex flex-nowrap gap-2 overflow-x-auto">
					{categories.map((cat) => {
						const isActive = cat.id === activeCategoryId;
						return (
							<li key={cat.id} className="shrink-0">
								<button
									type="button"
									className={isActive ? "bg-red-50" : ""}
									onClick={() => onChangeCategoryId(cat.id)}
								>
									{cat.name}
								</button>
							</li>
						);
					})}
				</ul>
				{
					<ul className="flex gap-2">
						{actions.map((action) => {
							return (
								<li key={action.id}>
									<button type="button">{action.name}</button>
								</li>
							);
						})}
					</ul>
				}
			</div>
		</div>
	);
};

export default CategoryTabs;
