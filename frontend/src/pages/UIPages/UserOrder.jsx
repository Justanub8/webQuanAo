import React, { useEffect, useState } from 'react';
import { User, ShoppingBag, Lock, Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserOrder = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
 
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { color: 'text-yellow-600 bg-yellow-100', text: 'Đang xử lý', icon: <Clock size={16}/> };
      case 'shipping': 
        return { color: 'text-blue-600 bg-blue-100', text: 'Đang vận chuyển', icon: <Truck size={16}/> };
      case 'delivered': 
      case 'completed': 
        return { color: 'text-green-600 bg-green-100', text: 'Giao thành công', icon: <CheckCircle size={16}/> };
      case 'cancelled': 
        return { color: 'text-red-600 bg-red-100', text: 'Đã hủy', icon: <XCircle size={16}/> };
      default:
        return { color: 'text-gray-600 bg-gray-100', text: status, icon: <Package size={16}/> };
    }
  };

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    const fetchOrders = async () => {
      try { 
        const res = await axios.get(`http://localhost:5555/orders/user/${user._id}`); 
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
         
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 text-center mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-sm">
                <User size={40} className="text-gray-400" />
            </div>
            <h2 className="mt-4 font-bold text-gray-800 text-lg">{user?.username || 'Khách hàng'}</h2>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <nav className="flex flex-col">
              <Link to="/profile" className="flex items-center gap-3 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                <User size={18} /> Thông tin tài khoản
              </Link> 
              <Link to="/order-history" className="flex items-center gap-3 px-6 py-4 bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium">
                <ShoppingBag size={18} /> Lịch sử đơn hàng
              </Link>
              <Link to="/change-password" className="flex items-center gap-3 px-6 py-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                <Lock size={18} /> Đổi mật khẩu
              </Link>
            </nav>
          </div>
        </div>
 
        <div className="md:col-span-3">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

          {loading ? (
             <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
          ) : orders.length === 0 ? ( 
             <div className="bg-white rounded-lg shadow-md p-10 text-center flex flex-col items-center">
                <ShoppingBag size={64} className="text-gray-300 mb-4"/>
                <p className="text-gray-500 text-lg mb-6">Bạn chưa có đơn hàng nào.</p>
                <Link to="/" className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-700 transition">
                    Tiếp tục mua sắm
                </Link>
             </div>
          ) : ( 
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = getStatusBadge(order.status || 'pending');
                
                return (
                  <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                     
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div className="flex gap-4 text-sm text-gray-600">
                            <span className="font-medium text-gray-900">Mã đơn: #{order._id.slice(-6).toUpperCase()}</span>
                            <span className="border-l border-gray-300 pl-4">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span>{statusInfo.text}</span>
                        </div>
                    </div>
 
                    <div className="p-6">
                        {order.products.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-center gap-4 mb-4 last:mb-0"> 
                                <div className="w-16 h-16 border rounded bg-gray-100 shrink-0 overflow-hidden">
                                    <img 
                                        src={item.image || "https://via.placeholder.com/64"} 
                                        alt={item.productName} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800 line-clamp-1">{item.productName}</h4>
                                    <p className="text-sm text-gray-500">Size: {item.size} | Màu: {item.color}</p>
                                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                                </div>
                                <div className="text-right font-medium text-gray-700">
                                    {formatCurrency(item.price)}
                                </div>
                            </div>
                        ))}
                         
                        {order.products.length > 2 && (
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                ...và {order.products.length - 2} sản phẩm khác
                            </p>
                        )}
                    </div>
 
                    <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <span className="text-sm text-gray-500 mr-2">Tổng tiền:</span>
                            <span className="text-lg font-bold text-[#D9534F]">{formatCurrency(order.totalPrice)}</span>
                        </div>
                        <div className="flex gap-3"> 
                            <Link 
                                to={`/order-detail/${order._id}`} 
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                            >
                                Xem chi tiết <ChevronRight size={16}/>
                            </Link>
                        </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrder;