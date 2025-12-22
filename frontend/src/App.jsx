import React from 'react'
import { Route,Routes } from 'react-router-dom'
import HomeProduct from './pages/adminPages/HomeProduct'
import HomeVoucher from './pages/adminPages/HomeVouchers'
import HomeCustomer from './pages/adminPages/HomeCustomer'
import HomeEmployee from './pages/adminPages/HomeEmployee'
import HomeOrder from './pages/adminPages/HomeOrder'
import HomeAccount from './pages/adminPages/HomeAccount'
import HomePage from './pages/UIPages/HomePage'
import RegisterPage from './pages/UIPages/RegisterPage'
import LoginPage from './pages/UIPages/LoginPage'
import CheckoutPage from './pages/UIPages/CheckoutPage'
import ProductDetailPage from './pages/UIPages/ProductDetail'
import AllProductPage from './pages/UIPages/AlProductPage'
import UserCartPage from './pages/UIPages/UserCartPage'
import AdminRoute from './components/AdminRoute'
import UserProfile from './pages/UIPages/UserProfile'
import UserOrder from './pages/UIPages/UserOrder'
import HomeBrand from './pages/adminPages/HomeBrand'
import HomeCategory from './pages/adminPages/HomeCategory'
import HomeMaterial from './pages/adminPages/HomeMaterial'
import HomeTag from './pages/adminPages/HomeTag'
const App = () => {
  return (
    <Routes>

      <Route element={<AdminRoute />}>
        <Route path='/products' element = {<HomeProduct/>}/>
        <Route path='/vouchers' element = {<HomeVoucher/>}/>
        <Route path='/customers' element = {<HomeCustomer/>}/>
        <Route path='/employees' element = {<HomeEmployee/>}/>
        <Route path='/orders' element = {<HomeOrder/>} />
        <Route path='/accounts' element = {<HomeAccount/>} />
        <Route path='/tags' element={<HomeTag/>} />
        <Route path='/categories' element={<HomeCategory/>} />
        <Route path='/materials' element={<HomeMaterial/>} />
        <Route path='/brands' element={<HomeBrand/>} />
      </Route>
      <Route path='/' element = {<HomePage/>} />
      <Route path='/register' element = {<RegisterPage/>} /> 
      <Route path='/login' element = {<LoginPage/>} />
      <Route path='/checkout' element = {<CheckoutPage />} /> 
      <Route path='/detail/:id' element = {<ProductDetailPage/>} />
      <Route path='/allproduct' element = {<AllProductPage/>} />
      <Route path='/cart/:id' element = {<UserCartPage/>} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path='/userorder' element={<UserOrder />} />
    </Routes>
  )
}

export default App
