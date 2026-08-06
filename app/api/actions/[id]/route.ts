import { prisma } from "@/lib/prisma";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	const { name } = await request.json();
	const { id } = await params;

	const updatedCategory = await prisma.action.update({
		where: { id },
		data: {
			name,
		},
	});

	return Response.json(updatedCategory);
};

export const DELETE = () => {};
