import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    
    if (confirm) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    }
  };

  return (
    <button 
      onClick={handleLogout}
      title="Đăng xuất" 
      className="flex items-center justify-center transition-opacity hover:opacity-80"
    >
        <LogOut size={32} className='text-white'/>
    </button>
  );
};