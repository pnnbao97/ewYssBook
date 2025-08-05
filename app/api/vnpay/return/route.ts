// app/api/vnpay/return/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VNPayService } from '@/lib/vnpay';
import { redirect } from 'next/navigation';

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
      // Redirect to error page
      return NextResponse.redirect(
        new URL('/thanh-toan/loi?error=invalid_signature', request.url)
      );
    }

    const { data } = verification;
    
    // Redirect to result page with payment info
    const resultUrl = new URL('/thanh-toan/ket-qua', request.url);
    resultUrl.searchParams.set('success', data.isSuccess.toString());
    resultUrl.searchParams.set('txnRef', data.txnRef);
    resultUrl.searchParams.set('amount', data.amount.toString());
    resultUrl.searchParams.set('responseCode', data.responseCode);
    
    return NextResponse.redirect(resultUrl);

  } catch (error) {
    console.error('VNPay return URL error:', error);
    return NextResponse.redirect(
      new URL('/thanh-toan/loi?error=processing_error', request.url)
    );
  }
}