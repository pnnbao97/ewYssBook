// lib/actions/get-books.ts
'use server'
import prisma from "@/lib/prisma";

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
