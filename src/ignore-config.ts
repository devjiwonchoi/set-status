import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import rootDir from 'grdp'

const ignoreFilePath = join(rootDir(), '.proxystatusignore')
let ignorePatterns: string[] = []

try {
  if (existsSync(ignoreFilePath)) {
    const fileContent = readFileSync(ignoreFilePath, 'utf8')
    ignorePatterns = fileContent.split('\n').filter(Boolean)
  } else {
    console.warn(
      `Warning: Ignore file '${ignoreFilePath}' not found. No paths will be ignored.`
    )
  }
} catch (err) {
  console.error(`Error reading '${ignoreFilePath}':`, err)
}

export function shouldIgnorePath(requestPath: string): boolean {
  return ignorePatterns.some((pattern) => new RegExp(pattern).test(requestPath))
}
