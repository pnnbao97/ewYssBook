'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, CheckCircle, TestTube } from 'lucide-react'

interface DevPurchaseButtonProps {
  bookId: string
  bookTitle: string
  bookSlug: string
  coverImageUrl: string | null
  colorPrice: number
  blackAndWhitePrice: number
  livebookPrice: number | null
  onPurchaseSuccess: () => void
}

export default function DevPurchaseButton({
  bookId,
  bookTitle,
  bookSlug,
  coverImageUrl,
  colorPrice,
  blackAndWhitePrice,
  livebookPrice,
  onPurchaseSuccess
}: DevPurchaseButtonProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleDevPurchase = async () => {
    setIsPurchasing(true)

    try {
      // Call the dev purchase API
      const response = await fetch('/api/dev/purchase-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: bookId,
          version: 'color',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Dev purchase successful:', data)

        // Show success message
        setPurchaseSuccess(true)
        onPurchaseSuccess()

        // Reset after 3 seconds
        setTimeout(() => {
          setPurchaseSuccess(false)
        }, 3000)
      } else {
        const errorData = await response.json()
        console.error('Dev purchase failed:', errorData)
        alert('Mua phát triển thất bại: ' + errorData.message)
      }
    } catch (error) {
      console.error('Dev purchase error:', error)
      alert('Lỗi mua phát triển: ' + error)
    } finally {
      setIsPurchasing(false)
    }
  }

  if (purchaseSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Mua phát triển thành công!</span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Sách đã được mua thành công trong chế độ phát triển. Bạn có thể đọc ngay bây giờ!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-yellow-800 font-medium text-sm">Chế độ phát triển</span>
      </div>
      <p className="text-yellow-700 text-sm mb-3">
        Nút này chỉ xuất hiện trong chế độ phát triển cho mục đích thử nghiệm.
      </p>
      <Button
        onClick={handleDevPurchase}
        disabled={isPurchasing}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        size="sm"
      >
        {isPurchasing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Đang xử lý...
          </>
        ) : (
          <>
            <TestTube className="w-4 h-4 mr-2" />
            Mua phát triển (Bản màu)
          </>
        )}
      </Button>
      <p className="text-yellow-600 text-xs mt-2 text-center">
        Mô phỏng mua bản màu cho mục đích thử nghiệm
      </p>
    </div>
  )
}
