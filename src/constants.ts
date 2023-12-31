import 'dotenv/config'
export const TARGET_URL = process.env.TARGET_URL ?? 'http://localhost:3000'
export const TARGET_META_NAME = process.env.TARGET_META_NAME ?? 'set-status'
export const PROXY_SERVER_PORT = process.env.PROXY_SERVER_PORT ?? '3001'
export const IGNORE_PATH_REGEX =
  process.env.IGNORE_PATH_REGEX ??
  '^(/api/.*|/_next/.*|/sitemap.xml$|/robots.txt$|/favicon.ico$|/.*.svg$|/.*.png$)'