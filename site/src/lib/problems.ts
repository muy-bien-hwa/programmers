/**
 * programmers 폴더(사이트의 상위 폴더)를 읽어 문제 데이터로 바꾼다.
 *
 * 폴더 규칙
 *   <문제 제목>/README.md        문제 설명 + "---" + "## Solution N" 회고
 *   <문제 제목>/solution_N.py    N번째 풀이
 *
 * README 맨 위 YAML 머리말(frontmatter)은 선택이다. 없으면 폴더 이름과 Git 날짜로 채운다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { marked } from 'marked';
import { diffArrays } from 'diff';

export type Tier = 'lin' | 'nlog' | 'sq' | 'unknown';

export interface Solution {
  index: number;            // 1, 2, 3 ...
  file: string;             // solution_1.py
  code: string;
  complexity: string | null;
  tier: Tier;
  result: string | null;    // "통과", "시간 초과" 등. 머리말에 적은 것만.
  noteHtml: string;         // README의 "## Solution N" 섹션
  issueHtml: string;        // 그 안의 "### 문제점" 부분 (있으면)
  changedLines: number[];   // 이전 풀이 대비 새로 생긴 줄 (1부터)
  date: string | null;      // ISO 날짜
}

export interface Example { args: string[]; expected: string; }

export interface Problem {
  slug: string;
  folder: string;
  title: string;
  level: number | null;
  link: string | null;
  tags: string[];
  summaryHtml: string;
  summaryText: string;
  solved: string | null;
  solutions: Solution[];
  examples: Example[];
  final: Solution | null;
  /** 큰 입력 벤치마크용 Python 식. n을 쓸 수 있다. 예: (rand_digits(n), rand_digits(n)) */
  bench: string | null;
  benchSizes: number[];
}

const CONTENT_DIR = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.resolve(process.cwd(), '..');

const SKIP = new Set(['site', 'node_modules', 'dist']);

export function tierOf(c: string | null | undefined): Tier {
  if (!c) return 'unknown';
  const s = c.replace(/\s+/g, '').toLowerCase();
  if (/[²³]|\^[2-9]|n·m|n\*m|nm\)|2\^n|n!/.test(s)) return 'sq';
  if (/nlog|mlog/.test(s)) return 'nlog';
  return 'lin';
}

export const tierLabel: Record<Tier, string> = {
  lin: 'O(n) 이하',
  nlog: 'O(n log n)',
  sq: 'O(n²) 이상',
  unknown: '미기재',
};

function gitDate(file: string): string | null {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      cwd: path.dirname(file), stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
    return out ? out.slice(0, 10) : null;
  } catch {
    return null;
  }
}

function fileDate(file: string): string | null {
  const g = gitDate(file);
  if (g) return g;
  try {
    return fs.statSync(file).mtime.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function toISO(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

function slugify(folder: string, link: string | null): string {
  const m = link?.match(/lessons\/(\d+)/);
  if (m) return m[1];
  return folder.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '');
}

/** README 본문을 "문제 원문"과 "## Solution N" 섹션들로 나눈다. */
function splitReadme(body: string) {
  const lines = body.split(/\r?\n/);
  const sections = new Map<number, string>();
  let problem: string[] = [];
  let cur: number | null = null;
  let buf: string[] = [];
  const flush = () => { if (cur !== null) sections.set(cur, buf.join('\n').trim()); };
  for (const line of lines) {
    const h = line.match(/^##\s+Solution\s*(\d+)/i);
    if (h) { flush(); cur = Number(h[1]); buf = []; continue; }
    if (cur === null) problem.push(line); else buf.push(line);
  }
  flush();
  // 원문 끝의 구분선(---) 제거
  const problemText = problem.join('\n').replace(/\n-{3,}\s*$/m, '').trim();
  return { problemText, sections };
}

/** 원문의 "입출력 예" 표에서 실행용 예제를 뽑는다. 화면에는 값만 표로 보여준다. */
function parseExamples(problemText: string): Example[] {
  const at = problemText.search(/^##\s*입출력\s*예\s*$/m);
  if (at < 0) return [];
  // 제목 아래 첫 번째 표만 읽는다 (뒤쪽 "입출력 예 설명"의 표는 무시)
  const after = problemText.slice(at).split(/\r?\n/);
  const startIdx = after.findIndex((l) => l.trim().startsWith('|'));
  if (startIdx < 0) return [];
  const rows: string[] = [];
  for (const l of after.slice(startIdx)) { if (!l.trim().startsWith('|')) break; rows.push(l); }
  if (rows.length < 3) return [];
  const cells = (r: string) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/^`|`$/g, ''));
  return rows.slice(2).map((r) => {
    const c = cells(r);
    return { args: c.slice(0, -1), expected: c[c.length - 1] };
  }).filter((e) => e.args.length > 0);
}

function splitIssue(md: string) {
  const i = md.search(/^###\s*문제점/m);
  if (i < 0) return { note: md, issue: '' };
  return { note: md.slice(0, i).trim(), issue: md.slice(i).replace(/^###\s*문제점\s*/m, '').trim() };
}

const md = (s: string) => (s ? (marked.parse(s, { async: false }) as string) : '');

function changed(prev: string | undefined, cur: string): number[] {
  if (prev === undefined) return [];
  const a = prev.split(/\r?\n/).map((l) => l.trim());
  const b = cur.split(/\r?\n/).map((l) => l.trim());
  const out: number[] = [];
  let line = 0;
  for (const part of diffArrays(a, b)) {
    if (part.removed) continue;
    for (const v of part.value) {
      line += 1;
      if (part.added && v !== '') out.push(line);
    }
  }
  return out;
}

let cache: Problem[] | null = null;

export function getProblems(): Problem[] {
  if (cache) return cache;
  const dirs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && !SKIP.has(d.name));

  const problems: Problem[] = [];
  for (const d of dirs) {
    const dir = path.join(CONTENT_DIR, d.name);
    const files = fs.readdirSync(dir);
    const solFiles = files
      .map((f) => ({ f, m: f.match(/^solution_(\d+)\.py$/i) }))
      .filter((x) => x.m)
      .sort((a, b) => Number(a.m![1]) - Number(b.m![1]));
    const readmePath = path.join(dir, 'README.md');
    // 풀이 파일이 하나도 없는 폴더는 아직 푸는 중으로 보고 사이트에 올리지 않는다
    if (!solFiles.length) continue;

    const raw = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : '';
    const { data, content } = matter(raw);
    const { problemText, sections } = splitReadme(content);
    const link: string | null = data.link ?? null;
    const meta = (data.solutions ?? {}) as Record<string, { complexity?: string; result?: string }>;

    const solutions: Solution[] = [];
    solFiles.forEach(({ f, m }, i) => {
      const index = Number(m![1]);
      const code = fs.readFileSync(path.join(dir, f), 'utf-8').replace(/\s+$/, '');
      const sm = meta[`solution_${index}`] ?? {};
      const { note, issue } = splitIssue(sections.get(index) ?? '');
      solutions.push({
        index,
        file: f,
        code,
        complexity: sm.complexity ?? null,
        tier: tierOf(sm.complexity),
        result: sm.result ?? null,
        noteHtml: md(note),
        issueHtml: md(issue),
        changedLines: changed(i > 0 ? solutions[i - 1].code : undefined, code),
        date: fileDate(path.join(dir, f)),
      });
    });

    const summary = typeof data.summary === 'string' ? data.summary.trim() : '';
    const dates = solutions.map((s) => s.date).filter(Boolean) as string[];
    problems.push({
      slug: slugify(d.name, link),
      folder: d.name,
      title: data.title ?? d.name,
      level: typeof data.level === 'number' ? data.level : null,
      link,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      summaryHtml: md(summary),
      summaryText: summary,
      solved: toISO(data.solved) ?? dates.sort().at(-1) ?? null,
      solutions,
      examples: parseExamples(problemText),
      final: solutions.at(-1) ?? null,
      bench: typeof data.bench === 'string' ? data.bench : null,
      benchSizes: Array.isArray(data.bench_sizes) ? data.bench_sizes.map(Number) : [1000, 10000, 100000],
    });
  }

  problems.sort((a, b) => (b.solved ?? '').localeCompare(a.solved ?? ''));
  cache = problems;
  return problems;
}

/** 잔디 히트맵용: 날짜별 풀이 파일 수 */
export function activity(problems: Problem[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const p of problems) {
    for (const s of p.solutions) {
      const d = s.date ?? p.solved;
      if (d) m.set(d, (m.get(d) ?? 0) + 1);
    }
  }
  return m;
}
