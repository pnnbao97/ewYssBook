import { PrismaClient } from '../lib/generated/prisma'

// Chỉ khởi tạo, không có logic gì khác
const prisma = new PrismaClient()

export default prisma