import { testUserId as userId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 숨긴 카테고리·행동 목록 (HIDDEN-001, HIDDEN-002, decisions.md 21)
export const GET = async () => {
	try {
		const categories = await prisma.category.findMany({
			where: { userId, isHidden: true },
			include: { _count: { select: { actions: true } } },
			orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
		});

		// 소속 카테고리가 숨겨져 있어도 포함 (HIDDEN-002)
		const actions = await prisma.action.findMany({
			where: { userId, isHidden: true },
			include: { category: true },
			orderBy: { createdAt: "asc" },
		});

		return Response.json({ categories, actions });
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : 숨긴 항목 조회 - ${e.message}` }, { status: 500 });
		}
		return Response.json({ message: "back : 숨긴 항목 조회 - 서버 오류" }, { status: 500 });
	}
};
