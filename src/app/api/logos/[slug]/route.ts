import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const logo = await prisma.logo.findUnique({
      where: {
        id: params.slug
      },
      include: {
        price: true
      }
    })

    if (!logo) {
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(logo)
  } catch (error) {
    console.error('Error fetching logo:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logo' },
      { status: 500 }
    )
  }
} 