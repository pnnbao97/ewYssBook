'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/use-cart';
import { SignInButton, useUser } from '@clerk/nextjs';
import { ShoppingCart, Plus, Minus, Package, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AddProps {
  bookId: number;
  isCompleted?: boolean;
  preorder?: boolean;
  selectedVersion: 'color' | 'photo';
  bookTitle: string;
  bookPrice: number;
  bookSalePrice?: number;
  bookSlug: string;
  bookCoverUrl?: string;
}

const Add = ({ 
  bookId, 
  isCompleted = true, 
  preorder = false, 
  selectedVersion,
  bookTitle,
  bookPrice,
  bookSalePrice,
  bookSlug,
  bookCoverUrl
}: AddProps) => {
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = 100
  const canPurchase = (isCompleted || preorder)
  const { addItem } = useCartStore();
  const { user } = useUser();
  const router = useRouter();

  const handleQuantity = (type: 'i' | 'd') => {
    if (type === 'd' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
    if (type === 'i' && quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleCheckout = () => {
    router.push('/thanh-toan/gio-hang');
  };

  const handlePurchase = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng', {
        description: 'Bạn cần đăng nhập để có thể mua sách',
        duration: 5000,
      });
      return;
    }
    
    if (!canPurchase) {
      toast.error('Sách hiện chưa có sẵn để đặt hàng', {
        description: 'Vui lòng thử lại sau',
        duration: 5000,
      });
      return;
    }
    
    try {
      const result = addItem(
        bookId,
        selectedVersion,
        bookTitle,
        bookSlug,
        bookCoverUrl || '',
        bookPrice,
        bookSalePrice || 0,
        maxQuantity,
        quantity
      );

      const versionText = selectedVersion === 'color' ? 'bản màu' : 'bản đen trắng';
      
      if (result.success) {
        // Hiển thị toast với checkout button cho mọi trường hợp (cả add mới và update)
        const actionText = result.isUpdate ? 'Đã cập nhật' : 'Đã thêm';
        
        toast.success(
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600">
              {actionText} {quantity} cuốn "{bookTitle}" ({versionText}) vào giỏ hàng
            </p>
          </div>,
          {
            duration: 10000,
            action: {
              label: (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-medium">Thanh toán ngay</span>
                </div>
              ),
              onClick: handleCheckout,
            },
            style: {
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '1px solid #0ea5e9',
              borderRadius: '12px',
            },
          }
        );
      } else {
        // Hiển thị warning nếu thất bại
        toast.warning(result.message, {
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
          },
        });
      }
    } catch (error: any) {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng', {
        description: error.message || 'Vui lòng thử lại sau',
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
        },
      });
    }
  };

  const versionText = selectedVersion === 'color' ? 'bản màu' : 'bản đen trắng';

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg font-semibold text-foreground">Thêm vào giỏ hàng</h4>
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Tình trạng kho</p>
              <p className="text-xs text-muted-foreground">Phiên bản {versionText}</p>
            </div>
          </div>
        </div>

        {/* Price Display */}
        {(bookPrice || bookSalePrice) && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Giá {versionText}:</span>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  {(bookPrice || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Chọn số lượng
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-background border-2 border-border rounded-xl p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleQuantity('d')}
                disabled={quantity <= 1 || !canPurchase}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="w-16 text-center">
                <span className="text-lg font-semibold text-foreground">{quantity}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleQuantity('i')}
                disabled={quantity >= maxQuantity || !canPurchase}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quantity Info */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Tối đa <span className="font-medium text-foreground">{maxQuantity}</span> cuốn
              </p>
              {quantity === maxQuantity && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  Đã đạt giới hạn số lượng
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Price Preview */}
        {(bookPrice || bookSalePrice) && (
          <div className="p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tổng cộng ({quantity} cuốn):</span>
              <span className="text-lg font-bold text-foreground">
                {((bookPrice || 0) * quantity).toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="pt-4">
          <Button
            onClick={handlePurchase}
            disabled={!canPurchase || !user}
            className={`w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
              canPurchase && user
                ? 'bg-gradient-to-r from-cyan-800 to-cyan-600 hover:from-cyan-900 hover:to-cyan-700 text-white shadow-blue-200'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              {isCompleted ? 'Thêm vào giỏ hàng' : preorder ? 'Đặt trước ngay' : 'Thêm vào giỏ hàng'}
            </div>
          </Button>

          {/* Status Messages */}
          {!user && (
            <p className="text-sm text-amber-600 text-center mt-3 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Vui lòng <span>
              <span className="font-bold">
                <SignInButton mode="modal">
                  đăng nhập
                </SignInButton>
              </span>
                </span> để thực hiện mua hàng
            </p>
          )}
          
          {!canPurchase && user && (
            <p className="text-sm text-destructive text-center mt-3 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Sản phẩm hiện không khả dụng
            </p>
          )}

          {canPurchase && user && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                Sẵn sàng thêm <span className="font-medium">{quantity} cuốn</span> ({versionText}) vào giỏ hàng
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Add;