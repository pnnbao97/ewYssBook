import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
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
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookId, version = 'color' } = body

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

    // First, try to find existing user
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    // If user doesn't exist, create one with a unique email
    if (!dbUser) {
      const userEmail = user.emailAddresses[0]?.emailAddress || ''
      
      // Check if email already exists
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: userEmail }
      })

      if (existingUserWithEmail) {
        // Email exists, create user with modified email
        const modifiedEmail = `dev_${Date.now()}_${userEmail}`
        dbUser = await prisma.user.create({
          data: {
            clerkId: user.id,
            email: modifiedEmail,
            name: user.fullName || '',
            phone: null
          }
        })
      } else {
        // Email doesn't exist, create user normally
        dbUser = await prisma.user.create({
          data: {
            clerkId: user.id,
            email: userEmail,
            name: user.fullName || '',
            phone: null
          }
        })
      }
    }

    // Create a mock order for the book
    const order = await prisma.order.create({
      data: {
        orderNumber: `DEV-${Date.now()}`,
        userId: dbUser.clerkId,
        shippingFullName: dbUser.name || 'Dev User',
        shippingPhone: '0000000000', // Default phone for dev
        shippingEmail: dbUser.email || 'dev@example.com',
        shippingAddress: 'Development Address',
        subtotal: 0, // Free for dev
        shippingFee: 0,
        couponDiscount: 0,
        totalAmount: 0,
        paymentMethod: 'CASH', // Use valid enum value
        paymentStatus: 'COMPLETED',
        status: 'DELIVERED',
        notes: 'Development purchase - no real payment required'
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
        unitPrice: 0, // Free for dev
        totalPrice: 0
      }
    })

    return NextResponse.json({
      message: 'Book purchased successfully in development mode',
      orderId: order.id,
      bookId: bookId,
      version: version
    })

  } catch (error) {
    console.error('Dev purchase error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
