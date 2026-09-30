import { formatDate, formatDay, getWeekDates } from "../utils/date";

type WeekTabsProps = {
	selectedDate: Date;
	onChangeDate: (date: Date) => void;
};

const WeekTabs = ({ selectedDate, onChangeDate }: WeekTabsProps) => {
	const weekDates = getWeekDates();
	const today = new Date();

	return (
		<section className="border-b border-neutral-100 pt-2 pb-3">
			<p className="mb-2 text-sm font-semibold text-neutral-800">{selectedDate.getMonth() + 1}월</p>
			<ul className="grid grid-cols-7">
				{weekDates.map((date) => {
					const isToday = formatDate(today) === formatDate(date);
					const isActive = formatDate(selectedDate) === formatDate(date);

					return (
						<li key={formatDate(date)}>
							<button
								type="button"
								onClick={() => onChangeDate(date)}
								className="flex w-full flex-col items-center gap-1"
							>
								<span
									className={`text-[11px] ${
										isToday ? "font-semibold text-red-500" : "text-neutral-400"
									}`}
								>
									{formatDay(date.getDay())}
								</span>
								<span
									className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors ${
										isActive
											? "bg-neutral-800 text-white"
											: isToday
												? "text-red-500"
												: "text-neutral-600 hover:bg-neutral-100"
									}`}
								>
									{date.getDate()}
								</span>
							</button>
						</li>
					);
				})}
			</ul>
		</section>
	);
};

export default WeekTabs;
