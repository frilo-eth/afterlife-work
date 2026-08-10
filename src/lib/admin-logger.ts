import fs from 'node:fs/promises'
import path from 'node:path'

const LOG_FILE = path.join(process.cwd(), 'logs', 'admin-access.log')

export async function logAdminAccess(action: string, ip: string, success: boolean) {
  try {
    // Create logs directory if it doesn't exist
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true })

    const timestamp = new Date().toISOString()
    const logEntry = `${timestamp} | ${action} | ${ip} | ${success ? 'SUCCESS' : 'FAILED'}\n`

    await fs.appendFile(LOG_FILE, logEntry)
  } catch (error) {
    console.error('Logging failed:', error)
    // Don't throw - logging should not break the app
  }
}
