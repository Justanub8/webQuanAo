import React from 'react'
import { FileSpreadsheet, Printer,Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
export const ActionToolbar = ({onAdd}) => {
  return (
    <div className='h-16 w-full bg-red-200 flex justify-between flex-row items-center px-6'>
          <div className='flex flex-row items-center px-6 space-x-2'>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm">
                <FileSpreadsheet size={16} />
                <span>Xuất Excel</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm">
                <Printer size={16} />
                <span>In dữ liệu</span>
            </button>
          </div>
          <div className='items-center flex'>
              <button onClick={onAdd} className="flex items-center space-x-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm text-sm font-medium">
                <Plus size={18} />
                <span>Thêm</span>
              </button>
          </div>
        </div>
  )
}


