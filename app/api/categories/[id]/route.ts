import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const body = await request.json();
	const { id } = await params;

	if (typeof body.name !== "string")
		return Response.json({ message: "api : 타입 string 아님" }, { status: 400 });

	const trimmedName = body.name.trim();
	const normalizedName = trimmedName.toLowerCase();

	if (trimmedName === "")
		return Response.json({ message: "api : 카테고리 빈 값" }, { status: 400 });

	const existingCategory = await prisma.category.findFirst({
		where: {
			normalizedName,
			id: { not: id },
		},
	});

	if (existingCategory)
		return Response.json({ message: "api : 이미 존재하는 카테고리" }, { status: 409 });

	const category = await prisma.category.update({
		where: {
			id,
		},
		data: {
			name: trimmedName,
			normalizedName,
			icon: body.icon,
		},
	});

	return Response.json(category);
}

export async function Delete() {}
