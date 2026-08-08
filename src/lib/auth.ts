import { SignJWT, jwtVerify } from 'jose'

// Environment variables for security
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-change-me')

// Hash password using Web Crypto API (same algorithm as Node's crypto sha256)
const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Verify password
export const verifyPassword = async (password: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === ADMIN_PASSWORD
}

// Generate session token
export const generateSession = async (userId: string): Promise<string> => {
  const token = await new SignJWT({ 
    role: 'admin',
    userId,
    sessionCreated: Date.now()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(JWT_SECRET)
  
  return token
}

// Verify session token
export const verifySession = async (token: string): Promise<boolean> => {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}