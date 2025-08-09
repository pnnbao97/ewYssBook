'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentResult {
  orderId: string;
  amount: number;
  orderInfo: string;
  transactionNo: string;
  responseCode: string;
  isValid: boolean;
}

export default function PaymentResult() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const query: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          if (key.startsWith('vnp_')) {
            query[key] = value;
          }
        });

        const response = await fetch('/api/vnpay/verify-return', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(query),
        });

        const data = await response.json();
        setResult(data);
        setLoading(false);
        // console.log('Payment verification result:', data);

        if (data.isValid && data.responseCode === '00') {
          toast.success('Thanh toán thành công!');
          // console.log('Payment result:', data);
        } else {
          toast.error(data.message || 'Thanh toán không thành công.');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setLoading(false);
        toast.error('Có lỗi xảy ra khi xác minh thanh toán.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMobileMenuClick={() => {}} />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-700 mx-auto"></div>
          <p className="mt-4 text-lg">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMobileMenuClick={() => {}} />
        <div className="container mx-auto px-4 py-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="mt-4 text-lg text-red-500">Không thể xử lý kết quả thanh toán</p>
          <Link href="/">
            <Button className="mt-4">Quay lại trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuClick={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              {result.responseCode === '00' && result.isValid ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  Thanh toán thành công
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-500" />
                  Thanh toán không thành công
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                <p className="text-sm font-medium">{result.orderId}</p>
                <p className="text-sm text-muted-foreground">Số tiền:</p>
                <p className="text-sm font-medium">
                  {(result.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </p>
                <p className="text-sm text-muted-foreground">Thông tin:</p>
                <p className="text-sm font-medium">{result.orderInfo}</p>
                <p className="text-sm text-muted-foreground">Mã giao dịch VNPay:</p>
                <p className="text-sm font-medium">{result.transactionNo}</p>
                {/* <p className="text-sm text-muted-foreground">Mã lỗi:</p>
                <p className="text-sm font-medium">{result.responseCode}</p> */}
              </div>
              {!result.isValid && (
                <p className="text-red-500 text-sm">Chữ ký không hợp lệ, giao dịch không được xác minh.</p>
              )}
              {result.isValid && result.responseCode !== '00' && (
                <p className="text-red-500 text-sm">Giao dịch thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
              )}
              <div className="flex justify-center gap-4 mt-6">
                <Link href="/">
                  <Button variant="outline">Quay lại trang chủ</Button>
                </Link>
                {result.isValid && result.responseCode === '00' && (
                  <Link href="/tai-khoan/don-hang">
                    <Button>Xem đơn hàng</Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}