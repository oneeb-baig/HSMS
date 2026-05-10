import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Divider, LinearProgress } from '@mui/material';
import { 
  TrendingUp, TrendingDown, AccountBalanceWallet, 
  Home, People, Engineering, Warning 
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  // Enhanced state to include operational counts
  const [stats, setStats] = useState({
    totalIncome: 0, 
    totalExpenses: 0, 
    netBalance: 0,
    totalHouses: 0,
    totalResidents: 0,
    activeStaff: 0,
    pendingSOS: 0
  });
  
  const userRole = localStorage.getItem('userRole') || 'Admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // You can create a single 'dashboard-summary' endpoint in your backend
        const res = await axios.get('http://localhost:5000/api/dashboard-summary');
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchDashboardData();
  }, []);

  // Helper component for Stat Cards
  const StatCard = ({ title, value, icon, color, bgcolor, border }) => (
    <Paper sx={{ 
      p: 3, display: 'flex', alignItems: 'center', 
      bgcolor: bgcolor, color: color, 
      borderRadius: 4, border: `1px solid ${border}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <Box sx={{ bgcolor: 'rgba(255,255,255,0.5)', p: 1, borderRadius: 2, mr: 2, display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: '900' }}>{value}</Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ mt: 2 }}>
      {/* 1. Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: '800' }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome back, <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{userRole}</span>. Here is the society's status.
          </Typography>
        </Box>
        {stats.pendingSOS > 0 && (
          <Paper sx={{ p: 2, bgcolor: '#fef2f2', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ color: '#ef4444', mr: 1 }} />
            <Typography variant="subtitle2" sx={{ color: '#991b1b', fontWeight: 'bold' }}>
              {stats.pendingSOS} Active SOS Alerts
            </Typography>
          </Paper>
        )}
      </Box>

      {/* 2. Management Overview (Operations) */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#475569' }}>Society Operations</Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Units" value={stats.totalHouses} icon={<Home />} color="#1e293b" bgcolor="#f8fafc" border="#e2e8f0" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Residents" value={stats.totalResidents} icon={<People />} color="#1e293b" bgcolor="#f8fafc" border="#e2e8f0" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Society Staff" value={stats.activeStaff} icon={<Engineering />} color="#1e293b" bgcolor="#f8fafc" border="#e2e8f0" />
        </Grid>
      </Grid>

      {/* 3. Financial Overview (Revenue) */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#475569' }}>Financial Pulse</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Total Revenue" 
            value={`Rs. ${stats.totalIncome.toLocaleString()}`} 
            icon={<TrendingUp />} color="#065f46" bgcolor="#f0fdf4" border="#bbf7d0" 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Total Expenses" 
            value={`Rs. ${stats.totalExpenses.toLocaleString()}`} 
            icon={<TrendingDown />} color="#991b1b" bgcolor="#fef2f2" border="#fecaca" 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Net Balance" 
            value={`Rs. ${stats.netBalance.toLocaleString()}`} 
            icon={<AccountBalanceWallet />} color="#1e40af" bgcolor="#eff6ff" border="#bfdbfe" 
          />
        </Grid>
      </Grid>

      {/* 4. Collection Progress Bar */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 4 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Monthly Collection Target</Typography>
        <LinearProgress 
          variant="determinate" 
          value={75} // You can calculate (totalIncome / targetRevenue) * 100
          sx={{ height: 10, borderRadius: 5, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption">Current: Rs. {stats.totalIncome.toLocaleString()}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Target: 75% Achieved</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;