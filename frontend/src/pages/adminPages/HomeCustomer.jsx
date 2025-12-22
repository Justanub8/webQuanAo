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

const HomeCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [selectedCustomer, setSelectedCustomer] = useState(null); 

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

  const modalFields = [
    { 
      header: "Họ và tên", 
      accessor: "hoTen", 
      required: true, 
      className: "col-span-1" 
    },
    { 
      header: "Email", 
      accessor: "email", 
      type: "email", 
      required: true 
    },
    { 
      header: "Số điện thoại", 
      accessor: "soDienThoai", 
      required: true 
    },
    { 
      header: "Ngày sinh", 
      accessor: "ngaySinh", 
      type: "date", 
      required: true,
      render: (data) => data.ngaySinh ? new Date(data.ngaySinh).toLocaleDateString('vi-VN') : '' 
    },
    { 
      header: "Giới tính", 
      accessor: "gioiTinh", 
      type: "select", 
      options: [
        { value: "Nam", label: "Nam" }, 
        { value: "Nữ", label: "Nữ" }
      ],
      defaultValue: "Nam"
    },
    { 
      header: "Trạng thái", 
      accessor: "trangThai", 
      type: "select",
      options: [
        { value: "Online", label: "Online (Hoạt động)" },
        { value: "Offline", label: "Offline (Đã khóa)" }
      ],
      defaultValue: "Online"
    },
    { 
      header: "Địa chỉ", 
      accessor: "diaChi", 
      required: true, 
      className: "col-span-2" 
    },
  ];
 
  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12 text-center" },
    { header: "Họ và tên", accessor: "hoTen", className: "font-medium" },
    { header: "Email", accessor: "email" },
    { header: "SĐT", accessor: "soDienThoai" },
    { header: "Giới tính", accessor: "gioiTinh" },
    { 
      header: "Trạng thái", 
      accessor: "trangThai",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          row.trangThai === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.trangThai}
        </span>
      )
    },
    {
      header: "Thao tác",
      className: "w-48 text-center",
      render: (row) => (
        <div className="flex justify-center gap-x-4">
          <button onClick={() => handleOpenModal('details', row)}>
            <BsInfoCircle className="text-xl text-green-800" />
          </button>
          <button onClick={() => handleOpenModal('edit', row)}>
            <AiOutlineEdit className="text-xl text-yellow-800" />
          </button>
          <button onClick={() => handleOpenModal('delete', row)}>
            <MdOutlineDelete className="text-xl text-red-800" />
          </button>
        </div>
      ),
    },
  ];
  
  const fetchCustomers = () => {
    axios.get('http://localhost:5555/customers', getAuthHeaders())  
      .then((response) => setCustomers(response.data.data))
      .catch((error) => {
        console.error(error);
        if (error.response?.status === 401 || error.response?.status === 403) {
           console.warn("Lỗi quyền truy cập Customer");
        }
      });
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleOpenModal = (type, customer = null) => {
    setModalType(type);
    
    if (customer) {
        let formattedDate = '';
        if (customer.ngaySinh) {
            formattedDate = new Date(customer.ngaySinh).toISOString().split('T')[0];
        }
        
        setSelectedCustomer({ 
            ...customer, 
            ngaySinh: formattedDate 
        });
    } else {
        setSelectedCustomer(null);
    }
    
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };
 
  const handleFormSubmit = async (formData) => {
    try {
      if (
          !formData.hoTen || !formData.email || !formData.soDienThoai || 
          !formData.diaChi || !formData.ngaySinh
      ) {
          alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
          return;
      }

      const payload = {
        ...formData,
        trangThai: formData.trangThai || 'Online' 
      };

      if (modalType === 'create') {
        await axios.post('http://localhost:5555/customers', payload, getAuthHeaders());
        alert('Thêm khách hàng thành công!');
      } else if (modalType === 'edit') {
        await axios.put(`http://localhost:5555/customers/${selectedCustomer._id}`, payload, getAuthHeaders());
        alert('Cập nhật thành công!');
      }
      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;
      if (msg.includes("Email or Phone number already exists")) {
          alert("Email hoặc Số điện thoại đã tồn tại!");
      } else {
          alert(`Lỗi: ${msg}`);
      }
    }
  };
 
  const handleDelete = async () => {
    
    try {
      await axios.delete(`http://localhost:5555/customers/${selectedCustomer._id}`, getAuthHeaders());
      alert('Đã chuyển trạng thái khách hàng sang Offline!');
      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      console.log(error);
      alert('Lỗi khi xóa! (Kiểm tra quyền Admin)');
    }
  };

  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <div className='flex flex-1 flex-row overflow-hidden'>
        <Sidebar />
        <div className='flex flex-col w-full h-full overflow-hidden'> 
          <ActionToolbar onAdd={() => handleOpenModal('create')} />
          <div className='bg-gray-50 flex-1 p-4 overflow-auto'>
            <DataTable columns={columns} data={customers} />
          </div>
          <Next />
        </div>
      </div> 
      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
            modalType === 'create' ? 'Thêm khách hàng mới' : 
            modalType === 'edit' ? 'Chỉnh sửa thông tin' : 
            modalType === 'details' ? 'Hồ sơ khách hàng' : 'Xác nhận xóa'
        }
        type={modalType}
        fields={modalFields}          
        data={selectedCustomer}       
        onSubmit={handleFormSubmit}   
        onDelete={handleDelete}       
      />
    </div>
  );
};

export default HomeCustomer;