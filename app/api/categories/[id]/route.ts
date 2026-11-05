import { testUserId as userId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUuid, parseName } from "@/lib/validation";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const body = await request.json();
		const { name, isHidden } = body;
		const { id } = await params;
		let trimmedName: string | undefined;
		let normalizedName: string | undefined;

		if (isHidden !== undefined && typeof isHidden !== "boolean") {
			return Response.json(
				{ message: "back : category 수정 - isHidden 타입 오류" },
				{ status: 400 },
			);
		}

		const existingCategory = isUuid(id)
			? await prisma.category.findFirst({ where: { userId, id } })
			: null;

		if (!existingCategory) {
			return Response.json({ message: "back : category 수정 - category 없음" }, { status: 404 });
		}

		// 활성 카테고리는 최소 한 개 유지 (CAT-003)
		if (isHidden === true && !existingCategory.isHidden) {
			const activeCount = await prisma.category.count({ where: { userId, isHidden: false } });

			if (activeCount <= 1) {
				return Response.json(
					{ message: "back : category 수정 - 마지막 활성 카테고리는 숨길 수 없음" },
					{ status: 400 },
				);
			}
		}

		if (name !== undefined) {
			const parsedName = parseName(name);

			if ("error" in parsedName) {
				return Response.json(
					{ message: `back : category 수정 - ${parsedName.error}` },
					{ status: 400 },
				);
			}

			({ trimmedName, normalizedName } = parsedName);

			const duplicateCategory = await prisma.category.findFirst({
				where: {
					userId,
					normalizedName,
					id: { not: id },
				},
			});

			if (duplicateCategory) {
				return Response.json({ message: "back : category 수정 - 이름 중복" }, { status: 409 });
			}
		}

		const category = await prisma.category.update({
			where: {
				id,
			},
			data: {
				...(name !== undefined && { name: trimmedName, normalizedName }),
				...(isHidden !== undefined && { isHidden }),
			},
		});

		return Response.json(category);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : category 수정 - ${e.message}` }, { status: 500 });
		}

		return Response.json({ message: "back : category 수정 - 서버 오류" }, { status: 500 });
	}
};

// 하위 행동 모두 기록이 없을 때만 행동과 함께 삭제 (CAT-005, decisions.md 18)
export const DELETE = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { id } = await params;

		const existingCategory = isUuid(id)
			? await prisma.category.findFirst({ where: { userId, id } })
			: null;

		if (!existingCategory) {
			return Response.json({ message: "back : category 삭제 - category 없음" }, { status: 404 });
		}

		if (!existingCategory.isHidden) {
			const activeCount = await prisma.category.count({ where: { userId, isHidden: false } });

			if (activeCount <= 1) {
				return Response.json(
					{ message: "back : category 삭제 - 마지막 활성 카테고리는 삭제할 수 없음" },
					{ status: 400 },
				);
			}
		}

		const recordCount = await prisma.record.count({ where: { action: { categoryId: id } } });

		if (recordCount > 0) {
			return Response.json(
				{ message: "back : category 삭제 - 기록이 있는 category는 삭제 불가 (숨김 사용)" },
				{ status: 409 },
			);
		}

		const [, category] = await prisma.$transaction([
			prisma.action.deleteMany({ where: { categoryId: id } }),
			prisma.category.delete({ where: { id } }),
		]);

		return Response.json(category);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : category 삭제 - ${e.message}` }, { status: 500 });
		}

		return Response.json({ message: "back : category 삭제 - 서버 오류" }, { status: 500 });
	}
};
