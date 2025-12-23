import React from 'react'
import { Bell, LogOut } from 'lucide-react'
import logo from '../assets/HenrySport.png';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
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
    <div className="bg-gray-900 text-white h-16 flex items-center justify-between px-6 shadow">
            <div className="h-16 w-51 items-center flex">
                <Link to={'/'} className="flex items-center h-full w-full">
                    <img src={logo} alt="HenrySport" className='w-full h-10 object-contain object-left'/>
                </Link>
            </div>
            
            <div className="flex items-center space-x-4">
                 <Bell className="cursor-pointer hover:text-gray-300" />
                 <LogOut className="cursor-pointer hover:text-gray-300" onClick={handleLogout}/>
            </div>
        </div>
  )
}