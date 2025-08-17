import React from 'react'
import { onAuthenticateUser } from '@/lib/actions/users'
import { ClerkLoading, SignInButton } from '@clerk/nextjs'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, User, BookOpen, Shield } from 'lucide-react'

const layout = async ({children}: {children: React.ReactNode}) => {
    // Allow free access in development to unblock dev/testing flows
    if (process.env.NODE_ENV === 'development') {
        return (
            <div className="min-h-screen bg-background">
                {children}
            </div>
        )
    }

    const userData = await onAuthenticateUser()

    if (userData.status !== 200 && userData.status !== 201) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
                <Header />

                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="text-center pb-6">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-700 to-cyan-900 rounded-full flex items-center justify-center">
                                        <Lock className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                                    Đăng nhập để tiếp tục
                                </CardTitle>
                                <p className="text-gray-600 text-sm">
                                    Bạn cần đăng nhập để truy cập vào khu vực này
                                </p>
                            </CardHeader>
                            
                            <CardContent className="space-y-6">
                                {/* <div className="grid grid-cols-1 gap-4"> */}
                                    {/* <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Tài khoản cá nhân</p>
                                            <p className="text-xs text-blue-600">Quản lý thông tin và đơn hàng</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900">Thư viện sách</p>
                                            <p className="text-xs text-green-600">Truy cập sách đã mua</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm font-medium text-purple-900">Bảo mật cao</p>
                                            <p className="text-xs text-purple-600">Thông tin được bảo vệ an toàn</p>
                                        </div>
                                    </div>
                                </div> */}
                                
                                <div className="pt-4">
                                    <SignInButton mode="modal">
                                        <Button className="w-full bg-gradient-to-r from-cyan-700 to-cyan-900 hover:from-cyan-800 hover:to-cyan-950 text-white py-3 text-base font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
                                            <User className="w-5 h-5 mr-2" />
                                            Đăng nhập ngay
                                        </Button>
                                    </SignInButton>
                                    
                                    <p className="text-center text-xs text-gray-500 mt-4">
                                        Bằng cách đăng nhập, bạn đồng ý với{' '}
                                        <span className="text-cyan-700 hover:underline cursor-pointer">
                                            Điều khoản sử dụng
                                        </span>{' '}
                                        và{' '}
                                        <span className="text-cyan-700 hover:underline cursor-pointer">
                                            Chính sách bảo mật
                                        </span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Loading State */}
                    <ClerkLoading>
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                            <Card className="p-8 shadow-xl">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-8 h-8 border-4 border-cyan-700 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-gray-600">Đang xác thực...</p>
                                </div>
                            </Card>
                        </div>
                    </ClerkLoading>
                </div>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen bg-background">
            {children}

            {/* Loading overlay for authenticated users */}
            <ClerkLoading>
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-cyan-700 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-base font-medium text-gray-700">Đang tải...</p>
                    </div>
                </div>
            </ClerkLoading>
        </div>
    )
}

export default layout