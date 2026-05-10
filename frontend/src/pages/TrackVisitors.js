import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Stack, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, MenuItem, InputAdornment,FormControlLabel, Checkbox 
} from '@mui/material';
import { PersonAdd, ExitToApp, Search, EventAvailable } from '@mui/icons-material';
import { Tabs, Tab, Divider } from '@mui/material';
import axios from 'axios';


const TrackVisitors = () => {
  const userRole = localStorage.getItem('userRole');
  const [visitors, setVisitors] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0 for Inside, 1 for Expected

  const [formData, setFormData] = useState({
    visitorName: '',
    phone: '',
    houseNo: '',
    purpose: 'Guest',
    vehicleNo: '',
    status: 'Checked-in'
  });

  const fetchData = async () => {
    try {
      const visitorRes = await axios.get('http://localhost:5000/api/visitors/active');
      const unitsRes = await axios.get('http://localhost:5000/api/units');
      setVisitors(visitorRes.data);
      setAvailableUnits(unitsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    const phoneRegex = /^03\d{2}-\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      return alert("Invalid Phone! Please use format: 0300-1234567");
    }
    if (!formData.visitorName || !formData.houseNo) {
      return alert("Please fill Name and House Number");
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/visitors/check-in', formData);
      setFormData({ visitorName: '', phone: '', houseNo: '', purpose: 'Guest', vehicleNo: '', status: 'Checked-in' });
      fetchData();
      alert("Visitor Logged Successfully");
    } catch (err) {
      alert("Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/visitors/check-out/${id}`);
      fetchData();
      alert("Visitor Marked as Exited");
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmArrival = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/visitors/confirm-arrival/${id}`);
      fetchData();
      alert("Guest has been checked in.");
    } catch (err) {
      console.error("Confirmation failed", err);
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.house_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1e293b' }}>
        Visitors Management
      </Typography>

      {/* Main Layout Grid */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%' }}>
        
        {/* LEFT: FORM (Sticky position keeps it visible while scrolling) */}
        <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0 }}>
          <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              <PersonAdd sx={{ mr: 1 }} color="primary" /> Entry Log
            </Typography>
            <Stack spacing={2} component="form" onSubmit={handleCheckIn}>
              <TextField label="Visitor Name" fullWidth size="small" value={formData.visitorName} onChange={(e) => setFormData({...formData, visitorName: e.target.value})} />
              <TextField label="Phone Number" fullWidth size="small" placeholder="0300-1234567" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              
              <TextField select label="House Number" fullWidth size="small" value={formData.houseNo} onChange={(e) => setFormData({...formData, houseNo: e.target.value})}>
                {availableUnits.map((unit) => (
                  <MenuItem key={unit.unit_id} value={unit.unit_no}>{unit.unit_no}</MenuItem>
                ))}
              </TextField>

              <TextField label="Vehicle No (Optional)" fullWidth size="small" value={formData.vehicleNo} onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})} />
              
              <TextField select label="Purpose" fullWidth size="small" value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})}>
                <MenuItem value="Guest">Guest</MenuItem>
                <MenuItem value="Delivery">Delivery</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

<FormControlLabel
  control={
    <Checkbox 
      // Rule: If resident, it must be checked. Otherwise, use the state.
      checked={userRole === 'resident' ? true : formData.status === 'Pending'}
      
      // Rule: Disable the checkbox if the user is a resident
      disabled={userRole === 'resident'}
      
      onChange={(e) => setFormData({
        ...formData, 
        status: e.target.checked ? 'Pending' : 'Checked-in'
      })}
      color="primary"
    />
  }
  label="Pre-Approve (Expected Guest)"
  sx={{ 
    color: '#475569',
    // Optional: make it look slightly different if disabled so they know why
    '& .Mui-disabled': { color: '#94a3b8' } 
  }}
/>


              <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#1e293b', mt: 1 }}>
                {loading ? 'Logging...' : 'Confirm Entry'}
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* RIGHT AREA: Stacked Tables (Stretches to Right) */}
        <Stack spacing={3} sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}> 
          
          {/* TABLE 2: CURRENT VISITORS */}
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}> 
  <Paper sx={{ p: 3, borderRadius: 3, width: '100%', boxSizing: 'border-box', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
    
    {/* Header & Search */}
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>Visitor Records</Typography>
      <TextField 
        size="small" 
        placeholder="Search..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        sx={{ width: '250px' }}
        InputProps={{ 
          startAdornment: <InputAdornment position="start"><Search /></InputAdornment> 
        }} 
      />
    </Stack>

    {/* Tab Toggle - The "Single Box" Solution */}
   <Tabs 
  value={tabValue} 
  onChange={(e, newValue) => setTabValue(newValue)} 
  sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
>
  {(userRole === 'admin' || userRole === 'guard') && (
    <Tab label={`Currently Inside (${visitors.filter(v => v.status === 'Checked-in').length})`} />
  )}
  <Tab label={`Pre-Approved (${visitors.filter(v => v.status === 'Pending').length})`} />
</Tabs>

    <TableContainer sx={{ width: '100%' }}>
      <Table size="medium" sx={{ minWidth: '100%' }}>
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Visitor</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>House</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>{tabValue === 0 ? 'Entry Time' : 'Purpose'}</TableCell>
              {(userRole === 'admin' || userRole === 'guard') && (
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
              )}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* LOGIC: Show different data based on the active Tab */}
          {tabValue === 0 ? (
            // TAB 0: CURRENT VISITORS
            filteredVisitors.filter(v => v.status === 'Checked-in').length > 0 ? (
              filteredVisitors.filter(v => v.status === 'Checked-in').map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{v.visitor_name}</Typography>
                    <Typography variant="caption" color="textSecondary">{v.visitor_phone}</Typography>
                  </TableCell>
                  <TableCell>{v.house_no}</TableCell>
                  <TableCell>{new Date(v.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                 {(userRole === 'admin' || userRole === 'guard') && (
                  <TableCell align="center">
                    <Button variant="contained" color="error" size="small" disableElevation startIcon={<ExitToApp />} onClick={() => handleCheckOut(v.id)}>
                      Exit
                    </Button>
                  </TableCell>
                 )}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>No visitors inside.</TableCell></TableRow>
            )
          ) : (
            // TAB 1: PRE-APPROVED (PENDING)
            visitors.filter(v => v.status === 'Pending').length > 0 ? (
              visitors.filter(v => v.status === 'Pending').map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{v.visitor_name}</Typography>
                    <Typography variant="caption" color="textSecondary">{v.visitor_phone}</Typography>
                  </TableCell>
                  <TableCell>{v.house_no}</TableCell>
                  <TableCell><Chip label={v.purpose} size="small" variant="outlined" /></TableCell>
                  <TableCell align="center">
                    <Button variant="contained" color="success" size="small" disableElevation onClick={() => handleConfirmArrival(v.id)}>
                      Confirm Arrival
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>No pre-approved guests found.</TableCell></TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
</Box>


        </Stack>

      </Box>
    </Box>
  );
};

export default TrackVisitors;