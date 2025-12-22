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
        try {
            const userObj = JSON.parse(userStr);
            token = userObj.token || userObj.accessToken;
        } catch (e) {
            console.error("Parse user error", e);
        }
    }
    
    if (!token) return {}; 
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'Shipping': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
        case 'Confirmed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'Pending': 
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };
 
  const modalFields = [
    { 
      header: "Mã đơn hàng", 
      accessor: "_id", 
      readOnly: true,
      className: "col-span-1 text-gray-500 bg-gray-100"
    },
    { 
        header: "Ngày đặt", 
        accessor: "createdAt", 
        readOnly: true,
        className: "col-span-1 bg-gray-100",
        render: (d) => formatDate(d.createdAt)
    },
    { 
      header: "Tài khoản đặt", 
      accessor: "account", 
      readOnly: true,
      className: "col-span-1 bg-gray-100",
      render: (d) => d.account ? `${d.account?.username} (${d.account.email})` : "Tài khoản đã xóa"
    },
    { 
      header: "SĐT Nhận hàng", 
      accessor: "phone", 
      readOnly: true, 
      className: "col-span-1 bg-gray-100"
    },
    { 
      header: "Địa chỉ giao hàng", 
      accessor: "shippingAddress", 
      readOnly: true,
      className: "col-span-2 bg-gray-100"
    }, 
    
    
    { 
      header: "Chi tiết đơn hàng", 
      accessor: "items", 
      type: "textarea", 
      readOnly: true,
      className: "col-span-2 font-mono text-sm bg-gray-50 h-32",
      render: (order) => {
        if (!order.items || order.items.length === 0) return "Không có sản phẩm";
        return order.items.map((item, index) => {
            const tenSP = item.product ? item.product.tenSanPham : "Sản phẩm đã ngừng kinh doanh";
            const gia = Number(item.price).toLocaleString();
            return `${index + 1}. ${tenSP} | Size: ${item.size} | SL: ${item.quantity} | Giá: ${gia}đ`;
        }).join('\n'); 
      }
    },
    
    { 
      header: "Tổng thanh toán", 
      accessor: "totalPrice", 
      readOnly: true,
      className: "col-span-1 font-bold text-red-600 text-lg bg-gray-100",
      render: (d) => `${Number(d.totalPrice).toLocaleString()} VND`
    },
    { 
        header: "Trạng thái đơn hàng", 
        accessor: "status", 
        type: "select",  
        options: [
            { value: "Pending", label: "Pending - Chờ xử lý" },
            { value: "Confirmed", label: "Confirmed - Đã xác nhận" },
            { value: "Shipping", label: "Shipping - Đang giao hàng" },
            { value: "Completed", label: "Completed - Giao thành công" },
            { value: "Cancelled", label: "Cancelled - Đã hủy" },
        ],
        required: true,
        className: "col-span-1"
    },
  ];

  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12 text-center" },
    { 
      header: "Mã đơn", 
      accessor: "_id",
      render: (row) => <span className="uppercase text-xs font-mono text-gray-500">{row._id.slice(-6)}</span>
    },
    { 
      header: "Khách hàng", 
      accessor: "account",
      render: (row) => (
        <div className="flex flex-col">
            <span className="font-bold text-blue-700 text-sm">
                {row.account?.username || "Unknown"}
            </span>
            <span className="text-xs text-gray-500">{row.phone}</span>
        </div>
      )
    },
    { 
        header: "Sản phẩm", 
        accessor: "items",
        render: (row) => {
            if(!row.items?.length) return <span className="text-gray-400">Trống</span>;
            const firstItem = row.items[0]?.product?.tenSanPham || "SP đã xóa";
            const count = row.items.length;
            return (
                <div className="text-sm">
                    <span className="font-medium block truncate w-32" title={firstItem}>{firstItem}</span>
                    {count > 1 && <span className="text-xs text-gray-500">và {count - 1} món khác</span>}
                </div>
            )
        }
    },
    { 
      header: "Tổng tiền", 
      accessor: "totalPrice",
      render: (row) => <span className="font-bold text-red-600 text-sm">{Number(row.totalPrice).toLocaleString()} đ</span>
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-[11px] font-bold border ${getStatusColor(row.status)}`}>
            {row.status}
        </span>
      )
    },
    {
      header: "Thao tác",
      className: "w-40 text-center",
      render: (row) => (
        <div className="flex justify-center gap-x-2"> 
          <button onClick={() => handleOpenModal('details', row)} title="Xem chi tiết" className="p-1 hover:bg-gray-100 rounded text-green-700">
            <BsInfoCircle className="text-xl" />
          </button> 
          <button onClick={() => handleOpenModal('edit', row)} title="Cập nhật trạng thái" className="p-1 hover:bg-gray-100 rounded text-yellow-700">
            <AiOutlineEdit className="text-xl" />
          </button> 
          <button onClick={() => handleOpenModal('delete', row)} title="Xóa vĩnh viễn" className="p-1 hover:bg-gray-100 rounded text-red-700">
            <MdOutlineDelete className="text-xl" />
          </button>
        </div>
      ),
    },
  ];
 
  const fetchOrders = async () => {
    setLoading(true);
    try {
        const res = await axios.get('http://localhost:5555/orders', getAuthHeaders()); 
        setOrders(res.data.data); 
    } catch (error) {
        console.error("Lỗi tải danh sách đơn hàng:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleOpenModal = (type, order = null) => {
    setModalType(type); 
    if (order) {
        setSelectedOrder(JSON.parse(JSON.stringify(order))); 
    } else {
        setSelectedOrder(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };
 
  const handleFormSubmit = async (formData) => {
    try {
      if (modalType === 'edit') { 
        const payload = {
            status: formData.status
        };

        await axios.put(`http://localhost:5555/orders/${selectedOrder._id}`, payload, getAuthHeaders());
        alert(`Đã cập nhật trạng thái đơn hàng thành: ${formData.status}`);
      }
      
      handleCloseModal();
      fetchOrders();  
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      alert(`Lỗi: ${msg}`);
    }
  };
 
  const handleDelete = async () => {
    if(!window.confirm("CẢNH BÁO: Hành động này sẽ xóa đơn hàng VĨNH VIỄN khỏi cơ sở dữ liệu.\nBạn có chắc chắn không?")) return;
    
    try {
      await axios.delete(`http://localhost:5555/orders/${selectedOrder._id}`, getAuthHeaders());
      alert('Đã xóa đơn hàng thành công!');
      handleCloseModal();
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert('Lỗi khi xóa đơn hàng!');
    }
  };

  return (
    <div className='h-screen flex flex-col font-sans bg-gray-50'>
      <Header />
      <div className='flex flex-1 flex-row overflow-hidden'>
        <Sidebar />
        <div className='flex flex-col w-full h-full overflow-hidden'> 
          <ActionToolbar 
            onAdd={() => alert("Chức năng tạo đơn hàng chỉ dành cho phía Client (Người mua)!")} 
            title="Quản lý Đơn hàng"
          /> 
          
          <div className='flex-1 p-4 overflow-auto'>
             {loading ? (
                 <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                 </div>
             ) : (
                 <div className="bg-white rounded shadow-sm border border-gray-200">
                    <DataTable columns={columns} data={orders} />
                 </div>
             )}
          </div>
          <Next />
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
            modalType === 'edit' ? 'Cập nhật Trạng thái' : 
            modalType === 'details' ? 'Chi tiết Đơn hàng' : 'Xóa Đơn hàng'
        }
        type={modalType}
        fields={modalFields}          
        data={selectedOrder}       
        onSubmit={handleFormSubmit}   
        onDelete={handleDelete}       
      />
    </div>
  );
};

export default HomeOrder;