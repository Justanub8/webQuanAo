import React from 'react'
import { FooterUI } from '../../components/FooterUI'
import { HeaderUI } from '../../components/HeaderUI'
import { ToolbarUI } from '../../components/ToolbarUI'
import { NearFooter } from '../../components/NearFooter'
import { AllProduct } from '../../components/AllProduct'
const AllProductPage = () => {
  return (
    <div>
      <HeaderUI/>
      <ToolbarUI/>
      <AllProduct/>
      <NearFooter/>
      <FooterUI/>
    </div>
  )
}

export default AllProductPage;
