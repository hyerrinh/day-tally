# API 명세서

> 기능명세서 12장 "기능별 API 연결 초안"을 확정한 문서다. 현재 구현 기준 (2026.11.04)
> 기능 기준: `docs/feature-spec.md` · DB 기준: `docs/db-design.md` · 결정 기록: `docs/decisions.md`

---

# 1. 공통

## 1-1. 인증

- 앱은 `Authorization: Bearer <Supabase access token>` 헤더를 보낸다.
- 서버는 Supabase 공개키(JWKS)로 토큰을 검증하고 `sub`를 사용자 id로 쓴다. (결정 13)
- 인증 실패는 `401`.

> 현재 상태: `POST /api/me/init`만 토큰을 검증한다. 나머지 API는 테스트 사용자 id를 사용하며, ROADMAP 4단계에서 토큰 검증으로 바꾼다.

## 1-2. 형식

| 항목 | 규칙 |
| --- | --- |
| 요청·응답 | JSON |
| 날짜 | `YYYY-MM-DD` 문자열. 실제로 존재하는 날짜만 허용 |
| 시각 (`createdAt`, `updatedAt`) | ISO 8601 UTC 문자열 |
| 오류 응답 | `{ "message": string }` |
| 생략한 필드 | 수정 API에서 보내지 않은 필드는 바꾸지 않는다 |

## 1-3. 공통 검증

| 항목 | 규칙 |
| --- | --- |
| 이름 (카테고리·행동) | 문자열, 앞뒤 공백 제거 후 1~15자. 대소문자 무시 중복 판단 |
| 시간 (`durationMinutes`, `defaultDurationMinutes`) | 정수 0~1439. `0`과 `null`은 "시간 없음"으로 `null` 저장 (COMMON-006) |
| ± 단위 (`durationStepMinutes`) | 1, 5, 10, 15, 30, 60 중 하나 |
| 메모 | 문자열, 앞뒤 공백 제거 후 최대 500자. 빈 문자열은 `null` |
| 미래 날짜 | 설정에 저장된 사용자 시간대의 오늘보다 뒤면 거부. 시간대가 없으면 UTC+14 기준 (결정 11, 22) |

## 1-4. 상태 코드

| 코드 | 의미 |
| --- | --- |
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 입력값 오류, 규칙 위반 |
| 401 | 인증 실패 |
| 404 | 대상 없음 (다른 사용자의 데이터 포함) |
| 409 | 이름 중복, 기록이 있어 삭제 불가 |
| 500 | 서버 오류 |

---

# 2. 사용자

## POST /api/me/init

로그인 직후 호출한다. 신규 사용자면 기본 데이터를 만든다. (AUTH-002, 결정 14)

- 요청 본문: 없음
- 응답: `{ "created": boolean }`
  - `201` 신규 생성 (사용자, 설정, 카테고리 3개, 행동 6개)
  - `200` 이미 있음 (아무것도 바꾸지 않음)
- 오류: `401`

## GET /api/me/settings

사용자 설정을 조회한다. (SET-001)

- 응답 `200`: UserSetting
  - 설정이 없으면 `{ recordSortOrder: "NEWEST_FIRST", lastSelectedCategoryId: null, timezone: null }`

## PATCH /api/me/settings

기록 정렬이나 시간대를 바꾼다. 설정이 없으면 만든다. (SET-001, 결정 22)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `recordSortOrder` | `"NEWEST_FIRST"` \| `"OLDEST_FIRST"` | X | 기록 정렬 |
| `timezone` | string | X | 기기 IANA 시간대 (예: `Asia/Seoul`). 앱 실행 시 보낸다. 미래 날짜 판단에 사용 |

- 둘 중 하나는 있어야 한다.
- 응답 `200`: UserSetting
- 오류: `400` 변경할 값 없음·허용값 아님

---

# 3. 카테고리

## GET /api/categories

활성 카테고리와 각 카테고리의 활성 행동을 조회한다. (HOME-002)

- 응답 `200`: `Category & { actions: Action[] }` 배열
- 정렬: 카테고리·행동 모두 `sortOrder` 오름차순, 같으면 `createdAt` 오름차순

## POST /api/categories

카테고리를 만든다. (CAT-001)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `name` | string | O | 이름 규칙 (1-3) |
| `icon` | string | X | 기본 `"default"`. 형식 미정 (아이콘 저장 방식 결정 전) |

- 응답 `201`: `Category & { actions: [] }`
- `sortOrder`: 사용자 최댓값 + 100 (최초 100)
- 오류: `400` 이름 규칙, `409` 이름 중복 (숨긴 카테고리 포함)

## PATCH /api/categories/{id}

카테고리 이름 변경, 숨김, 다시 보이기. (CAT-002, CAT-003, CAT-004)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `name` | string | X | 이름 규칙. 이전과 같은 이름이면 400 |
| `isHidden` | boolean | X | 숨김 여부 |

- 응답 `200`: Category
- 오류: `400` 이름 규칙·같은 이름·마지막 활성 카테고리 숨김, `404`, `409` 이름 중복

## DELETE /api/categories/{id}

하위 행동 모두 기록이 없을 때만 카테고리와 하위 행동을 함께 삭제한다. (CAT-005, 결정 18)

- 응답 `200`: 삭제한 Category
- 오류: `400` 마지막 활성 카테고리, `404`, `409` 기록 있음 (숨김 사용)

---

# 4. 행동

## POST /api/categories/{id}/actions

카테고리에 행동을 만든다. (ACT-001, ACT-002)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `name` | string | O | 이름 규칙. 카테고리 안에서 중복 불가 |
| `defaultDurationMinutes` | integer \| null | X | 기본 시간. 0·null은 시간 없음 |
| `durationStepMinutes` | integer | X | ± 단위. 기본 5 |

- 응답 `201`: Action
- `sortOrder`: 카테고리 안 최댓값 + 1 (최초 1)
- 오류: `400` 입력값, `404` 카테고리 없음, `409` 이름 중복 (숨긴 행동 포함)

## PATCH /api/actions/{id}

행동 수정, 숨김, 다시 보이기, 카테고리 이동. (ACT-003 ~ ACT-006)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `name` | string | X | 이름 규칙. 이전과 같은 이름이면 400 |
| `isHidden` | boolean | X | 숨김 여부 |
| `defaultDurationMinutes` | integer \| null | X | 기본 시간. 과거 기록에는 영향 없음 |
| `durationStepMinutes` | integer | X | ± 단위 |
| `categoryId` | string | X | 이동할 카테고리. 이동하면 대상 카테고리 맨 뒤 (결정 20) |

- 응답 `200`: Action
- 오류: `400` 입력값·숨긴 카테고리로 이동, `404` 행동 또는 이동할 카테고리 없음, `409` 이름 중복 (이동할 카테고리 기준)

## DELETE /api/actions/{id}

기록이 없는 행동만 삭제한다. (ACT-008, 결정 18)

- 응답 `200`: 삭제한 Action
- 오류: `404`, `409` 기록 있음 (숨김 사용)

---

# 5. 숨긴 항목

## GET /api/hidden

숨긴 카테고리와 숨긴 행동을 함께 조회한다. (HIDDEN-001, HIDDEN-002, 결정 21)

- 응답 `200`:

```json
{
  "categories": [{ "...Category": "", "_count": { "actions": 2 } }],
  "actions": [{ "...Action": "", "category": { "...Category": "" } }]
}
```

- `categories`: 숨긴 카테고리, `sortOrder`·`createdAt` 오름차순, 포함된 행동 개수
- `actions`: 숨긴 행동 (소속 카테고리가 숨겨져 있어도 포함), `createdAt` 오름차순
- 다시 보이기는 각 PATCH에 `{ "isHidden": false }`

---

# 6. 기록

## GET /api/records?date={YYYY-MM-DD}

날짜의 기록을 행동별로 묶어 조회한다. (HOME-006, REC-003)

- 응답 `200`: `{ [actionId]: (Record & { action: Action & { category: Category } })[] }`
- 정렬: 사용자 설정 `recordSortOrder` 기준 `createdAt` (기본 최근 먼저)
- 숨긴 행동·카테고리의 과거 기록도 포함
- 오류: `400` date 누락·형식

## POST /api/records

기록을 만든다. (REC-001)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `actionId` | string | O | 숨기지 않은 행동, 숨기지 않은 카테고리 |
| `recordDate` | string | O | 날짜. 미래 불가 |
| `durationMinutes` | integer | X | 0~1439. 0은 시간 없음 |
| `memo` | string | X | 최대 500자 |

- 응답 `201`: Record
- 오류: `400` 입력값·미래 날짜, `404` 행동 없음 또는 숨긴 행동·카테고리

## PATCH /api/records/{id}

기록을 수정한다. 행동은 바꿀 수 없다. (REC-004)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `recordDate` | string | X | 날짜. 미래 불가 |
| `durationMinutes` | integer \| null | X | 0·null은 시간 없음 |
| `memo` | string \| null | X | 빈 문자열·null은 메모 없음 |

- 응답 `200`: Record
- 숨긴 행동의 기록도 수정할 수 있다.
- 오류: `400` 입력값·미래 날짜, `404`

## DELETE /api/records/{id}

기록 한 건을 영구 삭제한다. 토스트 `되돌리기`도 이 API를 쓴다. (REC-006)

- 응답 `200`: 삭제한 Record
- 오류: `404`

## GET /api/records/dates?from={YYYY-MM-DD}&to={YYYY-MM-DD}

기간 안에서 기록이 있는 날짜 목록을 조회한다. 캘린더와 주간 화면의 점 표시에 쓴다. (CAL-001, 결정 21)

- 기간: `from` ≤ `to`, 최대 42일 (캘린더 6주)
- 응답 `200`: `["2026-11-02", "2026-11-03"]` (중복 없이 날짜 오름차순)
- 숨긴 행동·카테고리의 기록도 포함
- 오류: `400` 누락·형식·기간
