# ROADMAP

> 기능 기준: `docs/feature-spec.md` · DB 기준: `docs/db-design.md` · 결정 기록: `docs/decisions.md`
> 괄호 안은 기능명세서 ID다.

## 1단계: 스키마 정리 (로컬, Supabase 이전 전)

- [x] User.email null 허용 + UNIQUE 제거
- [x] User.id 기본값 제거 (Supabase Auth id 사용)
- [x] Action에 `durationStepMinutes` 추가 (기본 5)
- [x] 시간 Check 제약 추가 (1~1439분, ± 단위 1·5·10·15·30·60)
- [x] 테이블·컬럼 snake_case (`@@map` / `@map`)

## 2단계: 로컬 Postgres → Supabase 이전

- [ ] 로컬 Postgres → Supabase 이전
- [ ] 웹이 그대로 동작하는지 확인

## 3단계: API 다듬기

- [x] 기록 PATCH (REC-004)
- [x] 기록 삭제 시 없는 기록이면 404 (REC-006)
- [x] records GET에 행동·카테고리 포함 + 정렬 (HOME-006, REC-003)
- [x] 기록 시간 검증 1~1439분으로 변경 (COMMON-006)
- [ ] 기록 생성·수정 시 미래 날짜 차단 (REC-001, REC-004)
- [x] 행동 `defaultDurationMinutes` · `durationStepMinutes` 받기 (ACT-002, ACT-003, ACT-004)
- [x] `/api/users` 삭제

## 4단계: 인증 헬퍼

- [ ] `getUserId` 헬퍼 작성 (Supabase 토큰 검증)
- [ ] 하드코딩된 userId를 `getUserId`로 교체
- [ ] 신규 유저 기본 데이터 생성 (AUTH-002)
- [ ] AuthAccount 유지 여부 · Supabase 자동 계정 연결 설정 확인

## 5단계: Expo 앱 뼈대

- [ ] 레포 구조 결정
- [ ] Expo 뼈대
- [ ] Supabase 구글 로그인 (AUTH-001)
- [ ] 토큰 붙이는 fetch 래퍼

## 6단계: 기록 기능

- [ ] 탭 즉시 기록 + 토스트(되돌리기/수정) (REC-001, REC-006)
- [ ] 길게 누르기 시트(± · 메모) (REC-001, ACT-004)
- [ ] 날짜별 목록 · 날짜 이동 (HOME-003 ~ HOME-006)
- [ ] 행동 기본시간 · ± 단위 설정 (ACT-003, ACT-004)

## 7단계: 우주 디자인

- [ ] 시안
- [ ] 행성 돌아보기
- [ ] 별 애니메이션

## 8단계: 배포 · 출시

- [ ] Vercel 배포
- [ ] EAS 빌드
- [ ] Apple 로그인 (AUTH-001)
- [ ] 개인정보처리방침
- [ ] 계정 삭제 (AUTH-004)
- [ ] 비공개 테스트
- [ ] 출시

## 미정

- [ ] 레포 구조 (5단계 전)
- [ ] AuthAccount 유지 여부 (4단계)
- [ ] 아이콘 저장 방식 (이모지 문자열 / 아이콘 코드)
