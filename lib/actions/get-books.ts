// lib/actions/get-books.ts
'use server'
import prisma from "@/lib/prisma";
import { Book } from "@prisma/client";

export async function getBookBySlug(slug: string): Promise<{ success: boolean; data?: Book; message?: string }> {
    try {
        const book = await prisma.book.findUnique({
            where: { slug }
        });
        if (!book) {
            return { success: false, message: "Book not found" };
        }
        return { success: true, data: book };
    } catch (error) {
        console.error("Error fetching book by slug:", error);
        return { success: false, message: "Error fetching book" };
    }
}

export async function getAllBooks(page: number = 1, limit: number = 12): Promise<{ success: boolean; data?: Book[]; totalCount?: number; message?: string }> {
    try {
        const skip = (page - 1) * limit;
        
        const [books, totalCount] = await Promise.all([
            prisma.book.findMany({
                // where: { isPublished: true },
                orderBy: { createdAt: 'desc' }, // Mới nhất trước
                skip,
                take: limit
            }),
            prisma.book.count({
                // where: { isPublished: true }
            })
        ]);

        return { success: true, data: books, totalCount };
    } catch (error) {
        console.error("Error fetching all books:", error);
        return { success: false, message: "Error fetching books" };
    }
}

export async function getBooksByCategory(
    category: string, 
    page: number = 1, 
    limit: number = 12
): Promise<{ success: boolean; data?: Book[]; totalCount?: number; message?: string }> {
    try {
        const skip = (page - 1) * limit;
        
        const [books, totalCount] = await Promise.all([
            prisma.book.findMany({
                where: { 
                    // isPublished: true,
                    primaryCategory: category
                },
                orderBy: { createdAt: 'desc' }, // Mới nhất trước
                skip,
                take: limit
            }),
            prisma.book.count({
                where: { 
                    // isPublished: true,
                    primaryCategory: category
                }
            })
        ]);

        return { success: true, data: books, totalCount };
    } catch (error) {
        console.error("Error fetching books by category:", error);
        return { success: false, message: "Error fetching books by category" };
    }
}

export async function searchBooks(
    query: string, 
    page: number = 1, 
    limit: number = 12
): Promise<{ success: boolean; data?: Book[]; totalCount?: number; message?: string }> {
    try {
        const skip = (page - 1) * limit;
        
        const [books, totalCount] = await Promise.all([
            prisma.book.findMany({
                where: { 
                    // isPublished: true,
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { author: { contains: query, mode: 'insensitive' } },
                        { summary: { contains: query, mode: 'insensitive' } }
                    ]
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.book.count({
                where: { 
                    // isPublished: true,
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { author: { contains: query, mode: 'insensitive' } },
                        { summary: { contains: query, mode: 'insensitive' } }
                    ]
                }
            })
        ]);

        return { success: true, data: books, totalCount };
    } catch (error) {
        console.error("Error searching books:", error);
        return { success: false, message: "Error searching books" };
    }
}

export async function getCategoriesWithCount(): Promise<{ success: boolean; data?: { name: string; count: number }[]; message?: string }> {
    try {
        const categories = await prisma.book.groupBy({
            by: ['primaryCategory'],
            where: { isPublished: true },
            _count: { primaryCategory: true },
            orderBy: { primaryCategory: 'asc' }
        });

        const categoriesWithCount = categories.map(cat => ({
            name: cat.primaryCategory,
            count: cat._count.primaryCategory
        }));

        return { success: true, data: categoriesWithCount };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { success: false, message: "Error fetching categories" };
    }
}