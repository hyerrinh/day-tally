"use client";
import { useEffect, useState } from "react";
import { formatDate } from "./_home/utils/date";
import WeekTabs from "./_home/components/WeekTabs";
import DailyRecords from "./_home/components/DailyRecords";
import CategoryTabs from "./_home/components/CategoryTabs";
import AddRecordSheet from "./_home/components/AddRecordSheet";
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
	const [selectedAction, setSelectedAction] = useState<string | null>(null);

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

	if (isCategoriesLoading) {
		return (
			<main className="flex min-h-dvh items-center justify-center bg-slate-50">
				<p className="text-sm text-slate-500">카테고리를 불러오는 중입니다.</p>
			</main>
		);
	}

	const categoriesWithRecords = categories
		.map((category) => {
			const actionsWithRecords = category.actions.filter((action) => records[action.id]?.length);
			return { ...category, actions: actionsWithRecords };
		})
		.filter((category) => category.actions.length);

	const layerData = categories
		.find((cat) => cat.id === activeCategoryId)
		?.actions.find((action) => action.id === selectedAction);

	return (
		<>
			<main className="min-h-dvh bg-white px-4 py-4 text-slate-900">
				<div className="mx-auto w-full max-w-md">
					<WeekTabs selectedDate={selectedDate} onChangeDate={setSelectedDate} />

					<CategoryTabs
						categories={categories}
						activeCategoryId={activeCategoryId}
						onChangeCategoryId={setActiveCategoryId}
						onAddRecord={setSelectedAction}
					/>

					{isRecordsLoading ? (
						<div className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
							기록을 불러오는 중입니다.
						</div>
					) : (
						<DailyRecords
							categoriesWithRecords={categoriesWithRecords}
							records={records}
							onDeleteRecord={(record) => {
								setRecords((prev) => ({
									...prev,
									[record.actionId]: prev[record.actionId].filter((item) => item.id !== record.id),
								}));
							}}
						/>
					)}
				</div>
			</main>
			{selectedAction && layerData && (
				<AddRecordSheet
					data={layerData}
					selectedDate={formatDate(selectedDate)}
					onAddRecord={(record) =>
						setRecords((prev) => ({
							...prev,
							[record.actionId]: [...(prev[record.actionId] ?? []), record],
						}))
					}
					close={() => setSelectedAction(null)}
				/>
			)}
		</>
	);
}
