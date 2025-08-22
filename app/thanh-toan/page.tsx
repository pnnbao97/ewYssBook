'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Truck, Loader2, Banknote, Copy, Check, Tag, Wallet } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

const Checkout = () => {
  const { user } = useUser();
  const { items, totalPrice, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [formData, setFormData] = useState({
    email: user?.primaryEmailAddress?.emailAddress || '',
    shippingFullName: user?.fullName || '',
    shippingPhone: user?.phoneNumbers?.[0]?.phoneNumber || '',
    shippingAddress: '',
    paymentMethod: 'PAYMENTWALL' as 'COD' | 'PAYMENTWALL',
    notes: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Đã sao chép!');
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      toast.error('Không thể sao chép');
    }
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
      if (formData.paymentMethod === 'PAYMENTWALL') {
        handlePaymentWallPayment();
      } else {
        handleCODPayment();
      }
    }
  };

  const generateOrderRef = () => {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Calculate discounted amount for Paymentwall
  const getDiscountedAmount = (paymentMethod: string) => {
    if (paymentMethod === 'PAYMENTWALL') {
      return totalPrice * 0.95; // 5% discount
    }
    return totalPrice;
  };

  const getDiscountAmount = (paymentMethod: string) => {
    if (paymentMethod === 'PAYMENTWALL') {
      return totalPrice * 0.05; // 5% discount amount
    }
    return 0;
  };

  const handlePaymentWallPayment = async () => {
    setIsProcessing(true);

    try {
      const discountedAmount = getDiscountedAmount('PAYMENTWALL');
      const orderRef = generateOrderRef();

      const orderData = {
        userId: user?.id,
        orderRef,
        amount: discountedAmount,
        currency: 'VND', // Paymentwall hỗ trợ VND
        paymentMethod: 'PAYMENTWALL',
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

      const response = await fetch('/api/paymentwall/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        // Lưu thông tin đơn hàng vào sessionStorage
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
        
        // Chuyển hướng đến Paymentwall
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.error || 'Failed to create Paymentwall payment');
      }
    } catch (error) {
      console.error('Paymentwall payment error:', error);
      toast.error('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCODPayment = async () => {
    setIsProcessing(true);

    try {
      const orderRef = generateOrderRef();

      const orderData = {
        userId: user?.id,
        orderRef,
        amount: totalPrice, // No discount for COD
        paymentMethod: 'COD',
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

      const response = await fetch('/api/orders/create-cod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        toast.success('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.');
        window.location.href = `/don-hang/${result.orderId}`;
      } else {
        throw new Error(result.error || 'Failed to create COD order');
      }
    } catch (error) {
      console.error('COD payment error:', error);
      toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = totalPrice;
  const shippingFee = 0;
  const discountAmount = getDiscountAmount(formData.paymentMethod);
  const total = getDiscountedAmount(formData.paymentMethod) + shippingFee;
  const isEligibleForCOD = total < 1000000; // 1 million VND

  const getBackButtonText = () => {
    if (currentStep === 2) return 'Quay lại thông tin giao hàng';
    if (currentStep === 3) return 'Quay lại phương thức thanh toán';
    return 'Quay lại';
  };

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
                      placeholder="0123456789"
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
                  {/* Paymentwall Payment Option (Default) */}
                  <div 
                    className={`border rounded-lg p-6 cursor-pointer transition-all ${
                      formData.paymentMethod === 'PAYMENTWALL' 
                        ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500' 
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => handleInputChange('paymentMethod', 'PAYMENTWALL')}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.paymentMethod === 'PAYMENTWALL' 
                          ? 'bg-purple-500 border-purple-500' 
                          : 'border-gray-300'
                      }`}>
                        {formData.paymentMethod === 'PAYMENTWALL' && (
                          <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                        )}
                      </div>
                      <Wallet className="w-8 h-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Paymentwall</h3>
                        <p className="text-sm text-gray-600">Visa, Mastercard, ATM nội địa</p>
                      </div>
                    </div>
                    <div className="ml-7">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Mặc định
                        </span>
                        {/* <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Xác nhận ngay
                        </span> */}
                        {/* <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Đa dạng
                        </span> */}
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Giảm 5%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Hỗ trợ thẻ quốc tế và ATM nội địa. 
                        {/* <strong className="text-purple-600"> Xác nhận đơn hàng ngay lập tức!</strong>  */}
                        <strong className="text-red-600"> Giảm 5% tổng đơn hàng!</strong>
                      </p>
                    </div>
                  </div>

                  {/* COD Payment Option */}
                  <div 
                    className={`border rounded-lg p-6 cursor-pointer transition-all ${
                      !isEligibleForCOD 
                        ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                        : formData.paymentMethod === 'COD' 
                          ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500' 
                          : 'bg-white border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => isEligibleForCOD && handleInputChange('paymentMethod', 'COD')}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.paymentMethod === 'COD' && isEligibleForCOD
                          ? 'bg-orange-500 border-orange-500' 
                          : 'border-gray-300'
                      }`}>
                        {formData.paymentMethod === 'COD' && isEligibleForCOD && (
                          <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                        )}
                      </div>
                      <Banknote className="w-8 h-8 text-orange-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Thanh toán khi nhận hàng (COD)</h3>
                        <p className="text-sm text-gray-600">Tiền mặt khi giao hàng</p>
                      </div>
                    </div>
                    <div className="ml-7">
                      {isEligibleForCOD ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            {/* <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Dưới 1 triệu
                            </span> */}
                            {/* <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Thuận tiện
                            </span> */}
                          </div>
                          <p className="text-sm text-gray-600">
                            Thanh toán bằng tiền mặt khi nhận hàng. Chỉ áp dụng cho đơn hàng dưới 1.000.000 VNĐ.
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Không khả dụng
                          </span>
                          <p className="text-sm text-gray-600">
                            COD chỉ áp dụng cho đơn hàng dưới 1.000.000 VNĐ
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">💡 Gợi ý chọn phương thức thanh toán:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Paymentwall:</strong> Hỗ trợ đa dạng phương thức (thẻ quốc tế, ATM nội địa)   + <span className="text-red-600 font-medium">Giảm 5%</span></li>
                      <li>• <strong>COD:</strong> Dành cho đơn hàng dưới 1 triệu, thanh toán khi nhận</li>
                    </ul>
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
                        {formData.paymentMethod === 'PAYMENTWALL' ? (
                          <>
                            <Wallet className="w-6 h-6 text-purple-600" />
                            <div>
                              <p className="font-medium">Paymentwall</p>
                              <p className="text-sm text-gray-600">
                                Thẻ quốc tế/nội địa
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Tag className="w-3 h-3 text-red-600" />
                                <span className="text-sm text-red-600 font-medium">Giảm 5%</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Banknote className="w-6 h-6 text-orange-600" />
                            <div>
                              <p className="font-medium">Thanh toán khi nhận hàng</p>
                              <p className="text-sm text-gray-600">
                                Tiền mặt khi giao hàng
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          <strong>An toàn:</strong> Giao dịch được bảo mật với các tiêu chuẩn bảo mật cao nhất.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* <Card>
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
                  </Card> */}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Link href="/thanh-toan/gio-hang">
                <Button variant="outline" disabled={isProcessing}>
                  Quay lại giỏ hàng
                </Button>
              </Link>
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={isProcessing}
                  >
                    {getBackButtonText()}
                  </Button>
                )}
                <Button
                  className={`${
                    formData.paymentMethod === 'PAYMENTWALL'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900'
                      : 'bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900'
                  } text-white`}
                  onClick={handleNext}
                  disabled={
                    isProcessing ||
                    (currentStep === 1 &&
                      (!formData.email ||
                        !formData.shippingFullName ||
                        !formData.shippingPhone ||
                        !formData.shippingAddress)) ||
                    (formData.paymentMethod === 'COD' && !isEligibleForCOD)
                  }
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {currentStep === 1 ? 'Tiếp tục' : currentStep === 2 ? 'Tiếp tục' : 
                        formData.paymentMethod === 'PAYMENTWALL' ? 'Thanh toán qua Paymentwall' : 'Đặt hàng (COD)'}
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
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1 text-red-600">
                          <Tag className="w-3 h-3" />
                          Giảm giá (5%)
                        </span>
                        <span className="text-red-600 font-medium">
                          -{discountAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-cyan-700">
                          {total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="text-xs text-red-600 text-right mt-1">
                          Tiết kiệm: {discountAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </div>
                      )}
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
                  
                  <div className={`${
                    formData.paymentMethod === 'PAYMENTWALL' 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-orange-50 border-orange-200'
                  } border rounded-lg p-3`}>
                    <div className={`flex items-center gap-2 ${
                      formData.paymentMethod === 'PAYMENTWALL' ? 'text-purple-700' : 'text-orange-700'
                    }`}>
                      {formData.paymentMethod === 'PAYMENTWALL' ? (
                        <Wallet className="w-4 h-4" />
                      ) : (
                        <Banknote className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {formData.paymentMethod === 'PAYMENTWALL' ? 'Paymentwall' : 'Thanh toán COD'}
                      </span>
                      {formData.paymentMethod === 'PAYMENTWALL' && (
                        <div className="flex items-center gap-1 text-red-700">
                          <Tag className="w-3 h-3" />
                          <span className="text-xs font-medium">-5%</span>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      formData.paymentMethod === 'PAYMENTWALL' ? 'text-purple-600' : 'text-orange-600'
                    }`}>
                      {formData.paymentMethod === 'PAYMENTWALL' 
                        ? 'Thẻ quốc tế/nội địa, Ví điện tử + Giảm 5%' 
                        : 'Thanh toán khi nhận hàng'
                      }
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