import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

export const GET = async () => {
	const categories = await prisma.category.findMany({ include: { actions: true } });
	return Response.json(categories);
};

export const POST = async (request: Request) => {
	try {
		const body = await request.json();
		const { name, icon } = body;

		if (typeof name !== "string") {
			return Response.json({ message: "back : category 생성 - name 타입 오류" }, { status: 400 });
		}

		const trimmedName = name.trim();

		if (trimmedName === "") {
			return Response.json({ message: "back : category 생성 - name 빈 값" }, { status: 400 });
		}

		if (trimmedName.length > 15) {
			return Response.json({ message: "back : category 생성 - name 15자 초과" }, { status: 400 });
		}

		const normalizedName = trimmedName.toLowerCase();

		const duplicateCategory = await prisma.category.findUnique({
			where: {
				userId_normalizedName: {
					userId,
					normalizedName,
				},
			},
		});

		if (duplicateCategory) {
			return Response.json({ message: "back : category 생성 - 이름 중복" }, { status: 409 });
		}

		const category = await prisma.category.create({
			data: {
				userId,
				name: trimmedName,
				normalizedName,
				icon: icon ?? "default",
				sortOrder: 0,
			},
			include: { actions: true },
		});

		return Response.json(category, { status: 201 });
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : category 생성 - ${e.message}` }, { status: 500 });
		}

		return Response.json({ message: "back : category 생성 - 서버 오류" }, { status: 500 });
	}
};
