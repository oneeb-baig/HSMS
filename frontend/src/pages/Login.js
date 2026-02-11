import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Typography, Box, Paper, Stack } from '@mui/material';
import { AdminPanelSettings, Person } from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    localStorage.setItem('userRole', role);
    navigate('/dashboard');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)'
    }}>
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 6, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#334155' }}>
            HSMS
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 5 }}>
            Select your portal to continue
          </Typography>
          
          <Stack spacing={3}>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<AdminPanelSettings />} 
              onClick={() => handleLogin('admin')}
              sx={{ 
                py: 2, 
                bgcolor: '#334155', 
                textTransform: 'none',
                '&:hover': { bgcolor: '#1e293b' } // Darker slate on hover
              }}
            >
              Management Portal (Admin)
            </Button>
            
           <Button 
              variant="outlined" 
              size="large" 
              startIcon={<Person />} 
              onClick={() => handleLogin('resident')}
              sx={{ 
                py: 2, 
                color: '#334155', 
                borderColor: '#334155',
                textTransform: 'none',
                '&:hover': { borderColor: '#1e293b', bgcolor: '#f1f5f9' } 
              }}
            >
              Resident Portal
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;