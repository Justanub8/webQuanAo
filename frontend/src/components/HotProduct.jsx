import React from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from './ProductCard'; 
import sample from '../assets/T1 Overcoat1.png';
import sample1 from '../assets/T1 Overcoat2.png';
import sample2 from '../assets/T1 Tshirt.png';
import sample3 from '../assets/T1 pant.png';
export const HotProduct = ({title}) => {
  const products = [
    {
      id: 1,
      name: '[LoL] 2025 T1 2nd Uniform Jacket',
      price: 2000000,
      sold: '1k+',
      rating: 5.0,
      image: sample
    },
    {
      id: 2,
      name: '[LoL] 2025 T1 Uniform Jacket',
      price: 1000000,
      discount: null,
      sold: '2k+',
      rating: 5.0,
      image: sample1
    },
    {
      id: 3,
      name: '2024 World Champions Uniform Jersey',
      price: 1500000,
      oldPrice: 2600000,
      discount: null,
      sold: '3k+',
      rating: 5.0,
      image: sample2
    },
    {
      id: 4,
      name: "T1 2nd Uniform Pants",
      price: 500000,
      oldPrice: 2600000,
      discount: null,
      sold: '4k+',
      rating: 5.0,
      image: sample3
    },
  ];

  return (
    <div className="bg-white  font-sans overflow-hidden">
      <div className="container mx-auto px-4 md:px-24 py-16 space-y-16 max-w-7xl">
        <div>
          <div className="flex justify-between items-center mb-8">
             <div className="bg-[#2D2D2D] text-white font-bold py-2.5 px-6 rounded-full uppercase text-sm shadow-md tracking-wide">
                {title}
             </div>
             <Link to="/products?type=new" className="w-8 h-8 flex items-center justify-center bg-[#FF4D4F] rounded-full text-white hover:bg-red-700 transition shadow-md shadow-red-200">
                <ArrowRight size={16} />
             </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
             {products.map((product, index) => (
               <ProductCard 
              key={`new-${index}`} 
              name={product.name} 
              price={product.price} 
              solded={product.sold}
              image={product.image}
              />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};