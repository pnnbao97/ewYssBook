import ProductCard from "./ProductCard";

interface Product {
  id: string;
  title: string;
  image: string;
  price: string;
  publicationDate: string;
  isOnSale?: boolean;
}

export default function ProductGrid() {
  // Sample product data based on the original website
  const products: Product[] = [
    {
      id: "1",
      title: "Goldman-Cecil Medicine, 26th Edition",
      image: "https://ext.same-assets.com/3854006003/1750705943.png",
      price: "$108.99",
      publicationDate: "Aug 2025",
      isOnSale: false
    },
    {
      id: "2",
      title: "Braunwald's Heart Disease: A Textbook of Cardiovascular Medicine, 12th Edition",
      image: "https://ext.same-assets.com/3854006003/2789625395.jpeg",
      price: "$108.99",
      publicationDate: "Jul 2025",
      isOnSale: false
    },
    {
      id: "3",
      title: "Netter's Atlas of Human Anatomy, 8th Edition",
      image: "https://ext.same-assets.com/3854006003/2937685741.jpeg",
      price: "$68.99",
      publicationDate: "Jul 2025",
      isOnSale: true
    },
    {
      id: "4",
      title: "Robbins and Cotran Pathologic Basis of Disease, 10th Edition",
      image: "https://ext.same-assets.com/3854006003/2531084308.jpeg",
      price: "$138.99",
      publicationDate: "Jul 2025",
      isOnSale: false
    },
    {
      id: "5",
      title: "Kumar and Clark's Clinical Medicine, 10th Edition",
      image: "https://ext.same-assets.com/3854006003/3395177696.jpeg",
      price: "$89.99",
      publicationDate: "Jun 2025",
      isOnSale: false
    },
    {
      id: "6",
      title: "Harrison's Principles of Internal Medicine, 21st Edition",
      image: "https://ext.same-assets.com/3854006003/1750705943.png",
      price: "$129.99",
      publicationDate: "May 2025",
      isOnSale: false
    },
    {
      id: "7",
      title: "Guyton and Hall Textbook of Medical Physiology, 14th Edition",
      image: "https://ext.same-assets.com/3854006003/2789625395.jpeg",
      price: "$94.99",
      publicationDate: "Apr 2025",
      isOnSale: true
    },
    {
      id: "8",
      title: "Gray's Anatomy for Students, 4th Edition",
      image: "https://ext.same-assets.com/3854006003/2937685741.jpeg",
      price: "$79.99",
      publicationDate: "Mar 2025",
      isOnSale: false
    }
  ];

  return (
    <div className="flex-1">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#a45827]">
            TẤT CẢ SÁCH
          </h1>
          <a
            href="#"
            className="text-[#67c2cf] hover:underline text-sm hidden sm:block"
          >
            View all Medicine titles
          </a>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-4 sm:space-x-8">
            <button className="pb-2 border-b-2 border-[#a45827] text-[#a45827] font-medium text-sm">
              BOOK
            </button>
            <button className="pb-2 text-gray-500 hover:text-gray-700 text-sm">
              EBOOK
            </button>
            <button className="pb-2 text-gray-500 hover:text-gray-700 text-sm">
              JOURNAL
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SÁCH MỚI</h2>
        </div>
      </div>

      {/* Updated grid to show 2 columns on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center mt-8 space-x-2">
        <div className="w-3 h-3 bg-[#a45827] rounded-full"></div>
        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}