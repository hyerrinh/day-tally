import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

export const POST = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const body = await request.json();
		const { id } = await params;
		const { name } = body;

		if (typeof name !== "string") {
			return Response.json({ message: "back : action 타입 string 아님" }, { status: 400 });
		}

		const trimmedName = name.trim();

		if (trimmedName === "") {
			return Response.json({ message: "api : 액션 빈 값" }, { status: 400 });
		}
		if (trimmedName.length > 15) {
			return Response.json({ message: "api : 액션 글자수 15 초과" }, { status: 400 });
		}

		const existingCategory = await prisma.category.findFirst({
			where: {
				userId,
				id,
			},
		});

		if (!existingCategory) {
			return Response.json({ message: "api : 카테고리 없음" }, { status: 404 });
		}

		const normalizedName = trimmedName.toLowerCase();

		const duplicateAction = await prisma.action.findUnique({
			where: { categoryId_normalizedName: { categoryId: id, normalizedName } },
		});

		if (duplicateAction) {
			return Response.json({ message: "api : 액션 중복 이름" }, { status: 409 });
		}

		const action = await prisma.action.create({
			data: {
				userId,
				name: trimmedName,
				normalizedName,
				categoryId: id,
				sortOrder: 0,
			},
		});

		return Response.json(action, { status: 201 });
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: e.message }, { status: 500 });
		}
		return Response.json({ message: "api : 액션 에러" }, { status: 500 });
	}
};
