import { createRemoteJWKSet, jwtVerify } from "jose";

const supabaseUrl = process.env.SUPABASE_URL;

// Supabase 공개키로 토큰 서명을 직접 검증한다 (decisions.md 13)
const jwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));

// Authorization: Bearer <토큰>을 검증해 Supabase 사용자 id(sub)를 반환. 실패하면 null
export async function getUserId(request: Request): Promise<string | null> {
	const authorization = request.headers.get("authorization");

	if (!authorization?.startsWith("Bearer ")) {
		return null;
	}

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
