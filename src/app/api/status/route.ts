import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET() {
  const status = {
    database: await checkDatabase(),
    stripe: await checkStripe(),
    email: await checkEmail(),
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(status)
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return 'healthy'
  } catch {
    return 'error'
  }
}

async function checkStripe() {
  try {
    await stripe.products.list({ limit: 1 })
    return 'healthy'
  } catch {
    return 'error'
  }
}

async function checkEmail() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.get('test')
    return 'healthy'
  } catch {
    return 'error'
  }
}
