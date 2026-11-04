import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// 신규 사용자 기본 데이터 (AUTH-002)
const defaultCategories = [
	{ name: "일상", actions: ["밥 먹기", "청소", "설거지"] },
	{ name: "운동", actions: ["스트레칭", "러닝"] },
	{ name: "커리어", actions: ["회사"] },
];

// 사용자가 없으면 기본 데이터를 한 트랜잭션으로 생성하고 true, 이미 있으면 false (decisions.md 14)
export async function createDefaultData(userId: string): Promise<boolean> {
	const existingUser = await prisma.user.findUnique({ where: { id: userId } });

	if (existingUser) {
		return false;
	}

	try {
		await prisma.$transaction(async (tx) => {
			await tx.user.create({ data: { id: userId } });

			const categoryIds: string[] = [];

			for (const [i, category] of defaultCategories.entries()) {
				const created = await tx.category.create({
					data: {
						userId,
						name: category.name,
						normalizedName: category.name.toLowerCase(),
						sortOrder: (i + 1) * 100,
						actions: {
							createMany: {
								data: category.actions.map((name, j) => ({
									userId,
									name,
									normalizedName: name.toLowerCase(),
									sortOrder: j + 1,
								})),
							},
						},
					},
				});
				categoryIds.push(created.id);
			}

			await tx.userSetting.create({
				data: { userId, lastSelectedCategoryId: categoryIds[0] },
			});
		});
	} catch (e) {
		// 동시 요청이 먼저 생성한 경우 (User id 기본키 충돌)
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
			return false;
		}
		throw e;
	}

	return true;
}
