import type { CategoryWithActions, Records } from "@/app/_type/type";

type DailyRecordsProps = {
	records: Records;
	categoriesWithRecords: CategoryWithActions[];
};

const DailyRecords = ({ categoriesWithRecords, records }: DailyRecordsProps) => {
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

								return (
									<article key={action.id} className="py-4">
										<div className="flex items-center justify-between">
											<p className="text-[15px] font-semibold text-slate-800">{action.name}</p>

											<p className="text-xs font-medium text-slate-400">{actionRecords.length}회</p>
										</div>

										<div className="mt-2 flex flex-col gap-1.5">
											{actionRecords.map((record) => (
												<div key={record.id} className="flex items-start justify-between gap-4">
													<p className="min-w-0 text-sm text-slate-500">{record.memo || "기록"}</p>

													{record.durationMinutes !== null && (
														<p className="shrink-0 text-sm font-medium text-slate-600">
															{record.durationMinutes}
															<span className="ml-0.5 text-xs text-slate-400">분</span>
														</p>
													)}
												</div>
											))}
										</div>
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
