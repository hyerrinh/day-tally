import { prisma } from "@/lib/prisma";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	const { name } = await request.json();
	const { id } = await params;

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
