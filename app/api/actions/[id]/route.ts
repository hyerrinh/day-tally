import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { name, isHidden } = await request.json();
		const { id } = await params;
		let trimmedName: string | undefined;
		let normalizedName: string | undefined;

		if (isHidden !== undefined && typeof isHidden !== "boolean") {
			return Response.json({ message: "back : action 수정 - isHidden type 오류" }, { status: 400 });
		}
		const existingAction = await prisma.action.findFirst({ where: { id, userId } });

		if (!existingAction) {
			return Response.json({ message: "back : action 수정 - action 없음" }, { status: 404 });
		}

		const categoryId = existingAction.categoryId;

		if (name !== undefined) {
			if (typeof name !== "string") {
				return Response.json({ message: "back : action 수정 - name 타입 오류" }, { status: 400 });
			}

			trimmedName = name.trim();
			if (trimmedName === "") {
				return Response.json({ message: "back : action 수정 - name 빈 값" }, { status: 400 });
			}
			if (trimmedName.length > 15) {
				return Response.json({ message: "back : action 수정 - name 15자 초과" }, { status: 400 });
			}

			normalizedName = trimmedName.toLowerCase();
			if (existingAction.normalizedName === normalizedName) {
				return Response.json(
					{ message: "back : action 수정 - 이전과 동일한 이름" },
					{ status: 400 },
				);
			}

			const duplicateAction = await prisma.action.findFirst({
				where: { userId, categoryId, normalizedName, id: { not: id } },
			});

			if (duplicateAction) {
				return Response.json({ message: "back : action 수정 - 이름 중복" }, { status: 409 });
			}
		}

		const updatedAction = await prisma.action.update({
			where: { id },
			data: {
				...(name !== undefined && { name: trimmedName, normalizedName }),
				...(isHidden !== undefined && { isHidden }),
			},
		});

		return Response.json(updatedAction);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : action 수정 - ${e.message}` }, { status: 500 });
		}

		return Response.json({ message: "back : action 수정 - 서버 오류" }, { status: 500 });
	}
};
