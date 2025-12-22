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

const HomeBrand = () => {
  const [brands, setBrands] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);

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
      header: "Tên Thương Hiệu", 
      accessor: "tenBrand", 
      required: true, 
      placeholder: "VD: Nike, Adidas, Puma...",
      className: "col-span-2"
    },
    { 
      header: "Trạng thái", 
      accessor: "trangThai", 
      type: "select",
      options: [
        { value: "Online", label: "Online (Đang kinh doanh)" },
        { value: "Offline", label: "Offline (Ngừng kinh doanh)" }
      ],
      defaultValue: "Online",
      className: "col-span-2"
    }
  ];

  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12 text-center" },
    { 
        header: "Tên Thương Hiệu", 
        accessor: "tenBrand", 
        className: "font-bold text-lg text-blue-700" 
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
      header: "Ngày cập nhật", 
      accessor: "updatedAt",
      render: (row) => new Date(row.updatedAt).toLocaleDateString('vi-VN')
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

  const fetchBrands = () => {
    axios.get('http://localhost:5555/brands', getAuthHeaders()) 
      .then((response) => {
          setBrands(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleOpenModal = (type, brand = null) => {
    setModalType(type);
    setSelectedBrand(brand ? JSON.parse(JSON.stringify(brand)) : null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBrand(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
          tenBrand: formData.tenBrand,
          trangThai: formData.trangThai || 'Online'
      };

      if (modalType === 'create') {
        await axios.post('http://localhost:5555/brands', payload, getAuthHeaders());
        alert('Thêm thương hiệu thành công!');
      } else if (modalType === 'edit') {
        await axios.put(`http://localhost:5555/brands/${selectedBrand._id}`, payload, getAuthHeaders());
        alert('Cập nhật thương hiệu thành công!');
      }
      handleCloseModal();
      fetchBrands();
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;
      alert(`Lỗi: ${msg}`);
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("CẢNH BÁO: Hành động này sẽ chuyển Brand sang trạng thái 'Offline'.\nTất cả sản phẩm thuộc Brand này cũng sẽ bị chuyển sang 'Offline'.\nBạn có chắc chắn không?")) return;

    try {
      await axios.delete(`http://localhost:5555/brands/${selectedBrand._id}`, getAuthHeaders());
      alert('Đã ẩn thương hiệu và các sản phẩm liên quan!');
      handleCloseModal();
      fetchBrands(); 
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
          <ActionToolbar onAdd={() => handleOpenModal('create')} title="Quản lý Thương hiệu (Brand)" />
          
          <div className='bg-gray-50 flex-1 p-4 overflow-auto'>
            <DataTable columns={columns} data={brands} />
          </div>
          <Next />
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
            modalType === 'create' ? 'Thêm Thương hiệu' : 
            modalType === 'edit' ? 'Cập nhật Thương hiệu' : 
            modalType === 'details' ? 'Chi tiết Thương hiệu' : 'Xác nhận xóa'
        }
        type={modalType}
        fields={modalFields}          
        data={selectedBrand}       
        onSubmit={handleFormSubmit}   
        onDelete={handleDelete}       
      />
    </div>
  );
};

export default HomeBrand;