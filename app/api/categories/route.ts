import { prisma } from "@/lib/prisma";

export const GET = async () => {
	const categories = await prisma.category.findMany({ include: { actions: true } });
	return Response.json(categories);
};

export const POST = async (request: Request) => {
	const body = await request.json();

	const category = await prisma.category.create({
		data: {
			userId: "550e8400-e29b-41d4-a716-446655440000",
			name: body.name,
			normalizedName: body.name.trim().toLowerCase(),
			icon: body.icon ?? "default",
			sortOrder: 0,
		},
		include: { actions: true },
	});

	return Response.json(category);
};
