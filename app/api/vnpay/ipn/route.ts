// app/api/vnpay/ipn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VNPayService } from '@/lib/vnpay';
import { updateOrderStatus } from '@/lib/actions/orders';
import { PaymentStatus, OrderStatus } from '@/lib/generated/prisma';
import prisma from '@/lib/prisma';

async function handleVNPayIPN(request: NextRequest) {
  try {
    // Lấy tất cả query parameters từ VNPay
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, string> = {};

    // Convert URLSearchParams thành plain object
    searchParams.forEach((value, key) => {
      if (key.startsWith('vnp_')) {
        query[key] = value;
      }
    });

    console.log('VNPay IPN received:', query);

    // Kiểm tra các tham số bắt buộc
    const requiredParams = ['vnp_TxnRef', 'vnp_Amount', 'vnp_ResponseCode', 'vnp_TransactionStatus', 'vnp_SecureHash'];
    for (const param of requiredParams) {
      if (!query[param]) {
        console.log(`Missing required parameter: ${param}`);
        return NextResponse.json({
          RspCode: '99',
          Message: 'Missing required parameters',
        });
      }
    }

    // Khởi tạo VNPayService và verify IPN
    const vnpayService = new VNPayService();
    const verification = vnpayService.verifyIPN(query);

    console.log('VNPay IPN verification result:', verification);

    // Nếu signature không hợp lệ
    if (!verification.isValid) {
      console.log('Invalid VNPay signature');
      return NextResponse.json({
        RspCode: verification.rspCode,
        Message: verification.message,
      });
    }

    // Lấy thông tin từ VNPay
    const { data } = verification;
    const { 
      txnRef, 
      amount, 
      orderInfo,
      transactionNo, 
      responseCode, 
      transactionStatus,
      bankCode,
      payDate 
    } = data;

    console.log('Processing order with txnRef:', txnRef);

    // Tìm order trong database bằng transaction reference
    const order = await prisma.order.findFirst({
      where: { transactionId: txnRef },
      include: {
        user: true,
        orderItems: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!order) {
      console.log('Order not found for txnRef:', txnRef);
      return NextResponse.json({
        RspCode: '01',
        Message: 'Order Not Found',
      });
    }

    console.log('Found order:', order.id, 'with amount:', order.totalAmount, 'VNPay amount:', amount);

    // Kiểm tra số tiền có khớp không (order.totalAmount nên được lưu theo đơn vị VND)
    // VNPay gửi amount đã chia 100, nên order.totalAmount cũng phải theo format này
    const amountDifference = Math.abs(order.totalAmount - amount);
    if (amountDifference > 0.01) {
      console.log('Amount mismatch - Order:', order.totalAmount, 'VNPay:', amount);
      return NextResponse.json({
        RspCode: '04',
        Message: 'Invalid amount',
      });
    }

    // Kiểm tra trạng thái đơn hàng - tránh xử lý trùng lặp
    if (order.paymentStatus !== PaymentStatus.PENDING) {
      console.log('Order already processed with status:', order.paymentStatus);
      return NextResponse.json({
        RspCode: '02',
        Message: 'Order already confirmed',
      });
    }

    // Xác định trạng thái thanh toán dựa trên response từ VNPay
    let paymentStatus: PaymentStatus;
    let orderStatus: OrderStatus;

    if (responseCode === '00' && transactionStatus === '00') {
      // Giao dịch thành công
      paymentStatus = PaymentStatus.COMPLETED;
      orderStatus = OrderStatus.CONFIRMED;
      console.log('Payment successful for order:', order.id);
    } else {
      // Giao dịch thất bại hoặc bị hủy
      paymentStatus = PaymentStatus.FAILED;
      orderStatus = OrderStatus.CANCELLED;
      console.log('Payment failed for order:', order.id, 'Response code:', responseCode, 'Transaction status:', transactionStatus);
    }

    // Cập nhật trạng thái đơn hàng
    const updateResult = await updateOrderStatus({
      txnRef,
      paymentStatus,
      orderStatus,
      paymentTransactionId: transactionNo,
      bankCode,
    });

    if (!updateResult.success) {
      console.error('Failed to update order status:', updateResult.message);
      return NextResponse.json({
        RspCode: '99',
        Message: updateResult.message || 'Failed to update order status',
      });
    }

    console.log('Order status updated successfully for:', order.id);

    // Trả về response thành công cho VNPay
    return NextResponse.json({
      RspCode: '00',
      Message: 'Confirm Success',
    });

  } catch (error) {
    console.error('VNPay IPN processing error:', error);
    return NextResponse.json({
      RspCode: '99',
      Message: 'Unknown error',
    });
  }
}

// Handle both GET and POST methods
export async function GET(request: NextRequest) {
  return handleVNPayIPN(request);
}

export async function POST(request: NextRequest) {
  return handleVNPayIPN(request);
}