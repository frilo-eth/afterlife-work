import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCloudinaryLogos } from '@/lib/cloudinary-utils'
import { updateLogoGallery } from '@/lib/gallery-utils'
import type { Logo } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const logoId = searchParams.get('id')
    
    const logos = await getCloudinaryLogos()
    
    // Get different test images for the gallery
    const testGallery = logos.slice(0, 4).map(logo => ({
      imageUrl: logo.secure_url
    }))
    
    // If no ID provided, update first logo found
    const firstLogo = await prisma.logo.findFirst()
    const targetLogoId = logoId || firstLogo?.id
    
    if (!targetLogoId) {
      return NextResponse.json({ error: 'No logo found' }, { status: 404 })
    }

    // Update gallery using our helper function
    await updateLogoGallery(targetLogoId, testGallery)
    
    // Get updated logo with gallery
    const updatedLogo = await prisma.logo.findUnique({
      where: { id: targetLogoId },
      include: {
        gallery: true
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      logo: updatedLogo,
      galleryCount: testGallery.length
    })
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
} 