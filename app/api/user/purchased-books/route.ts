import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's completed orders and their items
    const purchasedBooks = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: 'DELIVERED', // Only completed orders
        paymentStatus: 'COMPLETED'
      },
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
      }
    })

    // Transform the data to a simpler format
    const purchasedBooksList = purchasedBooks.flatMap(order => 
      order.orderItems.map(item => ({
        bookId: item.bookId,
        version: item.version,
        orderDate: order.createdAt.toISOString(),
        orderStatus: order.status,
        bookTitle: item.book.title,
        bookSlug: item.book.slug,
        bookCoverUrl: item.book.coverImageUrl
      }))
    )

    return NextResponse.json({
      purchasedBooks: purchasedBooksList,
      totalCount: purchasedBooksList.length
    })

  } catch (error) {
    console.error('Error fetching purchased books:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
