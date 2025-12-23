import React, { useEffect, useState } from 'react';
import { AiOutlineClose, AiOutlineWarning } from 'react-icons/ai'; 
import { FiCheck, FiX } from 'react-icons/fi'; 

//File này sẽ sửa lại 

const DynamicInput = ({ field, value, onChange }) => {
  const baseClass = "w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 ease-in-out placeholder-gray-400";
  const safeValue = value !== undefined && value !== null ? value : '';

  if (field.type === 'select') {
    return (
      <div className="relative">
        <select
          name={field.accessor}
          value={safeValue}
          onChange={onChange}
          className={`${baseClass} appearance-none cursor-pointer`}
          required={field.required}
          disabled={field.readOnly}
        >
          <option value="" disabled>-- Chọn {field.header} --</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    );
  }

  if (field.type === 'textarea') {
      return (
        <textarea
            name={field.accessor}
            value={safeValue}
            onChange={onChange}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={baseClass}
            readOnly={field.readOnly}
        />
      )
  }

  if (field.type === 'multi-select') {
    const selectedIds = Array.isArray(value) ? value : [];
    const handleCheckboxChange = (optionValue) => {
      let newValues;
      if (selectedIds.includes(optionValue)) {
        newValues = selectedIds.filter(id => id !== optionValue);
      } else {
        newValues = [...selectedIds, optionValue];
      }
      onChange({ target: { name: field.accessor, value: newValues } });
    };

    return (
      <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50 custom-scrollbar">
        {field.options?.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
                {field.options.map((opt) => (
                <label 
                    key={opt.value} 
                    className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                        selectedIds.includes(opt.value) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100'
                    }`}
                >
                    <input
                    type="checkbox"
                    checked={selectedIds.includes(opt.value)}
                    onChange={() => handleCheckboxChange(opt.value)}
                    disabled={field.readOnly}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{opt.label}</span>
                </label>
                ))}
            </div>
        ) : (
             <div className="text-gray-400 text-sm text-center py-4">Không có dữ liệu để chọn</div>
        )}
      </div>
    );
  }
  return (
    <input
      type={field.type || 'text'}
      name={field.accessor}
      value={safeValue}
      onChange={onChange}
      placeholder={field.placeholder}
      required={field.required}
      className={`${baseClass} ${field.readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
      readOnly={field.readOnly}
    />
  );
};

export const ActionModal = ({ isOpen, onClose, title, type, fields, data, onSubmit, onDelete }) => {
  const [formData, setFormData] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAnimating(true);
        if ((type === 'edit' || type === 'details') && data) {
            const formattedData = { ...data };
            fields.forEach(field => {
               if(field.type === 'date' && data[field.accessor]){
                    formattedData[field.accessor] = new Date(data[field.accessor]).toISOString().split('T')[0];
               }
               if(data[field.accessor] && typeof data[field.accessor] === 'object' && !Array.isArray(data[field.accessor]) && data[field.accessor]._id) {
                    formattedData[field.accessor] = data[field.accessor]._id;
               }
            });
            setFormData(formattedData);
          } else {
            const initialData = {};
            fields.forEach(field => {
                if (field.defaultValue !== undefined) {
                    initialData[field.accessor] = field.defaultValue;
                }
            });
            setFormData(initialData);
          }
    } else {
        setTimeout(() => setIsAnimating(false), 200); 
    }
  }, [isOpen, type, data, fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
    >
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${
            isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h2>
                <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">{type === 'create' ? 'Create New' : type}</p>
            </div>
            <button 
                onClick={onClose} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
                <AiOutlineClose className="text-xl" />
            </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {type === 'delete' && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="bg-red-100 p-4 rounded-full mb-4 animate-pulse">
                    <AiOutlineWarning className="text-5xl text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa dữ liệu?</h3>
                <p className="text-gray-500 max-w-sm">
                    Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn hoặc chuyển sang trạng thái ẩn.
                </p>
            </div>
            )}

            {type === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field, index) => (
                <div key={index} className={`bg-gray-50 p-4 rounded-lg border border-gray-100 ${field.className || ''}`}>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {field.header}
                    </label>
                    <div className="text-gray-800 font-medium text-sm wrap-break-word">
                        {field.render ? field.render(formData) : 
                        (Array.isArray(formData[field.accessor]) ? formData[field.accessor].join(', ') : formData[field.accessor] || '---')}
                    </div>
                </div>
                ))}
            </div>
            )}

            {(type === 'create' || type === 'edit') && (
            <form id="action-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field, index) => (
                !(typeof field.hiddenInForm === 'function' ? field.hiddenInForm(type) : field.hiddenInForm) && (
                    <div key={index} className={field.className || ''}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {field.header} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <DynamicInput field={field} value={formData[field.accessor]} onChange={handleChange} />
                    </div>
                )
                ))}
            </form>
            )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3">
             {type === 'delete' ? (
                 <>
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                        Hủy bỏ
                    </button>
                    <button onClick={onDelete} className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-200 transition-all flex items-center gap-2">
                        <AiOutlineDeleteIcon /> Xác nhận xóa
                    </button>
                 </>
             ) : type === 'details' ? (
                <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
                    Đóng
                </button>
             ) : (
                 <>
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors">
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        form="action-form" 
                        className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                    >
                        {type === 'create' ? <><FiCheck /> Lưu lại</> : <><FiCheck /> Cập nhật</>}
                    </button>
                 </>
             )}
        </div>

      </div>
    </div>
  );
};

const AiOutlineDeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
)