import React from 'react'
import { ChevronLeft,ChevronRight } from 'lucide-react'
export const Next = () => {
  return (
        <div className='flex flex-row-reverse items-center px-6 space-x-2 h-16 bg-gray-400'>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-700 text-sm ">
                <ChevronRight size={16} />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-700 text-sm ">
                <ChevronLeft size={16} />
            </button>
        </div>
  )
}


