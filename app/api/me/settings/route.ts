import { testUserId as userId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

// 기록 정렬 설정 변경 (SET-001)
export const PATCH = async (request: Request) => {
	try {
		const { recordSortOrder } = await request.json();

		if (!recordSortOrders.includes(recordSortOrder)) {
			return Response.json(
				{ message: "back : 설정 수정 - recordSortOrder 허용값 아님" },
				{ status: 400 },
			);
		}

		const setting = await prisma.userSetting.upsert({
			where: { userId },
			update: { recordSortOrder },
			create: { userId, recordSortOrder },
		});

		return Response.json(setting);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : 설정 수정 - ${e.message}` }, { status: 500 });
		}
		return Response.json({ message: "back : 설정 수정 - 서버 오류" }, { status: 500 });
	}
};
