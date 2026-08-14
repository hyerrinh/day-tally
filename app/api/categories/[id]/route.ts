import { prisma } from "@/lib/prisma";

const userId = "550e8400-e29b-41d4-a716-446655440000";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const body = await request.json();
		const { name } = body;
		const { id } = await params;

		if (typeof name !== "string") {
			return Response.json({ message: "api : 타입 string 아님" }, { status: 400 });
		}

		const trimmedName = name.trim();

		if (trimmedName === "") {
			return Response.json({ message: "api : 카테고리 빈 값" }, { status: 400 });
		}
		if (trimmedName.length > 15) {
			return Response.json({ message: "api : 글자수 15 초과" }, { status: 400 });
		}

		const normalizedName = trimmedName.toLowerCase();

		const existingCategory = await prisma.category.findFirst({
			where: {
				userId,
				id,
			},
		});

		if (!existingCategory) {
			return Response.json({ message: "api : 카테고리 없음" }, { status: 404 });
		}
		if (normalizedName === existingCategory.normalizedName) {
			return Response.json({ message: "api 동일한 카테고리 이름" }, { status: 400 });
		}

		const duplicateCategory = await prisma.category.findFirst({
			where: {
				userId,
				normalizedName,
				id: { not: id },
			},
		});

		if (duplicateCategory) {
			return Response.json({ message: "api : 이미 존재하는 카테고리" }, { status: 409 });
		}

		const category = await prisma.category.update({
			where: {
				id,
			},
			data: {
				name: trimmedName,
				normalizedName,
			},
		});

		return Response.json(category);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: e.message }, { status: 500 });
		}
		return Response.json({ message: "서버 오류" }, { status: 500 });
	}
};

// TODO: 실제 서비스에서는 카테고리 영구 삭제 미지원.
// isHidden 기반 숨김 처리로 변경 예정.
export const DELETE = async (
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) => {
	const { id } = await params;
	const deletedCategory = await prisma.category.delete({
		where: { id },
	});

	return Response.json(deletedCategory);
};
