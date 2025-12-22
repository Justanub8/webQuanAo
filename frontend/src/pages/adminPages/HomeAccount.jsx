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

const HomeAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
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
      header: "Tên đăng nhập", 
      accessor: "username", 
      required: true, 
      readOnly: modalType === 'edit' 
    },
    { 
      header: "Email", 
      accessor: "email", 
      type: "email",
      required: true 
    },
    { 
      header: "Mật khẩu", 
      accessor: "password", 
      type: "password", 
      required: modalType === 'create', 
      placeholder: modalType === 'edit' ? "Để trống nếu giữ nguyên mật khẩu cũ" : "Nhập mật khẩu..."
    },
    { 
      header: "Vai trò (Role)", 
      accessor: "role", 
      type: "select", 
      required: true,
      options: [
        { value: "customer", label: "Khách hàng (Customer)" },
        { value: "employee", label: "Nhân viên (Employee)" },
        { value: "admin", label: "Quản trị viên (Admin)" }
      ],
      defaultValue: "customer"
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
  ];
 
  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12 text-center" },
    { header: "Username", accessor: "username", className: "font-bold" },
    { header: "Email", accessor: "email" },
    { 
      header: "Vai trò", 
      accessor: "role",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
          row.role === 'admin' ? 'bg-red-100 text-red-700' :
          row.role === 'employee' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }`}>
          {row.role}
        </span>
      )
    },
    { 
      header: "Trạng thái", 
      accessor: "trangThai",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${
            row.trangThai === 'Online' ? 'bg-green-50 text-green-600' : 'bg-gray-200 text-gray-600'
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
 
  const fetchAccounts = () => { 
    axios.get('http://localhost:5555/accounts', getAuthHeaders()) 
      .then((response) => setAccounts(response.data.data))
      .catch((error) => {
          console.error(error);
          if (error.response?.status === 401 || error.response?.status === 403) {
             console.warn("Lỗi quyền truy cập Admin");
          }
      });
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleOpenModal = (type, account = null) => {
    setModalType(type);
    if (account) {
        const accountForEdit = { ...account, password: '' };
        setSelectedAccount(accountForEdit); 
    } else {
        setSelectedAccount(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAccount(null);
  };
 
  const handleFormSubmit = async (formData) => {
    try {
      if (!formData.username || !formData.email || !formData.role) {
          alert("Vui lòng điền đầy đủ Tên đăng nhập, Email và Vai trò!");
          return;
      }

      const payload = { ...formData };
      
      if (modalType === 'edit') {
          if (!payload.password || payload.password.trim() === '') {
              delete payload.password; 
          }
      }

      if (modalType === 'create') {
        if (!payload.password) {
            alert("Mật khẩu là bắt buộc khi tạo mới!");
            return;
        }
        await axios.post('http://localhost:5555/accounts', payload, getAuthHeaders());
        alert('Tạo tài khoản thành công!');
      } else if (modalType === 'edit') { 
        await axios.put(`http://localhost:5555/accounts/${selectedAccount._id}`, payload, getAuthHeaders());
        alert('Cập nhật tài khoản thành công!');
      }
      handleCloseModal();
      fetchAccounts();
    } catch (error) {
      console.log(error); 
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };
 
  const handleDelete = async () => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa/khóa tài khoản này?")) return;
    try {
      await axios.delete(`http://localhost:5555/accounts/${selectedAccount._id}`, getAuthHeaders());
      alert('Đã xử lý tài khoản thành công!');
      handleCloseModal();
      fetchAccounts();
    } catch (error) {
      console.log(error);
      alert('Lỗi khi xóa!');
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
            <DataTable columns={columns} data={accounts} />
          </div>
          <Next />
        </div>
      </div>
 
      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
            modalType === 'create' ? 'Tạo tài khoản mới' : 
            modalType === 'edit' ? 'Cập nhật tài khoản' : 
            modalType === 'details' ? 'Chi tiết tài khoản' : 'Xác nhận xóa'
        }
        type={modalType}
        fields={modalFields}          
        data={selectedAccount}       
        onSubmit={handleFormSubmit}   
        onDelete={handleDelete}       
      />
    </div>
  );
};

export default HomeAccount;