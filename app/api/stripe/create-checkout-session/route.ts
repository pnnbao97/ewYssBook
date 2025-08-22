// app/api/stripe/create-checkout-session/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { currentUser } from '@clerk/nextjs/server';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const userData = await currentUser();
    const userId = userData?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      amount,
      currency = 'vnd',
      shippingInfo,
      orderItems,
    } = body;

    // Validate required fields
    if (!amount || !shippingInfo || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert VND to smallest unit (VND doesn't have cents, so amount stays the same)
    const amountInCents = Math.round(amount);

    // Create line items for Stripe
    const lineItems = orderItems.map((item: any) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: `Sách: ${item.bookTitle || 'Book'}`,
          description: `Phiên bản: ${item.version === 'color' ? 'Màu' : 'Đen trắng'}`,
        },
        unit_amount: Math.round(item.unitPrice),
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thanh-toan/thanh-cong?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thanh-toan/that-bai`,
      customer_email: shippingInfo.email,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['VN'], // Chỉ cho phép giao hàng trong Việt Nam
      },
      metadata: {
        userId: userId,
        orderType: 'book_purchase',
        shippingFullName: shippingInfo.fullName,
        shippingPhone: shippingInfo.phone,
        shippingAddress: shippingInfo.address,
        notes: shippingInfo.notes || '',
      },
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        shipping_address: {
          message: 'Vui lòng cung cấp địa chỉ giao hàng chính xác tại Việt Nam.',
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}