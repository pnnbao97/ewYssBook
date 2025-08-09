"use client";

import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";

interface CategoryItem {
  name: string;
  count: number;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  categories: CategoryItem[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function FilterSection({ title, children, defaultExpanded = true }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3"
      >
        {title}
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isExpanded && <div>{children}</div>}
    </div>
  );
}

export default function Sidebar({ 
  isOpen = true, 
  onClose, 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: SidebarProps) {
  // Default categories từ code gốc của bạn
  const defaultCategories: CategoryItem[] = [
    { name: "Cấp cứu", count: 84 },
    { name: "Chẩn đoán hình ảnh", count: 74 },
    { name: "Cơ xương khớp", count: 20 },
    { name: "Da liễu", count: 10 },
    { name: "Dược lý", count: 18 },
    { name: "Giải phẫu - Giải phẫu bệnh", count: 74 },
    { name: "Hóa sinh - Di truyền", count: 5 },
    { name: "Hô hấp", count: 9 },
    { name: "Huyết học", count: 421 },
    { name: "Miễn dịch - Dị ứng", count: 31 },
    { name: "Ngoại khoa", count: 10 },
    { name: "Nhi khoa", count: 7 },
    { name: "Nội khoa", count: 15 },
    { name: "Nội tiết", count: 89 },
    { name: "san-phu-khoa", count: 156 },
    { name: "Sinh lý - Sinh lý bệnh", count: 6 },
    { name: "Thần kinh học", count: 12 },
    { name: "Tiết niệu", count: 134 },
    { name: "Tiêu hóa - Gan mật", count: 67 },
    { name: "Tim mạch", count: 23 },
    { name: "Truyền nhiễm", count: 106 },
    { name: "Ung bướu", count: 170 },
    { name: "Y học gia đình", count: 224 },
  ];

  // Sử dụng danh sách từ database nếu có, nếu không thì dùng default
  const displayCategories = defaultCategories;
  const totalBooksCount = displayCategories.reduce((total, cat) => total + cat.count, 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-[80]"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative
        fixed inset-y-0 left-0 z-[90] md:z-[60]
        w-80 md:w-64 bg-white
        transition-transform duration-300 ease-in-out
        overflow-y-auto
      `}>
        {/* Mobile close button */}
        {onClose && (
          <div className="md:hidden flex justify-end p-4 border-b">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">SÁCH</h3>

          <FilterSection title="Chuyên khoa" defaultExpanded={true}>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* All books option */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onCategorySelect(null)}
                  className={`text-sm text-left hover:underline ${
                    selectedCategory === null 
                      ? "text-[#a45827] font-medium" 
                      : "text-[#67c2cf]"
                  }`}
                >
                  Tất cả sách
                </button>
                <Badge variant="secondary" className="text-xs">
                  {totalBooksCount}
                </Badge>
              </div>
              
              {/* Category options */}
              {displayCategories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <button
                    onClick={() => onCategorySelect(category.name)}
                    className={`text-sm text-left hover:underline ${
                      selectedCategory === category.name 
                        ? "text-[#a45827] font-medium" 
                        : "text-[#67c2cf]"
                    }`}
                  >
                    {category.name}
                  </button>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="THỂ LOẠI" defaultExpanded={false}>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="book" className="mr-2" />
                <label htmlFor="book" className="text-sm">Sách in</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="ebook" className="mr-2" />
                <label htmlFor="ebook" className="text-sm">Livebook</label>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="SERIES" defaultExpanded={false}>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="clinics" className="mr-2" />
                <label htmlFor="clinics" className="text-sm">USMLE Series</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="handbook" className="mr-2" />
                <label htmlFor="handbook" className="text-sm">Secret Series</label>
              </div>
            </div>
          </FilterSection>
        </div>
      </aside>
    </>
  );
}