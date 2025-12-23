import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { ActionToolbar } from '../../components/ActionToolbar';
import { Next } from '../../components/Next';
import { DataTable } from '../../components/DataTable';
import { ActionModal } from '../../components/ActionModal';

const HomeOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    let token = localStorage.getItem('token'); 
    if (!token && userStr) {
        try { const userObj = JSON.parse(userStr); token = userObj.token || userObj.accessToken; } 
        catch (error) {console.log(error);}
    }
    return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'Shipping': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
        case 'Confirmed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };
 
  const columns = [
    { 
      header: "STT", 
      className: "w-12 text-center font-medium text-gray-500",
      render: (row, index) => index + 1 
    },
    { 
      header: "Mã đơn", 
      accessor: "_id",
      className: "w-24 font-mono text-xs text-gray-500",
      render: (row) => <span className="uppercase">#{row._id.slice(-6)}</span>
    },
    { 
      header: "Khách hàng", 
      accessor: "account",
      className: "w-48",
      render: (row) => (
        <div>
            <div className="font-bold text-sm text-gray-800">{row.account?.username || "Unknown"}</div>
            <div className="text-[11px] text-gray-500">{row.phone}</div>
        </div>
      )
    },
    { 
        header: "Sản phẩm", 
        accessor: "items",
        className: "min-w-[200px]",
        render: (row) => {
            const firstItem = row.items?.[0]?.product?.tenSanPham || "SP đã xóa";
            const count = row.items?.length || 0;
            return (
                <div className="text-sm text-gray-700" title={row.items?.map(i => i.product?.tenSanPham).join(', ')}>
                    <span className="line-clamp-1">{firstItem}</span>
                    {count > 1 && <span className="text-[10px] text-gray-500 font-medium">+ {count - 1} khác</span>}
                </div>
            )
        }
    },
    { 
        header: "PTTT", 
        accessor: "pttt",
        className: "w-24 text-center",
        render: (row) => <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-600">{row.pttt || "COD"}</span>
    },
    { 
      header: "Tổng tiền & Voucher",  
      accessor: "totalPrice",
      className: "w-40 text-right",
      render: (row) => (
        <div className="flex flex-col items-end gap-1"> 
            <span className="font-bold text-[#D9534F] text-sm">{formatCurrency(row.totalPrice)}</span>
             
            {row.vouchers ? (
               <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                 <span className="text-[10px] font-mono font-bold text-green-700">{row.vouchers.maGiamGia}</span>
                 <span className="text-[9px] text-green-600">
                   (-{row.vouchers.loaiMa === '%' ? `${row.vouchers.giaTri}%` : formatCurrency(row.vouchers.giaTri)})
                 </span>
               </div>
            ) : (
                <span className="text-[10px] text-gray-400">Không dùng mã</span>
            )}
        </div>
      )
    },
    {
      header: "Trạng thái",
      accessor: "status",
      className: "w-32 text-center",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-[10px] font-bold border whitespace-nowrap block w-fit mx-auto ${getStatusColor(row.status)}`}>
            {row.status}
        </span>
      )
    },
    {
      header: "Thao tác",
      className: "w-32 text-center",
      render: (row) => (
        <div className="flex justify-center gap-2"> 
          <button onClick={() => handleOpenModal('details', row)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"><BsInfoCircle size={18} /></button> 
          <button onClick={() => handleOpenModal('edit', row)} className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded"><AiOutlineEdit size={18} /></button> 
          <button onClick={() => handleOpenModal('delete', row)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><MdOutlineDelete size={18} /></button>
        </div>
      ),
    },
  ];
 
  const fetchOrders = async () => {
    setLoading(true);
    try {
        const res = await axios.get('http://localhost:5555/orders', getAuthHeaders()); 
        setOrders(res.data.data); 
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, []);
 
  const handleOpenModal = (type, order) => {
    setModalType(type);
    setSelectedOrder(order ? JSON.parse(JSON.stringify(order)) : null);
    setModalOpen(true);
  };
  const handleCloseModal = () => { setModalOpen(false); setSelectedOrder(null); };

  const handleFormSubmit = async (formData) => {
    try {
      if (modalType === 'edit') { 
        await axios.put(`http://localhost:5555/orders/${selectedOrder._id}`, { status: formData.status }, getAuthHeaders());
        alert(`Đã cập nhật trạng thái!`);
      }
      handleCloseModal(); fetchOrders();  
    } catch (error) { alert(`Lỗi: ${error.response?.data?.message}`); }
  };
 
  const handleDelete = async () => {
    if(!window.confirm("Xóa vĩnh viễn đơn hàng này?")) return;
    try {
      await axios.delete(`http://localhost:5555/orders/${selectedOrder._id}`, getAuthHeaders());
      handleCloseModal(); fetchOrders();
    } catch (error) { console.log(error); }
  };
 
  const modalFields = [
    { header: "Mã đơn", accessor: "_id", readOnly: true, className: "col-span-1 bg-gray-100 text-xs" },
    { header: "Ngày đặt", accessor: "createdAt", readOnly: true, className: "col-span-1 bg-gray-100", render: (d) => new Date(d.createdAt).toLocaleString('vi-VN') },
    { header: "Khách hàng", accessor: "account", readOnly: true, className: "col-span-1 bg-gray-100", render: (d) => d.account?.username },
    { header: "SĐT", accessor: "phone", readOnly: true, className: "col-span-1 bg-gray-100 font-bold" },
     
    { 
        header: "Voucher áp dụng", 
        accessor: "vouchers", 
        readOnly: true, 
        className: "col-span-1 bg-green-50 border border-green-100", 
        render: (d) => {
            if(!d.vouchers) return <span className="text-gray-400 italic">Không sử dụng</span>
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-green-700">{d.vouchers.maGiamGia}</span>
                    <span className="text-xs text-green-600">
                        Giảm: {d.vouchers.loaiMa === '%' ? `${d.vouchers.giaTri}%` : formatCurrency(d.vouchers.giaTri)}
                    </span>
                </div>
            )
        }
    },
    
    { header: "PTTT", accessor: "pttt", readOnly: true, className: "col-span-1 bg-gray-100 uppercase font-bold text-gray-600" },
    { header: "Địa chỉ", accessor: "shippingAddress", readOnly: true, className: "col-span-2 bg-gray-100" },
    { header: "Ghi chú", accessor: "note", readOnly: true, type: "textarea", className: "col-span-2 bg-yellow-50 italic text-sm" },
    { header: "Tổng tiền thực trả", accessor: "totalPrice", readOnly: true, className: "col-span-2 font-bold text-red-600 text-xl text-right", render: (d) => formatCurrency(d.totalPrice) },
    { header: "Trạng thái đơn hàng", accessor: "status", type: "select", required: true, className: "col-span-2",
      options: [
        { value: "Pending", label: "Chờ xử lý" }, { value: "Confirmed", label: "Đã xác nhận" },
        { value: "Shipping", label: "Đang giao" }, { value: "Completed", label: "Hoàn thành" }, { value: "Cancelled", label: "Đã hủy" }
      ]
    },
  ];

  return (
    <div className='h-screen flex flex-col font-sans bg-gray-50 text-gray-800'>
      <Header />
      <div className='flex flex-1 flex-row overflow-hidden'>
        <Sidebar />
        <div className='flex flex-col w-full h-full overflow-hidden'> 
          <ActionToolbar onAdd={() => {}} title="Quản lý Đơn hàng" /> 
          
          <div className='flex-1 p-6 overflow-auto custom-scrollbar'>
             {loading ? (
                 <div className="flex justify-center h-64 items-center">Loading...</div>
             ) : (
                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <DataTable columns={columns} data={orders} />
                 </div>
             )}
          </div>
          <Next />
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen} onClose={handleCloseModal}
        title={modalType === 'edit' ? 'Cập nhật trạng thái' : modalType === 'details' ? 'Chi tiết đơn hàng' : 'Xóa đơn hàng'}
        type={modalType} fields={modalFields} data={selectedOrder}
        onSubmit={handleFormSubmit} onDelete={handleDelete}
      />
    </div>
  );
};

export default HomeOrder;