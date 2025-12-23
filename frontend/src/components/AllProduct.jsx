import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { ProductCard } from './ProductCard'
import axios from 'axios'

export const AllProduct = () => {
  const [productList, setProductList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    brands: [],
    categories: [],
    sizes: [],
    prices: []
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;
  const fetchAllData = async () => {
      try {
        const [productsRes, brandsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:5555/products'),
          axios.get('http://localhost:5555/brands'),
          axios.get('http://localhost:5555/categories')
        ]);
        const onlineProducts = productsRes.data.data.filter(
            product => product.trangThai === 'Online'
        );
        setProductList(onlineProducts);
        setFilteredProducts(onlineProducts);
        if (brandsRes.data && brandsRes.data.data) {
          const brandNames = brandsRes.data.data.map(item => item.tenBrand).filter(name => name && name.trim() !== "");;
          setBrandList(brandNames);
        }
        if (categoriesRes.data && categoriesRes.data.data) {
          const categoryNames = categoriesRes.data.data.map(item => item.tenCategory).filter(name => name && name.trim() !== "");;
          setCategoryList(categoryNames);
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };


    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAllData();
    }, []);
    useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' 
      });
    }, [currentPage]);

    const handleFilterChange = (filterType, value) => {
      setFilters(prev => {
        const currentList = prev[filterType];
        const newList = currentList.includes(value)
          ? currentList.filter(item => item !== value)
          : [...currentList, value];
        
        return { ...prev, [filterType]: newList };
      });
    };

    const checkPrice = (productPrice, priceRangeString) => {
      switch (priceRangeString) {
        case "Dưới 500.000 đ":
          return productPrice < 500000;
        case "500.000 đ - 1.000.000 đ":
          return productPrice >= 500000 && productPrice <= 1000000;
        case "1.000.000 đ - 2.000.000 đ":
          return productPrice >= 1000000 && productPrice <= 2000000;
        case "2.000.000 đ - 3.000.000 đ":
          return productPrice >= 2000000 && productPrice <= 3000000;
        case "Trên 3.000.000 đ":
          return productPrice > 3000000;
        default:
          return false;
      }
    };

    useEffect(() => {
      let tempProducts = [...productList];
      if (filters.brands.length > 0) {
        tempProducts = tempProducts.filter(product => 
          filters.brands.includes(product.maThuongHieu?.tenBrand)
        );
      }

      if (filters.categories.length > 0) {
        tempProducts = tempProducts.filter(product => 
          filters.categories.includes(product.category?.tenCategory)
        );
      }
      if (filters.sizes.length > 0) {
        tempProducts = tempProducts.filter(product => 
          filters.sizes.includes(product.kichThuoc)
        );
      }
      if (filters.prices.length > 0) {
        tempProducts = tempProducts.filter(product => {
          return filters.prices.some(range => checkPrice(product.giaBan, range));
        });
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredProducts(tempProducts);
      setCurrentPage(1);

  }, [filters, productList]);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
  const prices = ["Dưới 500.000 đ", "500.000 đ - 1.000.000", "1.000.000 đ - 2.000.000 đ", "2.000.000 đ - 3.000.000 đ", "Trên 3.000.000 đ"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

  return (
    <div className="py-16 bg-white font-sans text-gray-800">
      <div className="flex justify-center my-8">
        <div className="bg-gray-800 text-white font-bold py-2 px-8 rounded-full text-lg uppercase tracking-wide">
          Tất cả sản phẩm
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 shrink-0 space-y-8">
            <FilterSection 
                title="THƯƠNG HIỆU" 
                items={brandList} 
                selectedItems={filters.brands}
                onChange={(val) => handleFilterChange('brands', val)}
                scrollable 
            />
            <FilterSection 
                title="LỌC GIÁ" 
                items={prices} 
                selectedItems={filters.prices}
                onChange={(val) => handleFilterChange('prices', val)}
            />
            <FilterSection 
                title="THỂ LOẠI" 
                items={categoryList} 
                selectedItems={filters.categories}
                onChange={(val) => handleFilterChange('categories', val)}
                scrollable 
                scrollHeight="h-64" 
            />
            <FilterSection 
                title="KÍCH THƯỚC" 
                items={sizes} 
                selectedItems={filters.sizes}
                onChange={(val) => handleFilterChange('sizes', val)}
                scrollable 
            />
          </div>

          <div className="flex-1">
            {currentProducts.length === 0 ? (
                 <div className="text-center py-20 text-gray-500">
                    Không tìm thấy sản phẩm phù hợp.
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                {currentProducts.map((product) => (
                    <div key={product._id} className="relative group w-full">
                    <Link to={`/detail/${product._id}`} className="block h-full">
                        <ProductCard 
                            name={product.tenSanPham} 
                            price={product.giaBan} 
                            solded={product.soLuongDaBan}
                            image={product.imageUrl} 
                            rating={5.0}
                        />
                    </Link>
                    </div>
                ))}
                </div>
            )}
            
            {filteredProducts.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-3 mt-12 mb-8">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition 
                    ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                    <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full border transition font-medium
                        ${currentPage === number 
                            ? 'bg-[#D9534F] text-white border-[#D9534F] shadow-md' 
                            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {number}
                    </button>
                ))}

                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition 
                    ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                    <ChevronRight size={20} />
                </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const FilterSection = ({ 
    title, 
    items, 
    selectedItems = [],
    onChange,          
    scrollable = false, 
    scrollHeight = "h-48" 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-bold text-sm text-gray-700 uppercase mb-3">{title}</h3>
      
      {items.length === 0 ? (
        <div className="text-xs text-gray-400 italic">Đang tải...</div>
      ) : (
        <div className={`${scrollable ? `${scrollHeight} overflow-y-auto pr-2 custom-scrollbar` : ''}`}>
            <div className="space-y-2">
            {items.map((item, idx) => (
                item && (
                  <label key={idx} className="flex items-start gap-3 cursor-pointer group select-none">
                    <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 border-gray-300 rounded text-gray-800 focus:ring-gray-800 cursor-pointer"
                        checked={selectedItems.includes(item)} 
                        onChange={() => onChange(item)}        
                    />
                    <span className={`text-sm transition-colors capitalize ${selectedItems.includes(item) ? 'text-black font-semibold' : 'text-gray-600 group-hover:text-black'}`}>
                        {item}
                    </span>
                  </label>
                )
            ))}
            </div>
        </div>
      )}
    </div>
  )
}