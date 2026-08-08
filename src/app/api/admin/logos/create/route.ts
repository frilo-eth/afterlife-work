import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'
import fs from 'node:fs/promises'
import path from 'node:path'
import { requireAdmin } from '@/lib/api-utils'

// Add better debugging for environment variables
console.log('Environment check:', {
  CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
  NODE_ENV: process.env.NODE_ENV
})

// Setup file logging
const LOG_DIR = path.join(process.cwd(), 'logs');
const UPLOAD_LOG_FILE = path.join(LOG_DIR, 'upload-debug.log');

// Helper function to append to log file
async function logToFile(message: string): Promise<void> {
  try {
    // Ensure log directory exists
    await fs.mkdir(LOG_DIR, { recursive: true });
    
    // Format with timestamp
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}\n`;
    
    // Append to log file (create if doesn't exist)
    await fs.appendFile(UPLOAD_LOG_FILE, formattedMessage, 'utf8');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// Enhanced logging function that logs to console and file
async function enhancedLog(message: string, level: 'info' | 'warn' | 'error' = 'info'): Promise<void> {
  // Log to console
  switch (level) {
    case 'info':
      console.log(message);
      break;
    case 'warn':
      console.warn(message);
      break;
    case 'error':
      console.error(message);
      break;
  }
  
  // Log to file
  await logToFile(message);
}

// Configure Cloudinary with fallback values for development
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dsfmwnf5j',
    api_key: process.env.CLOUDINARY_API_KEY || '275761549541876',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'REDACTED'
  })
  console.log('Cloudinary configured successfully')
} catch (error) {
  console.error('Failed to configure Cloudinary:', error)
}

// Validation schema
const LogoCreateSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(50, "Title must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Title can only contain letters, numbers, spaces, and hyphens"),
  cloudinaryName: z.string()
    .min(1, "Cloudinary name is required")
    .max(50, "Cloudinary name must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Cloudinary name can only contain lowercase letters, numbers, and hyphens"),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  status: z.enum(['AVAILABLE', 'SOLD', 'HIDDEN', 'REVIEW', 'DRAFT']),
  tags: z.array(z.string()).min(1).max(5)
})

interface LogoGalleryCreate {
  imageUrl: string;
  // logoId is handled by Prisma relation
}

// Helper function for cloudinary upload
async function uploadToCloudinary(file: File, publicId: string): Promise<string> {
  const fileId = `${publicId.substring(0, 15)}...`; // Truncated ID for logging
  await enhancedLog(`🚀 [CLOUDINARY] Starting upload for file ${fileId}: name=${file.name}, size=${file.size}, type=${file.type}, lastModified=${new Date(file.lastModified).toISOString()}`, 'info');
  
  try {
    // Create a new buffer from the file
    await enhancedLog(`📦 [CLOUDINARY] [${fileId}] Converting file to buffer...`, 'info');
    const startBuffer = Date.now();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const bufferTime = Date.now() - startBuffer;
    await enhancedLog(`✅ [CLOUDINARY] [${fileId}] Buffer created with size: ${buffer.length} bytes in ${bufferTime}ms`, 'info');
    
    return new Promise((resolve, reject) => {
      const uploadStartTime = Date.now();
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: 'logos',
          resource_type: 'image',
          format: 'webp',
          transformation: [
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
          ]
        },
        async (error, result) => {
          if (error) {
            await enhancedLog(`❌ [CLOUDINARY] [${fileId}] Upload failed: ${error.message}`, 'error');
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
            return;
          }
          
          if (!result) {
            await enhancedLog(`❌ [CLOUDINARY] [${fileId}] Upload failed: No result returned`, 'error');
            reject(new Error('Cloudinary upload failed: No result returned'));
            return;
          }
          
          const uploadTime = Date.now() - uploadStartTime;
          await enhancedLog(`✅ [CLOUDINARY] [${fileId}] Upload successful in ${uploadTime}ms: ${result.secure_url}`, 'info');
          resolve(result.secure_url);
        }
      );
      
      uploadStream.write(buffer);
      uploadStream.end();
    });
  } catch (error) {
    await enhancedLog(`❌ [CLOUDINARY] [${fileId}] Error during upload process: ${error instanceof Error ? error.message : String(error)}`, 'error');
    throw error;
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  await enhancedLog(`📥 [${requestId}] Received logo creation request`, 'info');
  
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    await enhancedLog(`📦 [${requestId}] Parsed form data with ${formData.entries.length} entries`, 'info');
    
    // Extract form fields
    const title = formData.get('title') as string;
    const cloudinaryName = formData.get('cloudinaryName') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;
    const tagsJson = formData.get('tags') as string;
    
    // Parse tags from JSON
    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsJson);
    } catch (error) {
      await enhancedLog(`❌ [${requestId}] Failed to parse tags JSON: ${tagsJson}`, 'error');
      return NextResponse.json({ error: 'Invalid tags format' }, { status: 400 });
    }
    
    // Validate the data
    try {
      LogoCreateSchema.parse({
        title,
        cloudinaryName,
        description,
        status,
        tags
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        await enhancedLog(`❌ [${requestId}] Validation error: ${JSON.stringify(error.errors)}`, 'error');
        return NextResponse.json({ error: error.errors }, { status: 400 });
      }
      throw error;
    }
    
    // Get the main image file
    const mainImageFile = formData.get('mainImage') as File;
    if (!mainImageFile) {
      await enhancedLog(`❌ [${requestId}] No main image provided`, 'error');
      return NextResponse.json({ error: 'Main image is required' }, { status: 400 });
    }
    
    // Get gallery image files
    const galleryFiles: File[] = [];
    for (const item of formData.getAll('galleryImages')) {
      if (item instanceof File) {
        galleryFiles.push(item);
      }
    }
    
    if (galleryFiles.length === 0) {
      await enhancedLog(`❌ [${requestId}] No gallery images provided`, 'error');
      return NextResponse.json({ error: 'At least one gallery image is required' }, { status: 400 });
    }
    
    await enhancedLog(`📊 [${requestId}] Processing logo creation with ${galleryFiles.length} gallery images`, 'info');
    
    // Upload main image to Cloudinary
    const mainImagePublicId = `logo-${cloudinaryName}-main`;
    let mainImageUrl: string;
    
    try {
      mainImageUrl = await uploadToCloudinary(mainImageFile, mainImagePublicId);
      await enhancedLog(`✅ [${requestId}] Main image uploaded: ${mainImageUrl}`, 'info');
    } catch (error) {
      await enhancedLog(`❌ [${requestId}] Failed to upload main image: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return NextResponse.json({ error: 'Failed to upload main image' }, { status: 500 });
    }
    
    // Upload gallery images to Cloudinary
    const galleryUploads: Promise<LogoGalleryCreate>[] = galleryFiles.map(async (file, index) => {
      const galleryPublicId = `logo-${cloudinaryName}-gallery-${index + 1}`;
      
      try {
        const imageUrl = await uploadToCloudinary(file, galleryPublicId);
        await enhancedLog(`✅ [${requestId}] Gallery image ${index + 1} uploaded: ${imageUrl}`, 'info');
        
        return {
          imageUrl
        };
      } catch (error) {
        await enhancedLog(`❌ [${requestId}] Failed to upload gallery image ${index + 1}: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw new Error(`Failed to upload gallery image ${index + 1}`);
      }
    });
    
    // Wait for all gallery uploads to complete
    let galleryData: LogoGalleryCreate[];
    try {
      galleryData = await Promise.all(galleryUploads);
      await enhancedLog(`✅ [${requestId}] All gallery images uploaded successfully`, 'info');
    } catch (error) {
      await enhancedLog(`❌ [${requestId}] Failed to upload all gallery images: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return NextResponse.json({ error: 'Failed to upload gallery images' }, { status: 500 });
    }
    
    // Create the logo in the database
    try {
      const logo = await prisma.logo.create({
        data: {
          title,
          description,
          thumbnail: mainImageUrl,
          status: status as 'AVAILABLE' | 'SOLD' | 'HIDDEN' | 'REVIEW' | 'DRAFT',
          tags,
          price: {
            create: {
              summon: 1000,
              revival: 5000,
              afterlife: "Starts at $10,000"
            }
          },
          gallery: {
            create: galleryData
          }
        },
        include: {
          gallery: true
        }
      });
      
      await enhancedLog(`✅ [${requestId}] Logo created successfully with ID: ${logo.id}`, 'info');
      
      return NextResponse.json({
        id: logo.id,
        message: 'Logo created successfully'
      }, { status: 201 });
    } catch (error) {
      await enhancedLog(`❌ [${requestId}] Failed to create logo in database: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return NextResponse.json({ error: 'Failed to create logo in database' }, { status: 500 });
    }
  } catch (error) {
    await enhancedLog(`❌ [${requestId}] Unexpected error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 