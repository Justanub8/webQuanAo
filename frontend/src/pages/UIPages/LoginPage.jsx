import React from 'react'
import { FooterUI } from '../../components/FooterUI'
import { HeaderUI } from '../../components/HeaderUI'
import { ToolbarUI } from '../../components/ToolbarUI'
import { NearFooter } from '../../components/NearFooter'
import { LoginAccount } from '../../components/LoginAccount'
import { UserCart } from '../../components/UserCart'
import { AllProduct } from '../../components/AllProduct'
import { Recommend } from '../../components/Recommend'
const LoginPage = () => {
  return (
    <div>
      <HeaderUI/>
      <ToolbarUI/>
      <LoginAccount/>
      <NearFooter/>
      <FooterUI/>
    </div>
  )
}

export default LoginPage
