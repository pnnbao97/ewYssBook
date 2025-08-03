'use client'
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, CreditCard, Truck } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    shippingFullName: "",
    shippingPhone: "",
    shippingAddress: "",
    paymentMethod: "BANK_TRANSFER" as const,
    notes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      // Process payment
      console.log("Processing payment...", formData);
      // Here you would typically call your API to create the order
      handleCreateOrder();
    }
  };

  const handleCreateOrder = async () => {
    // Mock order creation
    const orderData = {
      shippingFullName: formData.shippingFullName,
      shippingPhone: formData.shippingPhone,
      shippingEmail: formData.email,
      shippingAddress: formData.shippingAddress,
      subtotal: totalPrice,
      shippingFee: 0,
      couponDiscount: 0,
      totalAmount: totalPrice,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      orderItems: items.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity,
        version: item.version === 'color' ? 'color' : 'black_and_white',
        unitPrice: item.bookPrice,
        totalPrice: item.bookPrice * item.quantity
      }))
    };

    console.log("Creating order:", orderData);
    
    // After successful order creation, clear cart and redirect
    clearCart();
    // redirect to success page or order confirmation
  };

  const subtotal = totalPrice;
  const shippingFee = 0; // Free shipping
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
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? "bg-cyan-700 text-white" : "bg-gray-300 text-gray-600"
              }`}>
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span className={`ml-2 ${currentStep >= 1 ? "text-cyan-700" : "text-gray-600"}`}>
                Thông tin giao hàng
              </span>
            </div>
            
            {/* Connector */}
            <div className={`w-12 h-0.5 ${currentStep >= 2 ? "bg-cyan-700" : "bg-gray-300"}`} />
            
            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-cyan-700 text-white" : "bg-gray-300 text-gray-600"
              }`}>
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span className={`ml-2 ${currentStep >= 2 ? "text-cyan-700" : "text-gray-600"}`}>
                Phương thức thanh toán
              </span>
            </div>

            {/* Connector */}
            <div className={`w-12 h-0.5 ${currentStep >= 3 ? "bg-cyan-700" : "bg-gray-300"}`} />
            
            {/* Step 3 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? "bg-cyan-700 text-white" : "bg-gray-300 text-gray-600"
              }`}>
                3
              </div>
              <span className={`ml-2 ${currentStep >= 3 ? "text-cyan-700" : "text-gray-600"}`}>
                Xác nhận đơn hàng
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Thông tin giao hàng</h2>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      * Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      * Họ và tên người nhận
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.shippingFullName}
                      onChange={(e) => handleInputChange("shippingFullName", e.target.value)}
                      className="mt-1"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      * Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      value={formData.shippingPhone}
                      onChange={(e) => handleInputChange("shippingPhone", e.target.value)}
                      className="mt-1"
                      placeholder="0123456789"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">
                      * Địa chỉ giao hàng
                    </Label>
                    <Input
                      id="address"
                      value={formData.shippingAddress}
                      onChange={(e) => handleInputChange("shippingAddress", e.target.value)}
                      className="mt-1"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Ghi chú đơn hàng (tùy chọn)
                    </Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="mt-1"
                      placeholder="Ghi chú thêm cho đơn hàng..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Phương thức thanh toán</h2>
                
                <div className="space-y-4">
                  {/* Bank Transfer - Only Option */}
                  <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Chuyển khoản ngân hàng</h3>
                        <p className="text-sm text-gray-600">Thanh toán qua chuyển khoản trực tiếp</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-white rounded-lg border">
                      <h4 className="font-medium mb-3">Thông tin tài khoản:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngân hàng:</span>
                          <span className="font-medium">Vietcombank</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số tài khoản:</span>
                          <span className="font-medium font-mono">1234567890</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chủ tài khoản:</span>
                          <span className="font-medium">CÔNG TY ABC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nội dung:</span>
                          <span className="font-medium">Thanh toán đơn hàng + SĐT</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>Lưu ý:</strong> Vui lòng ghi rõ số điện thoại trong nội dung chuyển khoản để chúng tôi xác nhận đơn hàng nhanh chóng.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Xác nhận đơn hàng</h2>
                
                <div className="space-y-6">
                  {/* Shipping Info Review */}
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
                  
                  {/* Payment Method Review */}
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
                          <p className="font-medium">Chuyển khoản ngân hàng</p>
                          <p className="text-sm text-gray-600">Vietcombank - 1234567890</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-sm text-orange-800">
                          <strong>Quan trọng:</strong> Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán từ bạn.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Items Review */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sản phẩm đặt mua</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4 border-b pb-4">
                            <Image
                              src={item.bookCoverUrl || "/default-book-cover.jpg"}
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
                                  {(item.bookPrice * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
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

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Quay lại
                </Button>
              )}
              
              <div className="flex gap-4 ml-auto">
                <Link href="/thanh-toan/gio-hang">
                  <Button variant="outline">
                    Quay lại giỏ hàng
                  </Button>
                </Link>
                
                <Button 
                  className="bg-gradient-to-r from-cyan-700 to-cyan-900 hover:from-cyan-800 hover:to-cyan-950 text-white"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!formData.email || !formData.shippingFullName || !formData.shippingPhone || !formData.shippingAddress))
                  }
                >
                  {currentStep === 1 ? "Tiếp tục" : currentStep === 2 ? "Xem lại đơn hàng" : "Hoàn tất đặt hàng"}
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
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
                  {/* Order Items Summary */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-12 h-16 flex-shrink-0">
                          <Image
                            src={item.bookCoverUrl || "/default-book-cover.jpg"}
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
                            {(item.bookPrice * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
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

                  {/* Shipping Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm font-medium">Miễn phí vận chuyển</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Giao hàng trong 2-3 ngày làm việc
                    </p>
                  </div>

                  {/* Security Notice */}
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