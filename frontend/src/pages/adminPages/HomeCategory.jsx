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

const HomeCategory = () => {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

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
      header: "Tên Danh Mục", 
      accessor: "tenCategory", 
      required: true, 
      placeholder: "VD: Giày Thể Thao, Giày Tây...",
      className: "col-span-2"
    },
    { 
      header: "Trạng thái", 
      accessor: "trangThai", 
      type: "select",
      options: [
        { value: "Online", label: "Online (Đang hiển thị)" },
        { value: "Offline", label: "Offline (Đang ẩn)" }
      ],
      defaultValue: "Online",
      className: "col-span-2"
    }
  ];

  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12 text-center" },

    { 
        header: "Tên Danh Mục", 
        accessor: "tenCategory", 
        className: "font-bold text-lg text-indigo-700" 
    },
    { 
      header: "Trạng thái", 
      accessor: "trangThai",
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          row.trangThai === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.trangThai}
        </span>
      )
    },
    { 
      header: "Ngày tạo", 
      accessor: "createdAt",
      render: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN')
    },
    {
      header: "Thao tác",
      className: "w-48 text-center",
      render: (row) => (
        <div className="flex justify-center gap-x-3">
          <button onClick={() => handleOpenModal('details', row)} title="Chi tiết">
             <BsInfoCircle className="text-xl text-green-700" />
          </button>
          <button onClick={() => handleOpenModal('edit', row)} title="Sửa">
            <AiOutlineEdit className="text-xl text-yellow-700" />
          </button>
          <button onClick={() => handleOpenModal('delete', row)} title="Xóa">
            <MdOutlineDelete className="text-xl text-red-700" />
          </button>
        </div>
      ),
    },
  ];

  const fetchCategories = () => {
    axios.get('http://localhost:5555/categories', getAuthHeaders()) 
      .then((response) => {
          setCategories(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenModal = (type, category = null) => {
    setModalType(type);
    setSelectedCategory(category ? JSON.parse(JSON.stringify(category)) : null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
          tenCategory: formData.tenCategory,
          trangThai: formData.trangThai || 'Online'
      };

      if (modalType === 'create') {
        await axios.post('http://localhost:5555/categories', payload, getAuthHeaders());
        alert('Thêm danh mục thành công!');
      } else if (modalType === 'edit') {
        await axios.put(`http://localhost:5555/categories/${selectedCategory._id}`, payload, getAuthHeaders());
        alert('Cập nhật danh mục thành công!');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;
      alert(`Lỗi: ${msg}`);
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("CẢNH BÁO QUAN TRỌNG:\n- Danh mục này sẽ chuyển sang trạng thái 'Offline'.\n- TẤT CẢ SẢN PHẨM thuộc danh mục này cũng sẽ bị chuyển sang 'Offline'.\n\nBạn có chắc chắn muốn tiếp tục?")) return;

    try {
      await axios.delete(`http://localhost:5555/categories/${selectedCategory._id}`, getAuthHeaders());
      alert('Đã ẩn danh mục và các sản phẩm liên quan!');
      handleCloseModal();
      fetchCategories(); 
    } catch (error) {
      console.log(error);
      alert('Lỗi khi xóa!');
    }
  };

  return (
    <div className='h-screen flex flex-col font-sans'>
      <Header />
      <div className='flex flex-1 flex-row overflow-hidden'>
        <Sidebar />
        <div className='flex flex-col w-full h-full overflow-hidden'>
          <ActionToolbar onAdd={() => handleOpenModal('create')} title="Quản lý Danh Mục (Category)" />
          
          <div className='bg-gray-50 flex-1 p-4 overflow-auto'>
            <DataTable columns={columns} data={categories} />
          </div>
          <Next />
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
            modalType === 'create' ? 'Thêm Danh Mục' : 
            modalType === 'edit' ? 'Cập nhật Danh Mục' : 
            modalType === 'details' ? 'Chi tiết Danh Mục' : 'Xác nhận xóa'
        }
        type={modalType}
        fields={modalFields}          
        data={selectedCategory}       
        onSubmit={handleFormSubmit}   
        onDelete={handleDelete}       
      />
    </div>
  );
};

export default HomeCategory;