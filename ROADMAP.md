# ROADMAP

## 1단계: 로컬 Postgres → Supabase 이전

- [ ] 로컬 Postgres → Supabase 이전
- [ ] 웹이 그대로 동작하는지 확인

## 2단계: API 다듬기

- [ ] 기록 PATCH
- [ ] 기록 삭제 시 없는 기록이면 404
- [ ] records GET에 행동·카테고리 포함 + 정렬
- [ ] defaultDurationMinutes 받기
- [ ] 웹 주 이동
- [ ] `/api/users` 삭제

## 3단계: 인증 헬퍼

- [ ] `getUserId` 헬퍼 작성 (Supabase 토큰 검증)
- [ ] 하드코딩된 userId를 `getUserId`로 교체

## 4단계: Expo 앱 뼈대

- [ ] Expo 뼈대
- [ ] Supabase 구글 로그인
- [ ] 토큰 붙이는 fetch 래퍼

## 5단계: 기록 기능

- [ ] 탭 즉시 기록 + 토스트(되돌리기/수정)
- [ ] 길게 누르기 시트(± · 메모)
- [ ] 날짜별 목록 · 날짜 이동
- [ ] 행동 기본시간

## 6단계: 우주 디자인

- [ ] 시안
- [ ] 행성 돌아보기
- [ ] 별 애니메이션

## 7단계: 배포 · 출시

- [ ] Vercel 배포
- [ ] EAS 빌드
- [ ] 개인정보처리방침
- [ ] 계정 삭제
- [ ] 비공개 테스트
- [ ] 출시

## 미정

- [ ] ± 단위
- [ ] 기록 시각 필드
- [ ] 레포 구조
- [ ] User id를 Supabase id로 쓸지
- [ ] 신규 유저 기본 카테고리
