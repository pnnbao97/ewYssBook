import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function MainNavigation() {
  return (
    <nav className="bg-[#345763] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center px-4 py-4 hover:bg-[#2c4a54] transition-colors">
              <span className="font-medium md:text-lg text-xs">CHUYÊN NGÀNH</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 z-[80]">
              <div className="grid grid-cols-2 gap-2 p-2">
                <div>
                  {/* <h3 className="font-semibold text-[#345763] mb-2">Medicine</h3> */}
                  <DropdownMenuItem>Cấp cứu</DropdownMenuItem>
                  <DropdownMenuItem>Chẩn đoán hình ảnh</DropdownMenuItem>
                  <DropdownMenuItem>Cơ xương khớp</DropdownMenuItem>
                  <DropdownMenuItem>Da liễu</DropdownMenuItem>
                  <DropdownMenuItem>Di truyền</DropdownMenuItem>
                  <DropdownMenuItem>Dược lý</DropdownMenuItem>
                  <DropdownMenuItem>Giải phẫu</DropdownMenuItem>
                  <DropdownMenuItem>Hóa sinh</DropdownMenuItem>
                  <DropdownMenuItem>Hô hấp</DropdownMenuItem>
                  <DropdownMenuItem>Huyết học</DropdownMenuItem>
                  <DropdownMenuItem>Ngoại khoa</DropdownMenuItem>
                </div>
                <div>
                  <DropdownMenuItem>Nội khoa</DropdownMenuItem>
                  <DropdownMenuItem>Nội tiết</DropdownMenuItem>
                  <DropdownMenuItem>Sản phụ khoa</DropdownMenuItem>
                  <DropdownMenuItem>Sinh lý</DropdownMenuItem>
                  <DropdownMenuItem>Thần kinh</DropdownMenuItem>
                  <DropdownMenuItem>Tiết niệu</DropdownMenuItem>
                  <DropdownMenuItem>Tiêu hóa</DropdownMenuItem>
                  <DropdownMenuItem>Tim mạch</DropdownMenuItem>
                  <DropdownMenuItem>Truyền nhiễm</DropdownMenuItem>
                  <DropdownMenuItem>Ung bướu</DropdownMenuItem>
                  <DropdownMenuItem>Vi sinh-Miễn dịch học</DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center px-4 py-4 hover:bg-[#2c4a54] transition-colors">
              <span className="font-medium text-lg">PHÂN LOẠI</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[80]">
              <DropdownMenuItem>Sách</DropdownMenuItem>
              <DropdownMenuItem>Livebook</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          <a href="#" className="px-4 py-4 hover:bg-[#2c4a54] transition-colors font-medium md:text-lg text-xs">
            CẬP NHẬT GUIDELINE
          </a>
                 </div>
       </div>
     </nav>
  );
}
