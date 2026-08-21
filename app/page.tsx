"use client";

import { useEffect, useState } from "react";
import { CategoryWithActions } from "./settings/categories/page";

const getCategories = async () => {
	const res = await fetch("/api/categories");
	const data = await res.json();

	if (!res.ok) {
		throw Error(data.message);
	}

	return data;
};

export default function Home() {
	const [isLoading, setIsLoading] = useState(true);
	const [categories, setCategories] = useState<CategoryWithActions[] | []>([]);
	const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
	const actions = categories.find((cat) => cat.id === activeCategoryId)?.actions ?? [];

	useEffect(() => {
		const loadCategories = async () => {
			try {
				const data = await getCategories();
				setCategories(data);
			} catch (e) {
				if (e instanceof Error) {
					alert(e.message);
				}
			} finally {
				setIsLoading(false);
			}
		};
		loadCategories();
	}, []);

	console.log(categories);

	if (isLoading) return <div>로딩중</div>;

	return (
		<div>
			<p>카테고리</p>
			<div>
				<ul className="flex flex-nowrap gap-2 overflow-x-auto">
					{categories.map((cat) => {
						const isActive = cat.id === activeCategoryId;
						return (
							<li className="shrink-0">
								<button
									type="button"
									className={isActive ? "bg-red-50" : ""}
									onClick={() => setActiveCategoryId(cat.id)}
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
								<li>
									<button type="button">{action.name}</button>
								</li>
							);
						})}
					</ul>
				}
			</div>
		</div>
	);
}
