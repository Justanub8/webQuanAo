import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem('user')); 
  const isAdmin = user && (user.role === 'admin'|| user.role === 'customer');
  if (!isAdmin) {
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default AdminRoute;