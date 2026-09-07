import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

export const DELETE = async (
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id } = await params;

	const record = await prisma.record.delete({ where: { userId, id } });

	return Response.json(record);
};
