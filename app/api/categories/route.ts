import { testUserId as userId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseName } from "@/lib/validation";

export const GET = async () => {
	try {
		const categories = await prisma.category.findMany({
			where: { userId, isHidden: false },
			include: {
				actions: {
					where: { isHidden: false },
					orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
				},
			},
			orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
		});
		return Response.json(categories);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: e.message }, { status: 500 });
		}
		return Response.json({ message: "back : 카테고리 조회 - 서버 오류" }, { status: 500 });
	}
};

export const POST = async (request: Request) => {
	try {
		const body = await request.json();
		const { name, icon } = body;

		const parsedName = parseName(name);

		if ("error" in parsedName) {
			return Response.json(
				{ message: `back : category 생성 - ${parsedName.error}` },
				{ status: 400 },
			);
		}

		const { trimmedName, normalizedName } = parsedName;

		const duplicateCategory = await prisma.category.findUnique({
			where: {
				userId_normalizedName: {
					userId,
					normalizedName,
				},
			},
		});

		if (duplicateCategory) {
			return Response.json({ message: "back : category 생성 - 이름 중복" }, { status: 409 });
		}

		// 최초 100, 이후 최댓값 + 100. 동시 요청으로 겹치면 createdAt으로 정렬 (decisions.md 12)
		const { _max } = await prisma.category.aggregate({
			where: { userId },
			_max: { sortOrder: true },
		});

		const category = await prisma.category.create({
			data: {
				userId,
				name: trimmedName,
				normalizedName,
				icon: icon ?? "default",
				sortOrder: (_max.sortOrder ?? 0) + 100,
			},
			include: { actions: true },
		});

		return Response.json(category, { status: 201 });
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : category 생성 - ${e.message}` }, { status: 500 });
		}

		return Response.json({ message: "back : category 생성 - 서버 오류" }, { status: 500 });
	}
};
