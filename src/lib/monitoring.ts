type LogDetails = {
  message?: string
  code?: string
  metadata?: Record<string, string | number | boolean>
}

export function logServiceError(service: string, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const timestamp = new Date().toISOString()
  
  console.error(`[${timestamp}] ${service} Error:`, {
    service,
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined
  })
}

export function logServiceSuccess(service: string, details?: LogDetails) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${service} Success:`, details)
} 