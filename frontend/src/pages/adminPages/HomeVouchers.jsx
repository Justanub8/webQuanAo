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

const HomeVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
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
      header: "Mã giảm giá", 
      accessor: "maGiamGia", 
      required: true, 
      placeholder: "VD: SALE50, TET2025 (Tự động in hoa)",
      className: "col-span-1"
    },
    { 
      header: "Loại mã", 
      accessor: "loaiMa", 
      type: "select", 
      required: true,
      options: [
        { value: "%", label: "Giảm theo %" },
        { value: "VND", label: "Giảm tiền mặt (VNĐ)" }
      ],
      defaultValue: "%"
    },
    { 
      header: "Giá trị giảm", 
      accessor: "giaTri", 
      type: "number", 
      required: true, 
      placeholder: "Nhập số (VD: 10 hoặc 50000)"
    },
    { 
      header: "Số lần dùng tối đa", 
      accessor: "soLanSuDungMax", 
      type: "number", 
      required: true 
    },
    { 
        header: "Đã sử dụng", 
        accessor: "soLanDaSuDung", 
        type: "number", 
        defaultValue: 0,
        readOnly: true,  
        render: (d) => (d.soLanDaSuDung !== undefined && d.soLanDaSuDung !== null) ? d.soLanDaSuDung : 0
    },
    { 
        header: "Ngày bắt đầu", 
        accessor: "ngayThem", 
        type: "date", 
        required: true, 
        render: (d) => d.ngayThem ? new Date(d.ngayThem).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    },
    { 
        header: "Ngày hết hạn", 
        accessor: "ngayHetHan", 
        type: "date", 
        required: true,
        render: (d) => d.ngayHetHan ? new Date(d.ngayHetHan).toISOString().split('T')[0] : ''
    },
    {
      header: 'Giá trị tối thiểu để sử dụng',
      accessor: 'giaTriToiThieu',
      type: 'number',
      required: false,
    },
    { 
      header: "Trạng thái", 
      accessor: "trangThai", 
      type: "select", 
      options: [
        { value: "Online", label: "Online (Đang hoạt động)" },
        { value: "Offline", label: "Offline (Tạm ẩn)" } 
      ],
      defaultValue: "Online",
      className: "col-span-2"
    },
  ];
 
  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12 text-center" },
    { header: "Mã Voucher", accessor: "maGiamGia", className: "font-bold text-blue-600 uppercase" },
    { header: "Loại", accessor: "loaiMa" },
    { 
      header: "Giá trị", 
      accessor: "giaTri",
      render: (row) => {
        if (row.loaiMa === '%') {
          return <span className="font-semibold text-orange-600">{row.giaTri}%</span>;
        }
        return <span className="font-semibold text-green-600">{Number(row.giaTri).toLocaleString()} đ</span>;
      }
    },
    { 
        header: "Tiến độ", 
        className: "text-center",
        render: (row) => (
            <span className="text-sm font-mono">
                {row.soLanDaSuDung || 0} / {row.soLanSuDungMax}
            </span>
        )
    },
    { 
      header: "Hạn dùng", 
      accessor: "ngayHetHan",
      render: (row) => row.ngayHetHan ? new Date(row.ngayHetHan).toLocaleDateString('vi-VN') : ''
    },
    { 
      header: "Trạng thái", 
      accessor: "trangThai",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          row.trangThai === 'Online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {row.trangThai}
        </span>
      )
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
 
  const fetchVouchers = () => {
    axios.get('http://localhost:5555/vouchers', getAuthHeaders()) 
      .then((response) => { 
          setVouchers(response.data.data);
      })
      .catch((error) => {
        console.log(error); 
      });
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleOpenModal = (type, voucher = null) => {
    setModalType(type);
    setSelectedVoucher(voucher);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVoucher(null);
  };
 
  const handleFormSubmit = async (formData) => { 
    try{
      if (new Date(formData.ngayHetHan) <= new Date(formData.ngayThem)) {
          alert("Lỗi: Ngày hết hạn phải sau ngày bắt đầu!");
          return;
      }
      const payload = {
          maGiamGia: formData.maGiamGia.toUpperCase(),  
          loaiMa: formData.loaiMa,
          trangThai: formData.trangThai || 'Online',  
          ngayThem: new Date(formData.ngayThem),
          ngayHetHan: new Date(formData.ngayHetHan),
          soLanSuDungMax: Number(formData.soLanSuDungMax),
          soLanDaSuDung: Number(formData.soLanDaSuDung || 0),
          giaTri: Number(formData.giaTri)
      };

      if (modalType === 'create') {
        await axios.post('http://localhost:5555/vouchers', payload, getAuthHeaders());
        alert('Tạo voucher thành công!');
      } else if (modalType === 'edit') { 
        await axios.put(`http://localhost:5555/vouchers/${selectedVoucher._id}`, payload, getAuthHeaders());
        alert('Cập nhật voucher thành công!');
      }
      handleCloseModal();
      fetchVouchers();
    }catch(error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;
      alert(`Lỗi: ${msg}`);
    }
  };
 
  const handleDelete = async () => {
    try { 
      await axios.delete(`http://localhost:5555/vouchers/${selectedVoucher._id}`, getAuthHeaders());
      alert('Đã xóa voucher (Chuyển sang Offline)!');
      handleCloseModal();
      fetchVouchers();
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
          <ActionToolbar onAdd={() => handleOpenModal('create')} title="Quản lý Voucher" />
          
          <div className='bg-gray-50 flex-1 p-4 overflow-auto'>
            <DataTable columns={columns} data={vouchers} />
          </div>
          <Next />
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
            modalType === 'create' ? 'Tạo mã giảm giá mới' : 
            modalType === 'edit' ? 'Cập nhật voucher' : 
            modalType === 'details' ? 'Chi tiết voucher' : 'Xác nhận xóa'
        }
        type={modalType}
        fields={modalFields}          
        data={selectedVoucher}       
        onSubmit={handleFormSubmit}   
        onDelete={handleDelete}       
      />
    </div>
  );
};

export default HomeVoucher;