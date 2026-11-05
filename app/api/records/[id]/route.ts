import { testUserId as userId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDurationMinutes, isFutureDate, parseDate } from "@/lib/validation";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		// actionId, createdAt은 수정 불가 (REC-004)
		const { recordDate, durationMinutes, memo } = await request.json();
		const { id } = await params;
		let targetDate: Date | undefined;
		let trimmedMemo: string | null | undefined;

		if (recordDate !== undefined) {
			const parsedDate = parseDate(recordDate);

			if (!parsedDate) {
				return Response.json(
					{ message: "back : record 수정 - recordDate 형식 오류" },
					{ status: 400 },
				);
			}

			const userSetting = await prisma.userSetting.findUnique({ where: { userId } });

			if (isFutureDate(parsedDate, userSetting?.timezone)) {
				return Response.json({ message: "back : record 수정 - 미래 날짜" }, { status: 400 });
			}

			targetDate = parsedDate;
		}

		if (
			durationMinutes !== undefined &&
			durationMinutes !== null &&
			!isDurationMinutes(durationMinutes)
		) {
			return Response.json(
				{ message: "back : record 수정 - durationMinutes는 0~1439 정수" },
				{ status: 400 },
			);
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
