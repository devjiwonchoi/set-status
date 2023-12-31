import type { IncomingMessage } from 'http'
import type { Request } from 'express'
import { createGunzip, createGzip } from 'zlib'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { TARGET_META_NAME, TARGET_URL, IGNORE_PATH_REGEX } from './constants'

const isIgnorePath = (requestPath: string) =>
  new RegExp(IGNORE_PATH_REGEX).test(requestPath)

function isPossiblyTargetPath(proxyRes: IncomingMessage, req: Request) {
  const { path, method } = req
  const { headers } = proxyRes

  if (isIgnorePath(path)) return false

  return Boolean(
    method === 'GET' &&
      headers['content-type']?.includes('text/html') &&
      headers['content-encoding']?.includes('gzip')
  )
}

function getStatusFromBody(body: string) {
  const metaTagPattern = new RegExp(
    `<meta\\s+name="${TARGET_META_NAME}"\\s+content="(.*?)"`,
    'i'
  )
  const match = body.match(metaTagPattern)
  return match?.[1]
}

const proxyMiddleware = createProxyMiddleware({
  target: TARGET_URL,
  selfHandleResponse: true,
  onProxyRes: (proxyRes, req, res) => {
    Object.keys(proxyRes.headers).forEach((key) => {
      const headerValue = proxyRes.headers[key]
      if (headerValue) {
        res.setHeader(key, headerValue)
      }
    })

    if (proxyRes.statusCode) {
      res.status(proxyRes.statusCode)
    }

    if (isPossiblyTargetPath(proxyRes, req)) {
      let statusIsSet: boolean = false

      const gunzip = createGunzip()
      const gzip = createGzip()

      proxyRes.pipe(gunzip)
      gzip.pipe(res)

      let body: Buffer[] = []

      gunzip.on('data', (data: Buffer) => {
        body.push(data)

        if (!statusIsSet) {
          const statusCode = getStatusFromBody(body.toString())
          if (statusCode) {
            res.status(parseInt(statusCode))
            statusIsSet = true
          }
        }

        gzip.write(Buffer.concat(body))
        body = []
      })

      gunzip.on('end', () => {
        if (body.length > 0) {
          gzip.write(Buffer.concat(body))
        }
        gzip.end()
      })

      gunzip.on('error', (err) => {
        console.log('unzip error')
        gzip.emit('error', err)
      })
    } else {
      proxyRes.pipe(res)
    }
  },
})

export default proxyMiddleware
