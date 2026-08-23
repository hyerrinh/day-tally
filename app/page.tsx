"use client";

import { useEffect, useState } from "react";
import { CategoryWithActions } from "./settings/categories/page";
import { Record } from "./generated/prisma/client";

type RecordResponse = Omit<Record, "recordDate" | "createdAt" | "updatedAt"> & {
	recordDate: string;
	createdAt: string;
	updatedAt: string;
};

const getCategories = async () => {
	const res = await fetch("/api/categories");
	const data = await res.json();

	if (!res.ok) {
		throw Error(data.message);
	}

	return data;
};

const getWeekDates = () => {
	const today = new Date();
	const day = today.getDay();
	const diff = today.getDate() - day + (day === 0 ? -6 : 1);

	const monday = new Date(today);
	monday.setDate(diff);

	const weekDates = [];

	for (let i = 0; i < 7; i++) {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);

		weekDates.push(date);
	}

	return weekDates;
};

const formatDate = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const formatDay = (index: number) => {
	const days = ["일", "월", "화", "수", "목", "금", "토"];
	return days[index];
};

const getRecords = async (date: string) => {
	const res = await fetch(`/api/records?date=${date}`);
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message ?? "front - records 조회 오류");
	}

	return data;
};

export default function Home() {
	const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
	const [isRecordsLoading, setIsRecordsLoading] = useState(true);
	const [categories, setCategories] = useState<CategoryWithActions[]>([]);
	const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
	const [records, setRecords] = useState<{ [actionId: string]: RecordResponse[] }>({});
	const actions = categories.find((cat) => cat.id === activeCategoryId)?.actions ?? [];
	const weekDates = getWeekDates();
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

	const categoriesWithRecords = categories
		.map((category) => {
			const actionsWithRecords = category.actions.filter((action) => records[action.id]?.length);
			return { ...category, actions: actionsWithRecords };
		})
		.filter((category) => category.actions.length);

	if (isCategoriesLoading) return <div>카테고리 로딩중</div>;
	if (isRecordsLoading) return <div>레코드 로딩중</div>;

	return (
		<div>
			<p>캘린더</p>
			<ul className="flex gap-3">
				{weekDates.map((date) => {
					const isToday = formatDate(new Date()) === formatDate(date);
					const isActive = formatDate(selectedDate) === formatDate(date);

					return (
						<li key={formatDate(date)}>
							<button type="button" onClick={() => setSelectedDate(date)}>
								<span
									className={`${isToday ? "font-bold" : ""} block ${isActive ? "text-red-600" : ""}`}
								>
									{date.getDate()}
								</span>
								<span>{formatDay(date.getDay())}</span>
							</button>
						</li>
					);
				})}
			</ul>
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
								<li key={action.id}>
									<button type="button">{action.name}</button>
								</li>
							);
						})}
					</ul>
				}
			</div>
			<p className="mt-4">오늘 기록</p>
			{categoriesWithRecords.map((category) => {
				return (
					<div key={category.id}>
						<p>{category.name}</p>
						{category.actions.map((action) => {
							return (
								<div key={action.id}>
									<p>{action.name}</p>
									{records[action.id].map((record) => (
										<div key={record.id}>
											<div>시간 : {record.durationMinutes}</div>
											<div>메모 : {record.memo}</div>
										</div>
									))}
								</div>
							);
						})}
					</div>
				);
			})}
		</div>
	);
}
