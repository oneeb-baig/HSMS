import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';

import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import RegisterMember from './pages/RegisterMember';
import MemberDirectory from './pages/MemberDirectory'; 
import OwnershipHistory from './pages/OwnershipHistory';// 1. Import the new page
import UnitManagement from './pages/UnitManagement';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={
            <Box sx={{ mt: 4 }}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: '#ffffff' }}>
                <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 'bold' }}>
                  Welcome back, {localStorage.getItem('userRole') || 'User'}!
                </Typography>
              </Paper>
            </Box>
          } />
          <Route path="register" element={<RegisterMember />} />
          
          {/* 2. Add this line for the Directory */}
          <Route path="directory" element={<MemberDirectory />} />
          <Route path="history" element={<OwnershipHistory />} />
          <Route path="units" element={<UnitManagement />} />
          <Route path="billing" element={<h1>Billing & Payments Coming Soon</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;



