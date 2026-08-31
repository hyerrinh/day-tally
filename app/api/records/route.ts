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
	const { actionId, recordDate, durationMinutes, memo } = await body;
	//검증

	if (!actionId)
		return Response.json({ message: "back - record 생성 : 액션ID 없음" }, { status: 500 });

	const record = await prisma.record.create({
		data: {
			userId,
			recordDate: new Date(`${recordDate}T00:00:00.000Z`),
			actionId,
			durationMinutes,
			memo,
		},
	});

	// const record = prisma.record.create();
	// return Response.json(record);

	return Response.json(record, { status: 201 });
}
