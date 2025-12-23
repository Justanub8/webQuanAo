import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ChevronDown, AlertCircle } from 'lucide-react'; 
import axios from 'axios'; 

export const UserCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]); 
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loading, setLoading] = useState(true); 

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchCart = async () => {
    const token = localStorage.getItem('token'); 

    if (!user || !token) {
        setLoading(false);
        return;
    }
    if (user.role !== 'customer') {
        setLoading(false);
        return;
    }

    try {

      const res = await axios.get(`http://localhost:5555/carts/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      const backendCart = res.data;
      if (backendCart && backendCart.items) {
        const mappedItems = backendCart.items.map((item) => {
          return {
            id: item._id, 
            productId: item.product?._id, 
            name: item.product?.tenSanPham, 
            variant: `Size: ${item.size}`, 
            size: item.size,
            price: item.product?.giaBan || 0,
            quantity: item.quantity,
            image: item.product?.imageUrl, 
            checked: false 
          };
        });
        
        setCartItems(mappedItems);
      }
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      return item.checked ? sum + (item.price * item.quantity) : sum;
    }, 0);
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotalPrice(total);
    setTotalQuantity(count);
  }, [cartItems]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ');
  };

  const handleProceedToCheckout = () => {
    const selectedItems = cartItems.filter(item => item.checked);
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }
    navigate('/checkout', { state: { itemsToBuy: selectedItems, totalAmount: totalPrice } });
  };

  const handleQuantityChange = (id, delta) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    }));
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    const token = localStorage.getItem('token'); 
    try {
        await axios.delete(`http://localhost:5555/carts/item/${user._id}/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
        alert("Lỗi khi xóa sản phẩm: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCheckItem = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleCheckAll = () => {
    const areAllChecked = cartItems.length > 0 && cartItems.every(item => item.checked);
    setCartItems(cartItems.map(item => ({ ...item, checked: !areAllChecked })));
  };

  if (loading) return <div className="text-center py-20 font-medium text-gray-500">Đang kiểm tra thông tin...</div>;
  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white">
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-600 mb-6 text-lg">Vui lòng đăng nhập để xem giỏ hàng.</p>
        <button onClick={() => navigate('/login')} className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
            Đăng nhập ngay
        </button>
    </div>
  );

  if (user.role !== 'customer') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white px-4">
            <div className="bg-red-50 p-6 rounded-lg border border-red-100 flex flex-col items-center max-w-md w-full text-center shadow-sm">
                <AlertCircle size={48} className="text-red-500 mb-3" />
                <h2 className="text-xl font-bold text-red-600 mb-2">Truy cập bị từ chối</h2>
                <p className="text-gray-700 mb-4">
                    Tài khoản hiện tại là <span className="font-bold bg-gray-200 px-2 py-0.5 rounded text-sm">{user.role}</span>.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                    Chức năng giỏ hàng và mua sắm chỉ dành cho tài khoản <strong>Khách hàng (Customer)</strong>.
                </p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate('/')} 
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                    >
                        Về trang chủ
                    </button>
                    {(user.role === 'admin') && (
                        <button 
                            onClick={() => navigate('/accounts')} 
                            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition text-sm"
                        >
                            Về trang quản trị
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white font-sans text-gray-800 py-10 lg:py-24">
      <div className="flex justify-center my-6">
        <div className="bg-[#333] text-white font-bold py-2 px-8 rounded-full text-lg uppercase shadow-md">
          Giỏ hàng của {user.username || user.fullName}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6 px-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input 
              type="checkbox" 
              className="w-5 h-5 border-gray-400 rounded text-gray-800 focus:ring-0 cursor-pointer"
              checked={cartItems.length > 0 && cartItems.every(item => item.checked)}
              onChange={handleCheckAll}
            />
            <span className="text-lg font-medium">Chọn tất cả ({cartItems.length})</span>
          </label>
          <span className="text-[#D9534F] font-medium text-lg">
            Tổng số lượng: {totalQuantity}
          </span>
        </div>

        <div className="space-y-6">
          {cartItems.length === 0 ? (
             <div className="text-center py-20 text-gray-500 border rounded-lg bg-gray-50 flex flex-col items-center">
                <p className="mb-4 text-lg">Giỏ hàng của bạn đang trống.</p>
                <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Tiếp tục mua sắm</button>
             </div>
          ) : (
            cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
              <input 
                type="checkbox" 
                className="w-5 h-5 border-gray-400 rounded text-gray-800 focus:ring-0 cursor-pointer shrink-0"
                checked={item.checked}
                onChange={() => handleCheckItem(item.id)}
              />
              <div className="w-24 h-24 shrink-0 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-lg text-gray-900 truncate pr-4">
                  {item.name}
                </h3>
                <div className="mt-1 mb-2 inline-flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-sm text-gray-600 cursor-pointer bg-white hover:bg-gray-50">
                  {item.variant} <ChevronDown size={14} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#D9534F] font-bold text-lg">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-600 transition-colors p-1">
                  <Trash2 size={20} />
                </button>
                <div className="flex items-center">
                  <button onClick={() => handleQuantityChange(item.id, -1)} className="w-8 h-8 bg-[#333] text-white flex items-center justify-center rounded-l hover:bg-black transition">
                    <Minus size={14} />
                  </button>
                  <div className="w-10 h-8 bg-white border-y border-gray-300 flex items-center justify-center font-medium text-sm">
                    {item.quantity}
                  </div>
                  <button onClick={() => handleQuantityChange(item.id, 1)} className="w-8 h-8 bg-[#333] text-white flex items-center justify-center rounded-r hover:bg-black transition">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#333] text-white p-4 shadow-lg z-50">
            <div className="container mx-auto max-w-4xl flex justify-between items-center px-4">
            <div className="text-xl font-bold">
                <span className="text-sm font-normal mr-2">Tổng thanh toán:</span>
                {formatCurrency(totalPrice)}
            </div>
            <button 
                className={`font-bold py-2 px-8 rounded transition uppercase ${totalPrice > 0 ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                disabled={totalPrice === 0}
                onClick={handleProceedToCheckout} 
            >
                Mua hàng ({cartItems.filter(i => i.checked).length})
            </button>
            </div>
        </div>
      )}
    </div>
  );
};