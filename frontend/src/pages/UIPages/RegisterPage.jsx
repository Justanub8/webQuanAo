import React from 'react'
import { FooterUI } from '../../components/FooterUI'
import { HeaderUI } from '../../components/HeaderUI'
import { ToolbarUI } from '../../components/ToolbarUI'
import { NearFooter } from '../../components/NearFooter'
import { RegisterAccount } from '../../components/RegisterAccount'
const RegisterPage = () => {
  return (
    <div>
      <HeaderUI/>
      <ToolbarUI/>
      <div>
        <RegisterAccount/>
      </div>
      <NearFooter/>
      <FooterUI/>
    </div>
  )
}

export default RegisterPage
