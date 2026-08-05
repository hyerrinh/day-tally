import { prisma } from "@/lib/prisma";

export const POST = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	const body = await request.json();
	const { id } = await params;

	const trimmedName = body.name.trim();
	const normalizedName = trimmedName.toLowerCase();

	const action = await prisma.action.create({
		data: {
			userId: "550e8400-e29b-41d4-a716-446655440000",
			name: trimmedName,
			normalizedName: normalizedName,
			categoryId: id,
			sortOrder: 0,
		},
	});

	return Response.json(action);
};
