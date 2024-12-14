import { v2 as cloudinary } from 'cloudinary'

interface CloudinaryImage {
  public_id: string
  secure_url: string
  folder: string
}

interface CloudinaryResource {
  public_id: string
  secure_url: string
  folder: string
  created_at: string
}

// Configure cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function getCloudinaryLogos(): Promise<CloudinaryImage[]> {
  try {
    console.log('Cloudinary Config:', {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    })
    
    console.log('Fetching images from Cloudinary...')
    
    const result = await cloudinary.search
      .expression('folder:logos')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute()

    console.log(`Found ${result.resources.length} images in Cloudinary`)
    
    return result.resources.map((resource: CloudinaryResource) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      folder: resource.folder
    }))
  } catch (error) {
    console.error('Failed to fetch Cloudinary images:', error)
    throw error
  }
} 