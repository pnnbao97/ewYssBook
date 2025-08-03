export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  isbn: string;
  publicationDate: string;
  edition: string;
  description: string;
  inStock: boolean;
  isNew?: boolean;
  isPreOrder?: boolean;
}

export const categories = [
  { id: 'allergy', name: 'Allergy & Clinical Immunology', count: 178 },
  { id: 'anatomy', name: 'Anatomy', count: 272 },
  { id: 'anesthesiology', name: 'Anesthesiology', count: 146 },
  { id: 'behavioral', name: 'Behavioral Science', count: 13 },
  { id: 'biochemistry', name: 'Biochemistry/Chemistry', count: 34 },
  { id: 'cardiology', name: 'Cardiology', count: 753 },
  { id: 'clinical', name: 'Clinical/General Medicine', count: 990 },
  { id: 'critical', name: 'Critical Care', count: 326 },
  { id: 'dermatology', name: 'Dermatology & Cosmetic Surgery', count: 243 },
  { id: 'education', name: 'Education in Medicine', count: 60 },
  { id: 'emergency', name: 'Emergency Medicine', count: 258 },
  { id: 'endocrinology', name: 'Endocrinology', count: 159 },
  { id: 'epidemiology', name: 'Epidemiology & Public Health', count: 45 },
  { id: 'evidence', name: 'Evidence Based Medicine', count: 53 },
  { id: 'gastroenterology', name: 'Gastroenterology & Hepatology', count: 426 },
  { id: 'genetics', name: 'Genetics', count: 16 },
  { id: 'geriatrics', name: 'Geriatrics', count: 141 }
];

export const books: Book[] = [
  {
    id: '1',
    title: 'Clinical Pharmacology, International Edition',
    author: 'Edited by Fraz A. Mir',
    price: 47.99,
    rating: 0,
    reviews: 0,
    image: '/placeholder-book.jpg',
    category: 'clinical',
    isbn: '9780443111495',
    publicationDate: 'Jan 2026',
    edition: '13th Edition',
    description: 'Comprehensive clinical pharmacology reference for medical students and practitioners.',
    inStock: false,
    isNew: true,
    isPreOrder: true
  },
  {
    id: '2',
    title: 'Handbook of Nitrous Oxide and Oxygen Sedation',
    author: 'By Morris S. Clark, Ann L. Brunick',
    price: 51.24,
    originalPrice: 67.99,
    discount: 25,
    rating: 4.5,
    reviews: 23,
    image: '/placeholder-book.jpg',
    category: 'anesthesiology',
    isbn: '9780323827447',
    publicationDate: 'May 2024',
    edition: '6th Edition',
    description: 'Essential guide to nitrous oxide and oxygen sedation techniques.',
    inStock: true
  },
  {
    id: '3',
    title: "Braunwald's Heart Disease: International Edition",
    author: 'Edited by Robert O. Bonow',
    price: 175.99,
    rating: 5,
    reviews: 156,
    image: '/placeholder-book.jpg',
    category: 'cardiology',
    isbn: '9780323249747',
    publicationDate: 'Dec 2025',
    edition: '13th Edition',
    description: 'The leading source of reliable cardiology information for practitioners and trainees worldwide.',
    inStock: true
  },
  {
    id: '4',
    title: 'Guyton and Hall Textbook of Medical Physiology',
    author: 'By John E. Hall',
    price: 101.24,
    originalPrice: 134.99,
    discount: 25,
    rating: 4.8,
    reviews: 289,
    image: '/placeholder-book.jpg',
    category: 'clinical',
    isbn: '9780443111686',
    publicationDate: 'Aug 2024',
    edition: '14th Edition',
    description: 'The world\'s leading text on medical physiology.',
    inStock: true
  },
  {
    id: '5',
    title: 'Clinical Chemistry - International Edition',
    author: 'By William J. Marshall',
    price: 33.99,
    rating: 4.2,
    reviews: 67,
    image: '/placeholder-book.jpg',
    category: 'biochemistry',
    isbn: '9780443112471',
    publicationDate: 'Mar 2024',
    edition: '9th Edition',
    description: 'Comprehensive clinical chemistry reference.',
    inStock: true
  },
  {
    id: '6',
    title: 'Essential Surgery International Edition',
    author: 'Edited by Philip J. Dookin',
    price: 38.99,
    rating: 4.6,
    reviews: 134,
    image: '/placeholder-book.jpg',
    category: 'clinical',
    isbn: '9780443114281',
    publicationDate: 'Jan 2024',
    edition: '6th Edition',
    description: 'Essential surgical knowledge for medical students.',
    inStock: true
  },
  {
    id: '7',
    title: 'Robbins, Cotran & Kumar Pathologic Basis of Disease',
    author: 'Edited by Vinay Kumar',
    price: 104.99,
    originalPrice: 139.99,
    discount: 25,
    rating: 4.9,
    reviews: 412,
    image: '/placeholder-book.jpg',
    category: 'clinical',
    isbn: '9780443115837',
    publicationDate: 'Apr 2024',
    edition: '11th Edition',
    description: 'The most comprehensive, authoritative, and consumable resource for understanding disease and disease processes.',
    inStock: true
  },
  {
    id: '8',
    title: 'Netter\'s Atlas of Human Anatomy',
    author: 'By Frank H. Netter',
    price: 89.99,
    rating: 4.7,
    reviews: 523,
    image: '/placeholder-book.jpg',
    category: 'anatomy',
    isbn: '9780443119477',
    publicationDate: 'Feb 2024',
    edition: '8th Edition',
    description: 'The gold standard of human anatomy atlases.',
    inStock: true
  }
];