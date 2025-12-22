import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const RegisterAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      await axios.post('http://localhost:5555/api/auth/register', payload);
      
      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white p-4">
      <div className="bg-gray-800 text-white font-bold py-2 px-8 rounded-full mb-8 text-lg uppercase tracking-wide">
        Đăng ký tài khoản
      </div>
      
      <form onSubmit={handleRegister} className="w-full max-w-md space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1 ml-2">
            Tên tài khoản<span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Ví dụ: nguyenvanA"
            className="w-full border border-gray-400 rounded-full px-5 py-2.5 focus:outline-none focus:border-gray-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1 ml-2">
            Email<span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@example.com"
            className="w-full border border-gray-400 rounded-full px-5 py-2.5 focus:outline-none focus:border-gray-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1 ml-2">
            Mật khẩu<span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="********"
            className="w-full border border-gray-400 rounded-full px-5 py-2.5 focus:outline-none focus:border-gray-600 transition-colors"
          />
        </div>

        <div className="flex items-center justify-center pt-4 gap-4">
          <button 
            type="submit"
            disabled={loading}
            className="bg-[#D9534F] hover:bg-[#c9302c] text-white font-medium py-2 px-8 rounded-full transition-colors shadow-sm disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="text-gray-500 hover:text-gray-700 font-medium py-2 px-4 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
};