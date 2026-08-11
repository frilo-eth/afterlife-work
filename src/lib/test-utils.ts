import { getCloudinaryLogos } from './cloudinary-utils'
import { LOGO_TAGS } from './constants'
import { prisma } from './prisma'

function generateTitle(publicId: string): string {
  const parts = publicId.split('/')
  const lastPart = parts[parts.length - 1] ?? ''
  const baseName = lastPart.split('.')[0] ?? ''

  return baseName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getRandomTags(count = 2): string[] {
  const shuffled = [...LOGO_TAGS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export async function seedFromCloudinary(force = false) {
  try {
    const existingCount = await prisma.logo.count()
    if (existingCount > 0 && !force) {
      console.log('Database already has logos. Use force=true to override.')
      return { success: false, reason: 'DATABASE_NOT_EMPTY' }
    }

    const cloudinaryLogos = await getCloudinaryLogos()

    // Consider all images as main logos if we don't have many
    // This is more flexible for different Cloudinary setups
    const mainLogos =
      cloudinaryLogos.length <= 10
        ? cloudinaryLogos
        : cloudinaryLogos.filter(
            (logo) =>
              !logo.public_id.includes('/gallery/') && (logo.folder === 'logos' || !logo.folder),
          )

    // Find gallery images - those in the gallery subfolder
    // Only look for gallery images if we have enough total images
    const galleryImages =
      cloudinaryLogos.length > 10
        ? cloudinaryLogos.filter(
            (image) => image.public_id.includes('/gallery/') || image.folder === 'logos/gallery',
          )
        : []

    console.log(`Found ${mainLogos.length} main logos and ${galleryImages.length} gallery images`)

    // Group gallery images by possible parent logo using naming patterns
    const galleryGroups = galleryImages.reduce(
      (groups, image) => {
        // Extract base name from gallery image to match with main logos
        const parts = image.public_id.split('/')
        const fileName = parts[parts.length - 1] || ''
        const baseName = fileName.split('.')[0] || ''

        // Try to find a matching pattern in main logos
        // Example: if gallery image is "logo-1-gallery", look for a main logo with "logo-1" in the name
        const basePattern = baseName.replace(/-gallery|-alt|-variant|-option|-v\d+/g, '')

        if (!groups[basePattern]) {
          groups[basePattern] = []
        }

        groups[basePattern].push(image)
        return groups
      },
      {} as Record<string, typeof galleryImages>,
    )

    console.log(`Processing ${mainLogos.length} unique logos with their galleries...`)

    const results = await Promise.all(
      mainLogos.map(async (logo) => {
        // Create pricing
        const price = await prisma.price.create({
          data: {
            summon: 2500,
            revival: 5000,
            afterlife: '$10,000/mo',
          },
        })

        // Extract base pattern to match with gallery images
        const parts = logo.public_id.split('/')
        const fileName = parts[parts.length - 1] || ''
        const baseName = fileName.split('.')[0] || ''

        // Create the main logo
        const title = generateTitle(logo.public_id)
        const createdLogo = await prisma.logo.create({
          data: {
            title,
            slug: title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, ''),
            description: 'A unique design from our collection',
            images: [logo.secure_url],
            thumbnail: logo.secure_url,
            tags: getRandomTags(),
            priceId: price.id,
            status: 'AVAILABLE',
          },
        })

        // Find gallery images for this logo
        const matchingGalleryImages = galleryGroups[baseName] || []

        // Create gallery entries for this logo
        if (matchingGalleryImages.length > 0) {
          await Promise.all(
            matchingGalleryImages.map((galleryImage) =>
              prisma.logoGallery.create({
                data: {
                  logoId: createdLogo.id,
                  imageUrl: galleryImage.secure_url,
                },
              }),
            ),
          )

          console.log(
            `Added ${matchingGalleryImages.length} gallery images to logo ${createdLogo.title}`,
          )
        }

        return {
          logo: createdLogo,
          galleryCount: matchingGalleryImages.length,
        }
      }),
    )

    const totalGalleryImages = results.reduce((sum, result) => sum + result.galleryCount, 0)

    return {
      success: true,
      count: results.length,
      galleryImagesAdded: totalGalleryImages,
    }
  } catch (error) {
    console.error('Seed from Cloudinary failed:', error)
    throw error
  }
}
