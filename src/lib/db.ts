import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function getAllLogos() {
  try {
    const logos = await db.logo.findMany({
      include: { price: true },
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' }
    })
    return logos
  } catch (error) {
    console.error('Error fetching logos:', error)
    throw error
  }
}

export async function cleanDatabase() {
  try {
    await db.order.deleteMany({})
    await db.logo.deleteMany({})
    await db.price.deleteMany({})
    return { success: true }
  } catch (error) {
    console.error('Clean up failed:', error)
    throw error
  }
}

export async function createTestLogo() {
  try {
    const price = await db.price.create({
      data: {
        summon: 1000,
        revival: 5000,
        afterlife: "Starts at $10,000"
      }
    })

    const logo = await db.logo.create({
      data: {
        title: "Test Logo",
        description: "This is a test logo to verify our database setup",
        images: ["https://placehold.co/400x400"],
        thumbnail: "https://placehold.co/400x400",
        tags: ["Test", "Minimal"],
        priceId: price.id,
        status: 'AVAILABLE'
      }
    })

    return { price, logo }
  } catch (error) {
    console.error('Database test failed:', error)
    throw error
  }
}

export async function uploadTestImage() {
  try {
    // Replace with path to your local test image
    const result = await cloudinary.uploader.upload('path/to/your/test-image.jpg', {
      folder: 'logos',
      public_id: 'test-logo',
      upload_preset: 'logos_preset'
    })
    
    console.log('Test image uploaded:', result.secure_url)
    return result.secure_url
  } catch (error) {
    console.error('Failed to upload test image:', error)
    throw error
  }
} 