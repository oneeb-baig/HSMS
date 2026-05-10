import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Typography, Box, Paper, Stack, TextField, Alert } from '@mui/material';
import { LockOpen } from '@mui/icons-material';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  
  // States for form input
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password
      });

      if (response.data.success) {
        // SAVE USER DATA TO LOCAL STORAGE
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('linkedId', response.data.linked_id);
        localStorage.setItem('fullName', response.data.fullName); 
        localStorage.setItem('houseNo', response.data.houseNo);
        
        // REDIRECT TO DASHBOARD
        navigate('/dashboard');
      }
    } catch (err) {
      // Check if it's a 401 (Invalid creds) or something else
      setError(err.response?.data?.error || "Connection to server failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)'
    }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#334155' }}>
            HSMS
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Housing Society Management System
          </Typography>

          {/* Error Message Display */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField 
                label="Username" 
                variant="outlined" 
                fullWidth 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField 
                label="Password" 
                type="password" 
                variant="outlined" 
                fullWidth 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button 
                type="submit"
                variant="contained" 
                size="large" 
                disabled={loading}
                startIcon={<LockOpen />} 
                sx={{ 
                  py: 1.5, 
                  bgcolor: '#334155', 
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1e293b' } 
                }}
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Typography variant="caption" sx={{ display: 'block', mt: 3, color: 'text.secondary' }}>
            Contact the society office if you forgot your credentials.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;