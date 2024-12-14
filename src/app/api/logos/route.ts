import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Add GET method to fetch all logos
export async function GET() {
  try {
    const logos = await prisma.logo.findMany({
      include: {
        price: true
      },
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('Fetched logos:', JSON.stringify(logos, null, 2))
    return NextResponse.json(logos)
  } catch (error) {
    console.error('Error fetching logos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logos' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, images, thumbnail, tags } = await req.json()

    // Create price record first
    const price = await prisma.price.create({
      data: {
        summon: 1000,
        revival: 5000,
        afterlife: "Starts at $10,000"
      }
    })

    // Create logo record
    const logo = await prisma.logo.create({
      data: {
        title,
        description,
        images,
        thumbnail,
        tags,
        priceId: price.id
      }
    })

    return NextResponse.json({ logo })
  } catch (error) {
    console.error('Logo creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create logo' },
      { status: 500 }
    )
  }
} 