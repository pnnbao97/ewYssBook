import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  price: string;
  publicationDate: string;
  isOnSale?: boolean;
}

export default function ProductCard({
  id,
  title,
  image,
  price,
  publicationDate,
  isOnSale
}: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <Link href={`/product/${id}`}>
            <img
              src={image}
              alt={title}
              className="w-full h-48 object-cover rounded-md hover:opacity-90 cursor-pointer transition-opacity"
            />
          </Link>
          <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="space-y-2">
          <Link href={`/product/${id}`}>
            <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-3 hover:text-[#67c2cf] cursor-pointer">
              {title}
            </h3>
          </Link>

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

          <Button
            className="w-full bg-[#67c2cf] hover:bg-[#5bb0bd] text-white"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
