import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

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

		const existingCategory = await prisma.category.findFirst({
			where: {
				userId,
				id,
			},
		});

		if (!existingCategory) {
			return Response.json({ message: "back : category 수정 - category 없음" }, { status: 404 });
		}

		if (name !== undefined) {
			if (typeof name !== "string") {
				return Response.json({ message: "back : category 수정 - name 타입 오류" }, { status: 400 });
			}

			trimmedName = name.trim();

			if (trimmedName === "") {
				return Response.json({ message: "back : category 수정 - name 빈 값" }, { status: 400 });
			}

			if (trimmedName.length > 15) {
				return Response.json({ message: "back : category 수정 - name 15자 초과" }, { status: 400 });
			}

			normalizedName = trimmedName.toLowerCase();

			if (normalizedName === existingCategory.normalizedName) {
				return Response.json(
					{ message: "back : category 수정 - 이전과 동일한 이름" },
					{ status: 400 },
				);
			}

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
