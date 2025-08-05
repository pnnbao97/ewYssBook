
// app/api/vnpay/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VNPayService } from '@/lib/vnpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      orderInfo,
      txnRef,
      bankCode,
      shippingInfo
    } = body;

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1';

    const vnpayService = new VNPayService();
    
    // Create return URL (adjust according to your domain)
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/thanh-toan/ket-qua`;

    const paymentUrl = vnpayService.createPaymentUrl({
      amount,
      orderInfo: `Thanh toan don hang: ${txnRef}`,
      txnRef,
      returnUrl,
      ipAddr: ip,
      bankCode,
      locale: 'vn'
    });

    // Here you might want to save the order to database before redirecting
    // await saveOrderToDatabase(orderData);

    return NextResponse.json({
      success: true,
      paymentUrl
    });

  } catch (error) {
    console.error('VNPay payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}