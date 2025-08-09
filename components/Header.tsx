'use client'
import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainNavigation from './MainNavigation';
import { useCartStore } from '@/hooks/use-cart';
import CartModal from './CartModal';

interface HeaderProps {
  onMobileMenuClick: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const Header = ({ onMobileMenuClick, onSearch, searchQuery = "" }: HeaderProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const { user } = useUser();
  const { totalItems } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearchQuery.trim());
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  return (
    <header className="bg-background border-b sticky top-0 z-[60] md:z-[70]">
      {/* Top bar */}
      <div className="bg-muted/30 px-4 py-2 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6 text-muted-foreground">
            <span className="flex items-center gap-1">
              🚚 Giao hàng miễn phí
            </span>
            <span className="flex items-center gap-1">
              💳 Thanh toán an toàn
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {/* Clerk Authentication for Desktop */}
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton 
                  mode="modal"
                  fallbackRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/'}
                >
                  <Button variant="link" className="text-sm p-0 h-auto">
                    Đăng nhập
                  </Button>
                </SignInButton>
                <span>|</span>
                <SignUpButton 
                  mode="modal"
                  fallbackRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/'}
                >
                  <Button variant="link" className="text-sm p-0 h-auto">
                    Tạo tài khoản
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <span className="text-sm text-muted-foreground mr-2">
                  Xin chào {user?.emailAddresses[0]?.emailAddress}
                </span>
                <UserButton 
                  afterSignOutUrl={typeof window !== 'undefined' ? window.location.href : '/'}
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
              </SignedIn>
            </div>
            
            {/* Desktop Cart - Fixed */}
            <div className="relative" ref={cartRef}>
              <div
                className="relative cursor-pointer"
                onClick={() => setIsCartOpen((prev) => !prev)}
              >
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#F35C7A] rounded-full text-white text-xs flex items-center justify-center">
                      {totalItems}
                    </div>
                  )}
                </Button>
              </div>
              {isCartOpen && <CartModal />}
            </div>
          </div>
          
          {/* Mobile icons */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Clerk Authentication for Mobile */}
            <SignedOut>
              <SignInButton 
                mode="modal"
                fallbackRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/'}
              >
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl={typeof window !== 'undefined' ? window.location.href : '/'}
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </SignedIn>
            
            {/* Mobile Cart */}
            <div className="relative">
              <div
                className="relative cursor-pointer"
                onClick={() => setIsCartOpen((prev) => !prev)}
              >
                <ShoppingCart 
                  className="h-5 w-5 hover:opacity-80 transition-opacity"
                />
                {totalItems > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#F35C7A] rounded-full text-white text-xs flex items-center justify-center">
                    {totalItems}
                  </div>
                )}
              </div>
              {isCartOpen && <CartModal />}
            </div>
            
            <Button variant="ghost" size="icon" onClick={onMobileMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <span className='text-blue-950 text-xl font-bold'>ew</span>
            <img src="/ewyss.png" alt="ewYss" className="h-12 w-auto" />
            <span className='text-blue-950 text-xl font-bold'>ss</span>
          </div>

          {/* Search bar - responsive for mobile */}
          <div className="flex flex-1 max-w-2xl mx-4 md:mx-8">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              <div className="relative flex-1">
                <Input
                  placeholder="Tìm kiếm sách..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="md:rounded focus-visible:ring-0 text-sm"
                />
              </div>
              <Button 
                type="submit"
                className="md:rounded-l-none rounded-l-none"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <MainNavigation />
    </header>
  );
};