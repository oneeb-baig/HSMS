import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Stack } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalanceWallet } from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  const userRole = localStorage.getItem('userRole') || 'Admin';

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/financial-summary');
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching summary", err);
      }
    };
    fetchSummary();
  }, []);

  return (
    <Box sx={{ mt: 2 }}>
      {/* Welcome Header */}
      <Paper elevation={1} sx={{ p: 4, borderRadius: 3, bgcolor: '#ffffff', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 'bold' }}>
          Welcome back, {userRole}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here is what's happening in the society today.
        </Typography>
      </Paper>

      {/* Financial Overview Section */}
      <Grid container spacing={3}>
        {/* Income Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', bgcolor: '#ecfdf5', color: '#065f46', borderRadius: 3, border: '1px solid #d1fae5' }}>
            <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Income (Paid Bills)</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Rs. {summary.totalIncome.toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Expenses Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', bgcolor: '#fff1f2', color: '#9f1239', borderRadius: 3, border: '1px solid #ffe4e6' }}>
            <TrendingDown sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Expenses</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Rs. {summary.totalExpenses.toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Net Balance Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, display: 'flex', alignItems: 'center', 
            bgcolor: summary.netBalance >= 0 ? '#eff6ff' : '#fff7ed', 
            color: summary.netBalance >= 0 ? '#1e40af' : '#9a3412', 
            borderRadius: 3, 
            border: '2px solid' 
          }}>
            <AccountBalanceWallet sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Net Society Balance</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Rs. {summary.netBalance.toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;