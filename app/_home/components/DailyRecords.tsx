"use client";

import type { CategoryWithActions, RecordResponse, Records } from "@/app/_type/type";
import { useState } from "react";
import { deleteRecord } from "../api/homeApi";

type DailyRecordsProps = {
	records: Records;
	categoriesWithRecords: CategoryWithActions[];
	onDeleteRecord: (record: RecordResponse) => void;
};

const DailyRecords = ({ categoriesWithRecords, records, onDeleteRecord }: DailyRecordsProps) => {
	const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
	const [openMenuRecordId, setOpenMenuRecordId] = useState<string | null>(null);

	const toggleAction = (actionId: string) => {
		setOpenMenuRecordId(null);
		setExpandedActionId((prev) => (prev === actionId ? null : actionId));
	};

	const editRecord = () => {
		setOpenMenuRecordId(null);
		// 다음 단계: 수정 상태 열기
	};

	const removeRecord = async ({ id }: { id: string }) => {
		try {
			setOpenMenuRecordId(null);
			const record = await deleteRecord({ id });
			onDeleteRecord(record);
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		}
	};

	return (
		<section className="pt-6">
			<h2 className="mb-5 text-base font-bold text-neutral-900">기록</h2>

			{categoriesWithRecords.length === 0 ? (
				<div className="rounded-2xl bg-neutral-50 px-5 py-8 text-center">
					<p className="text-sm text-neutral-500">아직 남긴 기록이 없어요.</p>
				</div>
			) : (
				<div className="flex flex-col gap-6">
					{categoriesWithRecords.map((category) => (
						<section key={category.id}>
							<h3 className="mb-2 px-3 text-xs font-semibold text-neutral-500">{category.name}</h3>

							<div className="divide-y divide-neutral-100">
								{category.actions.map((action) => {
									const actionRecords = records[action.id] ?? [];
									const totalDuration = actionRecords.reduce(
										(sum, record) => sum + (record.durationMinutes ?? 0),
										0,
									);
									const hasDuration = actionRecords.some(
										(record) => record.durationMinutes !== null,
									);
									const isExpanded = expandedActionId === action.id;

									return (
										<article key={action.id} className="py-2">
											{/* 행동 요약 */}
											<button
												type="button"
												aria-expanded={isExpanded}
												aria-controls={`action-records-${action.id}`}
												onClick={() => toggleAction(action.id)}
												className="flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
											>
												<span className="min-w-0 break-words text-[15px] font-semibold text-neutral-800">
													{action.name}
												</span>

												<span className="flex shrink-0 items-center gap-3">
													<span className="text-right text-xs tabular-nums text-neutral-500">
														<span className="font-semibold text-neutral-700">
															{actionRecords.length}회
														</span>
														{hasDuration && (
															<span className="mt-0.5 block">총 {totalDuration}분</span>
														)}
													</span>

													<svg
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth={1.8}
														strokeLinecap="round"
														strokeLinejoin="round"
														aria-hidden="true"
														className={`h-5 w-5 text-neutral-500 transition-transform ${
															isExpanded ? "rotate-180" : ""
														}`}
													>
														<path d="m6 9 6 6 6-6" />
													</svg>
												</span>
											</button>

											{/* 개별 기록 */}
											{isExpanded && (
												<div id={`action-records-${action.id}`} className="mx-4 pb-1">
													{actionRecords.map((record, index) => {
														const hasMemo = Boolean(record.memo);
														const hasRecordDuration = record.durationMinutes !== null;
														const isMenuOpen = openMenuRecordId === record.id;

														return (
															<div
																key={record.id}
																className="relative border-t border-neutral-50 first:border-t-0"
															>
																<div className="flex items-start gap-3 py-3">
																	<span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-medium tabular-nums text-neutral-500">
																		{index + 1}
																	</span>

																	<div className="min-w-0 flex-1 py-0.5">
																		{hasRecordDuration && (
																			<p className="text-sm font-semibold tabular-nums text-neutral-700">
																				{record.durationMinutes}
																				<span className="ml-1 text-xs font-normal text-neutral-500">
																					분
																				</span>
																			</p>
																		)}

																		{hasMemo && (
																			<p
																				className={`whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-600 ${
																					hasRecordDuration ? "mt-1" : ""
																				}`}
																			>
																				{record.memo}
																			</p>
																		)}

																		{!hasRecordDuration && !hasMemo && (
																			<p className="text-sm text-neutral-500">기록 완료</p>
																		)}
																	</div>

																	<button
																		type="button"
																		aria-label={`${action.name} 기록 ${index + 1} 관리`}
																		aria-expanded={isMenuOpen}
																		onClick={() =>
																			setOpenMenuRecordId((prev) =>
																				prev === record.id ? null : record.id,
																			)
																		}
																		className={`-my-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
																			isMenuOpen
																				? "bg-neutral-200 text-neutral-900"
																				: "text-neutral-600 hover:bg-neutral-200/70"
																		}`}
																	>
																		<svg
																			viewBox="0 0 24 24"
																			fill="currentColor"
																			className="h-5 w-5"
																			aria-hidden="true"
																		>
																			<circle cx="5" cy="12" r="1.8" />
																			<circle cx="12" cy="12" r="1.8" />
																			<circle cx="19" cy="12" r="1.8" />
																		</svg>
																	</button>
																</div>

																{isMenuOpen && (
																	<div
																		onKeyDown={(e) => {
																			if (e.key === "Escape") {
																				setOpenMenuRecordId(null);
																			}
																		}}
																		className="absolute right-0 top-12 z-10 w-28 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg shadow-neutral-900/10"
																	>
																		<button
																			type="button"
																			onClick={editRecord}
																			className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-100 focus-visible:bg-neutral-100"
																		>
																			수정
																		</button>
																		<button
																			type="button"
																			onClick={() => removeRecord({ id: record.id })}
																			className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:bg-red-50"
																		>
																			삭제
																		</button>
																	</div>
																)}
															</div>
														);
													})}
												</div>
											)}
										</article>
									);
								})}
							</div>
						</section>
					))}
				</div>
			)}
		</section>
	);
};

export default DailyRecords;
