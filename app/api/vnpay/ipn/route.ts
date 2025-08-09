import { NextRequest, NextResponse } from 'next/server';
import { VNPayService } from '@/lib/vnpay';
import { updateOrderStatus } from '@/lib/actions/orders';
import { PaymentStatus, OrderStatus } from '@/lib/generated/prisma';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, string> = {};

    // Convert URLSearchParams to plain object
    searchParams.forEach((value, key) => {
      if (key.startsWith('vnp_')) {
        query[key] = value;
      }
    });

    const vnpayService = new VNPayService();
    const verification = vnpayService.verifyReturnUrl(query);

    if (!verification.isValid) {
      return NextResponse.json({
        RspCode: '97',
        Message: 'Invalid signature',
      });
    }

    const { data } = verification;
    const { vnp_TxnRef: txnRef, vnp_Amount: amount, vnp_ResponseCode: responseCode, vnp_TransactionNo: transactionNo, vnp_BankCode: bankCode } = data;

    // Find order by transaction reference
    const orderResult = await prisma.order.findFirst({
      where: { transactionId: txnRef },
    });

    if (!orderResult) {
      return NextResponse.json({
        RspCode: '01',
        Message: 'Order not found',
      });
    }

    // Verify amount
    if (orderResult.totalAmount !== Number(amount) / 100) {
      return NextResponse.json({
        RspCode: '04',
        Message: 'Invalid amount',
      });
    }

    // Check if order is already processed
    if (orderResult.paymentStatus !== 'PENDING') {
      return NextResponse.json({
        RspCode: '02',
        Message: 'Order already confirmed',
      });
    }

    // Update order status based on response code
    const isSuccess = responseCode === '00';
    const paymentStatus = isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
    const orderStatus = isSuccess ? OrderStatus.CONFIRMED : OrderStatus.CANCELLED;

    const updateResult = await updateOrderStatus({
      txnRef,
      paymentStatus,
      orderStatus,
      paymentTransactionId: transactionNo,
      bankCode,
    });

    if (!updateResult.success) {
      return NextResponse.json({
        RspCode: '99',
        Message: updateResult.message || 'Failed to update order',
      });
    }

    return NextResponse.json({
      RspCode: '00',
      Message: 'Confirm Success',
    });
  } catch (error) {
    console.error('VNPay IPN error:', error);
    return NextResponse.json({
      RspCode: '99',
      Message: 'Unknown error',
    });
  }
}