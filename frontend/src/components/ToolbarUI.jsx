import React, { useEffect, useState } from 'react';
import logo from '../assets/HenrySport.png';
import { ChevronDown, User, Search, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logout } from './Logout';
import axios from 'axios';

export const ToolbarUI = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get('http://localhost:5555/brands');
        if (res.data && res.data.data) {
          const brandNames = res.data.data
            .map(item => item.tenBrand)
            .filter(name => name && name.trim() !== "");
          setBrands(brandNames);
        }
      } catch (error) {
        console.error("Lỗi tải brands:", error);
      }
    };
    fetchBrands();
  }, []);

  const handleUserClick = () => {
    if (user) {
      navigate('/profile'); 
    } else {
      navigate('/login');
    }
  };

  const cartLink = user ? `/cart/${user._id}` : '/login';

  const sanPhamItems = [
    { label: 'Tất cả sản phẩm', link: '/allproduct' },
    { label: 'Sản phẩm mới', link: '/products?type=new' },
    { label: 'Sản phẩm nổi bật', link: '/products?type=hot' },
    { label: 'Sản phẩm sale', link: '/products?type=sale' },
  ];

  const theLoaiColumns = [
    { title: 'Kiểu dáng', items: ['Cổ cao', 'Cổ thấp', 'Cổ lửng', 'Không dây'] },
    { title: 'Thể thao', items: ['Bóng đá', 'Bóng rổ', 'Bóng chuyền', 'Chạy bộ', 'Cầu lông'] },
    { title: 'Đối tượng', items: ['Nam', 'Nữ', 'Trẻ em', 'Học sinh', 'Thanh niên'] },
    { title: 'Phụ kiện', items: ['Dây giày', 'Lót giày', 'Xịt khử mùi', 'Tất, vớ'] }
  ];

  return (
    <div className='bg-gray-600 h-16 flex items-center flex-row px-10 justify-between relative z-50 shadow-md'>
      <div className="h-16 w-51 items-center flex">
          <Link to={'/'} className="flex items-center h-full w-full">
            <img 
              src={logo} 
              alt="HenrySport" 
              className='w-full h-10 object-contain object-left' 
            />
          </Link>
      </div>

      <div className='flex items-center space-x-12 h-full'>
          <div className='group relative flex items-center flex-row space-x-0.5 h-full cursor-pointer'>
            <span className='text-white font-medium group-hover:text-gray-300 transition-colors'>Sản phẩm</span>
            <ChevronDown size={16} className='text-white group-hover:text-gray-300 transition-colors' />
            <div className='hidden group-hover:block absolute top-full left-0 w-48 bg-white shadow-xl rounded-b-md py-2 z-50'>
              {sanPhamItems.map((item, idx) => (
                <Link key={idx} to={item.link} className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#D9534F]'>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className='group relative flex items-center flex-row space-x-0.5 h-full cursor-pointer'>
            <span className='text-white font-medium group-hover:text-gray-300 transition-colors'>Thể loại</span>
            <ChevronDown size={16} className='text-white group-hover:text-gray-300 transition-colors' />
            <div className='hidden group-hover:block absolute top-full -left-40 w-[600px] bg-white shadow-xl rounded-b-md p-6 z-50'>
               <div className="grid grid-cols-4 gap-6">
                  {theLoaiColumns.map((col, idx) => (
                    <div key={idx}>
                      <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs border-b pb-1">{col.title}</h4>
                      <ul className="space-y-1">
                        {col.items.map((item, i) => (
                          <li key={i}>
                            <Link to={`/category/${item}`} className="text-sm text-gray-600 hover:text-[#D9534F] block py-0.5">
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className='group relative flex items-center flex-row space-x-0.5 h-full cursor-pointer'>
            <span className='text-white font-medium group-hover:text-gray-300 transition-colors'>Thương hiệu</span>
            <ChevronDown size={16} className='text-white group-hover:text-gray-300 transition-colors' />
            <div className='hidden group-hover:block absolute top-full -left-32 w-[700px] bg-white shadow-xl rounded-b-md p-6 z-50'>
               <div className="grid grid-cols-5 gap-y-2 gap-x-4">
                  {brands.length === 0 ? (
                    <span className="text-sm text-gray-400 col-span-5 text-center">Đang cập nhật...</span>
                  ) : (
                    brands.map((brand, idx) => (
                        <Link key={idx} to={`/brand/${brand}`} className="text-sm text-gray-600 hover:text-[#D9534F] truncate block py-1 capitalize">
                        {brand}
                        </Link>
                    ))
                  )}
               </div>
            </div>
          </div>

          <div className='bg-black rounded-full w-48 h-8 flex items-center justify-between px-3 border border-transparent focus-within:border-gray-500 transition-all'>
            <input 
                type="text" 
                className='flex-1 w-24 bg-transparent border-none outline-none text-white text-sm placeholder-gray-400' 
                placeholder="Tìm kiếm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className='w-6 flex justify-center'>
              <Search size={16} className='text-white cursor-pointer hover:text-[#D9534F]'/>
            </div>
          </div>
      </div>

      <div className='flex items-center space-x-6'>
        <div 
            onClick={handleUserClick} 
            className='flex items-center gap-2 cursor-pointer hover:opacity-80'
            title={user ? "Quản lý tài khoản" : "Đăng nhập"}
        >
            <User className='text-white' size={28}/>
            {user && (
                <span className='text-white text-sm font-medium hidden xl:block max-w-[100px] truncate'>
                    {user.username || user.fullName}
                </span>
            )}
        </div>

        <Link to={cartLink} className="relative group">
          <ShoppingBag className='text-white group-hover:text-gray-300 transition-colors' size={28}/>
        </Link>

        {user && (
            <div className="border-l border-gray-500 pl-6">
                <Logout/>
            </div>
        )}
      </div>
    </div>
  )
}