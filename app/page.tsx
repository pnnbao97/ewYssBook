'use client'
import { Header } from "@/components/Header";
import MainNavigation from "@/components/MainNavigation";
import Breadcrumb from "@/components/Breadcrumb";
import Sidebar from "@/components/Sidebar";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { getAllBooks, getBooksByCategory, searchBooks, getCategoriesWithCount } from "@/lib/actions/get-books";
import { Book } from "@/lib/generated/prisma";
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();

  // Check for search query in URL params
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const handleMobileMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null); // Clear category when searching
    setCurrentPage(1); // Reset to first page
  };

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategoriesWithCount();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    };
    loadCategories();
  }, []);

  // Load books based on current state
  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      let result;

      if (searchQuery.trim()) {
        result = await searchBooks(searchQuery, currentPage);
      } else if (selectedCategory) {
        result = await getBooksByCategory(selectedCategory, currentPage);
      } else {
        result = await getAllBooks(currentPage);
      }

      if (result.success && result.data) {
        setBooks(result.data);
        setTotalCount(result.totalCount || 0);
      }
      setLoading(false);
    };

    loadBooks();
  }, [selectedCategory, searchQuery, currentPage]);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setSearchQuery(""); // Clear search when selecting category
    setCurrentPage(1); // Reset to first page
    setSidebarOpen(false); // Close mobile sidebar
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMobileMenuClick={handleMobileMenuClick}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      <Breadcrumb />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={handleSidebarClose}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
          <ProductGrid 
            books={books}
            loading={loading}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            totalCount={totalCount}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}