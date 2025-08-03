'use client'
import {Header} from "@/components/Header";
import MainNavigation from "@/components/MainNavigation";
import Breadcrumb from "@/components/Breadcrumb";
import Sidebar from "@/components/Sidebar";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMobileMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMobileMenuClick={handleMobileMenuClick} />
      <Breadcrumb />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={handleSidebarClose}
          />
          <ProductGrid />
        </div>
      </div>

      <Footer />
    </div>
  );
}