// types.d.ts
interface Book {
    id: string;
    title: string;
    author: string;
    slug: string;
    primaryCategory: string;
    relatedCategories: string[];
    relatedBooks?: string[];
    details?: string;
    tableOfContents?: string;
    summary?: string;
    pageCount?: number;

    // Thông tin số lượng và ISBN
    // availableCopies: number;
    isbn?: string; // Optional
    
    coverImageUrl: string;
    // coverColor: string;
    previewUrl?: string;
    previewImageUrl?: string[];
    
    // Trạng thái sách
    isPublished: boolean; // Sách đã hoàn thành chưa
    
    // Thông tin đặt trước
    availableForPreorder?: boolean; // Không còn optional, có default false
    predictableReleaseDate?: string; // Ngày dự kiến ra mắt (bắt buộc khi isPublished = false)

    // Thông tin giá
    colorPrice: number; // Giá bản màu (không còn optional, có default 0)
    blackAndWhitePrice: number; // Giá bản đen trắng (không còn optional, có default 0)

    // Thông tin sale cho bản màu
    hasColorPriceSale?: boolean; // Có sale cho bản màu không (không còn optional)
    colorPriceSale?: number; // Số tiền giảm giá (không còn optional, có default 0)
    
    // Additional properties from API
    livebookPrice?: number;
    createdAt: string;
    updatedAt: string;
}