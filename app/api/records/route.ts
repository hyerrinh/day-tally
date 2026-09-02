import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const date = searchParams.get("date");
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

		if (!date) {
			return Response.json({ message: "back - record 조회 : date 값 누락" }, { status: 400 });
		}
		if (!dateRegex.test(date)) {
			return Response.json({ message: "back - record 조회 : date 형식 오류" }, { status: 400 });
		}

		const targetDate = new Date(`${date}T00:00:00.000Z`);

		const records = await prisma.record.findMany({
			where: {
				recordDate: targetDate,
				userId,
			},
		});

		type RecordItem = (typeof records)[number];

		const groupedRecords = records.reduce<Record<string, RecordItem[]>>((acc, record) => {
			if (!acc[record.actionId]) {
				acc[record.actionId] = [];
			}
			acc[record.actionId].push(record);

			return acc;
		}, {});

		return Response.json(groupedRecords);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: e.message }, { status: 500 });
		}
		return Response.json({ message: "back - record 조회 오류 " }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const body = await request.json();
	const { actionId, recordDate, durationMinutes, memo } = body;
	let trimmedMemo;

	// actionId: 타입·빈 값·존재 여부·현재 사용자 소유인지
	// recordDate: 타입·YYYY-MM-DD 형식·실제로 유효한 날짜인지
	// durationMinutes: 선택값, 들어왔다면 숫자·정수·0~1440
	// memo: 선택값, 들어왔다면 문자열·공백 처리·최대 길이
	// 액션이 숨김 상태라면 기록 등록을 허용할지

	if (typeof actionId !== "string") {
		return Response.json(
			{ message: "back - record 생성 : 액션ID type string 아님" },
			{ status: 400 },
		);
	}

	if (durationMinutes !== undefined) {
		if (typeof durationMinutes !== "number") {
			return Response.json(
				{ message: "back - record 생성 : durationMinutes type number 아님" },
				{ status: 400 },
			);
		}

		if (0 > durationMinutes || 1440 < durationMinutes) {
			return Response.json({
				message: "back - record 생성 : durationMinutes 0 미만 이거나 1440 초과",
			});
		}
	}

	if (memo !== undefined) {
		if (typeof memo !== "string") {
			return Response.json(
				{ message: "back - record 생성 : 메모 type string 아님" },
				{ status: 400 },
			);
		}
		trimmedMemo = memo.trim();
	}

	const record = await prisma.record.create({
		data: {
			userId,
			recordDate: new Date(`${recordDate}T00:00:00.000Z`),
			actionId,
			...(durationMinutes && durationMinutes),
			...(trimmedMemo && { memo: trimmedMemo }),
		},
	});

	return Response.json(record, { status: 201 });
}
