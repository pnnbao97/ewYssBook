import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  title: string;
  image: string;
  price: number
  publicationDate: string;
  isOnSale?: boolean;
  author: string;
  slug: string;
}

export default function ProductCard({
  id,
  title,
  image,
  price,
  publicationDate,
  isOnSale,
  author,
  slug
}: ProductCardProps) {
  const { addItem } = useCartStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAddingToCart(true);
    
    // Add item to cart
    addItem(
      id,
      "color",
      title,
      slug,
      image,
      price,
      price,
      100,
      1
    );

    // Show feedback
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="relative mb-4">
          <Link href={`/product/${slug}`}>
            <img
              src={image}
              alt={title}
              className="w-full h-48 object-cover rounded-md hover:opacity-90 cursor-pointer transition-opacity"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                // Only set placeholder if we haven't already tried
                if (img.src !== '/placeholder-book.png') {
                  img.src = '/placeholder-book.png';
                  img.onerror = null; // Prevent infinite retry loop
                }
              }}
            />
          </Link>
          <button 
            type="button"
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Add to favorites"
          >
            <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="flex flex-col flex-grow space-y-2">
          <Link href={`/product/${slug}`}>
            <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-3 hover:text-[#67c2cf] cursor-pointer min-h-[3.75rem]">
              {title}
            </h3>
          </Link>

          <p className="text-xs text-gray-600 font-medium">
            {author}
          </p>

          <p className="text-xs text-gray-500">
            {publicationDate}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {price}
            </span>
            {isOnSale && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                Sale
              </span>
            )}
          </div>

          <div className="mt-auto pt-2">
            <Button
              className="w-full bg-[#67c2cf] hover:bg-[#5bb0bd] text-white disabled:opacity-50"
              size="sm"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}