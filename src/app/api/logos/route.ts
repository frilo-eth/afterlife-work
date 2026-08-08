import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'
import type { LogoStatus, LogoWithDetails, LogoGalleryItem } from '@/types'
import { getFromCache, setCacheWithTTL, CACHE_KEYS, warmUpCache } from '@/lib/redis'
import type { Logo } from '@prisma/client'

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Validation schema
const LogoUpdateSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(50, "Title must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Title can only contain letters, numbers, spaces, and hyphens"),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  status: z.enum(['AVAILABLE', 'SOLD', 'HIDDEN', 'REVIEW', 'DRAFT']),
  tags: z.array(z.string()).min(1).max(2)
})

type LogoUpdateData = z.infer<typeof LogoUpdateSchema>

// Helper function for cloudinary upload
async function uploadToCloudinary(file: File, publicId: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicId,
          folder: 'logos'
        },
        (error, result) => {
          if (error) reject(error)
          if (!result) reject(new Error('No result from Cloudinary'))
          else resolve(result.secure_url)
        }
      )
      .end(buffer)
  })
}

// Cache duration constants
const CACHE_DURATION = {
  development: 0,
  production: 60, // 1 minute
  staleWhileRevalidate: 300 // 5 minutes
}

// Add ETag generation with proper typing
function generateETag(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

export async function GET() {
  try {
    // Try to get logos from cache first
    const cachedLogos = await getFromCache<LogoWithDetails[]>(CACHE_KEYS.ALL_LOGOS);
    
    if (cachedLogos) {
      return NextResponse.json({ 
        logos: cachedLogos,
        groupedLogos: groupLogosByStatus(cachedLogos)
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=59',
        },
      });
    }

    // If not in cache, fetch from database with all related data
    const logos = await prisma.logo.findMany({
      include: {
        price: true,
        gallery: true
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data to match LogoWithDetails type
    const transformedLogos = logos.map(logo => ({
      ...logo,
      createdAt: logo.createdAt.toISOString(),
      updatedAt: logo.updatedAt.toISOString(),
      price: logo.price ? {
        ...logo.price,
        createdAt: logo.price.createdAt.toISOString(),
        updatedAt: logo.price.updatedAt.toISOString()
      } : null,
      gallery: logo.gallery.map(g => ({
        ...g,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString()
      }))
    })) as LogoWithDetails[];

    // Group logos by status
    const groupedLogos = groupLogosByStatus(transformedLogos);

    // Warm up the cache with transformed data
    await warmUpCache(transformedLogos);

    return NextResponse.json({
      logos: transformedLogos,
      groupedLogos
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Error fetching logos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logos' },
      { status: 500 }
    );
  }
}

// Helper function to group logos by status
function groupLogosByStatus(logos: LogoWithDetails[]): Record<LogoStatus, LogoWithDetails[]> {
  const grouped = logos.reduce((acc, logo) => {
    const status = logo.status as LogoStatus;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(logo);
    return acc;
  }, {} as Record<LogoStatus, LogoWithDetails[]>);

  // Ensure all status groups exist
  const allStatuses: LogoStatus[] = ['AVAILABLE', 'SOLD', 'REVIEW', 'DRAFT', 'HIDDEN'];
  for (const status of allStatuses) {
    if (!grouped[status]) {
      grouped[status] = [];
    }
  }

  return grouped;
}