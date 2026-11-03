import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		// actionId, createdAt은 수정 불가 (REC-004)
		const { recordDate, durationMinutes, memo } = await request.json();
		const { id } = await params;
		let targetDate: Date | undefined;
		let trimmedMemo: string | null | undefined;

		if (recordDate !== undefined) {
			if (typeof recordDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(recordDate)) {
				return Response.json(
					{ message: "back : record 수정 - recordDate 형식 오류" },
					{ status: 400 },
				);
			}

			targetDate = new Date(`${recordDate}T00:00:00.000Z`);

			if (
				Number.isNaN(targetDate.getTime()) ||
				targetDate.toISOString().slice(0, 10) !== recordDate
			) {
				return Response.json(
					{ message: "back : record 수정 - 실제로 존재하지 않는 날짜" },
					{ status: 400 },
				);
			}

			// 가장 빠른 시간대(UTC+14)의 오늘보다 뒤면 미래 날짜 (decisions.md 11)
			const latestToday = new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10);

			if (recordDate > latestToday) {
				return Response.json({ message: "back : record 수정 - 미래 날짜" }, { status: 400 });
			}
		}

		if (durationMinutes !== undefined && durationMinutes !== null) {
			if (!Number.isInteger(durationMinutes)) {
				return Response.json(
					{ message: "back : record 수정 - durationMinutes 정수 아님" },
					{ status: 400 },
				);
			}
			if (durationMinutes < 0 || durationMinutes > 1439) {
				return Response.json(
					{ message: "back : record 수정 - durationMinutes 0 미만 이거나 1439 초과" },
					{ status: 400 },
				);
			}
		}

		if (memo !== undefined && memo !== null) {
			if (typeof memo !== "string") {
				return Response.json(
					{ message: "back : record 수정 - 메모 type string 아님" },
					{ status: 400 },
				);
			}

			trimmedMemo = memo.trim();

			if (trimmedMemo.length > 500) {
				return Response.json({ message: "back : record 수정 - 메모 500자 초과" }, { status: 400 });
			}
		}

		const existingRecord = await prisma.record.findFirst({ where: { id, userId } });

		if (!existingRecord) {
			return Response.json({ message: "back : record 수정 - record 없음" }, { status: 404 });
		}

		const record = await prisma.record.update({
			where: { id },
			data: {
				...(targetDate && { recordDate: targetDate }),
				// 0은 시간 없음, 빈 메모는 null (COMMON-006, REC-001)
				...(durationMinutes !== undefined && { durationMinutes: durationMinutes || null }),
				...(memo !== undefined && { memo: trimmedMemo || null }),
			},
		});

		return Response.json(record);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : record 수정 - ${e.message}` }, { status: 500 });
		}

		return Response.json({ message: "back : record 수정 - 서버 오류" }, { status: 500 });
	}
};

export const DELETE = async (
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id } = await params;

	const existingRecord = await prisma.record.findFirst({ where: { id, userId } });

	if (!existingRecord) {
		return Response.json({ message: "back : record 삭제 - record 없음" }, { status: 404 });
	}

	const record = await prisma.record.delete({ where: { userId, id } });

	return Response.json(record);
};
