"use client";
import { useEffect, useState } from "react";
import { formatDate } from "./_home/utils/date";
import WeekTabs from "./_home/components/WeekTabs";
import DailyRecords from "./_home/components/DailyRecords";
import CategoryTabs from "./_home/components/CategoryTabs";
import type { CategoryWithActions, Records } from "./_type/type";
import { getRecords } from "./_home/api/homeApi";
import { getCategories } from "./settings/categories/_api/categoryApi";

export default function Home() {
	const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
	const [isRecordsLoading, setIsRecordsLoading] = useState(true);
	const [categories, setCategories] = useState<CategoryWithActions[]>([]);
	const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
	const [records, setRecords] = useState<Records>({});
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());

	useEffect(() => {
		const loadCategories = async () => {
			try {
				const data = await getCategories();
				setCategories(data);
				setActiveCategoryId(data[0]?.id ?? null);
			} catch (e) {
				if (e instanceof Error) {
					alert(e.message);
				}
			} finally {
				setIsCategoriesLoading(false);
			}
		};
		loadCategories();
	}, []);

	useEffect(() => {
		const loadRecords = async () => {
			try {
				setIsRecordsLoading(true);
				const records = await getRecords(formatDate(selectedDate));
				setRecords(records);
			} catch (e) {
				if (e instanceof Error) {
					alert(e.message);
				}
			} finally {
				setIsRecordsLoading(false);
			}
		};
		loadRecords();
	}, [selectedDate]);

	if (isCategoriesLoading) return <div>카테고리 로딩중</div>;

	const categoriesWithRecords = categories
		.map((category) => {
			const actionsWithRecords = category.actions.filter((action) => records[action.id]?.length);
			return { ...category, actions: actionsWithRecords };
		})
		.filter((category) => category.actions.length);

	return (
		<div>
			<WeekTabs selectedDate={selectedDate} onChangeDate={setSelectedDate} />
			<CategoryTabs
				categories={categories}
				activeCategoryId={activeCategoryId}
				onChangeCategoryId={setActiveCategoryId}
			/>
			{!isRecordsLoading && (
				<DailyRecords categoriesWithRecords={categoriesWithRecords} records={records} />
			)}
		</div>
	);
}
