import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { v2 as cloudinary } from 'cloudinary'

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('🗑️ Starting logo deletion process for ID:', params.id)
  
  try {
    // First, get the logo and its gallery to get the image URLs
    console.log('📥 Fetching logo details from database...')
    const logo = await prisma.logo.findUnique({
      where: { id: params.id },
      include: {
        gallery: true
      }
    })

    if (!logo) {
      console.log('❌ Logo not found:', params.id)
      return NextResponse.json(
        { success: false, message: 'Logo not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found logo:', {
      id: logo.id,
      title: logo.title,
      hasMainImage: !!logo.thumbnail,
      galleryCount: logo.gallery?.length || 0
    })

    // Delete images from Cloudinary
    const deletePromises = []

    // Delete main image
    if (logo.thumbnail) {
      const mainImageUrl = logo.thumbnail
      const mainImagePublicId = `logos/${mainImageUrl.split('/').pop()?.split('.')[0]}`
      console.log('🖼️ Deleting main image:', { url: mainImageUrl, publicId: mainImagePublicId })
      
      deletePromises.push(
        cloudinary.uploader.destroy(mainImagePublicId)
          .then(result => {
            console.log('✅ Main image deleted:', result)
            return result
          })
          .catch(error => {
            console.error('❌ Failed to delete main image:', {
              error,
              publicId: mainImagePublicId,
              url: mainImageUrl
            })
            return null
          })
      )
    }

    // Delete gallery images
    if (logo.gallery?.length > 0) {
      console.log(`🗑️ Processing ${logo.gallery.length} gallery images...`)
      
      for (const item of logo.gallery) {
        const imageUrl = item.imageUrl
        const galleryImagePublicId = `logos/${imageUrl.split('/').pop()?.split('.')[0]}`
        console.log('🖼️ Deleting gallery image:', { url: imageUrl, publicId: galleryImagePublicId })
        
        deletePromises.push(
          cloudinary.uploader.destroy(galleryImagePublicId)
            .then(result => {
              console.log('✅ Gallery image deleted:', { publicId: galleryImagePublicId, result })
              return result
            })
            .catch(error => {
              console.error('❌ Failed to delete gallery image:', {
                error,
                publicId: galleryImagePublicId,
                url: imageUrl
              })
              return null
            })
        )
      }
    }

    // Wait for all Cloudinary deletions to complete
    console.log('⏳ Waiting for all Cloudinary deletions to complete...')
    const cloudinaryResults = await Promise.all(deletePromises)
    console.log('✅ Cloudinary cleanup completed:', cloudinaryResults)

    // Delete the logo and all related data from the database using a transaction
    console.log('🗑️ Deleting logo and related data from database...')
    await prisma.$transaction(async (tx) => {
      // First delete all gallery items
      if (logo.gallery?.length > 0) {
        await tx.logoGallery.deleteMany({
          where: {
            logoId: params.id
          }
        })
        console.log('✅ Gallery items deleted from database')
      }

      // Then delete the logo itself
      await tx.logo.delete({
        where: {
          id: params.id
        }
      })
      console.log('✅ Logo deleted from database')
    })

    // Revalidate the logos page and individual logo page
    console.log('🔄 Revalidating pages...')
    revalidatePath('/admin/logos')
    revalidatePath(`/${params.id}`)
    console.log('✅ Pages revalidated')

    return NextResponse.json({ 
      success: true,
      message: 'Logo and associated images deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting logo:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      logoId: params.id
    })
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Logo not found',
            error: error.message
          },
          { status: 404 }
        )
      }
      
      if (error.message.includes('Cloudinary')) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Failed to delete logo images',
            error: error.message
          },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to delete logo',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 