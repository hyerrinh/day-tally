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

		const userSetting = await prisma.userSetting.findUnique({ where: { userId } });
		const sortOrder = userSetting?.recordSortOrder === "OLDEST_FIRST" ? "asc" : "desc";

		const records = await prisma.record.findMany({
			where: {
				recordDate: targetDate,
				userId,
			},
			include: {
				action: { include: { category: true } },
			},
			orderBy: { createdAt: sortOrder },
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
	try {
		const body = await request.json();
		const { actionId, recordDate, durationMinutes, memo } = body;
		let trimmedMemo: string | undefined;

		/* 
			1. actionId
			문자열이 아니면 400
			앞뒤 공백을 제거했을 때 빈 문자열이면 400
			현재 사용자의 액션 중 해당 ID가 없으면 404
			숨겨진 액션이면 등록 거부
			숨겨진 카테고리의 액션이면 등록 거부 (REC-001)
			DB 생성에는 공백 제거한 ID 사용
			참고: 존재 여부·소유권·숨김 여부는 Prisma 조회 한 번으로 함께 확인할 수 있어.
		*/

		if (typeof actionId !== "string") {
			return Response.json(
				{ message: "back - record 생성 : 액션ID type string 아님" },
				{ status: 400 },
			);
		}

		const trimmedActionId = actionId.trim();

		if (trimmedActionId === "") {
			return Response.json({ message: "back - record 생성 : 액션ID 빈 문자열" }, { status: 400 });
		}

		const existingAction = await prisma.action.findFirst({
			where: { userId, id: trimmedActionId, isHidden: false, category: { isHidden: false } },
		});

		if (!existingAction) {
			return Response.json(
				{ message: "back - record 생성 - 숨기지 않은 action 또는 category 없음" },
				{ status: 404 },
			);
		}

		/* 
			2. recordDate
			반드시 존재해야 함
			문자열이어야 함
			정확히 YYYY-MM-DD 형식이어야 함
			2026-02-31처럼 형식은 맞지만 실제로 없는 날짜면 400
			검증을 통과한 후 Prisma에 넣을 Date 객체 생성
		*/

		if (typeof recordDate !== "string") {
			return Response.json(
				{ message: "back - record 생성 - recordDate 없음 or 타입 오류" },
				{ status: 400 },
			);
		}

		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

		if (!dateRegex.test(recordDate)) {
			return Response.json(
				{ message: "back - record 생성 - recordDate 형식 오류" },
				{ status: 400 },
			);
		}

		const targetDate = new Date(`${recordDate}T00:00:00.000Z`);

		if (
			Number.isNaN(targetDate.getTime()) ||
			targetDate.toISOString().slice(0, 10) !== recordDate
		) {
			return Response.json(
				{ message: "back - record 생성 - 실제로 존재하지 않는 날짜" },
				{ status: 400 },
			);
		}

		// 가장 빠른 시간대(UTC+14)의 오늘보다 뒤면 미래 날짜 (decisions.md 11)
		const latestToday = new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10);

		if (recordDate > latestToday) {
			return Response.json({ message: "back - record 생성 - 미래 날짜" }, { status: 400 });
		}

		/*
			3. durationMinutes
			없어도 됨
			존재한다면 number여야 함
			정수여야 함
			0 이상 1439 이하여야 함
			0은 시간 없음으로 보고 저장하지 않음 (COMMON-006)
		*/

		if (durationMinutes !== undefined) {
			if (typeof durationMinutes !== "number") {
				return Response.json(
					{ message: "back - record 생성 : durationMinutes type number 아님" },
					{ status: 400 },
				);
			}

			if (!Number.isInteger(durationMinutes)) {
				return Response.json(
					{ message: "back - record 생성 : durationMinutes 정수 아님" },
					{ status: 400 },
				);
			}
			if (durationMinutes < 0 || durationMinutes > 1439) {
				return Response.json(
					{
						message: "back - record 생성 : durationMinutes 0 미만 이거나 1439 초과",
					},
					{ status: 400 },
				);
			}
		}

		/*
			4. memo
			없어도 됨
			존재한다면 string이어야 함
			앞뒤 공백 제거
			공백 제거 결과가 빈 문자열이면 DB에는 null 또는 필드 생략
			최대 길이는 우선 500자
		*/

		if (memo !== undefined) {
			if (typeof memo !== "string") {
				return Response.json(
					{ message: "back - record 생성 : 메모 type string 아님" },
					{ status: 400 },
				);
			}
			trimmedMemo = memo.trim();

			if (trimmedMemo.length > 500) {
				return Response.json({ message: "back - record 생성 : 메모 500자 초과" }, { status: 400 });
			}
		}

		const record = await prisma.record.create({
			data: {
				userId,
				recordDate: targetDate,
				actionId: trimmedActionId,
				...(durationMinutes !== undefined && durationMinutes !== 0 && { durationMinutes }),
				...(trimmedMemo && { memo: trimmedMemo }),
			},
		});

		return Response.json(record, { status: 201 });
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : record 생성 - ${e.message}` }, { status: 500 });
		}
		return Response.json({ message: "back : record 생성 - 서버 오류" }, { status: 500 });
	}
}
