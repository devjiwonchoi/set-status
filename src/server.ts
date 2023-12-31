import express from 'express'
import dotenv from 'dotenv'
import proxyMiddleware from './next-status-proxy'

dotenv.config()

const app = express()

app.use('*', proxyMiddleware)

const port = process.env.PROXY_PORT ?? '3001'

const server = app.listen(parseInt(port), () => {
  console.log(`Server is running on port ${port}`)
})

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.')
  server.close(() => {
    console.log('HTTP server closed.')
    process.exit(0)
  })
})
