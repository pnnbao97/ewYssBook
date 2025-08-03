"use client";

import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";

interface CategoryItem {
  name: string;
  count: number;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function FilterSection({ title, children, defaultExpanded = true }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3"
      >
        {title}
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isExpanded && <div>{children}</div>}
    </div>
  );
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const categories: CategoryItem[] = [
    { name: "Allergy", count: 84 },
    { name: "Anatomy", count: 74 },
    { name: "Anesthesiology", count: 186 },
    { name: "Basic Science", count: 20 },
    { name: "Behavioral Science", count: 10 },
    { name: "Biochemistry", count: 9 },
    { name: "Cardiology", count: 421 },
    { name: "Cell Biology", count: 10 },
    { name: "ClinicalKey", count: 7 },
    { name: "Complementary Medicine", count: 15 },
    { name: "Critical Care", count: 89 },
    { name: "Dermatology", count: 156 },
    { name: "Embryology", count: 12 },
    { name: "Emergency", count: 134 },
    { name: "Endocrinology", count: 67 },
    { name: "Epidemiology", count: 23 },
    { name: "Family Medicine", count: 106 },
    { name: "Gastroenterology", count: 170 },
    { name: "General Medicine", count: 224 },
    { name: "General Surgery", count: 878 },
    { name: "Genetics", count: 5 },
    { name: "Geriatrics", count: 70 },
    { name: "Hematology", count: 153 },
    { name: "Hepatology", count: 75 },
    { name: "Histology", count: 8 },
    { name: "Immunology", count: 31 },
    { name: "Infectious Disease", count: 105 },
    { name: "Internal Medicine", count: 415 },
    { name: "Lab and Diagnostic Tests", count: 1 },
    { name: "Microbiology", count: 9 },
    { name: "Nephrology", count: 23 },
    { name: "Neurology", count: 170 },
    { name: "Neurosurgery", count: 59 },
    { name: "Obstetrics/Gynecology", count: 138 },
    { name: "Occupational Medicine", count: 33 },
    { name: "Oncology", count: 104 },
    { name: "Ophthalmology", count: 102 },
    { name: "Optometry", count: 1 },
    { name: "Orthopaedics", count: 341 },
    { name: "Otolaryngology", count: 147 },
    { name: "Pain Medicine", count: 32 },
    { name: "Palliative Medicine", count: 4 },
    { name: "Pathology", count: 236 },
    { name: "Pediatrics", count: 278 },
    { name: "Pharmacology", count: 18 },
    { name: "Physical Medicine and Rehab", count: 115 },
    { name: "Physiology", count: 25 },
    { name: "Plastic Surgery", count: 189 },
    { name: "Psychiatry", count: 208 },
    { name: "Pulmonary and Respiratory", count: 127 },
    { name: "Radiology", count: 511 },
    { name: "Rheumatology", count: 81 },
    { name: "Sleep Medicine", count: 48 },
    { name: "Sports Medicine", count: 98 },
    { name: "Urology", count: 96 },
    { name: "Vascular Surgery", count: 26 }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-[80]"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative
        fixed inset-y-0 left-0 z-[90] md:z-[60]
        w-80 md:w-64 bg-white
        transition-transform duration-300 ease-in-out
        overflow-y-auto
      `}>
        {/* Mobile close button */}
        {onClose && (
          <div className="md:hidden flex justify-end p-4 border-b">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">CATEGORY</h3>

          <FilterSection title="Medical Specialties" defaultExpanded={true}>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <a
                    href="#"
                    className="text-[#67c2cf] hover:underline text-sm"
                  >
                    {category.name}
                  </a>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* <FilterSection title="PUBLICATION YEAR" defaultExpanded={false}>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="2024" className="mr-2" />
                <label htmlFor="2024" className="text-sm">2024</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="2023" className="mr-2" />
                <label htmlFor="2023" className="text-sm">2023</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="2022" className="mr-2" />
                <label htmlFor="2022" className="text-sm">2022</label>
              </div>
            </div>
          </FilterSection> */}

          {/* <FilterSection title="PHÙ HỢP VỚI" defaultExpanded={false}>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="students" className="mr-2" />
                <label htmlFor="students" className="text-sm">Sinh viên</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="professionals" className="mr-2" />
                <label htmlFor="professionals" className="text-sm">Chuyên gia</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="residents" className="mr-2" />
                <label htmlFor="residents" className="text-sm">Nội trú</label>
              </div>
            </div>
          </FilterSection> */}

          <FilterSection title="THỂ LOẠI" defaultExpanded={false}>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="book" className="mr-2" />
                <label htmlFor="book" className="text-sm">Sách</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="ebook" className="mr-2" />
                <label htmlFor="ebook" className="text-sm">Livebook</label>
              </div>
            </div>
          </FilterSection>

          {/* <FilterSection title="PRICE" defaultExpanded={false}>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="under50" className="mr-2" />
                <label htmlFor="under50" className="text-sm">Under $50</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="50to100" className="mr-2" />
                <label htmlFor="50to100" className="text-sm">$50 - $100</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="over100" className="mr-2" />
                <label htmlFor="over100" className="text-sm">Over $100</label>
              </div>
            </div>
          </FilterSection> */}

          {/* <FilterSection title="PUBLICATION ORIGIN" defaultExpanded={false}>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="us" className="mr-2" />
                <label htmlFor="us" className="text-sm">US</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="uk" className="mr-2" />
                <label htmlFor="uk" className="text-sm">UK</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="international" className="mr-2" />
                <label htmlFor="international" className="text-sm">International</label>
              </div>
            </div>
          </FilterSection> */}

          <FilterSection title="SERIES" defaultExpanded={false}>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="clinics" className="mr-2" />
                <label htmlFor="clinics" className="text-sm">USMLE Series</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="handbook" className="mr-2" />
                <label htmlFor="handbook" className="text-sm">Secret Series</label>
              </div>
            </div>
          </FilterSection>
        </div>
      </aside>
    </>
  );
}