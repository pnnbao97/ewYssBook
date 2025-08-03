import { ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  return (
    <nav className="bg-gray-50 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center text-sm text-gray-600">
          <a href="#" className="hover:text-[#345763]">Trang chủ</a>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900">Sách</span>
        </div>
      </div>
    </nav>
  );
}
