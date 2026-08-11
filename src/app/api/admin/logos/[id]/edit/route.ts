import fs from 'node:fs/promises'
import path from 'node:path'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/api-utils'
import { CATALOG_TAG } from '@/lib/catalog'
import { cloudinary } from '@/lib/cloudinary-server'
import { resolveDesignerForLogo } from '@/lib/designer-resolve'
import { prisma } from '@/lib/prisma'

// Add better debugging for environment variables
console.log('Environment check:', {
  CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
  NODE_ENV: process.env.NODE_ENV,
})

// Setup file logging
const LOG_DIR = path.join(process.cwd(), 'logs')
const UPLOAD_LOG_FILE = path.join(LOG_DIR, 'upload-debug.log')

// Helper function to append to log file
async function logToFile(message: string): Promise<void> {
  try {
    // Ensure log directory exists
    await fs.mkdir(LOG_DIR, { recursive: true })

    // Format with timestamp
    const timestamp = new Date().toISOString()
    const formattedMessage = `[${timestamp}] ${message}\n`

    // Append to log file (create if doesn't exist)
    await fs.appendFile(UPLOAD_LOG_FILE, formattedMessage, 'utf8')
  } catch (error) {
    console.error('Failed to write to log file:', error)
  }
}

// Enhanced logging function that logs to console and file
async function enhancedLog(
  message: string,
  level: 'info' | 'warn' | 'error' = 'info',
): Promise<void> {
  // Log to console
  switch (level) {
    case 'info':
      console.log(message)
      break
    case 'warn':
      console.warn(message)
      break
    case 'error':
      console.error(message)
      break
  }

  // Log to file
  await logToFile(message)
}

// Cloudinary is configured once in lib/cloudinary-server. Credentials were
// previously inlined here as `||` fallbacks, which put the live API secret in
// the source tree; the fallback was also load-bearing because production sets
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME rather than CLOUDINARY_CLOUD_NAME.

// Validation schema
const LogoUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(50, 'Title must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Title can only contain letters, numbers, spaces, and hyphens'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  status: z.enum(['AVAILABLE', 'HIDDEN', 'REVIEW', 'DRAFT', 'TRASH']),
  tags: z.array(z.string()).min(1).max(2),
})

interface LogoGalleryCreate {
  imageUrl: string
  // logoId is handled by Prisma relation
}

// Helper function for cloudinary upload
async function uploadToCloudinary(file: File, publicId: string): Promise<string> {
  const fileId = `${publicId.substring(0, 15)}...` // Truncated ID for logging
  await enhancedLog(
    `🚀 [CLOUDINARY] Starting upload for file ${fileId}: name=${file.name}, size=${file.size}, type=${file.type}, lastModified=${new Date(file.lastModified).toISOString()}`,
    'info',
  )

  try {
    // Create a new buffer from the file
    await enhancedLog(`📦 [CLOUDINARY] [${fileId}] Converting file to buffer...`, 'info')
    const startBuffer = Date.now()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const bufferTime = Date.now() - startBuffer
    await enhancedLog(
      `✅ [CLOUDINARY] [${fileId}] Buffer created with size: ${buffer.length} bytes in ${bufferTime}ms`,
      'info',
    )

    return new Promise((resolve, reject) => {
      enhancedLog(`🔄 [CLOUDINARY] [${fileId}] Creating upload stream...`, 'info')
      const uploadOptions = {
        public_id: publicId,
        folder: 'logos',
        resource_type: 'auto' as const,
        overwrite: true,
        unique_filename: true,
        invalidate: true,
      }

      enhancedLog(
        `📋 [CLOUDINARY] [${fileId}] Upload options: ${JSON.stringify(uploadOptions, null, 2)}`,
        'info',
      )

      const startUpload = Date.now()

      // Add timeout handling
      const uploadTimeout = setTimeout(() => {
        enhancedLog(`⏱️ [CLOUDINARY] [${fileId}] Upload timed out after 30s`, 'error')
        reject(new Error('Cloudinary upload timed out after 30 seconds'))
      }, 30000) // 30 second timeout

      try {
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          clearTimeout(uploadTimeout) // Clear the timeout
          const uploadTime = Date.now() - startUpload

          if (error) {
            enhancedLog(
              `❌ [CLOUDINARY] [${fileId}] Upload error after ${uploadTime}ms: ${JSON.stringify(error)}`,
              'error',
            )
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
            return
          }

          if (!result) {
            enhancedLog(
              `❌ [CLOUDINARY] [${fileId}] No result from Cloudinary after ${uploadTime}ms`,
              'error',
            )
            reject(new Error('No result from Cloudinary'))
            return
          }

          enhancedLog(
            `✅ [CLOUDINARY] [${fileId}] Upload successful in ${uploadTime}ms: ${JSON.stringify({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              size: result.bytes,
              width: result.width,
              height: result.height,
              resourceType: result.resource_type,
            })}`,
            'info',
          )

          resolve(result.secure_url)
        })

        enhancedLog(
          `⏳ [CLOUDINARY] [${fileId}] Sending buffer (${buffer.length} bytes) to upload stream...`,
          'info',
        )

        // Add error handler for the stream
        uploadStream.on('error', (err) => {
          clearTimeout(uploadTimeout)
          enhancedLog(`❌ [CLOUDINARY] [${fileId}] Stream error: ${err}`, 'error')
          reject(new Error(`Upload stream error: ${err.message}`))
        })

        uploadStream.end(buffer)
      } catch (streamError) {
        clearTimeout(uploadTimeout)
        enhancedLog(
          `❌ [CLOUDINARY] [${fileId}] Error creating upload stream: ${streamError}`,
          'error',
        )
        reject(
          new Error(
            `Failed to create upload stream: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`,
          ),
        )
      }
    })
  } catch (error) {
    await enhancedLog(`❌ [CLOUDINARY] [${fileId}] Error in uploadToCloudinary: ${error}`, 'error')
    // Add more detailed error logging
    if (error instanceof Error) {
      await enhancedLog(`❌ [CLOUDINARY] [${fileId}] Error stack: ${error.stack}`, 'error')
    }
    throw new Error(
      `Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin()
  if (denied) return denied

  // Generate a unique ID for this request for tracking across logs
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  const logPrefix = `[API-LOGO-EDIT][${requestId}]`

  await enhancedLog(`🚀 ${logPrefix} Starting PATCH request for logo ${params.id}`, 'info')
  console.time(`${logPrefix} Total processing time`)

  // Create a fresh log entry for this request with a clear separator
  await logToFile('='.repeat(80))
  await logToFile(`NEW REQUEST ${requestId} - ${new Date().toISOString()}`)
  await logToFile('='.repeat(80))

  // Log request headers
  const requestHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    requestHeaders[key] = value
  })
  await enhancedLog(
    `📋 ${logPrefix} Request headers: ${JSON.stringify(requestHeaders, null, 2)}`,
    'info',
  )

  // Log URL with query parameters
  const url = new URL(request.url)
  await enhancedLog(`🔗 ${logPrefix} Request URL: ${url.toString()}`, 'info')
  await enhancedLog(
    `🔍 ${logPrefix} Query parameters: ${JSON.stringify(Object.fromEntries(url.searchParams.entries()), null, 2)}`,
    'info',
  )

  try {
    console.log(`📝 ${logPrefix} Parsing form data from request...`)
    console.time(`${logPrefix} Form data parsing time`)

    // Add content-type validation
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      console.error(
        `❌ ${logPrefix} Invalid content type: ${contentType}. Expected multipart/form-data`,
      )
      throw new Error('Invalid content type. Expected multipart/form-data')
    }

    // Add request size validation
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const size = Number.parseInt(contentLength, 10)
      console.log(`📏 ${logPrefix} Request size: ${(size / 1024 / 1024).toFixed(2)}MB`)

      if (size === 0) {
        console.error(`❌ ${logPrefix} Empty request detected (size: 0)`)
        throw new Error('Empty request detected')
      }

      if (size > 100 * 1024 * 1024) {
        // 100MB limit
        console.error(`❌ ${logPrefix} Request too large: ${(size / 1024 / 1024).toFixed(2)}MB`)
        throw new Error('Request too large')
      }
    } else {
      console.warn(`⚠️ ${logPrefix} No content-length header found`)
    }

    let formData: FormData
    try {
      formData = await request.formData()
      console.timeEnd(`${logPrefix} Form data parsing time`)
    } catch (formDataError) {
      console.error(`❌ ${logPrefix} Failed to parse form data:`, formDataError)
      if (formDataError instanceof Error) {
        console.error(`Stack: ${formDataError.stack}`)
      }
      throw new Error(
        `Failed to parse form data: ${formDataError instanceof Error ? formDataError.message : 'Unknown error'}`,
      )
    }

    // Log received form data
    console.log(`📋 ${logPrefix} Received form data entries:`)
    let fileCount = 0
    let galleryImagesCount = 0
    let mainImageFile: File | null = null

    // Track client timestamp if provided
    const clientTimestamp = formData.get('clientTimestamp')
    if (clientTimestamp) {
      console.log(
        `🕒 ${logPrefix} Client timestamp: ${clientTimestamp}, server time difference: ${Date.now() - Number(clientTimestamp)}ms`,
      )
    }

    // Check for duplicate keys which can indicate client-side issues
    const formDataKeys = new Set<string>()
    const duplicateKeys = new Set<string>()

    for (const [key, value] of formData.entries()) {
      if (formDataKeys.has(key)) {
        duplicateKeys.add(key)
      }
      formDataKeys.add(key)

      if (value instanceof File) {
        fileCount++

        // Validate each file
        if (value.size === 0) {
          console.error(`❌ ${logPrefix} Empty file detected for ${key}: ${value.name}`)
          throw new Error(`Empty file detected: ${value.name}`)
        }

        console.log(
          `📄 ${logPrefix} Form data ${key}:`,
          `File (${value.name}, size: ${value.size} bytes, type: ${value.type}, lastModified: ${new Date(value.lastModified).toISOString()})`,
        )

        if (key === 'mainImage') {
          mainImageFile = value
        } else if (key === 'galleryImages') {
          galleryImagesCount++
        }
      } else {
        console.log(
          `📄 ${logPrefix} Form data ${key}:`,
          typeof value === 'string' && value.length > 100 ? `${value.substring(0, 100)}...` : value,
        )
      }
    }

    if (duplicateKeys.size > 0) {
      console.warn(`⚠️ ${logPrefix} Duplicate form data keys detected:`, [...duplicateKeys])
    }

    // Verify mainImage is found if it's supposed to be present
    if (requestHeaders['x-has-main-image'] === 'true' && !mainImageFile) {
      console.error(`❌ ${logPrefix} Main image was expected but not found in form data`)
    }

    console.log(
      `📊 ${logPrefix} Form data summary: ${fileCount} files, ${galleryImagesCount} gallery images`,
    )

    // Extract form data and validate
    console.log(`🧪 ${logPrefix} Validating form data...`)

    const rawUpdateData = {
      title: formData.get('title') as string | null,
      description: formData.get('description') as string | null,
      status: formData.get('status') as string | null,
      tags: JSON.parse((formData.get('tags') as string) || '[]'),
    }

    console.log(`📝 ${logPrefix} Parsed update data:`, {
      title: rawUpdateData.title,
      description: rawUpdateData.description
        ? rawUpdateData.description.length > 50
          ? `${rawUpdateData.description.substring(0, 50)}...`
          : rawUpdateData.description
        : null,
      status: rawUpdateData.status,
      tags: rawUpdateData.tags,
      timestamp: new Date().toISOString(),
    })

    if (!rawUpdateData.title || !rawUpdateData.description || !rawUpdateData.status) {
      console.error(`❌ ${logPrefix} Validation failed: Missing required fields`, rawUpdateData)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure status is a valid admin-settable enum value (SOLD is Stripe-only).
    const validStatuses = ['AVAILABLE', 'HIDDEN', 'REVIEW', 'DRAFT', 'TRASH']
    if (!validStatuses.includes(rawUpdateData.status)) {
      console.error(`❌ ${logPrefix} Invalid status value:`, rawUpdateData.status)
      return NextResponse.json(
        {
          error:
            rawUpdateData.status === 'SOLD'
              ? 'Sold is set automatically by Stripe checkout and cannot be chosen manually.'
              : `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 },
      )
    }

    let updateData: z.infer<typeof LogoUpdateSchema>
    try {
      updateData = LogoUpdateSchema.parse(rawUpdateData)
      console.log(`✅ ${logPrefix} Zod validation passed:`, updateData)
    } catch (error) {
      console.error(`❌ ${logPrefix} Zod validation failed:`, error)
      return NextResponse.json({ error: 'Invalid data format', details: error }, { status: 400 })
    }

    // Get existing logo
    console.log(`🔍 ${logPrefix} Fetching existing logo from database...`)
    const existingLogo = await prisma.logo.findUnique({
      where: { id: params.id },
      include: {
        gallery: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })
    if (!existingLogo) {
      console.error(`❌ ${logPrefix} Logo not found with ID:`, params.id)
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
    }

    if (existingLogo.status === 'SOLD') {
      return NextResponse.json(
        {
          error: 'Sold logos are locked. Status and details are set by the completed checkout.',
        },
        { status: 409 },
      )
    }

    console.log(
      `✅ ${logPrefix} Found logo: ${existingLogo.title} with ${existingLogo.gallery.length} gallery images`,
    )

    // Handle main image upload if provided
    let thumbnail = existingLogo.thumbnail
    const mainImage = mainImageFile
    if (mainImage) {
      console.log(`🖼️ ${logPrefix} Processing main image upload:`, {
        name: mainImage.name,
        size: mainImage.size,
        type: mainImage.type,
        lastModified: new Date(mainImage.lastModified).toISOString(),
      })

      try {
        const publicId = `logo_${updateData.title.toLowerCase().replace(/\s+/g, '-')}_placeholder`
        console.log(`🔖 ${logPrefix} Generated Cloudinary public ID:`, publicId)

        console.log(`⏳ ${logPrefix} Starting uploadToCloudinary for main image...`)
        const mainImageUrl = await uploadToCloudinary(mainImage, publicId)
        console.log(`✅ ${logPrefix} Main image uploaded to Cloudinary:`, mainImageUrl)
        thumbnail = mainImageUrl
      } catch (error) {
        console.error(`❌ ${logPrefix} Failed to upload main image to Cloudinary:`, error)
        return NextResponse.json(
          { error: 'Failed to upload main image', details: error },
          { status: 500 },
        )
      }
    } else {
      console.log(`ℹ️ ${logPrefix} No main image file provided`)
    }

    // Handle gallery images
    const newGalleryImages: LogoGalleryCreate[] = []
    const galleryImages = formData.getAll('galleryImages') as File[]

    console.log(`🖼️ ${logPrefix} Processing ${galleryImages.length} new gallery images`)

    for (let i = 0; i < galleryImages.length; i++) {
      const file = galleryImages[i]
      console.log(
        `🖼️ ${logPrefix} Uploading gallery image ${i + 1}/${galleryImages.length}: ${file.name}, size: ${file.size}, type: ${file.type}, lastModified: ${new Date(file.lastModified).toISOString()}`,
      )

      try {
        const publicId = `gallery_${updateData.title.toLowerCase().replace(/\s+/g, '-')}_${Date.now()}_${i}`
        console.log(
          `🔖 ${logPrefix} Generated Cloudinary public ID for gallery image ${i + 1}:`,
          publicId,
        )

        console.log(`⏳ ${logPrefix} Starting uploadToCloudinary for gallery image ${i + 1}...`)
        const imageUrl = await uploadToCloudinary(file, publicId)
        console.log(`✅ ${logPrefix} Gallery image ${i + 1} uploaded to Cloudinary:`, imageUrl)

        newGalleryImages.push({
          imageUrl,
          // logoId is handled automatically by the relation
        })
      } catch (error) {
        console.error(`❌ ${logPrefix} Failed to upload gallery image ${i + 1}:`, error)
        // Continue with other images even if one fails
      }
    }

    console.log(
      `📊 ${logPrefix} Successfully uploaded ${newGalleryImages.length} out of ${galleryImages.length} gallery images`,
    )

    // Handle deleted gallery images
    const deletedGalleryIds = formData.get('deletedGalleryIds')
      ? JSON.parse(formData.get('deletedGalleryIds') as string)
      : []

    console.log(
      `🗑️ ${logPrefix} Processing ${deletedGalleryIds.length} deleted gallery images:`,
      deletedGalleryIds,
    )

    if (deletedGalleryIds.length > 0) {
      try {
        // First get the gallery items to delete so we can clean up Cloudinary
        console.log(`🔍 ${logPrefix} Fetching gallery items to delete from database...`)
        const galleryItemsToDelete = await prisma.logoGallery.findMany({
          where: {
            id: { in: deletedGalleryIds },
          },
        })

        console.log(`✅ ${logPrefix} Found ${galleryItemsToDelete.length} gallery items to delete`)

        // Delete from database
        console.log(`🗑️ ${logPrefix} Deleting gallery items from database...`)
        const deleteResult = await prisma.logoGallery.deleteMany({
          where: {
            id: { in: deletedGalleryIds },
          },
        })

        console.log(`✅ ${logPrefix} Deleted ${deleteResult.count} gallery items from database`)

        // Clean up Cloudinary images
        console.log(`🧹 ${logPrefix} Cleaning up Cloudinary images...`)
        for (let i = 0; i < galleryItemsToDelete.length; i++) {
          const item = galleryItemsToDelete[i]
          try {
            // Extract public_id from URL
            const urlParts = item.imageUrl.split('/')
            const filenameWithExt = urlParts[urlParts.length - 1]
            const publicId = `logos/${filenameWithExt.split('.')[0]}`

            console.log(
              `🧹 ${logPrefix} Attempting to delete Cloudinary image ${i + 1}/${galleryItemsToDelete.length} with public_id: ${publicId}`,
            )

            // Delete from Cloudinary
            await new Promise((resolve, reject) => {
              cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) {
                  console.error(
                    `❌ ${logPrefix} Failed to delete Cloudinary image ${publicId}:`,
                    error,
                  )
                  reject(error)
                } else {
                  console.log(`✅ ${logPrefix} Deleted Cloudinary image ${publicId}:`, result)
                  resolve(result)
                }
              })
            })
          } catch (error) {
            console.error(
              `❌ ${logPrefix} Failed to delete Cloudinary image for gallery item ${item.id}:`,
              error,
            )
            // Continue with other deletions even if one fails
          }
        }
      } catch (error) {
        console.error(`❌ ${logPrefix} Failed to delete gallery images:`, error)
        // Continue with the update even if gallery deletion fails
      }
    }

    // Update logo with validated data
    console.log(`📝 ${logPrefix} Updating logo in database with new data...`)

    let designer: Awaited<ReturnType<typeof resolveDesignerForLogo>> = null
    const designerIdRaw = formData.get('designerId')
    const designerNameRaw = formData.get('designerName')
    const designerEmailRaw = formData.get('designerEmail')
    const clearDesigner = formData.get('clearDesigner') === 'true'

    try {
      if (clearDesigner) {
        designer = null
      } else if (designerIdRaw != null || designerNameRaw != null || designerEmailRaw != null) {
        designer = await resolveDesignerForLogo({
          designerId: typeof designerIdRaw === 'string' ? designerIdRaw : null,
          designerName: typeof designerNameRaw === 'string' ? designerNameRaw : null,
          designerEmail: typeof designerEmailRaw === 'string' ? designerEmailRaw : null,
        })
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid designer' },
        { status: 400 },
      )
    }

    const designerTouched =
      clearDesigner || designerIdRaw != null || designerNameRaw != null || designerEmailRaw != null

    const updatedLogo = await prisma.logo.update({
      where: { id: params.id },
      data: {
        title: updateData.title,
        description: updateData.description,
        status: updateData.status,
        tags: updateData.tags,
        thumbnail,
        gallery: {
          create: newGalleryImages,
        },
        ...(designerTouched
          ? {
              designerId: designer?.id ?? null,
              designerEmail: designer?.email ?? null,
            }
          : {}),
      },
      include: {
        gallery: true,
        designer: true,
      },
    })

    console.log(`✅ ${logPrefix} Logo updated successfully:`, {
      id: updatedLogo.id,
      title: updatedLogo.title,
      galleryCount: updatedLogo.gallery.length,
      hasThumbnail: !!updatedLogo.thumbnail,
      status: updatedLogo.status,
      tags: updatedLogo.tags,
      timestamp: new Date().toISOString(),
    })

    revalidateTag(CATALOG_TAG)

    // Create the response
    const timestamp = new Date().toISOString()
    const response = NextResponse.json({
      success: true,
      data: {
        ...updatedLogo,
        thumbnail: updatedLogo.thumbnail ? `${updatedLogo.thumbnail}?t=${Date.now()}` : null,
        gallery: updatedLogo.gallery.map((item) => ({
          ...item,
          imageUrl: `${item.imageUrl}?t=${Date.now()}`,
        })),
      },
      timestamp,
    })

    // Add Cache-Control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('X-Response-Time', timestamp)

    console.log(`🏁 ${logPrefix} Sending successful response`)
    console.timeEnd(`${logPrefix} Total processing time`)
    return response
  } catch (error) {
    console.error(`❌ ${logPrefix} Error processing request:`, error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
