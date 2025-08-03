import { Book } from '@/data/books';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 relative">
      {/* Discount badge */}
      {book.discount && (
        <Badge className="absolute top-2 left-2 z-10">
          {book.discount}% OFF
        </Badge>
      )}
      
      {/* New badge */}
      {book.isNew && (
        <Badge className="absolute top-2 right-2 z-10 bg-green-600">
          NEW
        </Badge>
      )}

      <CardContent className="p-4">
        {/* Book image */}
        <Link to={`/book/${book.id}`}>
          <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden aspect-[3/4] cursor-pointer">
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Book</span>
            </div>
          </div>
        </Link>

        {/* Book info */}
        <div className="space-y-2">
          <Link to={`/book/${book.id}`}>
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary cursor-pointer">
              {book.title}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            {book.author}
          </p>
          
          <p className="text-xs text-muted-foreground">
            {book.publicationDate}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(book.rating)}
            </div>
            <span className="text-xs text-muted-foreground">
              {book.rating > 0 ? `${book.rating}%` : ''}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            {book.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${book.originalPrice}
              </span>
            )}
            <span className="text-lg font-bold text-primary">
              ${book.price}
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {book.isPreOrder ? (
              <Button className="w-full">
                Pre-Order
              </Button>
            ) : (
              <Button className="w-full">
                Add to cart
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="flex-1">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="flex-1">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
