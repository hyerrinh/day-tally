import { createRemoteJWKSet, jwtVerify } from "jose";

// 토큰 검증으로 바꾸기 전까지 API가 쓰는 테스트 사용자 (ROADMAP 4단계에서 getUserId로 교체)
export const testUserId = "550e8400-e29b-41d4-a716-446655440000";

const supabaseUrl = process.env.SUPABASE_URL;

// Supabase 공개키로 토큰 서명을 직접 검증한다 (decisions.md 13)
// 처음 검증할 때 만든다. 모듈 로드 시 만들면 SUPABASE_URL이 없을 때 이 파일을 쓰는 모든 API가 실패함
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

// Authorization: Bearer <토큰>을 검증해 Supabase 사용자 id(sub)를 반환. 실패하면 null
export async function getUserId(request: Request): Promise<string | null> {
	const authorization = request.headers.get("authorization");

	if (!authorization?.startsWith("Bearer ")) {
		return null;
	}

	if (!supabaseUrl) {
		throw new Error("SUPABASE_URL 환경변수 없음");
	}

	jwks ??= createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));

	try {
		const { payload } = await jwtVerify(authorization.slice(7), jwks, {
			issuer: `${supabaseUrl}/auth/v1`,
			audience: "authenticated",
		});

		return payload.sub ?? null;
	} catch {
		return null;
	}
}
