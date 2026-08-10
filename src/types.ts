export type LogoStatus = 'AVAILABLE' | 'SOLD' | 'REVIEW' | 'DRAFT' | 'HIDDEN'

export interface LogoGalleryItem {
  id: string
  imageUrl: string
  logoId: string
}

export interface Logo {
  id: string
  title: string
  description: string
  thumbnail: string
  tags: string[]
  status: LogoStatus
  gallery?: LogoGalleryItem[]
  createdAt: Date
}

export interface LogoWithDetails {
  id: string
  title: string
  description: string
  thumbnail: string
  tags: string[]
  status: LogoStatus
  gallery?: LogoGalleryItem[]
  createdAt: Date | string
  updatedAt: Date | string
  price?: {
    id: string
    summon: number
    revival: number
    afterlife: string
    createdAt: Date | string
    updatedAt: Date | string
  }
}
