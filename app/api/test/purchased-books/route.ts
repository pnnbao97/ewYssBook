import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { message: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    // Get test user ID from query params or use default
    const { searchParams } = new URL(request.url)
    const testUserId = searchParams.get('testUserId') || 'test-user-playwright'

    // Find test user
    const testUser = await prisma.user.findUnique({
      where: { clerkId: testUserId }
    })

    if (!testUser) {
      return NextResponse.json({
        purchasedBooks: [],
        message: 'Test user not found'
      })
    }

    // Get all orders for the test user
    const orders = await prisma.order.findMany({
      where: { userId: testUserId },
      include: {
        orderItems: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format the response to match the expected structure
    const purchasedBooks = orders.flatMap(order => 
      order.orderItems.map(item => ({
        bookId: item.bookId,
        version: item.version,
        orderDate: order.createdAt.toISOString(),
        orderStatus: order.status,
        bookTitle: item.book.title,
        bookSlug: item.book.slug,
        coverImageUrl: item.book.coverImageUrl
      }))
    )

    return NextResponse.json({
      purchasedBooks,
      message: 'Test purchases retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching test purchased books:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
