'use client';
import React, { useState, Suspense, lazy } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load components
const Add = lazy(() => import('@/components/Add'));
const CustomizeProducts = lazy(() => import('@/components/CustomizeProducts'));
const ProductImages = lazy(() => import('@/components/ProductImages'));

// Loading components
const ComponentSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

// Define types
interface MedicalSpecialty {
  value: string;
  label: string;
}

interface BookDetailClientProps {
  initialBook: Book;
  medicalSpecialties: MedicalSpecialty[];
}

const getSpecialtyLabel = (value: string, medicalSpecialties: MedicalSpecialty[]) => {
  const specialty = medicalSpecialties.find(s => s.value === value);
  return specialty ? specialty.label : value;
};

const BookDetailClient = ({ initialBook, medicalSpecialties }: BookDetailClientProps) => {
  const [selectedVersion, setSelectedVersion] = useState<'color' | 'photo'>('color');
  const [displayPrice, setDisplayPrice] = useState<number>(
    (initialBook.hasColorPriceSale
      ? initialBook.colorPrice - (initialBook?.colorPriceSale ?? 0)
      : initialBook.colorPrice)
  );
  const [activeTab, setActiveTab] = useState('description');

  const optimizedDescription = `${initialBook.summary ? initialBook.summary : ''}`;
  const optimizedDetail = `${initialBook.details}`;

  const handleVersionChange = (version: 'color' | 'photo') => {
    setSelectedVersion(version);
  };

  const handlePriceChange = (price: number) => {
    setDisplayPrice(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="mb-4" aria-label="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/books">Tất cả</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/books?specialty=${initialBook.primaryCategory}`}>
                  {getSpecialtyLabel(initialBook.primaryCategory, medicalSpecialties)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{initialBook.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="mt-2">
          <Button variant="link" className="text-primary p-0 h-auto">
            View all {getSpecialtyLabel(initialBook.primaryCategory, medicalSpecialties)} titles
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Discount banner */}
        {initialBook.hasColorPriceSale && (
          <div className="mb-6">
            <Badge className="text-sm py-1 px-3">
              {Math.round(((initialBook?.colorPriceSale ?? 0 / initialBook.colorPrice) * 100))}% OFF
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Image */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Suspense fallback={<ComponentSkeleton />}>
                  <ProductImages 
                    previewImages={initialBook.previewImageUrl ? initialBook.previewImageUrl : []} 
                    pdfUrl={initialBook.previewUrl ?? ''}
                    bookTitle={initialBook.title}
                    bookAuthor={initialBook.author}
                  />
                </Suspense>
                {/* <div className="text-center mt-4">
                  <p className="font-semibold">Medical Textbook</p>
                </div> */}
              </CardContent>
            </Card>


          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                {initialBook.title}
              </h1>
              
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Tác giả:</strong> {initialBook.author}</p>
                {initialBook.isbn && (
                  <p><strong>ISBN:</strong> {initialBook.isbn}</p>
                )}
              </div>

              {(!initialBook.isPublished && initialBook.availableForPreorder) && (
                <div className="flex items-center gap-2 mt-4">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white">MỚI</Badge>
                  <span className="text-sm">Sách sẽ được phát hành vào {format(new Date(initialBook.predictableReleaseDate ?? ''), 'dd-MM-yyyy')}</span>
                </div>
              )}

              <p className="font-sans text-justify text-muted-foreground mt-4" itemProp="description">
                {optimizedDescription}
              </p>

              <div className="flex flex-wrap gap-2 mt-4" role="list" aria-label="Chuyên khoa">
                <Link
                  href={`/books?specialty=${initialBook.primaryCategory}`}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                  role="listitem"
                  itemProp="genre"
                >
                  {getSpecialtyLabel(initialBook.primaryCategory, medicalSpecialties)}
                </Link>
                {initialBook.relatedCategories?.map((specialty) => (
                  <Link
                    key={specialty}
                    href={`/books?specialty=${specialty}`}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                    role="listitem"
                  >
                    {getSpecialtyLabel(specialty, medicalSpecialties)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price and Purchase */}
            {/* <Card> */}
              {/* <CardContent className="p-6"> */}
                {/* <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">📖 Book</Badge>
                </div>
                
                {(initialBook.isPublished || initialBook.availableForPreorder) && (
                  <div className="flex items-center gap-4 mt-4 mb-6" role="group" aria-label="Giá sản phẩm">
                    {selectedVersion === 'color' && initialBook.hasColorPriceSale && (
                      <span className="text-lg text-muted-foreground line-through" aria-label="Giá gốc">
                        ${initialBook.colorPrice}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-primary" aria-label="Giá hiện tại">
                      ${(displayPrice).toFixed(2)}
                    </span>
                  </div>
                )} */}

                {/* Product Customization */}
                {(initialBook.isPublished || initialBook.availableForPreorder) && (
                  <div className="space-y-6">
                    <Suspense fallback={<ComponentSkeleton />}>
                      <CustomizeProducts
                        colorPrice={initialBook.colorPrice}
                        photoPrice={initialBook.blackAndWhitePrice}
                        hasColorSale={initialBook.hasColorPriceSale ?? false}
                        colorSaleAmount={initialBook.colorPriceSale ?? 0}
                        book={{
                          title: initialBook.title,
                          slug: initialBook.slug,
                          coverUrl: initialBook.coverImageUrl || '/default-book-cover.jpg',
                        }}
                        onPriceChange={handlePriceChange}
                        onVersionChange={handleVersionChange}
                      />
                    </Suspense>

                    <div className="border-t pt-6">
                      <Suspense fallback={<ComponentSkeleton />}>
                        <Add
                          bookId={Number(initialBook.id)}
                          isCompleted={initialBook.isPublished}
                          preorder={initialBook.availableForPreorder}
                          selectedVersion={selectedVersion}
                          bookTitle={initialBook.title}
                          bookPrice={displayPrice}
                          bookSalePrice={initialBook.hasColorPriceSale ? initialBook.colorPrice - (initialBook.colorPriceSale ?? 0) : undefined}
                          bookSlug={initialBook.slug}
                          bookCoverUrl={initialBook.coverImageUrl}
                        />
                      </Suspense>
                    </div>
                  </div>
                )}

                {(!initialBook.isPublished && initialBook.availableForPreorder && initialBook.predictableReleaseDate) && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ĐẶT TRƯỚC NGAY VÀ SÁCH SẼ ĐƯỢC GIAO SAU NGÀY PHÁT HÀNH {format(new Date(initialBook.predictableReleaseDate), 'dd-MM-yyyy')}
                    </p>
                  </div>
                )}
              {/* </CardContent> */}
            {/* </Card> */}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="w-full">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button 
                  onClick={() => setActiveTab('description')}
                  className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'description' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Giới thiệu
                </button>
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'details' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Chi tiết sách - Mục lục
                </button>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'reviews' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Reviews
                </button>
              </nav>
            </div>
            
            <div className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {activeTab === 'description' && (
                    <div className="space-y-4">
                      <p>
                        {optimizedDescription}
                      </p>
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-foreground">Thông tin sản phẩm</h4>
                          <div className="space-y-2 text-sm">

                            <p><strong>Tác giả:</strong> {initialBook.author}</p>
                            <p><strong>Ngày xuất bản:</strong> {initialBook.predictableReleaseDate ? format(new Date(initialBook.predictableReleaseDate), 'dd/MM/yyyy') : 'Chưa xác định'}</p>
                            <p><strong>Danh mục:</strong> {getSpecialtyLabel(initialBook.primaryCategory, medicalSpecialties)}</p>
                            <p><strong>Số trang:</strong> {initialBook.pageCount ? initialBook.pageCount : 'Chưa xác định'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Table of Contents */}
                      {initialBook.tableOfContents && (
                        <div className="border-t pt-6">
                          <h4 className="font-semibold mb-3 text-foreground">Mục lục</h4>
                          <div
                            className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: initialBook.tableOfContents }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="text-center text-muted-foreground">
                      <p className="mb-4">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sách này!</p>
                      <Button>Viết đánh giá</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default BookDetailClient;