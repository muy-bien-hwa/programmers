export const SITE = {
  name: 'Solve Trace',
  author: 'muy-bien-hwa',
  school: '서울과학기술대학교',
  github: 'https://github.com/muy-bien-hwa',
  githubId: 'muy-bien-hwa',
  email: 'gomgom3008@gmail.com',
  description: 'muy-bien-hwa의 프로그래머스 풀이 기록. 풀이가 어떻게 빨라졌는지 단계별로 보여준다.',
};

/** base 경로를 붙인 내부 링크 */
export function url(p = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = p.replace(/^\//, '');
  return `${base}/${clean}`.replace(/\/?$/, '/').replace(/\/\/+/g, '/');
}
