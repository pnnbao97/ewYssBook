'use client'
import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore, CartItem } from "@/hooks/use-cart";
import { debounce } from 'lodash';

const Cart = () => {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  const [discountCode, setDiscountCode] = useState("");
  
  // State để lưu quantity tạm thời cho mỗi item
  const [tempQuantities, setTempQuantities] = useState<{[key: string]: number}>({});

  // Khởi tạo tempQuantities khi items thay đổi
  useEffect(() => {
    const initialQuantities: {[key: string]: number} = {};
    items.forEach(item => {
      initialQuantities[item.id] = item.quantity;
    });
    setTempQuantities(initialQuantities);
  }, [items]);

  // Tạo debounced update function với useMemo để tránh recreate
  const debouncedUpdate = useMemo(
    () => debounce((itemId: string, newQuantity: number) => {
      updateQuantity(itemId, newQuantity);
    }, 500),
    [updateQuantity]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  // Validate và normalize quantity
  const normalizeQuantity = useCallback((quantity: number, maxAvailable: number) => {
    if (quantity <= 0) return 0;
    return Math.min(quantity, maxAvailable);
  }, []);

  // Handle quantity change (unified function cho cả button và input)
  const handleQuantityChange = useCallback((itemId: string, newQuantity: number, item: CartItem) => {
    const maxAvailable = item.maxQuantity || 999;
    const normalizedQuantity = normalizeQuantity(newQuantity, maxAvailable);

    // Update temp state ngay lập tức (cho UI responsive)
    setTempQuantities(prev => ({
      ...prev,
      [itemId]: normalizedQuantity
    }));

    // Debounced update
    debouncedUpdate(itemId, normalizedQuantity);
  }, [normalizeQuantity, debouncedUpdate]);

  // Handle input blur (immediate update khi blur)
  const handleInputBlur = useCallback((itemId: string, item: CartItem) => {
    const currentTemp = tempQuantities[itemId] ?? item.quantity;
    
    // Cancel pending debounced call và update ngay lập tức
    debouncedUpdate.cancel();
    
    if (currentTemp !== item.quantity) {
      updateQuantity(itemId, currentTemp);
    }
  }, [tempQuantities, debouncedUpdate, updateQuantity]);

  const handleApplyDiscount = () => {
    // Implement discount logic here
    console.log("Applying discount code:", discountCode);
  };

  const subtotal = totalPrice;
  const grandTotal = subtotal; // Can add shipping, taxes here

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuClick={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">GIỎ HÀNG</h1>
        
        {items.length > 0 && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Bạn có <span className="font-medium">{items.length} sản phẩm</span> trong giỏ hàng.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-3">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Giỏ hàng trống</p>
                <Link href="/">
                  <Button>Tiếp tục mua sắm</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-4">
                  <div className="col-span-6">Sản phẩm</div>
                  <div className="col-span-2 text-center">Giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-center">Tổng tiền</div>
                </div>

                {/* Cart Items */}
                {items.map((item) => {
                  const currentQuantity = tempQuantities[item.id] ?? item.quantity;
                  const itemPrice = item.bookPrice;
                  const maxAvailable = item.maxQuantity || 999;
                  const hasDiscount = item.bookSalePrice && item.bookSalePrice < item.bookPrice;

                  return (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b pb-6">
                      {/* Item Info */}
                      <div className="md:col-span-6">
                        <div className="flex gap-4">
                          <div className="relative w-20 h-24 flex-shrink-0">
                            <Image
                              src={item.bookCoverUrl || "/default-book-cover.jpg"}
                              alt={item.bookTitle || `Book ${item.bookId}`}
                              width={80}
                              height={96}
                              className="w-full h-full object-cover rounded"
                            />
                            {hasDiscount && (
                              <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                                SALE
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1">
                            <Link 
                              href={`/sach/${item.bookSlug}`}
                              className="font-medium text-sm mb-1 hover:underline text-amber-700"
                            >
                              {item.bookTitle || `Book ${item.bookId}`}
                            </Link>
                            <p className="text-xs text-muted-foreground mb-1">
                              Phiên bản: {item.version === 'color' ? 'Bản màu' : 'Bản đen trắng'}
                            </p>
                            <p className="text-xs text-muted-foreground">Sách</p>
                            {maxAvailable <= 10 && (
                              <p className="text-xs text-red-500 mt-2">
                                Chỉ còn {maxAvailable} cuốn
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 text-center">
                        <div className="flex flex-col items-center">
                          {hasDiscount ? (
                            <>
                              <span className="text-sm line-through text-muted-foreground">
                                {item.bookPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                              </span>
                              <span className="text-lg font-medium text-destructive">
                                {(item.bookSalePrice || item.bookPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-medium">
                              {itemPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, currentQuantity - 1, item)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <Input
                            type="number"
                            min="0"
                            max={maxAvailable}
                            value={currentQuantity === 0 ? '' : currentQuantity}
                            onChange={(e) => {
                              const numValue = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                              handleQuantityChange(item.id, numValue, item);
                            }}
                            onBlur={() => handleInputBlur(item.id, item)}
                            className="w-16 text-center border rounded px-2 py-1 text-sm"
                          />
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, currentQuantity + 1, item)}
                            disabled={currentQuantity >= maxAvailable}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="md:col-span-2 text-center flex items-center justify-between md:justify-center">
                        <span className="font-medium">
                          {(itemPrice * currentQuantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive md:ml-2"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Cart Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button variant="outline" onClick={() => clearCart()}>
                    XÓA GIỎ HÀNG
                  </Button>
                  <Button variant="outline">
                    CẬP NHẬT GIỎ HÀNG
                  </Button>
                  <Button variant="link" className="text-primary">
                    <Link href="/">TIẾP TỤC MUA SẮM</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Discount Codes */}
              <div>
                <h3 className="font-medium mb-4">Mã giảm giá</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã giảm giá"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <Button 
                    className="bg-primary hover:bg-primary-hover"
                    onClick={handleApplyDiscount}
                  >
                    ÁP DỤNG
                  </Button>
                </div>
              </div>

              {/* Order Totals */}
              <div className="border-t pt-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span>Miễn phí</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span>{grandTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Đã bao gồm thuế VAT nếu có.
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/thanh-toan">
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-700 to-cyan-900 text-white font-semibold py-3"
                  disabled={items.length === 0}
                >
                  THANH TOÁN
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;