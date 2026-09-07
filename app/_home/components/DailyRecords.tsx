import type { CategoryWithActions, RecordResponse, Records } from "@/app/_type/type";
import { useState } from "react";
import { deleteRecord } from "../api/homeApi";

type DailyRecordsProps = {
	records: Records;
	categoriesWithRecords: CategoryWithActions[];
	onDeleteRecord: (Record: RecordResponse) => void;
};

const DailyRecords = ({ categoriesWithRecords, records, onDeleteRecord }: DailyRecordsProps) => {
	const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
	const [openMenuRecordId, setOpenMenuRecordId] = useState<string | null>(null);

	const toggleAction = (actionId: string) => {
		setExpandedActionId((prev) => {
			if (prev === actionId) {
				setOpenMenuRecordId(null);
				return null;
			}
			return actionId;
		});
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
		<section className="pt-5">
			<p className="mb-5 text-base font-bold text-slate-900">오늘 기록</p>

			<div className="flex flex-col gap-7">
				{categoriesWithRecords.map((category) => (
					<section key={category.id}>
						<p className="mb-2 text-xs font-semibold text-slate-400">{category.name}</p>
						<div className="divide-y divide-slate-100">
							{category.actions.map((action) => {
								const actionRecords = records[action.id] ?? [];

								const totalDuration = actionRecords.reduce(
									(sum, record) => sum + (record.durationMinutes ?? 0),
									0,
								);

								const hasDuration = actionRecords.some((record) => record.durationMinutes !== null);

								const isExpanded = expandedActionId === action.id;

								return (
									<article key={action.id} className="py-2">
										<button
											type="button"
											className="flex w-full items-center justify-between py-2 text-left"
											aria-expanded={isExpanded}
											onClick={() => toggleAction(action.id)}
										>
											<p className="text-[15px] font-semibold text-slate-800">{action.name}</p>

											<div className="flex items-center gap-2">
												<p className="text-xs font-medium text-slate-400">
													{actionRecords.length}회{hasDuration && ` · 총 ${totalDuration}분`}
												</p>

												<span className="text-xs text-slate-400">{isExpanded ? "▲" : "▼"}</span>
											</div>
										</button>

										{isExpanded && (
											<div className="flex flex-col pb-2">
												{actionRecords.map((record, index) => {
													const hasMemo = Boolean(record.memo);
													const hasRecordDuration = record.durationMinutes !== null;

													return (
														<div
															key={record.id}
															className="relative border-t border-slate-50 first:border-t-0"
														>
															<div className="flex items-start gap-3 py-3">
																<span className="shrink-0 text-xs font-medium text-slate-300">
																	{index + 1}
																</span>

																<div className="min-w-0 flex-1">
																	{hasRecordDuration && (
																		<p className="text-sm font-medium text-slate-600">
																			{record.durationMinutes}
																			<span className="ml-0.5 text-xs text-slate-400">분</span>
																		</p>
																	)}
																	{hasMemo && (
																		<p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
																			{record.memo}
																		</p>
																	)}
																	{!hasRecordDuration && !hasMemo && (
																		<p className="text-sm text-slate-400">시간·메모 없이 기록</p>
																	)}
																</div>

																<button
																	type="button"
																	className="shrink-0 px-1 text-slate-400"
																	aria-label={`${action.name} 기록 ${index + 1} 메뉴`}
																	aria-expanded={openMenuRecordId === record.id}
																	onClick={() =>
																		setOpenMenuRecordId((prev) =>
																			prev === record.id ? null : record.id,
																		)
																	}
																>
																	···
																</button>
															</div>
															{openMenuRecordId === record.id && (
																<div className="absolute right-0 top-9 z-10 w-24 overflow-hidden rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
																	<button
																		type="button"
																		className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
																		onClick={editRecord}
																	>
																		수정
																	</button>
																	<button
																		type="button"
																		className="block w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
																		onClick={() => removeRecord({ id: record.id })}
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
		</section>
	);
};

export default DailyRecords;
