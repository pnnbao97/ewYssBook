// app/thanh-toan/ket-qua/ClientPaymentResult.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

interface ClientPaymentResultProps {
  onResult: (result: PaymentResult) => void;
}

const ClientPaymentResult = ({ onResult }: ClientPaymentResultProps) => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const success = searchParams.get('success') === 'true';
    const txnRef = searchParams.get('txnRef') || '';
    const amount = parseFloat(searchParams.get('amount') || '0');
    const responseCode = searchParams.get('responseCode') || '';

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

    const result = {
      success,
      txnRef,
      amount,
      responseCode,
      message: getMessageFromCode(responseCode, success),
    };

    onResult(result);
    setLoading(false);

    if (success) {
      sessionStorage.removeItem('pendingOrder');
    }
  }, [searchParams, onResult]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-cyan-700" />
          <p className="text-lg">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return null; // Render nothing; parent handles the UI
};

export default ClientPaymentResult;