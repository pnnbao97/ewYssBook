'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { BookOpen, Filter, ShoppingCart, CheckCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/hooks/use-cart'

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
  isPublished: boolean
  createdAt: string
  isbn?: string
}

interface PurchasedBook {
  bookId: string
  version: 'color' | 'black_and_white' | 'livebook'
  orderDate: string
  orderStatus: string
}

export default function BooksPage() {
  const { user, isSignedIn } = useUser()
  const { addItem, getItemByBookId } = useCartStore()
  const searchParams = useSearchParams()
  
  const [books, setBooks] = useState<Book[]>([])
  const [purchasedBooks, setPurchasedBooks] = useState<PurchasedBook[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null)

  const booksPerPage = 12

  // Check for search query in URL params
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  useEffect(() => {
    fetchBooks()
    if (isSignedIn) {
      fetchPurchasedBooks()
    }
  }, [isSignedIn, currentPage, searchQuery, selectedCategory])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: booksPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      })
      
      const response = await fetch(`/api/books?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
        setTotalCount(data.totalCount || 0)
      } else {
        console.error('Failed to fetch books:', response.status)
        setBooks([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
      setBooks([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchPurchasedBooks = async () => {
    try {
      const response = await fetch('/api/user/purchased-books')
      if (response.ok) {
        const data = await response.json()
        setPurchasedBooks(data.purchasedBooks || [])
      }
    } catch (error) {
      console.error('Error fetching purchased books:', error)
    }
  }

  const handleAddToCart = async (book: Book, version: 'color' | 'black_and_white' | 'livebook') => {
    setIsAddingToCart(`${book.id}-${version}`)
    
    try {
      const price = version === 'color' ? book.colorPrice : 
                   version === 'black_and_white' ? book.blackAndWhitePrice : 
                   book.livebookPrice || 0
      
      const result = addItem(
        Number(book.id),
        version === 'color' ? 'color' : 'photo',
        book.title,
        book.slug,
        book.coverImageUrl || '/placeholder-book.png',
        price,
        price,
        100,
        1
      )

      if (result.success) {
        // Show success feedback (you can add toast notification here)
        console.log(result.message)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setTimeout(() => setIsAddingToCart(null), 500)
    }
  }

  const isBookPurchased = (bookId: string, version: 'color' | 'black_and_white' | 'livebook') => {
    return purchasedBooks.some(pb => 
      pb.bookId === bookId && pb.version === version
    )
  }

  const isInCart = (bookId: string, version: 'color' | 'black_and_white' | 'livebook') => {
    return getItemByBookId(Number(bookId), version === 'color' ? 'color' : 'photo')
  }

  const getDisplayTitle = () => {
    if (searchQuery.trim()) {
      return `KẾT QUẢ TÌM KIẾM: "${searchQuery}"`
    }
    if (selectedCategory !== 'all') {
      return `SÁCH CHUYÊN KHOA: ${selectedCategory.toUpperCase()}`
    }
    return "TẤT CẢ SÁCH"
  }

  const getDisplaySubtitle = () => {
    if (searchQuery.trim()) {
      return `Tìm thấy ${totalCount} kết quả`
    }
    if (selectedCategory !== 'all') {
      return `${totalCount} cuốn sách`
    }
    return "SÁCH MỚI"
  }

  const totalPages = Math.ceil(totalCount / booksPerPage)

  if (loading && books.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thư viện sách y khoa</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập sách y khoa chất lượng cao, từ cơ bản đến nâng cao
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                <SelectItem value="cardiology">Tim mạch</SelectItem>
                <SelectItem value="neurology">Thần kinh</SelectItem>
                <SelectItem value="oncology">Ung thư</SelectItem>
                <SelectItem value="pediatrics">Nhi khoa</SelectItem>
                <SelectItem value="surgery">Phẫu thuật</SelectItem>
                <SelectItem value="obstetrics">Sản khoa</SelectItem>
                <SelectItem value="internal-medicine">Nội khoa</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setCurrentPage(1)
              }}
              variant="outline"
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Purchased Books Section (if user is signed in) */}
        {isSignedIn && purchasedBooks.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Sách đã mua
                </CardTitle>
                <CardDescription>
                  Những cuốn sách bạn đã sở hữu và có thể truy cập bất cứ lúc nào
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {purchasedBooks.slice(0, 6).map((purchasedBook) => {
                    const book = books.find(b => b.id === purchasedBook.bookId)
                    if (!book) return null
                    
                    return (
                      <div key={`${purchasedBook.bookId}-${purchasedBook.version}`} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <img
                          src={book.coverImageUrl || '/placeholder-book.png'}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                          <p className="text-xs text-gray-500">
                            {purchasedBook.version === 'color' ? 'Bản màu' : 
                             purchasedBook.version === 'black_and_white' ? 'Bản đen trắng' : 'Livebook'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Mua ngày: {new Date(purchasedBook.orderDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/product/${book.slug}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </a>
                        </Button>
                      </div>
                    )
                  })}
                </div>
                {purchasedBooks.length > 6 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm">
                      Xem tất cả sách đã mua ({purchasedBooks.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Books Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getDisplayTitle()}</h2>
              <p className="text-gray-600">{getDisplaySubtitle()}</p>
            </div>
            <div className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages}
            </div>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery.trim() ? 'Không tìm thấy sách nào' : 'Chưa có sách trong danh mục này'}
              </h3>
              <p className="text-gray-500">
                {searchQuery.trim() ? 'Thử tìm kiếm với từ khóa khác' : 'Vui lòng quay lại sau'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                  <CardContent className="p-4 flex flex-col h-full">
                    {/* Book Cover */}
                    <div className="relative mb-4">
                      <a href={`/product/${book.slug}`}>
                        <img
                          src={book.coverImageUrl || '/placeholder-book.png'}
                          alt={book.title}
                          className="w-full h-48 object-cover rounded-md hover:opacity-90 cursor-pointer transition-opacity"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            if (img.src !== '/placeholder-book.png') {
                              img.src = '/placeholder-book.png'
                              img.onerror = null
                            }
                          }}
                        />
                      </a>
                      
                      {/* Purchased Badge */}
                      {isSignedIn && (
                        <div className="absolute top-2 left-2">
                          {isBookPurchased(book.id, 'color') && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Đã mua
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="flex flex-col flex-grow space-y-3">
                      <a href={`/product/${book.slug}`}>
                        <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 hover:text-blue-600 cursor-pointer min-h-[2.5rem]">
                          {book.title}
                        </h3>
                      </a>

                      <p className="text-xs text-gray-600 font-medium">
                        {book.author}
                      </p>

                      <p className="text-xs text-gray-500">
                        Xuất bản: {new Date(book.createdAt).getFullYear()}
                      </p>

                      <Badge variant="secondary" className="w-fit">
                        {book.primaryCategory}
                      </Badge>

                      {/* Pricing Options */}
                      <div className="space-y-2">
                        {/* Color Version */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Bản màu:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {(book.colorPrice / 100).toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                        
                        {/* Black & White Version */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Bản đen trắng:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {(book.blackAndWhitePrice / 100).toLocaleString('vi-VN')} ₫
                          </span>
                        </div>

                        {/* Livebook Version */}
                        {book.livebookPrice && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Sách điện tử:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {(book.livebookPrice / 100).toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto pt-3 space-y-2">
                        {/* View Details Button */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          asChild
                        >
                          <a href={`/product/${book.slug}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </a>
                        </Button>

                        {/* Add to Cart Buttons */}
                        {!isBookPurchased(book.id, 'color') && (
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleAddToCart(book, 'color')}
                            disabled={isAddingToCart === `${book.id}-color` || !!isInCart(book.id, 'color')}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {isAddingToCart === `${book.id}-color` ? 'Đang thêm...' : 
                             isInCart(book.id, 'color') ? 'Đã có trong giỏ' : 'Thêm bản màu'}
                          </Button>
                        )}

                        {!isBookPurchased(book.id, 'black_and_white') && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleAddToCart(book, 'black_and_white')}
                            disabled={isAddingToCart === `${book.id}-black_and_white` || !!isInCart(book.id, 'black_and_white')}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {isAddingToCart === `${book.id}-black_and_white` ? 'Đang thêm...' : 
                             isInCart(book.id, 'black_and_white') ? 'Đã có trong giỏ' : 'Thêm bản đen trắng'}
                          </Button>
                        )}

                        {book.livebookPrice && !isBookPurchased(book.id, 'livebook') && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleAddToCart(book, 'livebook')}
                            disabled={isAddingToCart === `${book.id}-livebook` || !!isInCart(book.id, 'livebook')}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {isAddingToCart === `${book.id}-livebook` ? 'Đang thêm...' : 
                             isInCart(book.id, 'livebook') ? 'Đã có trong giỏ' : 'Thêm sách điện tử'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1
                let displayPage = pageNumber
                
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    displayPage = pageNumber
                  } else if (currentPage >= totalPages - 2) {
                    displayPage = totalPages - 4 + pageNumber
                  } else {
                    displayPage = currentPage - 2 + pageNumber
                  }
                }

                return (
                  <Button
                    key={displayPage}
                    variant={currentPage === displayPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(displayPage)}
                  >
                    {displayPage}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Tiếp
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}