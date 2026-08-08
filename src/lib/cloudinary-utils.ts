import { v2 as cloudinary } from 'cloudinary'
import { UploadApiResponse, UploadApiOptions } from 'cloudinary'

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

/**
 * Get all logos from Cloudinary
 */
export async function getCloudinaryLogos(): Promise<CloudinaryImage[]> {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'logos',
      max_results: 500,
    })
    
    return result.resources.map((resource: CloudinaryResource) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      folder: resource.folder
    }))
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

interface UploadResponse {
  mainImage: string
  galleryImages: string[]
}

type CloudinaryUploadFile = string | { path: string }

export async function uploadLogoAssets(
  mainFile: CloudinaryUploadFile,
  galleryFiles: CloudinaryUploadFile[]
): Promise<UploadResponse> {
  try {
    // Upload main placeholder using the preset
    const mainUpload = await cloudinary.uploader.upload(
      typeof mainFile === 'string' ? mainFile : mainFile.path,
      { 
        upload_preset: 'logos_preset',
        folder: 'logos'
      }
    )

    // Upload gallery images to a different folder
    const galleryUploads = await Promise.all(
      galleryFiles.map(file => 
        cloudinary.uploader.upload(
          typeof file === 'string' ? file : file.path,
          { 
            folder: 'logos/gallery',
            // No preset needed for gallery images
          }
        )
      )
    )

    return {
      mainImage: mainUpload.secure_url,
      galleryImages: galleryUploads.map(upload => upload.secure_url)
    }
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

// Helper function for direct uploads from the client
export function getUploadSignature() {
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  
  if (!apiSecret) {
    throw new Error('Cloudinary API Secret is not configured')
  }

  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: 'logos',
      upload_preset: 'logos_preset'
    },
    apiSecret
  )

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY

  if (!cloudName || !apiKey) {
    throw new Error('Cloudinary configuration is incomplete')
  }

  return {
    timestamp,
    signature,
    cloudName,
    apiKey
  }
}