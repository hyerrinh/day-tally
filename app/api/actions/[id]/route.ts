import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { name } = await request.json();
		const { id } = await params;

		if (typeof name !== "string") {
			return Response.json({ message: "api : 액션 name 타입 오류" }, { status: 400 });
		}

		const trimmedName = name.trim();

		if (trimmedName === "") {
			return Response.json({ message: "api 액션 name 빈 값" }, { status: 400 });
		}
		if (trimmedName.length > 15) {
			return Response.json({ message: "api 액션 글자수 15 초과" }, { status: 400 });
		}

		const normalizedName = trimmedName.toLowerCase();

		const existingAction = await prisma.action.findFirst({ where: { id, userId } });

		if (!existingAction) {
			return Response.json({ message: "api : 액션 없다" }, { status: 404 });
		}
		const categoryId = existingAction.categoryId;

		if (existingAction.normalizedName === normalizedName) {
			return Response.json({ message: "api : 이전과 동일한 action name" }, { status: 400 });
		}

		const duplicateAction = await prisma.action.findFirst({
			where: { userId, categoryId, normalizedName, id: { not: id } },
		});

		if (duplicateAction) {
			return Response.json({ message: "api : 다른 action name 과 중복" }, { status: 409 });
		}

		const updatedAction = await prisma.action.update({
			where: { id },
			data: {
				name: trimmedName,
				normalizedName,
			},
		});

		return Response.json(updatedAction);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: e.message }, { status: 500 });
		}
		return Response.json({ message: "api : 액션 수정 에러" }, { status: 500 });
	}
};

export const DELETE = async (
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id } = await params;
	const deletedAction = await prisma.action.delete({
		where: { id },
	});

	return Response.json(deletedAction);
};
