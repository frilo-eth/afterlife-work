import { PrismaClient } from '@prisma/client'
import { getCloudinaryLogos } from './cloudinary-utils'
import { LOGO_TAGS } from './constants'

const prisma = new PrismaClient()

function generateTitle(publicId: string): string {
  // Remove folder prefix and file extension
  const baseName = publicId.split('/').pop()?.split('.')[0] || ''
  // Convert kebab-case to Title Case
  return baseName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getRandomTags(count: number = 2): string[] {
  const shuffled = [...LOGO_TAGS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export async function seedFromCloudinary() {
  try {
    await prisma.logo.deleteMany()
    await prisma.price.deleteMany()
    
    const cloudinaryLogos = await getCloudinaryLogos()
    
    const results = await Promise.all(cloudinaryLogos.map(async (image) => {
      const price = await prisma.price.create({
        data: {
          summon: 1000,
          revival: 5000,
          afterlife: "Starts at $10,000"
        }
      })

      return prisma.logo.create({
        data: {
          title: generateTitle(image.public_id),
          description: "A carefully crafted design ready for resurrection",
          images: [image.secure_url],
          thumbnail: image.secure_url,
          tags: getRandomTags(),
          priceId: price.id,
          status: "AVAILABLE"
        }
      })
    }))

    return { success: true, count: results.length }
  } catch (error) {
    console.error('Seed from Cloudinary failed:', error)
    throw error
  }
} 