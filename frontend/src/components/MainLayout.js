import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, AppBar, Toolbar, Stack, Chip, Tooltip, IconButton } from '@mui/material'
import { Dashboard, People, History, Business, Campaign, Badge, Inventory, Logout,
  AppRegistration, FolderShared, Payments, RequestQuote, Assessment, 
  RecordVoiceOver, LocalPolice, EventAvailable  } from '@mui/icons-material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import Communication from '../pages/Communication';
import AccountCircle from '@mui/icons-material/AccountCircle';

const drawerWidth = 260; 

export default function MainLayout() {

  const navigate = useNavigate();
  
  // Get the current user's role from localStorage
  const userRole = localStorage.getItem('userRole'); // 'admin', 'resident', or 'guard'
 
  const allMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'resident', 'guard'] },
    
    
    { text: 'Registration', icon: <AppRegistration />, path: '/dashboard/register', roles: ['admin'] },
    { text: 'Member Directory', icon: <FolderShared />, path: '/dashboard/directory', roles: ['admin', 'resident'] },
    { text: 'Track Ownership', icon: <History />, path: '/dashboard/history', roles: ['admin'] },
    { text: 'Unit Management', icon: <Business />, path: '/dashboard/units', roles: ['admin', 'resident'] },
    { text: 'Billing', icon: <Payments />, path: '/dashboard/billing', roles: ['admin'] },
    { text: 'Expenses', icon: <RequestQuote />, path: '/dashboard/expenses', roles: ['admin', 'resident'] },
    { text: 'Reports', icon: <Assessment />, path: '/dashboard/reports', roles: ['admin'] },
    { text: 'Communication', icon: <RecordVoiceOver />, path: '/dashboard/communication', roles: ['admin', 'resident'] },
    { text: 'Track Visitors', icon: <People />, path: '/dashboard/visitors', roles: ['admin', 'resident', 'guard'] },
    { text: 'Staff Management', icon: <Badge />, path: '/dashboard/staff', roles: ['admin', 'guard'] },
    { text: 'Gate And Patrolling', icon: <LocalPolice />, path: '/dashboard/GateAndPatrolling', roles: ['admin', 'guard'] },
    { text: 'Facilities Booking', icon: <EventAvailable />, path: '/dashboard/FacilityBooking', roles: ['admin', 'resident'] },
    { text: 'Inventory', icon: <Inventory />, path: '/dashboard/inventory', roles: ['admin'] }    
];

const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));
  return (
    <Box sx={{ display: 'flex' }}>
    
     <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1e293b' }}>
  <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="h6" noWrap>
      HSMS - Housing Society Management System
    </Typography>

    {/* Right side: User Info and Logout */}
    <Stack direction="row" spacing={2} alignItems="center">
      <Chip 
        icon={<AccountCircle style={{ color: 'white' }} />} 
        label={localStorage.getItem('userRole')?.toUpperCase() || 'USER'} 
        sx={{ 
          color: 'white', 
          bgcolor: 'rgba(255,255,255,0.1)', 
          fontWeight: 'bold',
          border: '1px solid rgba(255,255,255,0.3)' 
        }} 
      />
      
      <Tooltip title="Logout">
        <IconButton 
          onClick={() => {
            localStorage.clear(); // Clears role and username
            window.location.href = '/'; // Redirect to login page
          }} 
          sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
        >
          <Logout />
        </IconButton>
      </Tooltip>
    </Stack>
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

    
   <Box 
  component="main" 
  sx={{ 
    flexGrow: 1, 
    // Change 'p: 3' to specific padding to remove the right-side gap
    pt: 3, 
    pb: 3, 
    pl: 3, 
    pr: 0, // Set right padding to 0 so content can touch the end
    width: `calc(100% - ${drawerWidth}px)`, 
    minHeight: '100vh',
    display: 'flex', 
    flexDirection: 'column', 
    overflowX: 'hidden',
    bgcolor: '#ffffff'
  }}
>
        <Toolbar />
       
        <Outlet />
      </Box>
    </Box>
  );
}     