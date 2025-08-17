import ProductCard from "./ProductCard";
import { Book } from "@/lib/generated/prisma";

interface ProductGridProps {
  books: Book[];
  loading: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function ProductGrid({ 
  books, 
  loading, 
  selectedCategory, 
  searchQuery, 
  totalCount,
  currentPage,
  onPageChange 
}: ProductGridProps) {
  const booksPerPage = 12;
  const totalPages = Math.ceil(totalCount / booksPerPage);

  const getDisplayTitle = () => {
    if (searchQuery.trim()) {
      return `KẾT QUẢ TÌM KIẾM: "${searchQuery}"`;
    }
    if (selectedCategory) {
      return `SÁCH CHUYÊN KHOA: ${selectedCategory.toUpperCase()}`;
    }
    return "TẤT CẢ SÁCH";
  };

  const getDisplaySubtitle = () => {
    if (searchQuery.trim()) {
      return `Tìm thấy ${totalCount} kết quả`;
    }
    if (selectedCategory) {
      return `${totalCount} cuốn sách`;
    }
    return "SÁCH MỚI";
  };

  if (loading) {
    return (
      <div className="flex-1">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#a45827]">
            {getDisplayTitle()}
          </h1>
          {/* {!searchQuery && !selectedCategory && (
            <a
              href="#"
              className="text-[#67c2cf] hover:underline text-sm hidden sm:block"
            >
              View all Medicine titles
            </a>
          )} */}
        </div>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-4 sm:space-x-8">
            <button className="pb-2 border-b-2 border-[#a45827] text-[#a45827] font-medium text-sm">
              SÁCH
            </button>
            <button className="pb-2 text-gray-500 hover:text-gray-700 text-sm">
              SÁCH ĐIỆN TỬ
            </button>
            <button className="pb-2 text-gray-500 hover:text-gray-700 text-sm">
              TẠP CHÍ
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {getDisplaySubtitle()}
          </h2>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            {searchQuery.trim() ? "Không tìm thấy sách nào" : "Chưa có sách trong danh mục này"}
          </div>
          <div className="text-gray-400 text-sm">
            {searchQuery.trim() ? "Thử tìm kiếm với từ khóa khác" : "Vui lòng quay lại sau"}
          </div>
        </div>
      ) : (
        <>
          {/* Updated grid to show 2 columns on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {books.map((book) => (
              <ProductCard
                key={book.id}
                id={Number(book.id)}
                title={book.title}
                image={book.coverImageUrl || '/placeholder-book.png'}
                price={book.hasColorPriceSale ? (book.colorPrice - (book.colorPriceSale ? book.colorPriceSale : 0)) : book.colorPrice}
                publicationDate={book.predictableReleaseDate ? 
                  new Date(book.predictableReleaseDate).toLocaleDateString('vi-VN', { 
                    month: 'short', 
                    year: 'numeric' 
                  }) : 'Chưa xác định'
                }
                isOnSale={book.hasColorPriceSale}
                author={book.author}
                slug={book.slug}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {/* Previous button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Trước
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1;
                let displayPage = pageNumber;
                
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    displayPage = pageNumber;
                  } else if (currentPage >= totalPages - 2) {
                    displayPage = totalPages - 4 + pageNumber;
                  } else {
                    displayPage = currentPage - 2 + pageNumber;
                  }
                }

                return (
                  <button
                    key={displayPage}
                    onClick={() => onPageChange(displayPage)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === displayPage 
                        ? 'bg-[#a45827] text-white border-[#a45827]' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {displayPage}
                  </button>
                );
              })}

              {/* Next button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Tiếp
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}