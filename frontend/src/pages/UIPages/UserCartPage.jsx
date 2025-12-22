import React from 'react'
import { FooterUI } from '../../components/FooterUI'
import { HeaderUI } from '../../components/HeaderUI'
import { ToolbarUI } from '../../components/ToolbarUI'
import { NearFooter } from '../../components/NearFooter'
import { UserCart } from '../../components/UserCart'
const UserCartPage = () => {
  return (
    <div>
      <HeaderUI/>
      <ToolbarUI/>
      <UserCart/>
      <NearFooter/>
      <FooterUI/>
    </div>
  )
}

export default UserCartPage
