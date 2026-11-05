import { testUserId as userId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTimezone } from "@/lib/validation";

const recordSortOrders = ["NEWEST_FIRST", "OLDEST_FIRST"];

// 사용자 설정 조회 (SET-001, decisions.md 21). 설정이 없으면 기본값
export const GET = async () => {
	try {
		const setting = await prisma.userSetting.findUnique({ where: { userId } });

		return Response.json(
			setting ?? { recordSortOrder: "NEWEST_FIRST", lastSelectedCategoryId: null, timezone: null },
		);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : 설정 조회 - ${e.message}` }, { status: 500 });
		}
		return Response.json({ message: "back : 설정 조회 - 서버 오류" }, { status: 500 });
	}
};

// 기록 정렬(SET-001)·시간대(decisions.md 22) 변경
export const PATCH = async (request: Request) => {
	try {
		const { recordSortOrder, timezone } = await request.json();

		if (recordSortOrder === undefined && timezone === undefined) {
			return Response.json(
				{ message: "back : 설정 수정 - 변경할 값 없음" },
				{ status: 400 },
			);
		}

		if (recordSortOrder !== undefined && !recordSortOrders.includes(recordSortOrder)) {
			return Response.json(
				{ message: "back : 설정 수정 - recordSortOrder 허용값 아님" },
				{ status: 400 },
			);
		}

		if (timezone !== undefined && !isTimezone(timezone)) {
			return Response.json(
				{ message: "back : 설정 수정 - timezone 허용값 아님" },
				{ status: 400 },
			);
		}

		const data = {
			...(recordSortOrder !== undefined && { recordSortOrder }),
			...(timezone !== undefined && { timezone }),
		};

		const setting = await prisma.userSetting.upsert({
			where: { userId },
			update: data,
			create: { userId, ...data },
		});

		return Response.json(setting);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : 설정 수정 - ${e.message}` }, { status: 500 });
		}
		return Response.json({ message: "back : 설정 수정 - 서버 오류" }, { status: 500 });
	}
};
