'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, CheckCircle, TestTube } from 'lucide-react'

interface TestDevPurchaseButtonProps {
  bookId: string
  bookTitle: string
  bookSlug: string
  coverImageUrl: string | null
  colorPrice: number
  blackAndWhitePrice: number
  livebookPrice: number | null
  onPurchaseSuccess: () => void
}

export default function TestDevPurchaseButton({
  bookId,
  bookTitle,
  bookSlug,
  coverImageUrl,
  colorPrice,
  blackAndWhitePrice,
  livebookPrice,
  onPurchaseSuccess
}: TestDevPurchaseButtonProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleTestPurchase = async () => {
    setIsPurchasing(true)
    
    try {
      // Call the test dev purchase API (no auth required)
      const response = await fetch('/api/test/dev-purchase-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: bookId,
          version: 'color',
          testUserId: 'test-user-playwright'
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Test purchase successful:', data)
        
        // Show success message
        setPurchaseSuccess(true)
        onPurchaseSuccess()
        
        // Reset after 3 seconds
        setTimeout(() => {
          setPurchaseSuccess(false)
        }, 3000)
      } else {
        const errorData = await response.json()
        console.error('Test purchase failed:', errorData)
        alert('Mua thử nghiệm thất bại: ' + errorData.message)
      }
    } catch (error) {
      console.error('Test purchase error:', error)
      alert('Lỗi mua thử nghiệm: ' + error)
    } finally {
      setIsPurchasing(false)
    }
  }

  if (purchaseSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Mua thử nghiệm thành công!</span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Sách đã được mua thành công trong chế độ thử nghiệm. Bạn có thể đọc ngay bây giờ!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TestTube className="h-4 h-4 text-blue-500" />
        <span className="text-blue-800 font-medium text-sm">Chế độ thử nghiệm (Không cần xác thực)</span>
      </div>
      <p className="text-blue-700 text-sm mb-3">
        Nút này hoạt động mà không cần xác thực cho mục đích thử nghiệm.
      </p>
      <Button
        onClick={handleTestPurchase}
        disabled={isPurchasing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        {isPurchasing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Đang xử lý...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Mua thử nghiệm (Bản màu)
          </>
        )}
      </Button>
      <p className="text-blue-600 text-xs mt-2 text-center">
        Mô phỏng mua bản màu cho mục đích thử nghiệm
      </p>
    </div>
  )
}
