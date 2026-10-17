// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages: https://muy-bien-hwa.github.io/<레포 이름>/
// 배포 워크플로가 BASE_PATH를 레포 이름에 맞춰 넣어준다. 로컬에선 /programmers.
const base = process.env.BASE_PATH !== undefined ? (process.env.BASE_PATH || '/') : '/programmers';

export default defineConfig({
  site: process.env.SITE_URL || 'https://muy-bien-hwa.github.io',
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { syntaxHighlight: false },
});
