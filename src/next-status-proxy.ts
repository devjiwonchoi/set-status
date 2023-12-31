import type { IncomingMessage } from 'http'
import type { Request } from 'express'
import { createGunzip, createGzip } from 'zlib'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { shouldIgnorePath } from './ignore-config'
import { TARGET_META_NAME } from './constants'

function isIgnoredPath(proxyRes: IncomingMessage, req: Request) {
  const { path, method } = req
  const { headers } = proxyRes

  if (shouldIgnorePath(path)) {
    return false
  }

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
  target: process.env.TARGET_URL ?? 'http://localhost:3000',
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

    if (isIgnoredPath(proxyRes, req)) {
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
