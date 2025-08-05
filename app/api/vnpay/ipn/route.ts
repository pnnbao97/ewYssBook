// app/api/vnpay/ipn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VNPayService } from '@/lib/vnpay';

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
        Message: 'Invalid signature'
      });
    }

    const { data } = verification;
    
    // Here you would:
    // 1. Find the order in your database using data.txnRef
    // 2. Check if the order exists and amount matches
    // 3. Update order status based on data.isSuccess
    // 4. Return appropriate response

    /*
    try {
      const order = await findOrderByTxnRef(data.txnRef);
      
      if (!order) {
        return NextResponse.json({
          RspCode: '01',
          Message: 'Order not found'
        });
      }

      if (order.amount !== data.amount) {
        return NextResponse.json({
          RspCode: '04',
          Message: 'Invalid amount'
        });
      }

      if (order.status !== 0) { // Already processed
        return NextResponse.json({
          RspCode: '02',
          Message: 'Order already confirmed'
        });
      }

      // Update order status
      const newStatus = data.isSuccess ? 1 : 2; // 1: success, 2: failed
      await updateOrderStatus(order.id, newStatus, data);

      return NextResponse.json({
        RspCode: '00',
        Message: 'Confirm Success'
      });

    } catch (dbError) {
      console.error('Database error in IPN:', dbError);
      return NextResponse.json({
        RspCode: '99',
        Message: 'Unknown error'
      });
    }
    */

    // For now, return success (you should implement the database logic above)
    return NextResponse.json({
      RspCode: '00',
      Message: 'Confirm Success'
    });

  } catch (error) {
    console.error('VNPay IPN error:', error);
    return NextResponse.json({
      RspCode: '99',
      Message: 'Unknown error'
    });
  }
}