import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import axios from 'axios';

export const HotProduct = ({ title }) => {
  const [products, setProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;

  const fetchProduct = () => {
    axios.get('http://localhost:5555/products')
      .then((response) => {
        setProducts(response.data.data.filter(
          product => (product.maTag?.tenTag === title && product.trangThai === 'Online')
        ));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchProduct();
  }, []); 
  const handleNext = () => {
    setStartIndex((prevIndex) => {
      if (prevIndex + itemsPerPage >= products.length) {
        return 0;
      }
      return prevIndex + itemsPerPage;
    });
  };

  const handlePrev = () => {
    setStartIndex((prevIndex) => {
      if (prevIndex === 0) {
        return Math.floor((products.length - 1) / itemsPerPage) * itemsPerPage;
      }
      return prevIndex - itemsPerPage;
    });
  };

  useEffect(() => {
    if (products.length === 0) return; 

    const interval = setInterval(() => {
      handleNext();
    }, 10000); 
    return () => clearInterval(interval);
  }, [products, startIndex]); 

  const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white font-sans overflow-hidden">
      <div className="container mx-auto px-4 md:px-24 py-16 space-y-16 max-w-7xl">
        <div>
          <div className="flex justify-between items-center mb-8">
            <div className="bg-[#2D2D2D] text-white font-bold py-2.5 px-6 rounded-full uppercase text-sm shadow-md tracking-wide">
              {title}
            </div>

            <div className="flex gap-3 items-center">
              {/* --- Nút điều hướng --- */}
              <button
                onClick={handlePrev}
                className="w-8 h-8 flex items-center justify-center bg-[#FF4D4F] rounded-full text-white hover:bg-red-700 transition shadow-md"
                title="Trước đó"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={handleNext}
                className="w-8 h-8 flex items-center justify-center bg-[#FF4D4F] rounded-full text-white hover:bg-red-700 transition shadow-md"
                title="Tiếp theo"
              >
                <ChevronRight size={16} />
              </button>
              {/* --------------------- */}

              <Link to="/products?type=new" className="w-8 h-8 flex items-center justify-center bg-[#FF4D4F] rounded-full text-white hover:bg-red-700 transition shadow-md shadow-red-200">
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 min-h-[400px]"> 
          {/* Thêm min-h để tránh giật giao diện khi load */}
            
            {visibleProducts.map((product, index) => (
              <Link to={`/detail/${product._id}`} >
                <ProductCard
                  key={product._id || `prod-${index}`} // Dùng _id để React render tối ưu hơn
                  name={product.tenSanPham}
                  price={product.giaBan}
                  solded={product.soLuongDaBan}
                  image={product.imageUrl}
                />
              </Link>
            ))}

            {products.length === 0 && (
               <p className="col-span-4 text-center text-gray-500 mt-10">Đang tải sản phẩm...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};