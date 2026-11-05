#!/bin/bash
# API 회귀 테스트 (docs/api-spec.md 기준)
# 사용: dev 서버를 띄운 뒤 `bash scripts/api-regress.sh` (다른 주소면 `API_BASE=http://... bash scripts/api-regress.sh`)
# 토큰 검증 적용 후에는 `API_TOKEN=<Supabase access token>`을 함께 지정한다
# 테스트 데이터는 zzr 접두사로 만들고 마지막에 삭제한다. 실패가 있으면 종료 코드 1
B=${API_BASE:-http://localhost:3000/api}
J='Content-Type: application/json'
O=$(mktemp)
AUTH=(); [ -n "$API_TOKEN" ] && AUTH=(-H "Authorization: Bearer $API_TOKEN")
pass=0; fail=0
id(){ grep -o '"id":"[^"]*"' $O | head -1 | cut -d'"' -f4; }
# t <기대코드> <설명> curl인자...
t(){ local want=$1 desc=$2; shift 2; local got; got=$(curl -s -o $O -w "%{http_code}" -H "$J" "${AUTH[@]}" "$@")
  if [ "$got" = "$want" ]; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL [$desc] want $want got $got: $(head -c 200 $O)"; fi; }
has(){ if grep -q "$1" $O; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL [$2] 응답에 $1 없음: $(head -c 200 $O)"; fi; }

# 카테고리
t 201 "카테고리 생성" -X POST $B/categories -d '{"name":"  zzrA  "}'; cA=$(id); has '"name":"zzrA"' "이름 trim"
t 201 "카테고리 생성 B" -X POST $B/categories -d '{"name":"zzrB"}'; cB=$(id)
t 400 "이름 빈 값" -X POST $B/categories -d '{"name":"   "}'
t 400 "이름 16자" -X POST $B/categories -d '{"name":"zzr4567890123456"}'
t 400 "이름 타입" -X POST $B/categories -d '{"name":5}'
t 409 "이름 중복(대소문자)" -X POST $B/categories -d '{"name":"ZZRA"}'
t 200 "카테고리 이름 변경" -X PATCH $B/categories/$cB -d '{"name":"zzrB2"}'
t 200 "같은 이름 다시 보내기" -X PATCH $B/categories/$cB -d '{"name":"zzrB2","isHidden":false}'
t 200 "대소문자만 변경" -X PATCH $B/categories/$cB -d '{"name":"ZZRB2"}'; has '"name":"ZZRB2"' "대소문자 반영"
t 400 "icon 타입" -X POST $B/categories -d '{"name":"zzrI","icon":5}'
t 400 "icon 101자" -X POST $B/categories -d "{\"name\":\"zzrI\",\"icon\":\"$(printf 'i%.0s' $(seq 101))\"}"
t 404 "UUID 아닌 카테고리 수정" -X PATCH $B/categories/abc -d '{"name":"x"}'
t 404 "UUID 아닌 카테고리 삭제" -X DELETE $B/categories/abc
t 404 "UUID 아닌 카테고리에 행동" -X POST $B/categories/abc/actions -d '{"name":"x"}'
t 400 "변경 이름 빈 값" -X PATCH $B/categories/$cB -d '{"name":""}'
t 409 "변경 이름 중복" -X PATCH $B/categories/$cB -d '{"name":"zzrA"}'
t 400 "isHidden 타입" -X PATCH $B/categories/$cB -d '{"isHidden":"y"}'
t 404 "없는 카테고리 수정" -X PATCH $B/categories/00000000-0000-4000-8000-000000000000 -d '{"name":"x"}'

# 행동
t 201 "행동 생성" -X POST $B/categories/$cA/actions -d '{"name":"zzr-a","defaultDurationMinutes":30,"durationStepMinutes":10}'; a=$(id)
has '"sortOrder":1' "첫 행동 순서 1"; has '"defaultDurationMinutes":30' "기본 시간"; has '"durationStepMinutes":10' "± 단위"
t 201 "행동 생성 0분" -X POST $B/categories/$cA/actions -d '{"name":"zzr-b","defaultDurationMinutes":0}'; has '"defaultDurationMinutes":null' "0분은 null"
t 400 "기본 시간 1440" -X POST $B/categories/$cA/actions -d '{"name":"zzr-c","defaultDurationMinutes":1440}'
t 400 "기본 시간 소수" -X POST $B/categories/$cA/actions -d '{"name":"zzr-c","defaultDurationMinutes":1.5}'
t 400 "기본 시간 문자열" -X POST $B/categories/$cA/actions -d '{"name":"zzr-c","defaultDurationMinutes":"5"}'
t 400 "± 단위 7" -X POST $B/categories/$cA/actions -d '{"name":"zzr-c","durationStepMinutes":7}'
t 400 "행동 이름 타입" -X POST $B/categories/$cA/actions -d '{}'
t 409 "행동 이름 중복" -X POST $B/categories/$cA/actions -d '{"name":"ZZR-A"}'
t 404 "없는 카테고리에 행동" -X POST $B/categories/00000000-0000-4000-8000-000000000000/actions -d '{"name":"x"}'
t 200 "행동 이름 변경" -X PATCH $B/actions/$a -d '{"name":"zzr-a2"}'
t 200 "행동 같은 이름 + 다른 필드" -X PATCH $B/actions/$a -d '{"name":"zzr-a2","durationStepMinutes":15}'; has '"durationStepMinutes":15' "다른 필드 반영"
t 404 "UUID 아닌 행동 수정" -X PATCH $B/actions/abc -d '{"name":"x"}'
t 404 "UUID 아닌 행동 삭제" -X DELETE $B/actions/abc
t 404 "UUID 아닌 카테고리로 이동" -X PATCH $B/actions/$a -d '{"categoryId":"abc"}'
t 400 "행동 이름 16자" -X PATCH $B/actions/$a -d '{"name":"zzr4567890123456"}'
t 200 "기본 시간 0으로" -X PATCH $B/actions/$a -d '{"defaultDurationMinutes":0}'; has '"defaultDurationMinutes":null' "수정 0분은 null"
t 400 "수정 기본 시간 -1" -X PATCH $B/actions/$a -d '{"defaultDurationMinutes":-1}'
t 400 "수정 ± 단위 2" -X PATCH $B/actions/$a -d '{"durationStepMinutes":2}'
t 200 "행동 이동" -X PATCH $B/actions/$a -d "{\"categoryId\":\"$cB\"}"; has "\"categoryId\":\"$cB\"" "이동 반영"
t 200 "되돌려 이동" -X PATCH $B/actions/$a -d "{\"categoryId\":\"$cA\"}"; has '"sortOrder":3' "맨 뒤(3, zzr-b 다음)"

# 기록
t 400 "조회 date 없음" "$B/records"
t 400 "조회 date 형식" "$B/records?date=2026-1-1"
t 400 "조회 없는 날짜" "$B/records?date=2026-02-31"
t 200 "조회" "$B/records?date=2026-11-04"
t 201 "기록 생성" -X POST $B/records -d "{\"actionId\":\"$a\",\"recordDate\":\"2026-11-04\",\"durationMinutes\":45,\"memo\":\"  hi  \"}"; r=$(id); has '"memo":"hi"' "메모 trim"
t 201 "기록 0분" -X POST $B/records -d "{\"actionId\":\"$a\",\"recordDate\":\"2026-11-03\",\"durationMinutes\":0}"; r2=$(id); has '"durationMinutes":null' "0분 기록은 null"
t 400 "기록 1440분" -X POST $B/records -d "{\"actionId\":\"$a\",\"recordDate\":\"2026-11-04\",\"durationMinutes\":1440}"
t 400 "기록 시간 문자열" -X POST $B/records -d "{\"actionId\":\"$a\",\"recordDate\":\"2026-11-04\",\"durationMinutes\":\"5\"}"
t 400 "기록 미래" -X POST $B/records -d "{\"actionId\":\"$a\",\"recordDate\":\"2030-01-01\"}"
t 400 "기록 없는 날짜" -X POST $B/records -d "{\"actionId\":\"$a\",\"recordDate\":\"2026-02-30\"}"
t 400 "기록 날짜 없음" -X POST $B/records -d "{\"actionId\":\"$a\"}"
t 400 "메모 501자" -X POST $B/records -d "{\"actionId\":\"$a\",\"recordDate\":\"2026-11-04\",\"memo\":\"$(printf 'x%.0s' $(seq 501))\"}"
t 400 "actionId 타입" -X POST $B/records -d '{"actionId":1,"recordDate":"2026-11-04"}'
t 404 "없는 행동" -X POST $B/records -d '{"actionId":"00000000-0000-4000-8000-000000000000","recordDate":"2026-11-04"}'
t 404 "UUID 아닌 actionId" -X POST $B/records -d '{"actionId":"abc","recordDate":"2026-11-04"}'
t 200 "기록 수정" -X PATCH $B/records/$r -d '{"recordDate":"2026-11-02","durationMinutes":null,"memo":""}'; has '"durationMinutes":null' "시간 null"; has '"memo":null' "빈 메모 null"
t 400 "수정 미래" -X PATCH $B/records/$r -d '{"recordDate":"2030-01-01"}'
t 400 "수정 없는 날짜" -X PATCH $B/records/$r -d '{"recordDate":"2026-13-01"}'
t 400 "수정 시간 1440" -X PATCH $B/records/$r -d '{"durationMinutes":1440}'
t 404 "없는 기록 수정" -X PATCH $B/records/00000000-0000-4000-8000-000000000000 -d '{"memo":"x"}'
t 200 "기록 날짜 조회" "$B/records/dates?from=2026-11-01&to=2026-11-04"; has '"2026-11-02","2026-11-03"' "날짜 목록"
t 400 "날짜 조회 형식" "$B/records/dates?from=2026-11-01&to=2026-11-31"
t 400 "날짜 조회 13월" "$B/records/dates?from=2026-13-01&to=2026-13-02"
t 400 "조회 13월" "$B/records?date=2026-13-01"
t 400 "기록 13월" -X POST $B/records -d "{\"actionId\":\"$a\",\"recordDate\":\"2026-13-01\"}"

# 숨김·설정·삭제
t 200 "행동 숨김" -X PATCH $B/actions/$a -d '{"isHidden":true}'
t 404 "숨긴 행동 기록" -X POST $B/records -d "{\"actionId\":\"$a\",\"recordDate\":\"2026-11-04\"}"
t 200 "숨긴 항목" "$B/hidden"; has 'zzr-a2' "숨긴 행동 목록"
t 200 "설정 조회" "$B/me/settings"
t 400 "설정 허용값" -X PATCH $B/me/settings -d '{"recordSortOrder":"x"}'
t 400 "설정 빈 요청" -X PATCH $B/me/settings -d '{}'
t 400 "시간대 허용값" -X PATCH $B/me/settings -d '{"timezone":"Mars/Base"}'
t 409 "기록 있는 행동 삭제" -X DELETE $B/actions/$a
t 409 "기록 있는 카테고리 삭제" -X DELETE $B/categories/$cA
t 200 "기록 삭제" -X DELETE $B/records/$r
t 200 "기록 삭제2" -X DELETE $B/records/$r2
t 404 "없는 기록 삭제" -X DELETE $B/records/$r
t 404 "UUID 아닌 기록 수정" -X PATCH $B/records/abc -d '{"memo":"x"}'
t 404 "UUID 아닌 기록 삭제" -X DELETE $B/records/abc
AUTH_SAVED=("${AUTH[@]}"); AUTH=(); t 401 "init 토큰 없음" -X POST $B/me/init; AUTH=("${AUTH_SAVED[@]}")
t 200 "카테고리 A 삭제" -X DELETE $B/categories/$cA
t 200 "카테고리 B 삭제" -X DELETE $B/categories/$cB

rm -f $O
echo "통과 $pass / 실패 $fail"
[ $fail -eq 0 ]
