import { testUserId as userId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDurationMinutes, isDurationStepMinutes, parseName } from "@/lib/validation";

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { name, isHidden, defaultDurationMinutes, durationStepMinutes, categoryId } =
			await request.json();
		const { id } = await params;
		let trimmedName: string | undefined;
		let normalizedName: string | undefined;
		let movedSortOrder: number | undefined;

		if (categoryId !== undefined && typeof categoryId !== "string") {
			return Response.json(
				{ message: "back : action 수정 - categoryId 타입 오류" },
				{ status: 400 },
			);
		}

		if (isHidden !== undefined && typeof isHidden !== "boolean") {
			return Response.json({ message: "back : action 수정 - isHidden type 오류" }, { status: 400 });
		}

		if (
			defaultDurationMinutes !== undefined &&
			defaultDurationMinutes !== null &&
			!isDurationMinutes(defaultDurationMinutes)
		) {
			return Response.json(
				{ message: "back : action 수정 - defaultDurationMinutes는 0~1439 정수" },
				{ status: 400 },
			);
		}

		if (durationStepMinutes !== undefined && !isDurationStepMinutes(durationStepMinutes)) {
			return Response.json(
				{ message: "back : action 수정 - durationStepMinutes 허용값 아님" },
				{ status: 400 },
			);
		}
		const existingAction = await prisma.action.findFirst({ where: { id, userId } });

		if (!existingAction) {
			return Response.json({ message: "back : action 수정 - action 없음" }, { status: 404 });
		}

		const targetCategoryId = categoryId ?? existingAction.categoryId;
		const isMoving = targetCategoryId !== existingAction.categoryId;

		// 숨긴 카테고리로 이동 불가 (ACT-003)
		if (isMoving) {
			const targetCategory = await prisma.category.findFirst({
				where: { userId, id: targetCategoryId },
			});

			if (!targetCategory) {
				return Response.json(
					{ message: "back : action 수정 - 이동할 category 없음" },
					{ status: 404 },
				);
			}

			if (targetCategory.isHidden) {
				return Response.json(
					{ message: "back : action 수정 - 숨긴 category로 이동 불가" },
					{ status: 400 },
				);
			}
		}

		if (name !== undefined) {
			const parsedName = parseName(name);

			if ("error" in parsedName) {
				return Response.json(
					{ message: `back : action 수정 - ${parsedName.error}` },
					{ status: 400 },
				);
			}

			({ trimmedName, normalizedName } = parsedName);

			if (existingAction.normalizedName === normalizedName) {
				return Response.json(
					{ message: "back : action 수정 - 이전과 동일한 이름" },
					{ status: 400 },
				);
			}
		}

		// 이동할 카테고리(또는 현재 카테고리)에 같은 이름이 있으면 불가
		if (name !== undefined || isMoving) {
			const duplicateAction = await prisma.action.findFirst({
				where: {
					userId,
					categoryId: targetCategoryId,
					normalizedName: normalizedName ?? existingAction.normalizedName,
					id: { not: id },
				},
			});

			if (duplicateAction) {
				return Response.json({ message: "back : action 수정 - 이름 중복" }, { status: 409 });
			}
		}

		// 이동하면 대상 카테고리의 맨 뒤로 (decisions.md 20)
		if (isMoving) {
			const { _max } = await prisma.action.aggregate({
				where: { categoryId: targetCategoryId },
				_max: { sortOrder: true },
			});
			movedSortOrder = (_max.sortOrder ?? 0) + 1;
		}

		const updatedAction = await prisma.action.update({
			where: { id },
			data: {
				...(name !== undefined && { name: trimmedName, normalizedName }),
				...(isHidden !== undefined && { isHidden }),
				// 0은 시간 없음 (COMMON-006)
				...(defaultDurationMinutes !== undefined && {
					defaultDurationMinutes: defaultDurationMinutes || null,
				}),
				...(durationStepMinutes !== undefined && { durationStepMinutes }),
				...(isMoving && { categoryId: targetCategoryId, sortOrder: movedSortOrder }),
			},
		});

		return Response.json(updatedAction);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : action 수정 - ${e.message}` }, { status: 500 });
		}

		return Response.json({ message: "back : action 수정 - 서버 오류" }, { status: 500 });
	}
};

// 기록이 없는 행동만 삭제 (ACT-008, decisions.md 18)
export const DELETE = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { id } = await params;

		const existingAction = await prisma.action.findFirst({ where: { id, userId } });

		if (!existingAction) {
			return Response.json({ message: "back : action 삭제 - action 없음" }, { status: 404 });
		}

		const recordCount = await prisma.record.count({ where: { actionId: id } });

		if (recordCount > 0) {
			return Response.json(
				{ message: "back : action 삭제 - 기록이 있는 action은 삭제 불가 (숨김 사용)" },
				{ status: 409 },
			);
		}

		const action = await prisma.action.delete({ where: { id } });

		return Response.json(action);
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : action 삭제 - ${e.message}` }, { status: 500 });
		}

		return Response.json({ message: "back : action 삭제 - 서버 오류" }, { status: 500 });
	}
};
