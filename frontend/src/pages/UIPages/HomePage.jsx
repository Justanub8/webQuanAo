import React from 'react'
import { FooterUI } from '../../components/FooterUI'
import { HeaderUI } from '../../components/HeaderUI'
import { ToolbarUI } from '../../components/ToolbarUI'
import { NearFooter } from '../../components/NearFooter'
import banner from '../../assets/t1-banner.png'
import banner2 from '../../assets/T1_banner2.png'
import { HotProduct } from '../../components/HotProduct'
import { Recommend } from '../../components/Recommend'
const HomePage = () => {
  return (
    <div>
      <HeaderUI/>
      <ToolbarUI/>
      <img src={banner} className='w-1000 h-98 object-contain bg-[#333333]'/>
      <HotProduct title = "Sản phẩm nổi bật"/>
      <HotProduct title = "Sản phẩm mới"/>
      <img src={banner2} className='w-full h-170 object-cover bg-[#333333]'/>
      <Recommend/>
      <NearFooter/>
      <FooterUI/>
    </div>
  )
}

export default HomePage
