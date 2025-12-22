import React from 'react'
import { Truck } from 'lucide-react'
export const NearFooter = () => {
  return (
    <div className='bg-amber-50 h-32 flex items-center px-48 '>
        <div className='flex pt-4 justify-between h-24 w-full '>
          <div className='w-64'>
            <div className='flex space-x-2'>
              <div>
                <Truck size={24}/>
              </div>
              <span className='font-bold'>
                Ship toàn quốc
              </span>
            </div>
            <div className='pl-8'>
              <span className='text-sm'>
                Miễn phí vận chuyển toàn quốc
                cho đơn hàng từ 2.000.000đ
              </span> 
            </div>
          </div> 
          <div className='w-64'>
            <div className='flex space-x-2'>
              <div>
                <Truck size={24}/>
              </div>
              <span className='font-bold'>
                Chất lượng tuyệt đối
              </span>
            </div>
            <div className='pl-8'>
              <span className='text-sm'>
                Cam kết sản phẩm chính hãng 100%
              </span> 
            </div>
          </div>
          <div className='w-64'>
            <div className='flex space-x-2'>
              <div>
                <Truck size={24}/>
              </div>
              <span className='font-bold'>
                Thanh toán dễ dàng
              </span>
            </div>
            <div className='pl-8'>
              <span className='text-sm'>
                Phương thức thanh toán đa dạng và tiện lợi
              </span> 
            </div>
          </div>
          <div className='w-64'>
            <div className='flex space-x-2'>
              <div>
                <Truck size={24}/>
              </div>
              <span className='font-bold'>
                Tiết kiệm thời gian 
              </span>
            </div>
            <div className='pl-8'>
              <span className='text-sm'>
                Mua sẵm dễ hơn khi online
              </span> 
            </div>
          </div>
        </div>
      </div>
  )
}

