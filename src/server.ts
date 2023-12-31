import express from 'express'
import proxyMiddleware from './next-status-proxy'
import { PROXY_SERVER_PORT } from './constants'

const app = express()
app.use('*', proxyMiddleware)

export function runServer() {
  const server = app.listen(parseInt(PROXY_SERVER_PORT), () => {
    console.log(`Proxy server is running on port ${PROXY_SERVER_PORT}`)
  })
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down gracefully.')
    server.close(() => {
      console.log('HTTP server closed.')
      process.exit(0)
    })
  })
}
