import { v2 as cloudinary } from 'cloudinary'

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Get all logos from Cloudinary
 */
export async function getCloudinaryLogos() {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'logos',
      max_results: 500,
    })
    
    return result.resources
  } catch (error) {
    console.error('Error fetching Cloudinary logos:', error)
    throw error
  }
}

/**
 * Get a specific logo from Cloudinary
 */
export async function getCloudinaryLogo(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId)
    return result
  } catch (error) {
    console.error(`Error fetching Cloudinary logo with ID ${publicId}:`, error)
    throw error
  }
}

/**
 * Delete a logo from Cloudinary
 */
export async function deleteCloudinaryLogo(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error(`Error deleting Cloudinary logo with ID ${publicId}:`, error)
    throw error
  }
}

/**
 * Upload a logo to Cloudinary
 */
export async function uploadToCloudinary(
  file: File | Buffer | string,
  options?: {
    folder?: string
    publicId?: string
    tags?: string[]
  }
) {
  try {
    const uploadOptions = {
      folder: options?.folder || 'logos',
      public_id: options?.publicId,
      tags: options?.tags,
    }
    
    // Cloudinary uploader expects a string path, URL, or Buffer
    // For File objects from browser, we would need to handle differently
    // but that's outside the scope of this server-side function
    const uploadData = file
    
    // @ts-ignore - Cloudinary types don't properly handle all input types
    const result = await cloudinary.uploader.upload(uploadData, uploadOptions)
    return result
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw error
  }
} 