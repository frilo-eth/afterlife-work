export type LogoStatus = 'AVAILABLE' | 'SOLD' | 'REVIEW' | 'DRAFT' | 'HIDDEN'

interface Order {
  id: string
  createdAt: Date
  status: 'pending' | 'completed' | 'cancelled'
  // Add other order-specific fields as needed
}

export interface Logo {
  id: string
  internal_id: number
  title: string
  description: string
  images: string[]
  thumbnail: string
  tags: string[]
  price: {
    summon: number
    revival: number
    afterlife: string
  }
  status: LogoStatus
  files?: {
    ai?: string
    pdf?: string
    svg?: string
  }
  orders?: Order[]
  createdAt: Date
}

// For admin page compatibility
export interface LogoWithDetails extends Omit<Logo, 'internal_id'> {
  internal_id?: number  // Make it optional for LogoWithDetails
}

export interface PricingTierProps {
  title: string;
  price: number | string;
  features: string[];
  highlighted?: boolean;
}

interface SubscribeResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface SubscribeRequest {
  email: string;
  source?: string;
}

export interface FilterState {
  styles: string[];
  search: string;
} 