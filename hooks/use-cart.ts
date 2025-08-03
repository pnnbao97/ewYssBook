// hooks/use-cart.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Định nghĩa types cho cart items
export interface CartItem {
  id: string; // unique identifier cho mỗi item trong cart
  bookId: number;
  version: 'color' | 'photo';
  quantity: number;
  addedAt: Date;
  
  // Thông tin book (có thể lấy từ props hoặc context khác)
  bookTitle: string;
  bookSlug: string; // slug để tạo link đến trang chi tiết sách
  bookCoverUrl: string; // URL của ảnh bìa sách
  bookPrice: number;
  bookSalePrice?: number;
  maxQuantity?: number; // số lượng tối đa có thể mua
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  
  // Actions - trả về thông tin để component xử lý toast
  addItem: (bookId: number, version: 'color' | 'photo', bookTitle: string, bookSlug: string, bookCoverUrl: string, bookPrice: number, bookSalePrice: number, maxQuantity: number, quantity?: number) => { success: boolean; message: string; isUpdate: boolean };
  updateQuantity: (itemId: string, quantity: number) => { success: boolean; message: string };
  removeItem: (itemId: string) => { success: boolean; message: string };
  clearCart: () => void;
  
  // Utilities
  calculateItemPrice: (item: CartItem) => number;
  recalculateTotals: () => void;
  getItemByBookId: (bookId: number, version: 'color' | 'photo') => CartItem | undefined;
  getItemById: (itemId: string) => CartItem | undefined;
}

// Helper function để tạo unique ID cho cart item
const generateCartItemId = (bookId: number, version: 'color' | 'photo'): string => {
  return `${bookId}-${version}`;
};

// Helper function để calculate giá của một item
const calculateItemPrice = (item: CartItem): number => {
  const price = item.bookPrice;
  return price * item.quantity;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      calculateItemPrice,

      recalculateTotals: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
        set({ totalItems, totalPrice });
      },

      getItemByBookId: (bookId: number, version: 'color' | 'photo') => {
        const { items } = get();
        return items.find(item => item.bookId === bookId && item.version === version);
      },

      getItemById: (itemId: string) => {
        const { items } = get();
        return items.find(item => item.id === itemId);
      },

      addItem: (bookId: number, version: 'color' | 'photo', bookTitle: string, bookSlug: string, bookCoverUrl: string, bookPrice: number, bookSalePrice: number, maxQuantity: number, quantity = 1) => {
        const { items } = get();
        const itemId = generateCartItemId(bookId, version);
        const existingItem = items.find(item => item.id === itemId);

        if (existingItem) {
          // Cập nhật quantity của item đã có
          const maxQuantityLimit = existingItem.maxQuantity || 999;
          const newQuantity = Math.min(existingItem.quantity + quantity, maxQuantityLimit);
          
          if (newQuantity > existingItem.quantity) {
            const updatedItems = items.map(item =>
              item.id === itemId
                ? { ...item, quantity: newQuantity }
                : item
            );
            set({ items: updatedItems });
            get().recalculateTotals();
            return { success: true, message: 'Đã cập nhật số lượng trong giỏ hàng', isUpdate: true };
          } else {
            return { success: false, message: 'Đã đạt số lượng tối đa cho sản phẩm này', isUpdate: true };
          }
        } else {
          // Thêm item mới
          const newItem: CartItem = {
            id: itemId,
            bookId,
            version,
            quantity,
            addedAt: new Date(),
            bookTitle,
            bookSlug,
            bookCoverUrl,
            bookPrice,
            bookSalePrice,
            maxQuantity
          };
          
          set({ items: [...items, newItem] });
          get().recalculateTotals();
          return { success: true, message: 'Đã thêm vào giỏ hàng', isUpdate: false };
        }
      },

      updateQuantity: (itemId: string, quantity: number) => {
        // Validate input
        if (quantity < 0) {
          return { success: false, message: 'Số lượng không thể âm' };
        }

        // If quantity is 0, remove item
        if (quantity === 0) {
          return get().removeItem(itemId);
        }

        const { items } = get();
        const item = items.find(item => item.id === itemId);
        
        if (!item) {
          return { success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng' };
        }

        // Check max quantity
        const maxQuantityLimit = item.maxQuantity || 999;
        const finalQuantity = Math.min(quantity, maxQuantityLimit);

        const updatedItems = items.map(item =>
          item.id === itemId
            ? { ...item, quantity: finalQuantity }
            : item
        );

        set({ items: updatedItems });
        get().recalculateTotals();

        if (finalQuantity < quantity) {
          return { success: true, message: `Số lượng tối đa cho sản phẩm này là ${maxQuantityLimit}` };
        }

        return { success: true, message: 'Đã cập nhật số lượng' };
      },

      removeItem: (itemId: string) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.id !== itemId);
        
        set({ items: updatedItems });
        get().recalculateTotals();
        return { success: true, message: 'Đã xóa khỏi giỏ hàng' };
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate totals after rehydrating from localStorage
          state.recalculateTotals();
        }
      },
    },
  ),
);