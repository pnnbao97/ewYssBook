"use client";
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface CustomizeProductsProps {
  colorPrice: number;
  photoPrice: number;
  hasColorSale: boolean;
  colorSaleAmount: number;
  book: {
    title: string;
    slug: string;
    coverUrl: string;
  };
  onPriceChange: (price: number) => void;
  onVersionChange: (version: 'color' | 'photo') => void;
}

const CustomizeProducts = ({
  colorPrice,
  photoPrice,
  hasColorSale,
  colorSaleAmount,
  book,
  onPriceChange,
  onVersionChange,
}: CustomizeProductsProps) => {
  const [selectedVersion, setSelectedVersion] = useState<'color' | 'photo'>('color');
  const displayColorPrice = hasColorSale ? colorPrice - colorSaleAmount : colorPrice;

  const handleVersionChange = (version: 'color' | 'photo') => {
    setSelectedVersion(version);
    const price = version === 'color' ? displayColorPrice : photoPrice;
    onPriceChange(price);
    onVersionChange(version);
  };

  // Helper function để format tiền VND
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const versions = [
    {
      type: 'color' as const,
      title: 'Bản Màu',
      description: 'Bìa cứng, in màu cao cấp',
      price: displayColorPrice,
      originalPrice: hasColorSale ? colorPrice : null,
      features: ['In màu chất lượng cao', 'Bìa cứng bền đẹp', 'Giấy cao cấp'],
      popular: true,
      icon: '📖',
      gradient: 'from-blue-900 to-indigo-600',
    },
    {
      type: 'photo' as const,
      title: 'Bản đen trắng',
      description: 'Bìa mềm, in đen trắng tiết kiệm',
      price: photoPrice,
      originalPrice: null,
      features: ['In đen trắng rõ nét', 'Bìa mềm tiện lợi', 'Giá cả phải chăng', 'Phù hợp với sinh viên'],
      popular: false,
      icon: '📄',
      gradient: 'from-gray-500 to-gray-600',
    }
  ];

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-foreground">Chọn phiên bản sách</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {versions.map((version) => (
            <div
              key={version.type}
              onClick={() => handleVersionChange(version.type)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                selectedVersion === version.type
                  ? 'border-primary bg-gradient-to-r from-cyan-100 to-violet-200 shadow-md ring-2 ring-primary/20'
                  : 'border-border bg-background hover:border-muted-foreground'
              }`}
            >
              {/* Popular Badge */}
              {version.popular && (
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white px-3 py-1 text-xs font-medium">
                    Nên chọn
                  </Badge>
                </div>
              )}

              {/* Header với ảnh */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Hiển thị ảnh cho bản gốc, icon cho bản photo */}
                  {version.type === 'color' ? (
                    <div className="w-12 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={book.coverUrl || '/default-book-cover.jpg'}
                        alt={book.title}
                        width={72}
                        height={96}
                        className="object-cover rounded-md"
                        loading='lazy'
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 bg-gradient-to-br ${version.gradient} rounded-xl flex items-center justify-center text-2xl`}>
                      {version.icon}
                    </div>
                  )}
                  
                  <div>
                    <h5 className="font-semibold text-foreground text-lg">{version.title}</h5>
                    <p className="text-sm text-muted-foreground">{version.description}</p>
                  </div>
                </div>
                
                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedVersion === version.type
                    ? 'border-primary bg-primary'
                    : 'border-border'
                }`}>
                  {selectedVersion === version.type && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  {version.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatVND(version.originalPrice)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-foreground">
                    {formatVND(version.price)}
                  </span>
                </div>
                {version.originalPrice && (
                  <div className="inline-block">
                    <Badge variant="destructive" className="text-xs mt-1">
                      Tiết kiệm {formatVND(version.originalPrice - version.price)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2">
                {version.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    {/* <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${version.gradient} flex items-center justify-center`}>
                      <span className="text-white text-xs">✓</span>
                    </div> */}
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-background p-4 rounded-xl border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Đã chọn:</span>
              <span className="font-medium text-foreground">
                {versions.find(v => v.type === selectedVersion)?.title}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatVND(versions.find(v => v.type === selectedVersion)?.price!)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomizeProducts;