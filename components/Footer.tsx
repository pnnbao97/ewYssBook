import { Facebook, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* ewYss */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">ewYss</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-[#67c2cf] hover:underline">Về chúng tôi</a></li>
              <li><a href="#" className="text-[#67c2cf] hover:underline">Cần trợ giúp?</a></li>
              <li><a href="#" className="text-[#67c2cf] hover:underline">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-[#67c2cf] hover:underline">Điều khoản và điều kiện mua hàng</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Tài khoản của tôi</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-[#67c2cf] hover:underline">Tài khoản của tôi</a></li>
              <li><a href="#" className="text-[#67c2cf] hover:underline">Trạng thái đơn hàng</a></li>
            </ul>
          </div>

          {/* Authors
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Authors</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-[#67c2cf] hover:underline">Author Hub</a></li>
              <li><a href="#" className="text-[#67c2cf] hover:underline">Book Author Support Hub</a></li>
              <li><a href="#" className="text-[#67c2cf] hover:underline">Health Sciences Publishing</a></li>
              <li><a href="#" className="text-[#67c2cf] hover:underline">Permissions Requests</a></li>
              <li><a href="#" className="text-[#67c2cf] hover:underline">The Bookmark</a></li>
            </ul>

            <h3 className="font-semibold text-gray-900 mb-4 mt-6">Tài khoản của tôi</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-[#67c2cf] hover:underline">Tài khoản của tôi</a></li>
              <li><a href="#" className="text-[#67c2cf] hover:underline">Trạng thái đơn hàng</a></li>
            </ul>
          </div> */}

          {/* Related Sites & Connect */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Các trang web liên quan</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-[#67c2cf] hover:underline">ewYss Trans</a></li>
              {/* <li><a href="#" className="text-[#67c2cf] hover:underline">ewYss Clinics</a></li> */}
              {/* <li><a href="#" className="text-[#67c2cf] hover:underline">ewYss Vision</a></li> */}
              {/* <li><a href="#" className="text-[#67c2cf] hover:underline">ewYss Images</a></li> */}
            </ul>

            <h3 className="font-semibold text-gray-900 mb-4 mt-6">Liên hệ</h3>
            <div className="flex space-x-3">
              <a href="#" className="text-[#67c2cf] hover:text-[#345763]">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#67c2cf] hover:text-[#345763]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#67c2cf] hover:text-[#345763]">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <img
                src="/ewyss-lg.png"
                alt="ewYss"
                className="h-40"
              />
              {/* <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Powered by</span>
                <img
                  src="https://ext.same-assets.com/3854006003/1809455972.png"
                  alt="RELX"
                  className="h-6"
                />
              </div> */}
            </div>

            <div className="text-sm text-gray-600 max-w-2xl">
              <p className="mb-2">
                ewYss với đội ngũ chuyên gia hàng đầu trong lĩnh vực y khoa kết hợp với công nghệ Trí tuệ Nhân tạo được đào tạo đặc thù với bộ dữ liệu chuyên ngành y từ dịch thuật đến chẩn đoán hình ảnh, chúng tôi tự hào là đơn vị tiên phong trong cuộc cách mạng học sâu ứng dụng vào ngành Y tế tại Việt Nam.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <a href="#" className="hover:underline hover:text-[#67c2cf]">Cài đặt Cookie</a>
                <span>|</span>
                <a href="#" className="hover:underline hover:text-[#67c2cf]">Quyền riêng tư của bạn</a>
                {/* <span>|</span>
                <a href="#" className="hover:underline hover:text-[#67c2cf]">Hotline: 1900-ewYss</a> */}
              </div>
              <div className="text-right">
                <p className="mb-1">Bản quyền © 2025 ewYss và các đối tác. Tất cả quyền được bảo lưu.</p>
                <p className="mb-1">Bao gồm quyền khai thác dữ liệu, đào tạo AI và các công nghệ tương tự.</p>
                <p>Góp ý hoặc báo lỗi? Liên hệ <a href="#" className="text-[#67c2cf] hover:underline">Trung tâm Hỗ trợ</a> của chúng tôi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
