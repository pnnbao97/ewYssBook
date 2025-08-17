import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample books
  const books = [
    {
      title: 'Sản khoa Gabbe',
      slug: 'san-khoa-gabbe',
      author: 'Dr. Steven G. Gabbe',
      isbn: '9780323827234',
      summary: 'Comprehensive textbook on obstetrics and gynecology, covering all aspects of women\'s health and pregnancy care.',
      coverImageUrl: '/placeholder-book.png',
      primaryCategory: 'Sản phụ khoa',
      relatedCategories: ['Sản khoa', 'Phụ khoa', 'Y học phụ nữ'],
      details: 'Detailed content about obstetrics and gynecology...',
      tableOfContents: 'Chapter 1: Introduction to Obstetrics\nChapter 2: Normal Pregnancy...',
      previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      previewImageUrl: ['/placeholder-book.png'],
      isPublished: true,
      availableForPreorder: false,
      colorPrice: 250000, // 2,500,000 VND in cents
      blackAndWhitePrice: 180000, // 1,800,000 VND in cents
      livebookPrice: 300000, // 3,000,000 VND in cents
      hasColorPriceSale: false,
      isSeries: false,
      hasMoreThanOneVolume: false
    },
    {
      title: 'Tim mạch học Braunwald',
      slug: 'tim-mach-braunwald',
      author: 'Dr. Eugene Braunwald',
      isbn: '9780323249747',
      summary: 'The definitive textbook on cardiovascular medicine, covering all aspects of heart disease and treatment.',
      coverImageUrl: '/placeholder-book.png',
      primaryCategory: 'Tim mạch',
      relatedCategories: ['Tim mạch', 'Nội khoa', 'Tim học'],
      details: 'Comprehensive cardiovascular medicine content...',
      tableOfContents: 'Chapter 1: Cardiovascular System Overview\nChapter 2: Heart Failure...',
      previewUrl: '/preview/tim-mach-braunwald',
      previewImageUrl: ['/placeholder-book.png'],
      isPublished: true,
      availableForPreorder: false,
      colorPrice: 350000, // 3,500,000 VND in cents
      blackAndWhitePrice: 250000, // 2,500,000 VND in cents
      livebookPrice: 400000, // 4,000,000 VND in cents
      hasColorPriceSale: false,
      isSeries: false,
      hasMoreThanOneVolume: false
    },
    {
      title: 'Nội khoa Harrison',
      slug: 'noi-khoa-harrison',
      author: 'Dr. Dennis L. Kasper',
      isbn: '9781259644030',
      summary: 'The most trusted textbook in internal medicine, providing comprehensive coverage of medical conditions.',
      coverImageUrl: '/placeholder-book.png',
      primaryCategory: 'Nội khoa',
      relatedCategories: ['Nội khoa', 'Y học tổng quát', 'Chẩn đoán'],
      details: 'Extensive internal medicine content...',
      tableOfContents: 'Chapter 1: Introduction to Internal Medicine\nChapter 2: Cardiovascular Disease...',
      previewUrl: '/preview/noi-khoa-harrison',
      previewImageUrl: ['/placeholder-book.png'],
      isPublished: true,
      availableForPreorder: false,
      colorPrice: 400000, // 4,000,000 VND in cents
      blackAndWhitePrice: 300000, // 3,000,000 VND in cents
      livebookPrice: 450000, // 4,500,000 VND in cents
      hasColorPriceSale: false,
      isSeries: false,
      hasMoreThanOneVolume: false
    }
  ]

  for (const bookData of books) {
    try {
      const book = await prisma.book.upsert({
        where: { slug: bookData.slug },
        update: {},
        create: bookData
      })
      console.log(`✅ Created/Updated book: ${book.title}`)
    } catch (error) {
      console.error(`❌ Error creating book ${bookData.title}:`, error)
    }
  }

  // Create a sample admin user
  try {
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@ewyss.com' },
      update: {},
      create: {
        clerkId: 'admin-clerk-id', // You'll need to replace this with actual Clerk ID
        email: 'admin@ewyss.com',
        name: 'Admin User',
        role: 'admin'
      }
    })
    console.log(`✅ Created/Updated admin user: ${adminUser.email}`)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
