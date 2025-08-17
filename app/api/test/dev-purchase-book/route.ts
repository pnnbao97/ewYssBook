import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { message: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { bookId, version = 'color', testUserId = 'test-user-123' } = body

    if (!bookId) {
      return NextResponse.json(
        { message: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true }
    })

    if (!book) {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      )
    }

    // Create or find test user
    let testUser = await prisma.user.findUnique({
      where: { clerkId: testUserId }
    })

    if (!testUser) {
      // Create test user with unique email
      const testEmail = `test_${Date.now()}@ewyssbook.test`
      testUser = await prisma.user.create({
        data: {
          clerkId: testUserId,
          email: testEmail,
          name: 'Test User',
          phone: null
        }
      })
    }

    // Create a mock order for the book
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        userId: testUser.clerkId,
        shippingFullName: testUser.name || 'Test User',
        shippingPhone: '0000000000',
        shippingEmail: testUser.email || 'test@ewyssbook.test',
        shippingAddress: 'Test Address',
        subtotal: 0,
        shippingFee: 0,
        couponDiscount: 0,
        totalAmount: 0,
        paymentMethod: 'CASH',
        paymentStatus: 'COMPLETED',
        status: 'DELIVERED',
        notes: 'Test purchase - no real payment required'
      }
    })

    // Create order item
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        bookId: bookId,
        quantity: 1,
        version: version === 'color' ? 'color' : 
                version === 'black_and_white' ? 'black_and_white' : 'livebook',
        unitPrice: 0,
        totalPrice: 0
      }
    })

    return NextResponse.json({
      message: 'Book purchased successfully in test mode',
      orderId: order.id,
      bookId: bookId,
      version: version,
      testUserId: testUserId
    })

  } catch (error) {
    console.error('Test dev purchase error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
