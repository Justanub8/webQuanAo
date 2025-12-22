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

const HomeMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

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
      header: "Tên Chất Liệu", 
      accessor: "tenMaterial", 
      required: true, 
      placeholder: "VD: Cotton, Polyester, Da bò...",
      className: "col-span-2"
    },
    { 
      header: "Trạng thái", 
      accessor: "trangThai", 
      type: "select",
      options: [
        { value: "Online", label: "Online (Đang sử dụng)" },
        { value: "Offline", label: "Offline (Ngừng sử dụng)" }
      ],
      defaultValue: "Online",
      className: "col-span-2"
    }
  ];

  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12 text-center" },
    { 
        header: "Tên Chất Liệu", 
        accessor: "tenMaterial", 
        className: "font-bold text-lg text-teal-700" 
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

  const fetchMaterials = () => {
    axios.get('http://localhost:5555/materials', getAuthHeaders()) 
      .then((response) => {
          setMaterials(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleOpenModal = (type, material = null) => {
    setModalType(type);
    setSelectedMaterial(material ? JSON.parse(JSON.stringify(material)) : null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMaterial(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
          tenMaterial: formData.tenMaterial,
          trangThai: formData.trangThai || 'Online'
      };

      if (modalType === 'create') {
        await axios.post('http://localhost:5555/materials', payload, getAuthHeaders());
        alert('Thêm chất liệu thành công!');
      } else if (modalType === 'edit') {
        await axios.put(`http://localhost:5555/materials/${selectedMaterial._id}`, payload, getAuthHeaders());
        alert('Cập nhật chất liệu thành công!');
      }
      handleCloseModal();
      fetchMaterials();
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;
      alert(`Lỗi: ${msg}`);
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("CẢNH BÁO: \n- Hành động này sẽ chuyển Chất liệu sang trạng thái 'Offline'.\n- TẤT CẢ SẢN PHẨM sử dụng chất liệu này cũng sẽ bị chuyển sang 'Offline'.\n\nBạn có chắc chắn muốn tiếp tục?")) return;

    try {
      await axios.delete(`http://localhost:5555/materials/${selectedMaterial._id}`, getAuthHeaders());
      alert('Đã ẩn chất liệu và các sản phẩm liên quan!');
      handleCloseModal();
      fetchMaterials(); 
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
          <ActionToolbar onAdd={() => handleOpenModal('create')} title="Quản lý Chất liệu (Material)" />
          
          <div className='bg-gray-50 flex-1 p-4 overflow-auto'>
            <DataTable columns={columns} data={materials} />
          </div>
          <Next />
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
            modalType === 'create' ? 'Thêm Chất liệu' : 
            modalType === 'edit' ? 'Cập nhật Chất liệu' : 
            modalType === 'details' ? 'Chi tiết Chất liệu' : 'Xác nhận xóa'
        }
        type={modalType}
        fields={modalFields}          
        data={selectedMaterial}       
        onSubmit={handleFormSubmit}   
        onDelete={handleDelete}       
      />
    </div>
  );
};

export default HomeMaterial;