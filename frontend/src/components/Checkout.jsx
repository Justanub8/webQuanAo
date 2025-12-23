import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy dữ liệu từ giỏ hàng
  const { itemsToBuy, totalAmount } = location.state || { itemsToBuy: [], totalAmount: 0 };

  // --- 1. STATE MỚI CHO VOUCHER ---
  const [voucherInput, setVoucherInput] = useState(''); // Lưu text người dùng nhập
  const [discount, setDiscount] = useState(0);          // Lưu số tiền được giảm
  const [appliedCode, setAppliedCode] = useState(null); // Lưu mã voucher đã áp dụng thành công
  // --------------------------------

  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    tinhThanh: '',
    quanHuyen: '',
    diaChi: '',
    ghiChu: '',
    phuongThucThanhToan: 'vnpay'
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        hoTen: user.fullName || user.username || '', 
        email: user.email || '',
        soDienThoai: user.phoneNumber || '', 
        diaChi: user.address || ''
      }));
    }
  }, []);

  useEffect(() => {
    if (!itemsToBuy || itemsToBuy.length === 0) {
        alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
        navigate('/cart');
    }
  }, [itemsToBuy, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ');
  };

  // --- 2. HÀM XỬ LÝ ÁP DỤNG VOUCHER ---
  const handleApplyVoucher = async () => {
    console.log("Dữ liệu gửi đi Check:", { 
        code: voucherInput.toUpperCase(), 
        totalAmount: totalAmount 
    });
    if (!voucherInput.trim()) return alert("Vui lòng nhập mã giảm giá!");

    try {
        const res = await axios.post('http://localhost:5555/vouchers/check', {
            code: voucherInput.toUpperCase(),
            totalAmount: totalAmount // Gửi tổng tiền để BE check giá trị tối thiểu
        });

        if (res.status === 200) {
            setDiscount(res.data.data.discount);
            setAppliedCode(res.data.data.code);
            alert(`Áp dụng thành công! Bạn được giảm: ${formatCurrency(res.data.data.discount)}`);
        }
    } catch (error) {
        // Reset nếu lỗi
        setDiscount(0);
        setAppliedCode(null);
        alert(error.response?.data?.message || "Mã giảm giá không hợp lệ!");
    }
  };

  // Hàm hủy voucher để chọn mã khác
  const handleRemoveVoucher = () => {
      setAppliedCode(null);
      setDiscount(0);
      setVoucherInput('');
  };
  // ------------------------------------

  const handleOrder = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate('/login');
        return;
    }

    if (!formData.hoTen || !formData.soDienThoai || !formData.diaChi || !formData.tinhThanh || !formData.quanHuyen) {
        alert("Vui lòng điền đầy đủ thông tin giao hàng!");
        return;
    }

    const orderData = {
        accountId: user._id,
        shippingAddress: `${formData.diaChi}, ${formData.quanHuyen}, ${formData.tinhThanh}`,
        phone: formData.soDienThoai,
        paymentMethod: formData.phuongThucThanhToan, 
        note: formData.ghiChu,
        items: itemsToBuy.map(item => ({
            productId: item.productId, 
            quantity: item.quantity,
            size: item.size
        })),
        voucherCode: appliedCode // <-- 3. GỬI KÈM MÃ VOUCHER
    };

    try {
        const res = await axios.post('http://localhost:5555/orders', orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 201 || res.status === 200) {
            alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");
            navigate('/'); 
        }
    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || "Lỗi khi đặt hàng, vui lòng thử lại.";
        alert(msg);
    }
  };

  // Tính tổng tiền cuối cùng hiển thị
  const finalTotal = totalAmount - discount;

  return (
    <div className="py-16 bg-white p-6 font-sans">
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 text-white font-bold py-3 px-10 rounded-full text-xl uppercase tracking-wide">
          Thông tin đặt hàng
        </div>
      </div>
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: FORM NHẬP LIỆU (Giữ nguyên) */}
          <div className="lg:col-span-2">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Họ tên<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Số điện thoại<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Tỉnh/ Thành phố<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type='text'
                    name="tinhThanh"
                    value={formData.tinhThanh}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Quận/ Huyện<span className="text-red-500">*</span>
                  </label>
                  <input
                    type='text'
                    name="quanHuyen"
                    value={formData.quanHuyen}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Địa chỉ cụ thể<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="diaChi"
                    value={formData.diaChi}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phương thức thanh toán<span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {['vnpay', 'momo', 'banking', 'cod'].map((method) => (
                      <label key={method} className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="phuongThucThanhToan"
                          value={method}
                          checked={formData.phuongThucThanhToan === method}
                          onChange={handleChange}
                          className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                        />
                        <span className="text-gray-500 uppercase">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Ghi chú
                  </label>
                  <textarea 
                    name="ghiChu"
                    rows="4"
                    value={formData.ghiChu}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:border-black resize-none"
                  ></textarea>
                </div>
              </div>

            </form>
          </div>

          {/* CỘT PHẢI: ĐƠN HÀNG (Cập nhật logic Voucher) */}
          <div className="lg:col-span-1">
            <div className="bg-[#FFF0F5] p-6 rounded-xl h-full flex flex-col"> 
              <h3 className="text-xl font-bold text-center mb-6 uppercase">Đơn hàng</h3>

              <div className="flex-1 overflow-y-auto max-h-[400px] mb-4 pr-2 custom-scrollbar">
                <h4 className="font-semibold mb-2 text-sm text-gray-500 uppercase">Sản phẩm đã chọn ({itemsToBuy.length})</h4>
                {itemsToBuy.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3 mb-3 last:border-0 flex justify-between gap-2">
                        <div>
                            <p className="text-gray-800 font-bold text-sm line-clamp-2">{item.tenSanPham || item.name}</p>
                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                <span>Size: {item.size}</span>
                                <span>SL: {item.quantity}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[#D9534F] font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                    </div>
                ))}
              </div>

              {/* --- 4. KHU VỰC NHẬP VOUCHER ĐÃ ĐƯỢC KẾT NỐI --- */}
              <div className="flex gap-2 mb-6">
                <input 
                  type="text"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  disabled={!!appliedCode} // Disable khi đã có mã
                  placeholder="Nhập mã giảm giá" 
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none"
                />
                
                {appliedCode ? (
                    <button 
                        onClick={handleRemoveVoucher}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium whitespace-nowrap transition-colors text-sm"
                    >
                        Hủy
                    </button>
                ) : (
                    <button 
                        onClick={handleApplyVoucher}
                        className="bg-[#D9534F] hover:bg-[#c9302c] text-white px-4 py-2 rounded font-medium whitespace-nowrap transition-colors text-sm"
                    >
                        Áp dụng
                    </button>
                )}
              </div>
              {/* ----------------------------------------------- */}

              <div className="space-y-3 border-t border-gray-300 pt-4 text-gray-700 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">{formatCurrency()}</span> 
                </div>
                
                {/* --- 5. HIỂN THỊ DÒNG GIẢM GIÁ --- */}
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  {/* Hiển thị số tiền giảm thực tế */}
                  <span className="font-medium">- {formatCurrency(discount)}</span>
                </div>
                {/* -------------------------------- */}

                <div className="flex justify-between text-xl font-bold text-black pt-2 border-t border-dashed border-gray-400 mt-2">
                  <span>Tổng cộng:</span>
                  {/* Tính lại tổng tiền: Hàng + Ship - Giảm giá */}
                  <span className="text-[#D9534F]">{formatCurrency(Math.max(0, finalTotal))}</span>
                </div>
              </div>

              <button 
                onClick={handleOrder}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg mt-8 uppercase transition-colors"
              >
                Đặt hàng
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;