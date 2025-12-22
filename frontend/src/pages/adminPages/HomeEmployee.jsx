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

const HomeEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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
    { header: "Họ tên", accessor: "hoTen", required: true, className: "col-span-1" },
    { header: "Email", accessor: "email", type: "email", required: true },
    { header: "SĐT", accessor: "soDienThoai", required: true },
    {
      header: "Ngày sinh",
      accessor: "ngaySinh",
      type: "date",
      required: true,
      render: (data) => data.ngaySinh ? new Date(data.ngaySinh).toISOString().split('T')[0] : ''
    },
    {
      header: "Giới tính",
      accessor: "gioiTinh",
      type: "select",
      options: [{ value: "Nam", label: "Nam" }, { value: "Nữ", label: "Nữ" }],
      defaultValue: "Nam"
    },
    { header: "Chức vụ", accessor: "chucVu", required: true },
    { header: "Ca làm", accessor: "caLam", required: true },
    {
      header: "Lương cơ bản",
      accessor: "luong",
      type: "number",
      required: true,
      render: (d) => Number(d.luong).toLocaleString()
    },
    { header: "Thưởng", accessor: "thuong", type: "number", defaultValue: 0, render: (d) => Number(d.thuong || 0).toLocaleString() },
    { header: "Thâm niên", accessor: "thamNien", defaultValue: "0" },
    { header: "Ngày nghỉ", accessor: "ngayNghi", type: "number", defaultValue: 0 },
    {
      header: "Trạng thái",
      accessor: "trangThai",
      type: "select",
      options: [{ value: "Online", label: "Online" }, { value: "Offline", label: "Offline" }],
      defaultValue: "Online"
    },
    { header: "Địa chỉ", accessor: "diaChi", required: true, className: "col-span-2" },
  ];

  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12" },
    { header: "Họ và tên", accessor: "hoTen" },
    { header: "Chức vụ", accessor: "chucVu" },
    { header: "SĐT", accessor: "soDienThoai" },
    { header: "Ca làm", accessor: "caLam" },
    { header: "Lương", accessor: "luong", render: (row) => row.luong?.toLocaleString() },
    {
      header: "Trạng thái",
      accessor: "trangThai",
      render: (row) => (
        <span className={`${row.trangThai === 'Online' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
          {row.trangThai}
        </span>
      )
    },
    {
      header: "Thao tác",
      className: "w-48",
      render: (row) => (
        <div className="flex justify-center gap-x-4">
          <button onClick={() => handleOpenModal('details', row)}>
            <BsInfoCircle className="text-2xl text-green-800" />
          </button>
          <button onClick={() => handleOpenModal('edit', row)}>
            <AiOutlineEdit className="text-2xl text-yellow-800" />
          </button>
          <button onClick={() => handleOpenModal('delete', row)}>
            <MdOutlineDelete className="text-2xl text-red-800" />
          </button>
        </div>
      ),
    },
  ];

  const fetchEmployees = () => {
    axios.get('http://localhost:5555/employees', getAuthHeaders())
      .then((response) => {
        setEmployees(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleOpenModal = (type, employee = null) => {
    setModalType(type);
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
  };
  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        luong: Number(formData.luong),
        thuong: Number(formData.thuong || 0),
        ngayNghi: Number(formData.ngayNghi || 0),
        thamNien: String(formData.thamNien || "0"),
        ngaySinh: new Date(formData.ngaySinh),
        trangThai: formData.trangThai || "Online"
      };

      if (modalType === 'create') {
        await axios.post('http://localhost:5555/employees', payload, getAuthHeaders());
        alert('Thêm nhân viên thành công!');
      } else if (modalType === 'edit') {
        await axios.put(`http://localhost:5555/employees/${selectedEmployee._id}`, payload, getAuthHeaders());
        alert('Cập nhật thành công!');
      }
      handleCloseModal();
      fetchEmployees();
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;
      alert(`Lỗi: ${msg}`);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5555/employees/${selectedEmployee._id}`, getAuthHeaders());
      alert('Đã chuyển trạng thái sang Offline!');
      handleCloseModal();
      fetchEmployees();
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
            <DataTable columns={columns} data={employees} />
          </div>
          <Next />
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
          modalType === 'create' ? 'Thêm nhân viên mới' :
            modalType === 'edit' ? 'Chỉnh sửa thông tin' :
              modalType === 'details' ? 'Hồ sơ nhân viên' : 'Xác nhận xóa'
        }
        type={modalType}
        fields={modalFields}
        data={selectedEmployee}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default HomeEmployee;