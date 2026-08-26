import { useState } from "react";
import { createRecord } from "../api/homeApi";

const AddRecordSheet = ({ data, selectedDate, close }) => {
	const [hours, setHours] = useState();
	const [minutes, setMinutes] = useState();
	const [memo, setMemo] = useState();

	const addRecord = async ({ actionId }) => {
		try {
			// 검증
			// minutes : 시간 + 분
			const record = await createRecord({ actionId, minutes, memo });
			console.log(record);

			close(null);
		} catch (e) {
			if (e instanceof Error) {
				alert(e.message);
			}
		}
	};

	return (
		<div className="fixed inset-0 bg-black">
			<div className="absolute bottom-0 top-8 left-0 right-0 bg-white rounded-t-2xl">
				<div className="flex justify-between mb-4">
					<p>기록 추가</p>
					<button type="button" className="w-4 h-4" onClick={() => close(null)}>
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
					<button type="button" className="w-1/2" onClick={() => close(null)}>
						취소
					</button>
					<button
						type="button"
						className="w-1/2 text-white bg-black"
						onClick={() => addRecord({ actionId: data.id })}
					>
						추가
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddRecordSheet;
