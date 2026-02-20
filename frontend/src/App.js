import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';

import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import RegisterMember from './pages/RegisterMember';
import Dashboard from './pages/Dashboard';
import MemberDirectory from './pages/MemberDirectory'; 
import OwnershipHistory from './pages/OwnershipHistory';// 1. Import the new page
import UnitManagement from './pages/UnitManagement';
import Billing from './pages/Billing';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';


function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Login />} />

  <Route path="/dashboard" element={<MainLayout />}>
    {/* Use the new Dashboard component as the 'index' (default) page */}
    <Route index element={<Dashboard />} />
    
    <Route path="register" element={<RegisterMember />} />
    <Route path="directory" element={<MemberDirectory />} />
    <Route path="history" element={<OwnershipHistory />} />
    <Route path="units" element={<UnitManagement />} />
    <Route path="billing" element={<Billing />} />
    <Route path="expenses" element={<Expenses />} />
    <Route path="reports" element={<Reports />} />
  </Route>
</Routes>
    </BrowserRouter>
  );
}

export default App;



