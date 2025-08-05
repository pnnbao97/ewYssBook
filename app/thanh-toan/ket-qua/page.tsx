// app/thanh-toan/ket-qua/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';

interface PaymentResult {
  success: boolean;
  txnRef: string;
  amount: number;
  responseCode: string;
  message: string;
}

const PaymentResultPage = () => {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const success = searchParams.get('success') === 'true';
    const txnRef = searchParams.get('txnRef') || '';
    const amount = parseFloat(searchParams.get('amount') || '0');
    const responseCode = searchParams.get('responseCode') || '';

    // Map response codes to user-friendly messages
    const getMessageFromCode = (code: string, isSuccess: boolean): string => {
      if (isSuccess) {
        return 'Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.';
      }

      switch (code) {
        case '07':
          return 'Giao dịch bị nghi ngờ gian lận. Vui lòng liên hệ với chúng tôi.';
        case '09':
          return 'Thẻ/tài khoản của bạn chưa đăng ký dịch vụ Internet Banking.';
        case '10':
          return 'Bạn đã nhập sai thông tin quá 3 lần. Vui lòng thử lại sau.';
        case '11':
          return 'Đã hết hạn thanh toán. Vui lòng thực hiện lại giao dịch.';
        case '12':
          return 'Thẻ/tài khoản của bạn đã bị khóa.';
        case '13':
          return 'Mật khẩu OTP không chính xác. Vui lòng thử lại.';
        case '24':
          return 'Bạn đã hủy giao dịch.';
        case '51':
          return 'Tài khoản không đủ số dư để thực hiện giao dịch.';
        case '65':
          return 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.';
        case '75':
          return 'Ngân hàng đang bảo trì. Vui lòng thử lại sau.';
        case '79':
          return 'Bạn đã nhập sai mật khẩu thanh toán quá số lần quy định.';
        default:
          return 'Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
      }
    };

    setResult({
      success,
      txnRef,
      amount,
      responseCode,
      message: getMessageFromCode(responseCode, success)
    });

    setLoading(false);

    // Clear pending order from session storage if payment was successful
    if (success) {
      sessionStorage.removeItem('pendingOrder');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMobileMenuClick={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-cyan-700" />
              <p className="text-lg">Đang xử lý kết quả thanh toán...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuClick={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4">
                {result?.success ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500" />
                )}
              </div>
              <CardTitle className={`text-2xl ${result?.success ? 'text-green-700' : 'text-red-700'}`}>
                {result?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Payment Status Message */}
              <div className={`p-4 rounded-lg border ${
                result?.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <p className="text-center font-medium">
                  {result?.message}
                </p>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg mb-3">Chi tiết giao dịch</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-medium">{result?.txnRef}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-medium text-cyan-700">
                      {result?.amount.toLocaleString('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã phản hồi:</span>
                    <span className="font-medium">{result?.responseCode}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">
                      {new Date().toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Success Actions */}
              {result?.success && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Bước tiếp theo:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút</li>
                    <li>• Đơn hàng sẽ được xử lý và giao trong 2-3 ngày làm việc</li>
                    <li>• Chúng tôi sẽ gọi điện xác nhận thông tin giao hàng</li>
                  </ul>
                </div>
              )}

              {/* Failed Payment Actions */}
              {!result?.success && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Bạn có thể:</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Thử lại với phương thức thanh toán khác</li>
                    <li>• Kiểm tra thông tin thẻ/tài khoản</li>
                    <li>• Liên hệ ngân hàng nếu gặp vấn đề kỹ thuật</li>
                    <li>• Liên hệ hotline hỗ trợ: 1900-1234</li>
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {result?.success ? (
                  <>
                    <Link href="/" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-cyan-700 to-cyan-900 hover:from-cyan-800 hover:to-cyan-950">
                        Tiếp tục mua sắm
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/tai-khoan/don-hang" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Xem đơn hàng
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/thanh-toan/gio-hang" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-cyan-700 to-cyan-900 hover:from-cyan-800 hover:to-cyan-950">
                        Thử lại thanh toán
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Về trang chủ
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Support Contact */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Cần hỗ trợ? Liên hệ:{' '}
                  <a href="tel:1900-1234" className="text-cyan-700 font-medium hover:underline">
                    1900-1234
                  </a>
                  {' '}hoặc{' '}
                  <a href="mailto:support@example.com" className="text-cyan-700 font-medium hover:underline">
                    support@example.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;