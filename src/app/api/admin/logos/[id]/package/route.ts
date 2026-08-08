import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary-server'
import { requireAdmin } from '@/lib/api-utils'

// Deliverable archives are handed out only through signed links, so they must
// not be world-readable on Cloudinary.
const PACKAGE_FOLDER = 'logo-packages'
const MAX_PACKAGE_BYTES = 100 * 1024 * 1024 // 100 MB
const ALLOWED_EXTENSIONS = ['zip', 'ai', 'eps', 'pdf', 'svg']

function uploadPackage(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicId,
          folder: PACKAGE_FOLDER,
          resource_type: 'raw',
          // 'authenticated' keeps the object off the public delivery URL, so
          // it can only be fetched through a signed, expiring link.
          type: 'authenticated',
          overwrite: true
        },
        (error, result) => {
          if (error) return reject(error)
          if (!result) return reject(new Error('No result from Cloudinary'))
          resolve(result.public_id)
        }
      )
      .end(buffer)
  })
}

/** Attach the deliverable archive that buyers of this logo receive. */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const logo = await prisma.logo.findUnique({
      where: { id: params.id },
      select: { id: true }
    })

    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Attach the package as a "file" field.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_PACKAGE_BYTES) {
      return NextResponse.json(
        { error: `Package exceeds the ${MAX_PACKAGE_BYTES / 1024 / 1024} MB limit.` },
        { status: 413 }
      )
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: `Unsupported file type ".${extension}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}.` },
        { status: 415 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const publicId = await uploadPackage(buffer, `${params.id}.${extension}`)

    const updated = await prisma.logo.update({
      where: { id: params.id },
      data: {
        sourcePackageId: publicId,
        sourcePackageName: file.name,
        sourcePackageAt: new Date()
      },
      select: { sourcePackageName: true, sourcePackageAt: true }
    })

    return NextResponse.json({
      success: true,
      package: updated
    })
  } catch (error) {
    console.error('Package upload failed:', error)
    return NextResponse.json(
      { error: 'Could not attach the package.' },
      { status: 500 }
    )
  }
}

/** Detach the deliverable archive, leaving the logo unsellable-as-delivered. */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const logo = await prisma.logo.findUnique({
      where: { id: params.id },
      select: { sourcePackageId: true }
    })

    if (logo?.sourcePackageId) {
      await cloudinary.uploader.destroy(logo.sourcePackageId, {
        resource_type: 'raw',
        type: 'authenticated'
      })
    }

    await prisma.logo.update({
      where: { id: params.id },
      data: {
        sourcePackageId: null,
        sourcePackageName: null,
        sourcePackageAt: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Package removal failed:', error)
    return NextResponse.json(
      { error: 'Could not remove the package.' },
      { status: 500 }
    )
  }
}
