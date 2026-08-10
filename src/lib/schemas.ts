import { z } from 'zod'

export const LogoSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  images: z.array(z.string().url()).min(1),
  thumbnail: z.string().url(),
  tags: z.array(z.string()).min(1),
  status: z.enum(['AVAILABLE', 'SOLD', 'HIDDEN']),
})

export const PriceSchema = z.object({
  summon: z.number().min(0),
  revival: z.number().min(0),
  afterlife: z.string(),
})

export const CheckoutSchema = z.object({
  logoId: z.string().uuid(),
  tier: z.enum(['summon', 'revival']),
  options: z
    .object({
      wordmark: z.boolean().optional(),
      domain: z.string().optional(),
    })
    .optional(),
})

export type Logo = z.infer<typeof LogoSchema>
export type Price = z.infer<typeof PriceSchema>
export type Checkout = z.infer<typeof CheckoutSchema>
