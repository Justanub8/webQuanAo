import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

export const LoginAccount = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5555/api/auth/login', {
        email: email,
        password: password
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'customer') {
        navigate('/'); 
      } else if (user.role === 'employee' || user.role === 'admin') {
        navigate('/customers/'); 
      } else {
        navigate('/');
      }

    } catch (error) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại!";
      alert(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white p-4">
      <div className="bg-gray-800 text-white font-bold py-2 px-8 rounded-full mb-8 text-lg uppercase tracking-wide">
        Đăng nhập tài khoản
      </div>
      
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1 ml-2">
            Email<span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-400 rounded-full px-5 py-2.5 focus:outline-none focus:border-gray-600 transition-colors"
            placeholder="nhapemail@example.com"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1 ml-2">
            Mật khẩu<span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-400 rounded-full px-5 py-2.5 focus:outline-none focus:border-gray-600 transition-colors"
            placeholder="********"
          />
        </div>
        
        <div className="flex items-center justify-center pt-4 gap-4">
          <button 
            type="submit"
            disabled={loading}
            className="bg-[#D9534F] hover:bg-[#c9302c] text-white font-medium py-2 px-8 rounded-full transition-colors shadow-sm disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/register')} 
            className="text-gray-500 hover:text-gray-700 font-medium py-2 px-4 transition-colors"
          >
            Đăng ký tài khoản mới
          </button>
        </div>
      </form>
    </div>
  );
};