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

const HomeTag = () => {
  const [tags, setTags] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
 
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
      header: "Tên Thẻ (Tag)", 
      accessor: "tenTag", 
      required: true, 
      placeholder: "VD: New Arrival, Hot Sale, Limited...",
      className: "col-span-2"
    },
    { 
      header: "Trạng thái", 
      accessor: "trangThai", 
      type: "select", 
      options: [
        { value: "Online", label: "Online (Hiển thị)" },
        { value: "Offline", label: "Offline (Ẩn)" }
      ],
      defaultValue: "Online",
      className: "col-span-2"
    }
  ];
 
  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12 text-center" },
    { 
        header: "Tên Tag", 
        accessor: "tenTag", 
        render: (row) => (
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md font-medium text-sm">
                #{row.tenTag}
            </span>
        ) 
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
 
  const fetchTags = () => { 
    axios.get('http://localhost:5555/tags', getAuthHeaders()) 
      .then((response) => {
          setTags(response.data.data);
      })
      .catch((error) => {
        console.log(error); 
      });
  };

  useEffect(() => { fetchTags(); }, []);

  const handleOpenModal = (type, tag = null) => {
    setModalType(type);
    setSelectedTag(tag ? JSON.parse(JSON.stringify(tag)) : null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTag(null);
  };
 
  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
          tenTag: formData.tenTag,
          trangThai: formData.trangThai || 'Online'
      };

      if (modalType === 'create') {
        await axios.post('http://localhost:5555/tags', payload, getAuthHeaders());
        alert('Thêm Tag thành công!');
      } else if (modalType === 'edit') {
        await axios.put(`http://localhost:5555/tags/${selectedTag._id}`, payload, getAuthHeaders());
        alert('Cập nhật Tag thành công!');
      }
      handleCloseModal();
      fetchTags();
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;
      alert(`Lỗi: ${msg}`);
    }
  }; 
  const handleDelete = async () => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa Tag này?\nTag sẽ chuyển sang trạng thái Offline và ẩn khỏi danh sách.")) return;

    try {
      await axios.delete(`http://localhost:5555/tags/${selectedTag._id}`, getAuthHeaders());
      alert('Đã ẩn Tag thành công!');
      handleCloseModal();
      fetchTags(); 
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
          <ActionToolbar onAdd={() => handleOpenModal('create')} title="Quản lý Nhãn (Tags)" />
          
          <div className='bg-gray-50 flex-1 p-4 overflow-auto'>
            <DataTable columns={columns} data={tags} />
          </div>
          <Next />
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
            modalType === 'create' ? 'Thêm Tag Mới' : 
            modalType === 'edit' ? 'Cập nhật Tag' : 
            modalType === 'details' ? 'Chi tiết Tag' : 'Xác nhận xóa'
        }
        type={modalType}
        fields={modalFields}          
        data={selectedTag}       
        onSubmit={handleFormSubmit}   
        onDelete={handleDelete}       
      />
    </div>
  );
};

export default HomeTag;