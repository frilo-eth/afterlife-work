// Base types from Prisma
export type LogoStatus = 'AVAILABLE' | 'SOLD' | 'REVIEW' | 'DRAFT' | 'HIDDEN'

export interface Logo {
  id: string
  title: string
  description: string
  images: string[]
  thumbnail: string
  tags: string[]
  priceId: string
  price: {
    id: string
    summon: number
    revival: number
    afterlife: string
  }
  status: LogoStatus
  createdAt: Date
  updatedAt: Date
  designerEmail?: string
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'SUMMONED' | 'REVIVED'

export interface Order {
  id: string
  logoId: string
  customerEmail: string
  amount: number
  tier: 'summon' | 'revival' | 'afterlife'
  wordmark?: string
  stripeSessionId: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

export interface OrderWithLogo extends Order {
  logo: LogoWithDetails
}

export interface LogoWithDetails extends Logo {
  orders?: Order[]
}

export interface Price {
  id: string
  summon: number
  revival: number
  afterlife: string
}

// Extended types with relations
export interface LogoWithPrice extends Logo {
  price: Price
}

export interface OrderConfirmationEmailProps {
  customerEmail: string
  logoTitle: string
  amount: number
  tier: string
  options?: {
    wordmark?: string
    domain?: string
  }
}

// Interface for the Logo component props
export interface LogoDisplayProps extends Logo {}

export interface LogoFormData {
  title: string
  placeholder: File | null
  galleryImages: File[]
  tags: string[]
}
