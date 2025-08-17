'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { BookOpen, User, Calendar, Tag, Eye, ShoppingCart, FileText, List, BookText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/Header'
import PDFViewer from '@/components/PDFViewer'
import DevPurchaseButton from '@/components/DevPurchaseButton'
import TestDevPurchaseButton from '@/components/TestDevPurchaseButton'

interface Book {
  id: string
  title: string
  author: string
  slug: string
  summary: string | null
  coverImageUrl: string | null
  primaryCategory: string
  colorPrice: number
  blackAndWhitePrice: number
  livebookPrice: number | null
  previewUrl: string
  isPublished: boolean
  createdAt: string
}

interface PurchasedBook {
  bookId: string
  version: 'color' | 'black_and_white' | 'livebook'
  orderDate: string
  orderStatus: string
}

export default function ProductPage() {
  const params = useParams()
  const { user, isSignedIn } = useUser()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasedBooks, setPurchasedBooks] = useState<PurchasedBook[]>([])
  const [showPDFViewer, setShowPDFViewer] = useState(false)

  const handleMobileMenuClick = () => {
    // Handle mobile menu if needed
  };

  const refreshPurchasedBooks = () => {
    fetchPurchasedBooks()
  }

  const fetchPurchasedBooks = async () => {
    // Always fetch test purchases in development mode
    if (process.env.NODE_ENV === 'development') {
      try {
        const testResponse = await fetch('/api/test/purchased-books?testUserId=test-user-playwright')
        if (testResponse.ok) {
          const testData = await testResponse.json()
          console.log('Test purchases fetched:', testData)
          setPurchasedBooks(testData.purchasedBooks || [])
        }
      } catch (error) {
        console.error('Error fetching test purchased books:', error)
      }
    }
    
    // Also fetch authenticated user purchases if signed in
    if (isSignedIn) {
      try {
        const response = await fetch('/api/user/purchased-books')
        if (response.ok) {
          const data = await response.json()
          // Merge with existing test purchases
          setPurchasedBooks(prev => [...prev, ...(data.purchasedBooks || [])])
        }
      } catch (error) {
        console.error('Error fetching purchased books:', error)
      }
    }
  }

  useEffect(() => {
    const fetchBook = async () => {
      try {
        console.log('Fetching book with slug:', params.slug)
        const response = await fetch(`/api/books/${params.slug}`)
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Book data:', data)
          setBook(data.book)
        } else {
          const errorData = await response.json()
          console.error('Error response:', errorData)
          setError('Không tìm thấy sách')
        }
      } catch (error) {
        console.error('Fetch error:', error)
        setError('Không thể tải sách')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchBook()
      fetchPurchasedBooks()
    }
  }, [params.slug, isSignedIn])

  const isBookPurchased = (bookId: string, version: 'color' | 'black_and_white' | 'livebook') => {
    return purchasedBooks.some(pb => 
      pb.bookId === bookId && pb.version === version
    )
  }

  const handleReadBook = () => {
    // Check if we have a valid preview URL
    if (book?.previewUrl) {
      setShowPDFViewer(true)
    } else {
      // Show a message when no preview URL is available
      alert('PDF đang được chuẩn bị. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMobileMenuClick={handleMobileMenuClick} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Không tìm thấy sách</h1>
            <p className="text-gray-600 mb-6">Sách bạn đang tìm kiếm không tồn tại.</p>
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Về trang chủ
            </a>
          </div>
        </div>
      </div>
    )
  }

  const hasPurchasedAnyVersion = isBookPurchased(book.id, 'color') || 
                                isBookPurchased(book.id, 'black_and_white') || 
                                isBookPurchased(book.id, 'livebook')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMobileMenuClick={handleMobileMenuClick} />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><a href="/" className="hover:text-gray-700">Trang chủ</a></li>
              <li>/</li>
              <li><a href="/sach" className="hover:text-gray-700">Sách</a></li>
              <li>/</li>
              <li className="text-gray-900">{book.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Book Cover */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={book.coverImageUrl || '/placeholder-book.png'}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.src = '/placeholder-book.png'
                  }}
                />
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-4">
                {hasPurchasedAnyVersion ? (
                  <Button 
                    className="flex-1" 
                    size="lg"
                    onClick={handleReadBook}
                  >
                    <BookText className="mr-2 h-4 w-4" />
                    Đọc sách
                  </Button>
                ) : (
                  <Button className="flex-1" size="lg">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Thêm vào giỏ hàng
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    // Scroll to preview section
                    document.getElementById('book-preview')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    })
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Xem trước
                </Button>
              </div>

              {/* Purchase Status */}
              {hasPurchasedAnyVersion && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 font-medium">Bạn đã mua sách này</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Bạn có thể đọc sách ngay bây giờ hoặc tải xuống để đọc offline.
                  </p>
                </div>
              )}

              {/* Developer Purchase Button */}
              <DevPurchaseButton
                bookId={book.id}
                bookTitle={book.title}
                bookSlug={book.slug}
                coverImageUrl={book.coverImageUrl}
                colorPrice={book.colorPrice}
                blackAndWhitePrice={book.blackAndWhitePrice}
                livebookPrice={book.livebookPrice}
                onPurchaseSuccess={refreshPurchasedBooks}
              />

              {/* Test Dev Purchase Button (No Auth Required) */}
              <TestDevPurchaseButton
                bookId={book.id}
                bookTitle={book.title}
                bookSlug={book.slug}
                coverImageUrl={book.coverImageUrl}
                colorPrice={book.colorPrice}
                blackAndWhitePrice={book.blackAndWhitePrice}
                livebookPrice={book.livebookPrice}
                onPurchaseSuccess={refreshPurchasedBooks}
              />
            </div>

            {/* Book Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600">bởi {book.author}</p>
              </div>

              {/* Category */}
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-gray-400" />
                <Badge variant="secondary">{book.primaryCategory}</Badge>
              </div>

              {/* Summary */}
              {book.summary && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tóm tắt</h3>
                  <p className="text-gray-600 leading-relaxed">{book.summary}</p>
                </div>
              )}

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Tùy chọn giá</CardTitle>
                  <CardDescription>Chọn định dạng bạn muốn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Bản màu</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {(book.colorPrice / 100).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">Bản đen trắng</span>
                    </div>
                    <span className="text-xl font-bold text-gray-600">
                      {(book.blackAndWhitePrice / 100).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  {book.livebookPrice && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Sách điện tử</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        {(book.livebookPrice / 100).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Xuất bản: {new Date(book.createdAt).getFullYear()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Tác giả: {book.author}</span>
                </div>
              </div>

              {/* Note for guests */}
              {!hasPurchasedAnyVersion && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Lưu ý:</strong> Đây là trang xem trước. Để truy cập nội dung đầy đủ của sách, 
                    mục lục chi tiết và hình ảnh xem trước, vui lòng mua sách hoặc đăng ký tài khoản.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Content Section */}
        <div id="book-preview" className="mt-16 border-t pt-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                Xem trước sách
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hãy xem bên trong sách có gì. Mua sách để truy cập nội dung đầy đủ, 
                mục lục chi tiết và tất cả hình ảnh xem trước.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Book Cover and Basic Info */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                  <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={book?.coverImageUrl || '/placeholder-book.png'}
                      alt={book?.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = '/placeholder-book.png'
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{book?.title}</h3>
                    <p className="text-gray-600 mb-3">bởi {book?.author}</p>
                    <div className="mb-3">
                      <Badge variant="secondary">{book?.primaryCategory}</Badge>
                    </div>
                    {(book as any)?.isbn && (
                      <p className="text-sm text-gray-500">ISBN: {(book as any).isbn}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Summary */}
                {book?.summary && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Tóm tắt
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-lg">{book.summary}</p>
                  </div>
                )}

                {/* Table of Contents Preview */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <List className="h-5 w-5 text-blue-600" />
                    Xem trước mục lục
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <span className="text-blue-600 font-semibold text-sm">Chương 1</span>
                          <span className="text-gray-700">Giới thiệu về {book?.primaryCategory}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <span className="text-blue-600 font-semibold text-sm">Chương 2</span>
                          <span className="text-gray-700">Nguyên tắc cơ bản và nền tảng</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <span className="text-blue-600 font-semibold text-sm">Chương 3</span>
                          <span className="text-gray-700">Ứng dụng lâm sàng</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <span className="text-blue-600 font-semibold text-sm">Chương 4</span>
                          <span className="text-gray-700">Chủ đề nâng cao và nghiên cứu ca bệnh</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <span className="text-blue-600 font-semibold text-sm">Chương 5</span>
                          <span className="text-gray-700">Phương pháp và kỹ thuật chẩn đoán</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <span className="text-blue-600 font-semibold text-sm">Chương 6</span>
                          <span className="text-gray-700">Giao thức và hướng dẫn điều trị</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-gray-500 text-sm mt-4 pt-4 border-t">
                      ... và {Math.floor(Math.random() * 20) + 10} chương khác
                    </div>
                  </div>
                </div>

                {/* Sample Pages */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Trang mẫu</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                      <div className="w-full h-40 bg-gray-200 rounded mb-3 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-medium">Trang mẫu 1</p>
                      <p className="text-sm text-gray-500 mt-1">Giới thiệu và tổng quan</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                      <div className="w-full h-40 bg-gray-200 rounded mb-3 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-medium">Trang mẫu 2</p>
                      <p className="text-sm text-gray-500 mt-1">Ví dụ lâm sàng và biểu đồ</p>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
                  <h4 className="text-2xl font-bold text-blue-900 mb-3">
                    Sẵn sàng tìm hiểu sâu hơn?
                  </h4>
                  <p className="text-blue-700 mb-6 text-lg">
                    Mua sách này để truy cập nội dung đầy đủ, mục lục chi tiết 
                    và tất cả hình ảnh xem trước. Bắt đầu hành trình học y khoa của bạn ngay hôm nay!
                  </p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Mua sách
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="px-8 py-3"
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      Xem tất cả sách
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPDFViewer && book?.previewUrl && (
        <PDFViewer
          pdfUrl={book.previewUrl}
          title={book.title}
          onClose={() => setShowPDFViewer(false)}
        />
      )}
    </div>
  )
}
