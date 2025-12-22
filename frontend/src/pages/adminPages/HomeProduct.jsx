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

const HomeProduct = () => {
  const [productList, setProductList] = useState([]);
  
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tags, setTags] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

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

 
  const fetchAuxiliaryData = async () => {
    try {
        const headers = getAuthHeaders(); 
        const [resCat, resBrand, resMat, resTag] = await Promise.all([
            axios.get('http://localhost:5555/categories', headers),
            axios.get('http://localhost:5555/brands', headers),
            axios.get('http://localhost:5555/materials', headers),
            axios.get('http://localhost:5555/tags', headers)
        ]); 
        setCategories(resCat.data.data || []);
        setBrands(resBrand.data.data || []);
        setMaterials(resMat.data.data || []);
        setTags(resTag.data.data || []);

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu tùy chọn:", error);
    }
  };

  useEffect(() => { 
      // eslint-disable-next-line react-hooks/immutability
      fetchProduct(); 
      fetchAuxiliaryData();  
  }, []);
 
  const modalFields = [
    { 
      header: "Tên sản phẩm", 
      accessor: "tenSanPham", 
      required: true, 
      className: "col-span-2" 
    },
    { header: "Link Ảnh (URL)", accessor: "imageUrl", required: true, className: "col-span-2" },
    { 
        header: "Giá bán", 
        accessor: "giaBan", 
        type: "number", 
        required: true, 
        render: (d) => Number(d.giaBan).toString() 
    },
    { 
        header: "Số lượng tồn", 
        accessor: "soLuongConLai", 
        type: "number", 
        required: true 
    },
    { 
        header: "Đã bán", 
        accessor: "soLuongDaBan", 
        type: "number",
        defaultValue: 0,
        readOnly: true 
    },
     
    { 
        header: "Danh Mục (Category)", 
        accessor: "category", 
        type: "select",   
        required: true, 
        options: categories.map(c => ({ value: c._id, label: c.tenCategory }))
    },
    { 
        header: "Thương Hiệu (Brand)", 
        accessor: "maThuongHieu", 
        type: "select",  
        required: true,
        options: brands.map(b => ({ value: b._id, label: b.tenBrand }))
    },
    { 
        header: "Chất Liệu (Material)", 
        accessor: "maChatLieu", 
        type: "select",  
        required: true,
        options: materials.map(m => ({ value: m._id, label: m.tenMaterial }))
    },
    { 
        header: "Thẻ (Tag)",  
        accessor: "maTag", 
        type: "select",
        required: false, 
        options: tags.map(t => ({ value: t._id, label: t.tenTag }))
    },
    
    { 
        header: "Mã Màu Sắc", 
        accessor: "maMauSac", 
        required: true 
    },
    
    { 
        header: "Kích thước", 
        accessor: "kichThuoc", 
        type: "select",
        required: true,
        options: [
            { value: "XS", label: "XS" },
            { value: "S", label: "S" },
            { value: "M", label: "M" },
            { value: "L", label: "L" },
            { value: "XL", label: "XL" },
            { value: "XXL", label: "XXL" },
            { value: "3XL", label: "3XL" }
        ]
    },
    
    { 
      header: "Trạng thái", 
      accessor: "trangThai", 
      type: "select",
      options: [
        { value: "Online", label: "Online (Đang bán)" },
        { value: "Offline", label: "Offline (Ngừng bán)" }
      ],
      defaultValue: "Online" 
    },
    { 
      header: "Mô tả", 
      accessor: "moTa", 
      required: true, 
      type: "textarea",
      className: "col-span-2 h-24",
      placeholder: "Mô tả chi tiết sản phẩm..." 
    },
  ];
 
  const columns = [
    { header: "No.", render: (row, index) => index + 1, className: "w-12 text-center" },
    { 
        header: "Ảnh", 
        accessor: "imageUrl",
        className: "w-16",
        render: (row) => <img src={row.imageUrl} alt="" className="w-10 h-10 object-cover rounded border"/>
    },
    { 
        header: "Tên sản phẩm", 
        accessor: "tenSanPham", 
        className: "font-medium max-w-xs truncate" 
    },
    { 
        header: "Danh mục & Brand", 
        accessor: "category", 
        render: (row) => (
            <div className="flex flex-col text-sm">
                <span className="font-semibold">{row.category?.tenCategory || "---"}</span>
                <span className="text-gray-500 text-xs">{row.maThuongHieu?.tenBrand || "---"}</span>
            </div>
        )
    },
    { 
        header: "Tag", 
        accessor: "maTag",
        render: (row) => row.maTag ? (
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                #{row.maTag?.tenTag || "Deleted"}
            </span>
        ) : ""
    },
    { 
      header: "Giá bán", 
      accessor: "giaBan", 
      render: (row) => <span className="text-red-600 font-bold">{row.giaBan?.toLocaleString()} đ</span>
    },
    { 
      header: "Kho", 
      accessor: "soLuongConLai", 
      className: "text-center" 
    },
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
 
  const fetchProduct = () => {
    axios.get('http://localhost:5555/products', getAuthHeaders()) 
      .then((response) => {
          setProductList(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleOpenModal = (type, product = null) => {
    setModalType(type);
    if (product) { 
        const mappedProduct = {
            ...product,
            category: product.category?._id || product.category,
            maThuongHieu: product.maThuongHieu?._id || product.maThuongHieu,
            maChatLieu: product.maChatLieu?._id || product.maChatLieu,
            maTag: product.maTag?._id || product.maTag,
        };
        setSelectedProduct(mappedProduct);
    } else {
        setSelectedProduct(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };
 
  const handleFormSubmit = async (formData) => {
    try { 
      const payload = {
          tenSanPham: formData.tenSanPham,
          moTa: formData.moTa,
          trangThai: formData.trangThai || 'Online',
          giaBan: Number(formData.giaBan),
          soLuongConLai: Number(formData.soLuongConLai),
          soLuongDaBan: Number(formData.soLuongDaBan || 0),
          imageUrl: formData.imageUrl,
          kichThuoc: formData.kichThuoc, 
          maMauSac: formData.maMauSac, 
          category: formData.category,
          maChatLieu: formData.maChatLieu,
          maThuongHieu: formData.maThuongHieu,
          maTag: formData.maTag || null  
      };

      if (modalType === 'create') {
        await axios.post('http://localhost:5555/products', payload, getAuthHeaders());
        alert('Thêm sản phẩm thành công!');
      } else if (modalType === 'edit') {
        await axios.put(`http://localhost:5555/products/${selectedProduct._id}`, payload, getAuthHeaders());
        alert('Cập nhật sản phẩm thành công!');
      }
      handleCloseModal();
      fetchProduct();
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;
      alert(`Lỗi: ${msg}`);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5555/products/${selectedProduct._id}`, getAuthHeaders());
      alert('Đã ẩn sản phẩm (Chuyển sang Offline)!');
      handleCloseModal();
      fetchProduct();
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
          <ActionToolbar onAdd={() => handleOpenModal('create')} title="Quản lý Sản phẩm" />
          
          <div className='bg-gray-50 flex-1 p-4 overflow-auto'>
            <DataTable columns={columns} data={productList} />
          </div>
          <Next />
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
            modalType === 'create' ? 'Thêm sản phẩm mới' : 
            modalType === 'edit' ? 'Cập nhật thông tin' : 
            modalType === 'details' ? 'Chi tiết sản phẩm' : 'Xác nhận xóa'
        }
        type={modalType}
        fields={modalFields}          
        data={selectedProduct}       
        onSubmit={handleFormSubmit}   
        onDelete={handleDelete}       
      />
    </div>
  );
};

export default HomeProduct;