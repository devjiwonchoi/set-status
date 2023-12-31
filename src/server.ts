import express from 'express'
import proxyMiddleware from './next-status-proxy'
import { PROXY_SERVER_PORT } from './constants'

const app = express()
app.use('*', proxyMiddleware)

const server = app.listen(parseInt(PROXY_SERVER_PORT), () => {
  console.log(`Server is running on port ${PROXY_SERVER_PORT}`)
})

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.')
  server.close(() => {
    console.log('HTTP server closed.')
    process.exit(0)
  })
})
