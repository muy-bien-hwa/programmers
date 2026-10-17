export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/** 한국식 큰 수 표기: 9조, 6,460만 */
export function koNum(v: number): string {
  if (v >= 1e12) return (v / 1e12).toFixed(v >= 1e13 ? 0 : 1).replace(/\.0$/, '') + '조';
  if (v >= 1e8) return (v / 1e8).toFixed(v >= 1e9 ? 0 : 1).replace(/\.0$/, '') + '억';
  if (v >= 1e4) return Math.round(v / 1e4).toLocaleString('ko-KR') + '만';
  return Math.round(v).toLocaleString('ko-KR');
}

/** 페이지 이동(View Transitions) 때마다 다시 붙이고, 떠날 때 정리한다. */
export function onPage(init: () => (() => void) | void) {
  let cleanup: (() => void) | void;
  document.addEventListener('astro:page-load', () => { cleanup?.(); cleanup = init(); });
  document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = undefined; });
}

/** 테마가 바뀌면 콜백 (토글, OS 설정 모두) */
export function onTheme(cb: () => void): () => void {
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', cb);
  window.addEventListener('themechange', cb);
  return () => { mq.removeEventListener('change', cb); window.removeEventListener('themechange', cb); };
}

export const TIER_VAR: Record<string, string> = { lin: '--c-lin', nlog: '--c-nlog', sq: '--c-sq', unknown: '--c-unknown' };
export const TIER_FN: Record<string, (n: number) => number> = {
  sq: (n) => n * n,
  nlog: (n) => n * Math.log2(n + 1),
  lin: (n) => n,
  unknown: (n) => n * Math.log2(n + 1),
};
