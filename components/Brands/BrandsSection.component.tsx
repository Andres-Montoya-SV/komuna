'use client';

import { motion } from 'framer-motion';
import StaggerContainer from '../Animations/StaggerContainer.component';
import StaggerItem from '../Animations/StaggerItem.component';

interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
}

const brands: Brand[] = [
  {
    id: '1',
    name: 'TechCorp',
    logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200',
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'FashionHub',
    logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200',
    category: 'Clothing',
  },
  {
    id: '3',
    name: 'HomeEssentials',
    logo: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=200',
    category: 'Home & Kitchen',
  },
  {
    id: '4',
    name: 'SportMax',
    logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
    category: 'Sports',
  },
  {
    id: '5',
    name: 'PetCare',
    logo: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=200',
    category: 'Pets',
  },
  {
    id: '6',
    name: 'BookWorld',
    logo: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200',
    category: 'Books',
  },
];

export default function BrandsSection() {
  return (
    <section className="py-12 bg-white border-t-2 border-base-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">Popular Brands</h2>
          <p className="text-base-content/70">Shop from trusted brands on Komuna</p>
        </div>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <StaggerItem key={brand.id}>
              <motion.a
                href={`/?category=${encodeURIComponent(brand.category)}`}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="card bg-base-100 border-2 border-base-200 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden cursor-pointer"
              >
                <figure className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                  <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                </figure>
                <div className="card-body p-3 text-center">
                  <h3 className="text-sm font-semibold text-primary">{brand.name}</h3>
                  <p className="text-xs text-base-content/60">{brand.category}</p>
                </div>
              </motion.a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
