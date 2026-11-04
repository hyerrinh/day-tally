import { getUserId } from "@/lib/auth";
import { createDefaultData } from "@/lib/default-data";

// 로그인 직후 앱이 호출. 신규 사용자면 기본 데이터 생성 (AUTH-002)
export const POST = async (request: Request) => {
	try {
		const userId = await getUserId(request);

		if (!userId) {
			return Response.json({ message: "back : 초기화 - 인증 실패" }, { status: 401 });
		}

		const created = await createDefaultData(userId);

		return Response.json({ created }, { status: created ? 201 : 200 });
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ message: `back : 초기화 - ${e.message}` }, { status: 500 });
		}
		return Response.json({ message: "back : 초기화 - 서버 오류" }, { status: 500 });
	}
};
