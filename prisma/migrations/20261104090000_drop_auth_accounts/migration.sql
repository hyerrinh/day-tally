-- AuthAccount 삭제 (decisions.md 16). provider 정보는 Supabase auth.identities 사용

DROP TABLE "auth_accounts";

DROP TYPE "Provider";
