import { NextRequest, NextResponse } from 'next/server';
import { VNPayService } from '@/lib/vnpay';

export async function POST(request: NextRequest) {
  try {
    const query = await request.json();
    const vnpayService = new VNPayService();
    const verification = vnpayService.verifyReturnUrl(query);
    // console.log('VNPay verification result:', verification);

    return NextResponse.json({
      isValid: verification.isValid,
      orderId: verification.data.txnRef,
      amount: Number(verification.data.amount),
      orderInfo: verification.data.orderInfo,
      transactionNo: verification.data.transactionNo,
      responseCode: verification.data.responseCode,
      message: verification.isValid ? 'Verification successful' : 'Invalid signature',
    });
  } catch (error) {
    // console.error('VNPay verify return error:', error);
    return NextResponse.json(
      { isValid: false, message: 'Error verifying payment' },
      { status: 500 }
    );
  }
}