import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

export const DELETE = async (
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id } = await params;

	const existingRecord = await prisma.record.findFirst({ where: { id, userId } });

	if (!existingRecord) {
		return Response.json({ message: "back : record 삭제 - record 없음" }, { status: 404 });
	}

	const record = await prisma.record.delete({ where: { userId, id } });

	return Response.json(record);
};
