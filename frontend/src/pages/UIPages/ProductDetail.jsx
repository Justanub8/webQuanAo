import React, { useEffect, useState } from 'react';
import { Star, Minus, Plus, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; 
import { FooterUI } from '../../components/FooterUI'
import { HeaderUI } from '../../components/HeaderUI'
import { ToolbarUI } from '../../components/ToolbarUI'
import { NearFooter } from '../../components/NearFooter'
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();  
  const [product, setProduct] = useState(null); 
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M'); 
  const [isAdding, setIsAdding] = useState(false);  

  useEffect(() => {
      axios.get(`http://localhost:5555/products/${id}`)
        .then((response) => {
          const data = response.data;
          setProduct({
            ...data,
          });
      })
      .catch((error) => console.log(error));
  }, [id]); 

  const handleAddToCart = async () => {  
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');  
 
    if (!user || !token) {
        alert("Vui lòng đăng nhập để mua hàng!");
        navigate('/login');  
        return;
    } 

    setIsAdding(true); 

    try {
        const payload = { 
            accountId: user._id,
            productId: product._id,     
            quantity: quantity,      
            size: selectedSize      
        };
 
        await axios.post('http://localhost:5555/carts', payload, {
            headers: { Authorization: `Bearer ${token}` }
        }); 

        const confirm = window.confirm("Đã thêm vào giỏ hàng! Bạn có muốn đến giỏ hàng ngay không?");
        if (confirm) {
            navigate(`/cart/${user._id}`);
        }
        
    } catch (error) {
        console.error(error); 
        const msg = error.response?.data?.message || error.message;
        alert("Lỗi khi thêm vào giỏ hàng: " + msg);
 
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
        }
    } finally {
        setIsAdding(false);  
    }
  };

  if (!product) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-xl font-medium text-gray-500 animate-pulse">
                Đang tải thông tin sản phẩm...
            </div>
        </div>
    );
  }

  const sizes = ["S", "M", "L", "XL", "XXL", "3XL", "4XL"];
  const thumbnails = [product.imageUrl, product.imageUrl, product.imageUrl, product.imageUrl, product.imageUrl];

  const handleQuantity = (type) => {
    if (type === 'minus' && quantity > 1) setQuantity(quantity - 1);
    if (type === 'plus') setQuantity(quantity + 1);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

  return (
    <div>
    <HeaderUI/>
    <ToolbarUI/>
    <div className="bg-white min-h-screen font-sans text-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden group border border-gray-100 shadow-sm flex items-center justify-center">
              <img src={product.imageUrl} alt="Main" className="w-full h-full object-contain mix-blend-multiply p-8" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {thumbnails.map((img, idx) => (
                <div key={idx} className="aspect-square border border-gray-200 rounded cursor-pointer hover:border-black overflow-hidden bg-gray-50">
                  <img src={img} alt="thumb" className="w-full h-full object-contain mix-blend-multiply p-2" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black mb-2 uppercase">{product.tenSanPham}</h1>       
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <span>Thương hiệu:</span>
                <span className="text-[#D9534F] font-bold uppercase">{product.maThuongHieu?.tenBrand}</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={14} fill="currentColor"/> <Star size={14} fill="currentColor"/> <Star size={14} fill="currentColor"/> <Star size={14} fill="currentColor"/> <Star size={14} fill="currentColor"/>
                <span className="text-gray-400 text-xs ml-1">(5.0)</span>
              </div>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-extrabold text-[#D9534F]">
                {product.giaBan ? formatCurrency(product.giaBan) : "0 đ"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
               <div className="flex-1">
                 <h3 className="font-bold text-sm uppercase mb-3">Kích thước</h3>
                 <div className="grid grid-cols-4 gap-2">
                  {sizes.map((size) => (
                    <button 
                        key={size} 
                        onClick={() => setSelectedSize(size)} 
                        className={`h-11 border-2 rounded font-bold transition-all ${selectedSize === size ? 'bg-black text-white border-black shadow-md' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-600'}`}
                    >
                        {size}
                    </button>
                  ))}
                 </div>
               </div>
               <div>
                  <h3 className="font-bold text-sm uppercase mb-3">Số lượng</h3>
                  <div className="flex items-center h-11 border-2 border-gray-200 rounded overflow-hidden">
                    <button onClick={() => handleQuantity('minus')} className="w-10 h-full bg-white text-gray-600 hover:bg-gray-100 border-r border-gray-200 flex items-center justify-center"><Minus size={16}/></button>
                    <div className="w-14 h-full flex items-center justify-center font-bold">{quantity}</div>
                    <button onClick={() => handleQuantity('plus')} className="w-10 h-full bg-white text-gray-600 hover:bg-gray-100 border-l border-gray-200 flex items-center justify-center"><Plus size={16}/></button>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 flex items-center justify-center gap-3 font-black py-4 rounded-xl uppercase shadow-lg transition-transform active:scale-95
                  ${isAdding ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D9534F] text-white hover:bg-[#c9302c] hover:shadow-xl tracking-widest'}`}
              >
                 {isAdding ? (
                    <span>Đang xử lý...</span>
                 ) : (
                    <>
                        <ShoppingBag size={22} />
                        Thêm vào giỏ hàng
                    </>
                 )}
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8">
            <h3 className="text-[#D9534F] font-bold text-xl uppercase mb-4 tracking-wider">Thông tin chi tiết</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{product.moTa}</p>
        </div>
      </div>
    </div>
    <NearFooter/>
    <FooterUI/>
  </div>
  );
};

export default ProductDetailPage;