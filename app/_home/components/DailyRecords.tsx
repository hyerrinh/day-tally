import type { CategoryWithActions, Records } from "@/app/_type/type";
import { useState } from "react";

type DailyRecordsProps = {
	records: Records;
	categoriesWithRecords: CategoryWithActions[];
};

const DailyRecords = ({ categoriesWithRecords, records }: DailyRecordsProps) => {
	const [expandedActionId, setExpandedActionId] = useState<string | null>(null);

	const toggleAction = (actionId: string) => {
		setExpandedActionId((prev) => (prev === actionId ? null : actionId));
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
															className="flex items-start gap-3 border-t border-slate-50 py-3 first:border-t-0"
														>
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
															>
																···
															</button>
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
