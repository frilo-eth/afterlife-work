import { jwtVerify, SignJWT } from 'jose'

// Resolved lazily so a missing secret surfaces as a runtime error on the
// request that needs it, rather than crashing the build when env vars are
// not yet injected. There is deliberately no fallback value: an unset
// JWT_SECRET must fail closed, never silently sign with a known key.
const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not set. Refusing to issue or verify sessions.')
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters.')
  }

  return new TextEncoder().encode(secret)
}

// Hash password using Web Crypto API (edge-runtime safe).
// NOTE: SHA-256 is a fast hash and is not an appropriate password KDF.
// This preserves the existing ADMIN_PASSWORD digest format so logins keep
// working; migrating to bcrypt/Argon2 is tracked as the next hardening step.
const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Length-independent, constant-time string comparison.
const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false

  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

// Verify password
export const verifyPassword = async (password: string): Promise<boolean> => {
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not set. Refusing to authenticate.')
  }

  const hashedPassword = await hashPassword(password)
  return timingSafeEqual(hashedPassword, expected)
}

// Generate session token
export const generateSession = async (userId: string): Promise<string> => {
  const token = await new SignJWT({
    role: 'admin',
    userId,
    sessionCreated: Date.now(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(getJwtSecret())

  return token
}

// Verify session token. Checks the signature *and* that the token actually
// carries the admin role — a validly signed token is not by itself proof of
// authorization.
export const verifySession = async (token: string): Promise<boolean> => {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    })
    return payload.role === 'admin'
  } catch {
    return false
  }
}
