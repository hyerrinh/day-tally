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
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35">
			<div className="flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-3xl bg-white text-slate-900 shadow-xl">
				{/* 핸들 */}
				<div className="flex shrink-0 justify-center pt-3 pb-2">
					<div className="h-1 w-9 rounded-full bg-slate-200" />
				</div>
				{/* 헤더 */}
				<div className="flex shrink-0 items-center justify-between px-5 pb-4">
					<h2 className="text-base font-bold">기록 추가</h2>
					<button
						type="button"
						aria-label="기록 추가 닫기"
						disabled={isAdding}
						onClick={close}
						className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
							className="h-[22px] w-[22px]"
							aria-hidden="true"
						>
							<path d="m6 6 12 12M18 6 6 18" />
						</svg>
					</button>
				</div>
				{/* 입력 영역 */}
				<div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
					<div className="border-b border-slate-100 pb-6">
						<p className="text-sm font-medium text-slate-500">{selectedDate}</p>
						<p className="mt-2 break-words text-[18px] font-bold tracking-tight text-slate-800">
							{data.name}
						</p>
					</div>
					<fieldset disabled={isAdding} className="mt-6">
						<legend className="text-sm font-semibold text-slate-700">
							지속시간
							<span className="ml-2 text-xs font-normal text-slate-400">선택</span>
						</legend>
						<div className="mt-3 grid grid-cols-2 gap-3">
							<label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition-colors focus-within:border-slate-400 focus-within:bg-white">
								<input
									type="number"
									aria-label="시간"
									min="0"
									max="24"
									step="1"
									inputMode="numeric"
									placeholder="0"
									value={hours}
									onChange={(e) => setHours(e.target.value)}
									className="w-full min-w-0 bg-transparent text-right text-lg font-semibold tabular-nums text-slate-800 outline-none placeholder:text-slate-300"
								/>
								<span className="shrink-0 text-sm text-slate-400">시간</span>
							</label>
							<label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition-colors focus-within:border-slate-400 focus-within:bg-white">
								<input
									type="number"
									aria-label="분"
									min="0"
									max="59"
									step="1"
									inputMode="numeric"
									placeholder="0"
									value={minutes}
									onChange={(e) => setMinutes(e.target.value)}
									className="w-full min-w-0 bg-transparent text-right text-lg font-semibold tabular-nums text-slate-800 outline-none placeholder:text-slate-300"
								/>
								<span className="shrink-0 text-sm text-slate-400">분</span>
							</label>
						</div>
						<p className="mt-2 text-xs text-slate-400">시간을 입력하지 않아도 기록할 수 있어요.</p>
					</fieldset>
					<div className="mt-6">
						<label htmlFor="record-memo" className="text-sm font-semibold text-slate-700">
							메모
							<span className="ml-2 text-xs font-normal text-slate-400">선택</span>
						</label>
						<textarea
							id="record-memo"
							rows={4}
							maxLength={500}
							disabled={isAdding}
							placeholder="어땠는지 짧게 남겨보세요."
							value={memo}
							onChange={(e) => setMemo(e.target.value)}
							className="mt-3 block w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:bg-white disabled:opacity-60"
						/>
						<p className="mt-2 text-right text-xs tabular-nums text-slate-400">
							{memo.length} / 500
						</p>
					</div>
				</div>
				{/* 하단 버튼 */}
				<div className="shrink-0 border-t border-slate-100 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
					<div className="flex gap-3">
						<button
							type="button"
							disabled={isAdding}
							onClick={close}
							className="h-12 flex-1 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-40"
						>
							취소
						</button>
						<button
							type="button"
							disabled={isAdding}
							onClick={() => addRecord({ actionId: data.id })}
							className="h-12 flex-[2] rounded-2xl bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isAdding ? "추가 중…" : "기록 추가"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddRecordSheet;
