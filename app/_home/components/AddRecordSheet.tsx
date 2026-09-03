"use client";
import { useState } from "react";
import { createRecord } from "../api/homeApi";
import type { Action } from "@/app/generated/prisma/client";
import type { RecordResponse } from "@/app/_type/type";

type AddRecordSheetProps = {
	data: Action;
	onAddRecord: (record: RecordResponse) => void;
	selectedDate: string;
	close: () => void;
};

const AddRecordSheet = ({ data, selectedDate, onAddRecord, close }: AddRecordSheetProps) => {
	const [isAdding, setIsAdding] = useState(false);
	const [hours, setHours] = useState("");
	const [minutes, setMinutes] = useState("");
	const [memo, setMemo] = useState("");

	const addRecord = async ({ actionId }: { actionId: string }) => {
		try {
			const hasDuration = hours !== "" || minutes !== "";
			const hourValue = Number(hours);
			const minuteValue = Number(minutes);

			if (!Number.isInteger(hourValue) || !Number.isInteger(minuteValue)) {
				return alert("front - record 추가 : 시간과 분은 정수만 입력 가능");
			}
			if (hourValue > 24) {
				return alert("front - record 추가 : hours 24 초과");
			}
			if (minuteValue > 59) {
				return alert("front - record 추가 : minutes 59 초과");
			}
			if (hourValue === 24 && minuteValue > 0) {
				return alert("front -record 추가 : hours 24 minutes 초과");
			}
			if (hourValue < 0 || minuteValue < 0) {
				return alert("front -record 추가 : hours or minutes 음수");
			}

			const durationMinutes = hasDuration ? hourValue * 60 + minuteValue : undefined;

			setIsAdding(true);

			const record = await createRecord({
				recordDate: selectedDate,
				actionId,
				durationMinutes,
				memo: memo.trim() === "" ? undefined : memo.trim(),
			});

			onAddRecord(record);
			close();
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black">
			<div className="absolute bottom-0 top-8 left-0 right-0 bg-white rounded-t-2xl">
				<div className="flex justify-between mb-4">
					<p>기록 추가</p>
					<button type="button" className="w-4 h-4" onClick={close}>
						X
					</button>
				</div>
				<div>
					<p>{selectedDate} (날짜 선택 가능하게)</p>
					<p>{data.name}</p>
					<div>
						<p>지속시간</p>
						<div className="flex">
							<input
								type="number"
								min="0"
								inputMode="numeric"
								onChange={(e) => setHours(e.target.value)}
							/>
							<span>시간</span>
							<input
								type="number"
								max="59"
								inputMode="numeric"
								onChange={(e) => setMinutes(e.target.value)}
							/>
							<span>분</span>
						</div>
					</div>
					<div>
						<p>메모</p>
						<textarea onChange={(e) => setMemo(e.target.value)}></textarea>
					</div>
				</div>
				<div className="mt-4">
					<button type="button" className="w-1/2" onClick={close}>
						취소
					</button>
					<button
						type="button"
						className="w-1/2 text-white bg-black"
						disabled={isAdding}
						onClick={() => addRecord({ actionId: data.id })}
					>
						{isAdding ? "추가중" : "추가"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddRecordSheet;
