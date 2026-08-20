import { prisma } from "@/lib/prisma";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
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
		return Response.json({ message: "api 액션 글자수 15 이상" }, { status: 400 });
	}

	const normalizedName = trimmedName.toLowerCase();

	const updatedAction = await prisma.action.update({
		where: { id },
		data: {
			name,
		},
	});

	return Response.json(updatedAction);
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
