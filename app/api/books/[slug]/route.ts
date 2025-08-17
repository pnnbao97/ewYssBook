import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const book = await prisma.book.findUnique({
      where: { slug: resolvedParams.slug },
      select: {
        id: true,
        title: true,
        author: true,
        slug: true,
        isbn: true,
        summary: true,
        coverImageUrl: true,
        primaryCategory: true,
        colorPrice: true,
        blackAndWhitePrice: true,
        livebookPrice: true,
        previewUrl: true,
        isPublished: true,
        createdAt: true
      }
    })

    if (!book) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 })
    }

    if (!book.isPublished) {
      return NextResponse.json({ message: 'Book not available' }, { status: 404 })
    }

    return NextResponse.json({ book })

  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    
    const updatedBook = await prisma.book.update({
      where: { slug: resolvedParams.slug },
      data: body,
      select: {
        id: true,
        title: true,
        author: true,
        slug: true,
        isbn: true,
        summary: true,
        coverImageUrl: true,
        primaryCategory: true,
        colorPrice: true,
        blackAndWhitePrice: true,
        livebookPrice: true,
        previewUrl: true,
        isPublished: true,
        createdAt: true
      }
    })

    return NextResponse.json({ book: updatedBook })

  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
