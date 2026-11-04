import { testUserId as userId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDate } from "@/lib/validation";

// 기간 안에서 기록이 있는 날짜 목록 (CAL-001, decisions.md 21). 숨긴 행동·카테고리 기록도 포함
export const GET = async (request: Request) => {
	try {
		const { searchParams } = new URL(request.url);
		const from = parseDate(searchParams.get("from"));
		const to = parseDate(searchParams.get("to"));

		if (!from || !to) {
			return Response.json(
				{ message: "back : 기록 날짜 조회 - from·to 누락 또는 형식 오류" },
				{ status: 400 },
			);
		}

		const days = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000) + 1;

		if (days < 1 || days > 42) {
			return Response.json(
				{ message: "back : 기록 날짜 조회 - 기간은 1~42일" },
				{ status: 400 },
			);
		}

		const records = await prisma.record.findMany({
			where: { userId, recordDate: { gte: from, lte: to } },
			select: { recordDate: true },
			distinct: ["recordDate"],
			orderBy: { recordDate: "asc" },
		});

		return Response.json(records.map((record) => record.recordDate.toISOString().slice(0, 10)));
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : 기록 날짜 조회 - ${e.message}` }, { status: 500 });
		}
		return Response.json({ message: "back : 기록 날짜 조회 - 서버 오류" }, { status: 500 });
	}
};
