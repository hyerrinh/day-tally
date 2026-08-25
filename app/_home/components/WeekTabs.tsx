import { formatDate, formatDay, getWeekDates } from "../utils/date";

type WeekTabsProps = {
	selectedDate: Date;
	onChangeDate: (date: Date) => void;
};

const WeekTabs = ({ selectedDate, onChangeDate }: WeekTabsProps) => {
	const weekDates = getWeekDates();

	return (
		<div>
			<p>캘린더</p>
			<ul className="flex gap-3">
				{weekDates.map((date) => {
					const isToday = formatDate(new Date()) === formatDate(date);
					const isActive = formatDate(selectedDate) === formatDate(date);

					return (
						<li key={formatDate(date)}>
							<button type="button" onClick={() => onChangeDate(date)}>
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
		</div>
	);
};

export default WeekTabs;
