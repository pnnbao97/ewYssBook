'use client'
import { useState } from 'react';
import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import React from 'react'
import Sidebar from '@/components/Sidebar'

const layout = ({children}: {children: React.ReactNode}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  
    const handleMobileMenuClick = () => {
      setSidebarOpen(true);
    };
  
    const handleSidebarClose = () => {
      setSidebarOpen(false);
    };
  return (
    <>
    <Header onMobileMenuClick={handleMobileMenuClick} />
    {children}
    <Footer />
    <div className='flex md:hidden'>
    <Sidebar 
      isOpen={sidebarOpen}
      onClose={handleSidebarClose}
    />
    </div>
    </>
  )
}

export default layout