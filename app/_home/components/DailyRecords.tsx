import type { CategoryWithActions, Records } from "@/app/_type/type";

type DailyRecordsProps = {
	records: Records;
	categoriesWithRecords: CategoryWithActions[];
};

const DailyRecords = ({ categoriesWithRecords, records }: DailyRecordsProps) => {
	return (
		<div>
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
};

export default DailyRecords;
