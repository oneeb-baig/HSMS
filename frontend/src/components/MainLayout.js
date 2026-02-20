import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, AppBar, Toolbar } from '@mui/material'
import { Dashboard, People, Receipt, History, Business, Announcement, ReceiptLong } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';

const drawerWidth = 260; 

export default function MainLayout() {
 
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Registration', icon: <People />, path: '/dashboard/register' },
    { text: 'Member Directory', icon: <People />, path: '/dashboard/directory' },
    { text: 'Track Ownership', icon: <History />, path: '/dashboard/history' },
    { text: 'Unit Management', icon: <Business />, path: '/dashboard/units' },
    { text: 'Billing', icon: <Receipt />, path: '/dashboard/billing' },
    { text: 'Expenses', icon: <Receipt />, path: '/dashboard/expenses' },
    { text: 'Reports', icon: <Receipt />, path: '/dashboard/reports' },
    { text: 'Notice Board', icon: <Announcement />, path: '/dashboard/notices' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
    
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1e293b' }}>
        <Toolbar>
          <Typography variant="h6" noWrap>HSMS - Management System</Typography>
        </Toolbar>
      </AppBar>

     
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#f8fafc' },
        }}
      >
        <Toolbar /> 
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
             
                <ListItemButton component={Link} to={item.path}>
                  <ListItemIcon sx={{ color: '#334155' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ color: '#334155' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

    
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#ffffff', minHeight: '100vh' }}>
        <Toolbar />
       
        <Outlet />
      </Box>
    </Box>
  );
}     