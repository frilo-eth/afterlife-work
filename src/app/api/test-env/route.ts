export async function GET() {
  return Response.json({
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    keyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
    publicUrl: process.env.NEXT_PUBLIC_URL,
    nodeEnv: process.env.NODE_ENV
  })
} 