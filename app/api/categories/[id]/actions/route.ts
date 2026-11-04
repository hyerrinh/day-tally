import { testUserId as userId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDurationMinutes, isDurationStepMinutes, parseName } from "@/lib/validation";

export const POST = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const body = await request.json();
		const { id } = await params;
		const { name, defaultDurationMinutes, durationStepMinutes } = body;

		const parsedName = parseName(name);

		if ("error" in parsedName) {
			return Response.json(
				{ message: `back : action 생성 - ${parsedName.error}` },
				{ status: 400 },
			);
		}

		const { trimmedName, normalizedName } = parsedName;

		if (
			defaultDurationMinutes !== undefined &&
			defaultDurationMinutes !== null &&
			!isDurationMinutes(defaultDurationMinutes)
		) {
			return Response.json(
				{ message: "back : action 생성 - defaultDurationMinutes는 0~1439 정수" },
				{ status: 400 },
			);
		}

		if (durationStepMinutes !== undefined && !isDurationStepMinutes(durationStepMinutes)) {
			return Response.json(
				{ message: "back : action 생성 - durationStepMinutes 허용값 아님" },
				{ status: 400 },
			);
		}

		const existingCategory = await prisma.category.findFirst({
			where: {
				userId,
				id,
			},
		});

		if (!existingCategory) {
			return Response.json({ message: "back : action 생성 - category 없음" }, { status: 404 });
		}

		const duplicateAction = await prisma.action.findUnique({
			where: {
				categoryId_normalizedName: {
					categoryId: id,
					normalizedName,
				},
			},
		});

		if (duplicateAction) {
			return Response.json({ message: "back : action 생성 - 이름 중복" }, { status: 409 });
		}

		// 카테고리 안에서 최초 1, 이후 최댓값 + 1 (decisions.md 12)
		const { _max } = await prisma.action.aggregate({
			where: { categoryId: id },
			_max: { sortOrder: true },
		});

		const action = await prisma.action.create({
			data: {
				userId,
				name: trimmedName,
				normalizedName,
				categoryId: id,
				sortOrder: (_max.sortOrder ?? 0) + 1,
				// 0은 시간 없음 (COMMON-006)
				...(defaultDurationMinutes !== undefined && {
					defaultDurationMinutes: defaultDurationMinutes || null,
				}),
				...(durationStepMinutes !== undefined && { durationStepMinutes }),
			},
		});

		return Response.json(action, { status: 201 });
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : action 생성 - ${e.message}` }, { status: 500 });
		}

		return Response.json({ message: "back : action 생성 - 서버 오류" }, { status: 500 });
	}
};
