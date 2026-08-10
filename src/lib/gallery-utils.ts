import { prisma } from './prisma'

export type GalleryImage = {
  imageUrl: string
}

export async function updateLogoGallery(logoId: string, images: GalleryImage[]) {
  console.log('Starting gallery update for logo:', logoId)
  console.log('Prisma instance:', !!prisma)

  try {
    // First delete existing gallery images
    await prisma.logoGallery.deleteMany({
      where: { logoId },
    })

    // Then create new gallery images
    const newGallery = await prisma.logoGallery.createMany({
      data: images.map((img) => ({
        logoId,
        imageUrl: img.imageUrl,
      })),
    })

    console.log('Gallery updated:', newGallery)

    return await prisma.logo.findUnique({
      where: { id: logoId },
      include: {
        gallery: true,
      },
    })
  } catch (error) {
    console.error('Gallery update failed:', error)
    throw error
  }
}

export async function getLogoWithGallery(logoId: string) {
  return await prisma.logo.findUnique({
    where: { id: logoId },
    include: {
      gallery: true,
    },
  })
}
