import React from 'react'
import { FooterUI } from '../../components/FooterUI'
import { HeaderUI } from '../../components/HeaderUI'
import { ToolbarUI } from '../../components/ToolbarUI'
import { NearFooter } from '../../components/NearFooter'
import { Checkout } from '../../components/Checkout'
const LoginPage = () => {
  return (
    <div>
      <HeaderUI/>
      <ToolbarUI/>
      <Checkout/>
      <NearFooter/>
      <FooterUI/>
    </div>
  )
}

export default LoginPage
