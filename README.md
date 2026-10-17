# 프로그래머스 풀이

프로그래머스 코딩 테스트 연습 풀이 모음이다. 문제마다 처음 풀이부터 개선한 풀이까지 단계별로 남긴다.

**사이트:** https://muy-bien-hwa.github.io/programmers/

## 폴더 구조

```
programmers/
├─ 숫자 짝꿍/
│  ├─ README.md       문제 요약(머리말) + Solution별 회고
│  ├─ solution_1.py
│  ├─ solution_2.py
│  └─ solution_3.py
├─ site/              풀이 사이트 (Astro)
└─ .github/workflows/ push하면 GitHub Pages로 자동 배포
```

## 새 문제 추가하기

1. 문제 제목으로 폴더를 만들고 `solution_1.py`, `solution_2.py` ... 를 넣는다.
2. `README.md`에 `## Solution 1`, `## Solution 2` ... 섹션으로 회고를 쓴다. `### 문제점`을 쓰면 따로 강조된다.
3. README 맨 위에 머리말을 붙이면 사이트에 레벨, 태그, 복잡도가 표시된다. 없어도 동작한다.

```yaml
---
title: 숫자 짝꿍
level: 1
link: https://school.programmers.co.kr/learn/courses/30/lessons/131128
solved: 2026-10-16
tags: [문자열, 정렬]
summary: |
  직접 쓴 문제 요약. 사이트에는 원문 대신 이 요약이 나간다.
bench: (rand_digits(n), rand_digits(n))   # 선택: 큰 입력 속도 비교용 인자
solutions:
  solution_1:
    complexity: O(n²)
  solution_2:
    complexity: O(n log n)
    result: 통과
---
```

`bench`에는 `n`과 `rand_digits(n)`, `rand_list(n)`, `rand_str(n)`을 쓸 수 있다.

## 사이트 로컬 실행

```bash
cd site
npm install
npm run dev      # http://localhost:4321/programmers/
```
