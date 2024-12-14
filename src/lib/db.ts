import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

export async function createTestLogo() {
  try {
    // First create a price record
    const price = await prisma.price.create({
      data: {
        summon: 1000,
        revival: 5000,
        afterlife: "Starts at $10,000"
      }
    })

    // Replace this URL with your actual Cloudinary image URL
    const imageUrl = "https://res.cloudinary.com/dsfmwnf5j/image/upload/v1734134134/test-logo_tbllhq.png"

    // Then create a logo linked to that price
    const logo = await prisma.logo.create({
      data: {
        title: "Test Logo",
        description: "This is a test logo to verify our database setup",
        images: [imageUrl],
        thumbnail: imageUrl,
        tags: ["Test", "Minimal"],
        priceId: price.id,
        status: "AVAILABLE"
      }
    })

    return { price, logo }
  } catch (error) {
    console.error('Database test failed:', error)
    throw error
  }
}

export async function cleanDatabase() {
  try {
    // Delete all logos first (because of foreign key constraints)
    await prisma.logo.deleteMany({})
    // Then delete all prices
    await prisma.price.deleteMany({})
    return { success: true }
  } catch (error) {
    console.error('Clean up failed:', error)
    throw error
  }
}

export async function getAllLogos() {
  try {
    const logos = await prisma.logo.findMany({
      include: {
        price: true
      },
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return logos
  } catch (error) {
    console.error('Error fetching logos:', error)
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