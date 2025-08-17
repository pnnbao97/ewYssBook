import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isPublished: true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category && category !== 'all') {
      where.primaryCategory = category
    }

    // Get total count for pagination
    const totalCount = await prisma.book.count({ where })

    // Get books with pagination
    const books = await prisma.book.findMany({
      where,
      select: {
        id: true,
        title: true,
        author: true,
        slug: true,
        summary: true,
        coverImageUrl: true,
        primaryCategory: true,
        colorPrice: true,
        blackAndWhitePrice: true,
        livebookPrice: true,
        isPublished: true,
        createdAt: true,
        isbn: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    return NextResponse.json({ 
      books,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1
    })

  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
