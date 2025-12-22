import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Save, ShoppingBag, Lock, Camera } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserProfile = () => { 
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const userId = currentUser ? currentUser._id : null;
 
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    gender: 'Nam',
    birthday: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });  
 
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try { 
        const res = await axios.get(`http://localhost:5555/users/${userId}`);
        if (res.data) {
          setFormData({
            username: res.data.username || '',
            email: res.data.email || '',  
            phone: res.data.phone || '',
            address: res.data.address || '',
            gender: res.data.gender || 'Nam',
            birthday: res.data.birthday ? res.data.birthday.split('T')[0] : ''  
          });
        }
      } catch (error) {
        console.error("Lỗi tải thông tin:", error); 
        if (currentUser) setFormData(prev => ({ ...prev, ...currentUser }));
      }
    };

    fetchUserData();
  }, [userId]); 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try { 
      await axios.put(`http://localhost:5555/users/${userId}`, formData);
       
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra, vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <div className="p-10 text-center">Vui lòng đăng nhập.</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
         
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 text-center mb-6">
            <div className="relative inline-block">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-sm overflow-hidden"> 
                    <User size={48} className="text-gray-400" />
                </div>
                <button className="absolute bottom-0 right-0 bg-gray-800 text-white p-1.5 rounded-full hover:bg-black transition">
                    <Camera size={14} />
                </button>
            </div>
            <h2 className="mt-4 font-bold text-gray-800 text-lg">{formData.username}</h2>
            <p className="text-sm text-gray-500">{formData.email}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <nav className="flex flex-col">
              <Link to="/profile" className="flex items-center gap-3 px-6 py-4 bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium">
                <User size={18} /> Thông tin tài khoản
              </Link>
              <Link to="/userorder" className="flex items-center gap-3 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                <ShoppingBag size={18} /> Lịch sử đơn hàng
              </Link>
              <Link to="/change-password" className="flex items-center gap-3 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                <Lock size={18} /> Đổi mật khẩu
              </Link>
            </nav>
          </div>
        </div>
 
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Hồ sơ của tôi</h1>
 
            {message.text && (
                <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                </div>
 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">*Email không thể thay đổi</p>
                </div>
 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="date" 
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                </div>
 
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                  <div className="flex space-x-6 mt-2">
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name="gender" 
                            value="Nam" 
                            checked={formData.gender === 'Nam'} 
                            onChange={handleChange}
                            className="mr-2"
                        /> Nam
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name="gender" 
                            value="Nữ" 
                            checked={formData.gender === 'Nữ'} 
                            onChange={handleChange}
                            className="mr-2"
                        /> Nữ
                    </label>
                  </div>
                </div>
 
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                    ></textarea>
                  </div>
                </div>

              </div> 
              <div className="mt-8 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition shadow-lg disabled:bg-gray-400"
                >
                    {loading ? 'Đang lưu...' : (
                        <>
                            <Save size={18} /> Lưu thay đổi
                        </>
                    )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;