import React from 'react'
import { User,Users,ClipboardList,Package,Ticket,Tag,Cuboid,Star,BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const Sidebar = () => {
  const navigate = useNavigate();
  const menuItems = [
    { icon: User, label: 'Quản lý tài khoản', active: false, path: '/accounts' },
    { icon: Users, label: 'Quản lý nhân viên', active: false, path: '/employees' },
    { icon: Users, label: 'Quản lý khách hàng', active: false, path: '/customers' },
    { icon: ClipboardList, label: 'Quản lý đơn hàng', active: false, path: '/orders' },
    { icon: Package, label: 'Quản lý sản phẩm', active: false, path: '/products' },
    { icon: Ticket, label: 'Quản lý mã giảm giá', active: false, path: '/vouchers' },
    { icon: BookOpen, label: 'Quản lý danh mục', active: false, path: '/categories' },
    { icon: Star, label: 'Quản lý thương hiệu', active: false, path: '/brands' },
    { icon: Tag, label: 'Quản lý tag', active: false, path: '/tags' },
    { icon: Cuboid, label: 'Quản lý chất liệu', active: false, path: '/materials' },
  ];

  return (
    <div className="w-96 bg-gray-100 h-full left-0 top-0 flex flex-col">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold">
          A
        </div>
        <span className="font-medium text-gray-700">A</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-300 ${
              item.active 
                ? 'bg-gray-800 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

