type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: any
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private log(level: LogLevel, message: string, context?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    }

    this.logs.push(entry)
    
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console[level](message, context || '')
    }

    // In production, you might want to send to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement production logging service
    }
  }

  info(message: string, context?: any) {
    this.log('info', message, context)
  }

  warn(message: string, context?: any) {
    this.log('warn', message, context)
  }

  error(message: string, context?: any) {
    this.log('error', message, context)
  }
}

export const logger = Logger.getInstance() 