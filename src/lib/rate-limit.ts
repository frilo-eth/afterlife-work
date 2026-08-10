const loginAttempts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(ip: string, isLoginAttempt = false): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = process.env.NODE_ENV === 'development' ? 20 : 5

  // Only track actual login attempts
  if (!isLoginAttempt) {
    return true
  }

  const attempt = loginAttempts.get(ip) || { count: 0, resetTime: now + windowMs }

  // Reset if time window expired
  if (now > attempt.resetTime) {
    attempt.count = 1
    attempt.resetTime = now + windowMs
    loginAttempts.set(ip, attempt)
    return true
  }

  // Check if over limit
  if (attempt.count >= maxAttempts) {
    console.log(`Rate limit exceeded for IP: ${ip}. Attempts: ${attempt.count}`)
    return false
  }

  // Increment attempts
  attempt.count++
  loginAttempts.set(ip, attempt)

  // Log remaining attempts
  console.log(`Login attempt ${attempt.count}/${maxAttempts} for IP: ${ip}`)
  return true
}

// Add a function to reset rate limit for testing
export function resetRateLimit(ip: string) {
  loginAttempts.delete(ip)
}
