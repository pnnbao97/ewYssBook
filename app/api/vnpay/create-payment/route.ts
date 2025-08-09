// app/api/vnpay/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VNPayService } from '@/lib/vnpay';
import { createOrder } from '@/lib/actions/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderInfo, txnRef, bankCode, shippingInfo, orderItems, userId } = body;

    // Validate input
    if (!amount || !orderInfo || !txnRef || !shippingInfo || !orderItems || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1';

    // Create order in database
    const orderResult = await createOrder({
      userId,
      shippingInfo: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        email: shippingInfo.email,
        address: shippingInfo.address,
        notes: shippingInfo.notes,
      },
      orderItems,
      totalAmount: amount,
      txnRef,
    });

    if (!orderResult.success) {
      return NextResponse.json(
        { success: false, error: orderResult.message },
        { status: 500 }
      );
    }

    const vnpayService = new VNPayService();
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/thanh-toan/ket-qua`;

    const paymentUrl = vnpayService.createPaymentUrl({
      amount,
      orderInfo,
      txnRef,
      returnUrl,
      ipAddr: ip,
      bankCode,
      locale: 'vn'
    });

    return NextResponse.json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.error('VNPay payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}