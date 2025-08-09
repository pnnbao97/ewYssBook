'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Truck, Loader2 } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs'; // Clerk hook for user data

const Checkout = () => {
  const { user } = useUser(); // Get user data from Clerk
  const { items, totalPrice, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.primaryEmailAddress?.emailAddress || '',
    shippingFullName: user?.fullName || '',
    shippingPhone: user?.phoneNumbers?.[0]?.phoneNumber || '',
    shippingAddress: '',
    paymentMethod: 'VNPAY' as const,
    bankCode: '',
    notes: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.email || !formData.shippingFullName || !formData.shippingPhone || !formData.shippingAddress) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      handleCreateOrder();
    }
  };

  const generateTxnRef = () => {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleCreateOrder = async () => {
    setIsProcessing(true);

    try {
      const txnRef = generateTxnRef();

      const orderData = {
        userId: user?.id,
        txnRef,
        amount: totalPrice,
        orderInfo: `Thanh toan don hang sach - ${formData.shippingFullName}`,
        bankCode: formData.bankCode,
        shippingInfo: {
          fullName: formData.shippingFullName,
          phone: formData.shippingPhone,
          email: formData.email,
          address: formData.shippingAddress,
          notes: formData.notes,
        },
        orderItems: items.map(item => ({
          bookId: String(item.bookId),
          quantity: item.quantity,
          version: item.version === 'color' ? 'color' : 'black_and_white',
          unitPrice: item.bookPrice,
          totalPrice: item.bookPrice * item.quantity,
        })),
      };

      const response = await fetch('/api/vnpay/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      toast.error('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = totalPrice;
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMobileMenuClick={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Giỏ hàng trống</p>
            <Link href="/">
              <Button>Quay lại mua sắm</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuClick={() => {}} />
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-cyan-700 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className={`ml-2 ${currentStep >= 1 ? 'text-cyan-700' : 'text-gray-600'}`}>
                Thông tin giao hàng
              </span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-cyan-700' : 'bg-gray-300'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-cyan-700 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className={`ml-2 ${currentStep >= 2 ? 'text-cyan-700' : 'text-gray-600'}`}>
                Phương thức thanh toán
              </span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-cyan-700' : 'bg-gray-300'}`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-cyan-700 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className={`ml-2 ${currentStep >= 3 ? 'text-cyan-700' : 'text-gray-600'}`}>
                Xác nhận đơn hàng
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Thông tin giao hàng</h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      * Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      * Họ và tên người nhận
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.shippingFullName}
                      onChange={(e) => handleInputChange('shippingFullName', e.target.value)}
                      className="mt-1"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      * Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      value={formData.shippingPhone}
                      onChange={(e) => handleInputChange('shippingPhone', e.target.value)}
                      className="mt-1"
                      placeholder=""
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">
                      * Địa chỉ giao hàng
                    </Label>
                    <Input
                      id="address"
                      value={formData.shippingAddress}
                      onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                      className="mt-1"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Ghi chú đơn hàng (tùy chọn)
                    </Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="mt-1"
                      placeholder="Ghi chú thêm cho đơn hàng..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Phương thức thanh toán</h2>
                <div className="space-y-4">
                  <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <CreditCard className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Thanh toán qua VNPay</h3>
                        <p className="text-sm text-gray-600">Thanh toán an toàn qua cổng VNPay</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Chọn phương thức thanh toán (tùy chọn):</Label>
                      <RadioGroup
                        value={formData.bankCode}
                        onValueChange={(value) => handleInputChange('bankCode', value)}
                        className="grid grid-cols-1 gap-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="" id="all" />
                          <label htmlFor="all" className="text-sm">
                            Chuyển khoản ngân hàng (tất cả ngân hàng)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="VNPAYQR" id="qr" />
                          <label htmlFor="qr" className="text-sm">
                            Thanh toán quét mã QR
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="VNBANK" id="atm" />
                          <label htmlFor="atm" className="text-sm">
                            Thẻ ATM - Tài khoản ngân hàng nội địa
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="INTCARD" id="visa" />
                          <label htmlFor="visa" className="text-sm">
                            Thẻ thanh toán quốc tế (Visa, Mastercard)
                          </label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Lưu ý:</strong> Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay để hoàn tất giao dịch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Xác nhận đơn hàng</h2>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Thông tin giao hàng
                        <Button
                          variant="link"
                          onClick={() => setCurrentStep(1)}
                          className="text-cyan-700 p-0"
                        >
                          Chỉnh sửa
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Họ tên:</strong> {formData.shippingFullName}</p>
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Điện thoại:</strong> {formData.shippingPhone}</p>
                        <p><strong>Địa chỉ:</strong> {formData.shippingAddress}</p>
                        {formData.notes && <p><strong>Ghi chú:</strong> {formData.notes}</p>}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Phương thức thanh toán
                        <Button
                          variant="link"
                          onClick={() => setCurrentStep(2)}
                          className="text-cyan-700 p-0"
                        >
                          Chỉnh sửa
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium">Thanh toán qua chuyển khoản ngân hàng</p>
                          <p className="text-sm text-gray-600">
                            {formData.bankCode === 'VNPAYQR' && 'Thanh toán quét mã QR'}
                            {formData.bankCode === 'VNBANK' && 'Thẻ ATM - Ngân hàng nội địa'}
                            {formData.bankCode === 'INTCARD' && 'Thẻ thanh toán quốc tế'}
                            {!formData.bankCode && 'Chọn phương thức tại VNPay'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          <strong>An toàn:</strong> Giao dịch được bảo mật bởi VNPay với công nghệ mã hóa hiện đại.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Sản phẩm đặt mua</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4 border-b pb-4">
                            <Image
                              src={item.bookCoverUrl || '/default-book-cover.jpg'}
                              alt={item.bookTitle}
                              width={60}
                              height={80}
                              className="object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.bookTitle}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.version === 'color' ? 'Bản màu' : 'Bản đen trắng'}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm">Số lượng: {item.quantity}</span>
                                <span className="font-medium">
                                  {(item.bookPrice * item.quantity).toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isProcessing}
                >
                  Quay lại
                </Button>
              )}
              <div className="flex gap-4 ml-auto">
                <Link href="/thanh-toan/gio-hang">
                  <Button variant="outline" disabled={isProcessing}>
                    Quay lại giỏ hàng
                  </Button>
                </Link>
                <Button
                  className="bg-gradient-to-r from-cyan-700 to-cyan-900 hover:from-cyan-800 hover:to-cyan-950 text-white"
                  onClick={handleNext}
                  disabled={
                    isProcessing ||
                    (currentStep === 1 &&
                      (!formData.email ||
                        !formData.shippingFullName ||
                        !formData.shippingPhone ||
                        !formData.shippingAddress))
                  }
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {currentStep === 1 ? 'Tiếp tục' : currentStep === 2 ? 'Tiếp tục' : 'Thanh toán qua VNPay'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                <Link href="/thanh-toan/gio-hang">
                  <Button variant="link" className="text-cyan-700 p-0">
                    Chỉnh sửa
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-12 h-16 flex-shrink-0">
                          <Image
                            src={item.bookCoverUrl || '/default-book-cover.jpg'}
                            alt={item.bookTitle}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute -top-1 -right-1 bg-cyan-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2">{item.bookTitle}</h4>
                          <p className="text-xs text-muted-foreground">
                            {item.version === 'color' ? 'Bản màu' : 'Bản đen trắng'}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {(item.bookPrice * item.quantity).toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính</span>
                      <span>{subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Phí vận chuyển</span>
                      <span className="text-green-600">Miễn phí</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-cyan-700">
                          {total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm font-medium">Miễn phí vận chuyển</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Giao hàng trong 2-3 ngày làm việc
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-700">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm font-medium">Thanh toán an toàn</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Được bảo mật bởi VNPay
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    <p>🔒 Thông tin của bạn được bảo mật an toàn</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;