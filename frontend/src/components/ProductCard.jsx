import React from 'react'
import { Star } from 'lucide-react'

export const ProductCard = ({name, price, solded, image, rating}) => {
  const formatPrice = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative w-full aspect-square overflow-hidden bg-[#F5F5F5]">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-contain p-4" 
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 font-medium h-10">
          {name}
        </h3>
        <div className="flex items-baseline mb-2">
          <span className="text-xl font-bold text-red-600">{formatPrice(price)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <p className="truncate">Đã bán {solded}</p>
          <div className="flex items-center gap-1">
            <Star size={14} fill='#FFC107' color='#FFC107'/>
            <span className="font-bold text-gray-700">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  )
}