// page.tsx - Server Component for SEO (Optimized & Improved)
'use server';
import React from 'react';
import { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getBookBySlug } from '@/lib/actions/get-books';
import BookDetailClient from '@/components/BookDetailClient';

// Constants
const SEO_CONFIG = {
  META_DESCRIPTION_LIMIT: 155,
  TRUNCATE_AT: 152,
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ewyss.com',
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  DEFAULT_BOOK_COVER: '/default-book-cover.jpg',
  TWITTER_HANDLE: '@ewYss',
} as const;

const SLUG_REGEX = /^[a-z0-9-]{1,100}$/;


// Medical specialties mapping
const medicalSpecialties = [
  { value: "noi-khoa", label: "Nội khoa" },
  { value: "ngoai-khoa", label: "Ngoại khoa" },
  { value: "san-phu-khoa", label: "Sản phụ khoa" },
  { value: "da-lieu", label: "Da liễu" },
  { value: "than-kinh", label: "Thần kinh" },
  { value: "tim-mach", label: "Tim mạch" },
  { value: "ho-hap", label: "Hô hấp" },
  { value: "tieu-hoa", label: "Tiêu hóa" },
  { value: "noi-tiet", label: "Nội tiết" },
  { value: "tiet-nieu", label: "Tiết niệu" },
  { value: "co-xuong-khop", label: "Cơ xương khớp" },
  { value: "ung-buou", label: "Ung bướu" },
  { value: "cap-cuu", label: "Cấp cứu" },
  { value: "truyen-nhiem", label: "Truyền nhiễm" },
  { value: "cdha", label: "Chẩn đoán hình ảnh" },
  { value: "giai-phau", label: "Giải phẫu" },
    { value: "hoa-sinh", label: "Hóa sinh" },
    { value: "duoc-ly", label: "Dược lý" },
    { value: "vi-sinh", label: "Vi sinh-Miễn dịch học" },
    { value: "di-truyen", label: "Di truyền" },
    { value: "sinh-ly", label: "Sinh lý" },
    { value: "huyet-hoc", label: "Huyết học" },

];

// Utility functions
const getSpecialtyLabel = (value: string): string => {
  const specialty = medicalSpecialties.find(s => s.value === value);
  return specialty ? specialty.label : value;
};

const validateSlug = (slug: string): boolean => {
  return SLUG_REGEX.test(slug);
};

const calculateDisplayPrice = (book: any): number => {
  return book.hasColorSale 
    ? book.colorPrice - book.colorSaleAmount 
    : book.colorPrice;
};

const truncateDescription = (description: string | null): string => {
  if (!description) return '';
  if (description.length <= SEO_CONFIG.META_DESCRIPTION_LIMIT) {
    return description;
  }
  return `${description.substring(0, SEO_CONFIG.TRUNCATE_AT)}...`;
};

const sanitizeUrl = (url: string): string => {
  try {
    return new URL(url).toString();
  } catch {
    return SEO_CONFIG.DEFAULT_BOOK_COVER;
  }
};

// Cached book fetcher - prevents duplicate API calls
const getCachedBook = cache(async (slug: string) => {
  try {
    // Validate slug before API call
    if (!validateSlug(slug)) {

      return { success: false, message: 'Invalid book identifier' };
    }

    const response = await getBookBySlug(slug);
  
    
    return response;
  } catch (error) {
    // logger.error('Error fetching book', { slug, error: error instanceof Error ? error.message : 'Unknown error' });
    return { success: false, message: 'Database connection error' };
  }
});

// Generate metadata dynamically - Server Component only
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const response = await getCachedBook(resolvedParams.slug);
    
    if (!response.success || !response.data) {
      return {
        title: 'Không tìm thấy sách - ewYss Book',
        description: 'Sách không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại đường dẫn hoặc tìm kiếm sách khác.',
        robots: { index: false, follow: false }
      };
    }

    const book = response.data;
    const displayPrice = calculateDisplayPrice(book);
    const metaDescription = truncateDescription(book.summary ? book.summary : '');
    const pageTitle = `${book.title} - ${book.author} | ewYss Book`;
    const bookImageUrl = sanitizeUrl(book.previewImageUrl?.[0] || SEO_CONFIG.DEFAULT_BOOK_COVER);
    const canonicalUrl = `${SEO_CONFIG.SITE_URL}/books/${book.slug}`;

    return {
      title: pageTitle,
      description: metaDescription || 'Khám phá sách y khoa chất lượng cao tại ewYss.',
      keywords: [
        book.title,
        book.author,
        getSpecialtyLabel(book.primaryCategory),
        'sách y khoa',
        'dịch thuật y khoa',
        'y học',
        'bác sĩ',
        'sinh viên y',
        'ewYss Book',
      ].join(', '),
      
      authors: [{ name: book.author }],
      category: 'Medical Books',
      
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },

      openGraph: {
        type: 'website',
        siteName: 'ewYss Book',
        title: pageTitle,
        description: metaDescription || 'Khám phá sách y khoa chất lượng cao tại ewYss Book.',
        url: canonicalUrl,
        images: [
          {
            url: bookImageUrl,
            width: 1200,
            height: 630,
            alt: `Bìa sách ${book.title} của ${book.author}`,
            secureUrl: bookImageUrl,
            type: 'image/jpeg',
          },
        ],
        locale: 'vi_VN',
      },

      twitter: {
        card: 'summary_large_image',
        site: SEO_CONFIG.TWITTER_HANDLE,
        creator: SEO_CONFIG.TWITTER_HANDLE,
        title: pageTitle,
        description: metaDescription || 'Khám phá sách y khoa chất lượng cao tại ewYss Book.',
        images: [bookImageUrl],
      },

      alternates: {
        canonical: canonicalUrl,
      },

      // Enhanced product meta tags
      other: {
        'product:price:amount': displayPrice.toString(),
        'product:price:currency': 'VND',
        'product:brand': 'ewYss Book',
        'product:category': getSpecialtyLabel(book.primaryCategory),
        'article:author': book.author,
        'og:price:amount': displayPrice.toString(),
        'og:price:currency': 'VND',
        'og:image:secure_url': bookImageUrl,
        'og:image:type': 'image/jpeg',
        'og:image:width': '1200',
        'og:image:height': '630',
        ...(SEO_CONFIG.FACEBOOK_APP_ID && { 'fb:app_id': SEO_CONFIG.FACEBOOK_APP_ID }),
      },
    };
  } catch (error) {
    // logger.error('Error generating metadata', { error: error instanceof Error ? error.message : 'Unknown error' });

    return {
      title: 'Lỗi tải trang - ewYss Book',
      description: 'Đã xảy ra lỗi khi tải thông tin sách. Vui lòng thử lại sau.',
      robots: { index: false, follow: false }
    };
  }
}

// Generate structured data JSON-LD
const generateStructuredData = (book: any) => {
  const displayPrice = calculateDisplayPrice(book);
  const bookImageUrl = sanitizeUrl(book.previewImages?.[0] || SEO_CONFIG.DEFAULT_BOOK_COVER);

  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author
    },
    description: book.description || `Sách y khoa ${book.title} của tác giả ${book.author}`,
    image: bookImageUrl,
    url: `${SEO_CONFIG.SITE_URL}/books/${book.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'VMedBook',
      url: SEO_CONFIG.SITE_URL
    },
    genre: getSpecialtyLabel(book.primarySpecialty),
    inLanguage: 'vi',
    datePublished: book.createdAt?.toISOString() || new Date().toISOString(),
    offers: {
      '@type': 'Offer',
      price: displayPrice,
      priceCurrency: 'VND',
      availability: book.availableCopies > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'ewYss Book',
        url: SEO_CONFIG.SITE_URL
      },
      validFrom: new Date().toISOString()
    }
  };

  // Add rating only if available
  if (book.rating && book.reviewCount > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: book.rating,
      bestRating: 5,
      worstRating: 1,
      reviewCount: book.reviewCount
    };
  }

  return structuredData;
};

// Breadcrumb structured data
const generateBreadcrumbData = (book: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: SEO_CONFIG.SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sách y khoa',
        item: `${SEO_CONFIG.SITE_URL}/books`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: getSpecialtyLabel(book.primarySpecialty),
        item: `${SEO_CONFIG.SITE_URL}/books?specialty=${book.primarySpecialty}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: book.title,
        item: `${SEO_CONFIG.SITE_URL}/books/${book.slug}`
      }
    ]
  };
};

// Error fallback component
const ErrorFallback = ({ title, message, showHomeButton = true }: {
  title: string;
  message: string;
  showHomeButton?: boolean;
}) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center text-center py-12 px-4">
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-red-600 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
      {showHomeButton && (
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ← Về trang chủ
        </a>
      )}
    </div>
  </div>
);

// Server Component
const SinglePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  try {
    const resolvedParams = await params;
    const response = await getCachedBook(resolvedParams.slug);
    
    // Handle not found - use Next.js notFound() for better UX
    if (!response.success || !response.data) {
      if (response.message === 'Invalid book identifier') {
        notFound();
      }
      
      return (
        <ErrorFallback
          title="Không tìm thấy sách"
          message={response.message || 'Sách không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại đường dẫn hoặc tìm kiếm sách khác.'}
        />
      );
    }

    const book = response.data;
    const bookStructuredData = generateStructuredData(book);
    const breadcrumbData = generateBreadcrumbData(book);

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(bookStructuredData, null, 0)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData, null, 0)
          }}
        />
        
        {/* Main Content */}
        <BookDetailClient
          initialBook={book}
          medicalSpecialties={medicalSpecialties}
        />
      </>
    );
  } catch (error) {
    // Log error for monitoring
    // logger.error('Critical error in SinglePage', { 
    //   error: error instanceof Error ? error.message : 'Unknown error',
    //   stack: error instanceof Error ? error.stack : undefined
    // });
    
    return (
      <ErrorFallback
        title="Lỗi hệ thống"
        message="Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp tục."
      />
    );
  }
};

// Generate static params for popular books (optional - for ISR)
export async function generateStaticParams() {
  try {
    // This would fetch popular book slugs for pre-generation
    // Implement based on your popular books logic
    return [];
  } catch (error) {
    // logger.error('Error generating static params', { error });
    return [];
  }
}

export default SinglePage;