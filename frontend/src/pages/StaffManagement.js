import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Stack, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, MenuItem, InputAdornment, Avatar, Dialog, DialogTitle, 
  DialogContent, DialogActions 
} from '@mui/material';
import { Search, PersonAdd, Login, Logout, Engineering, Close, Home } from '@mui/icons-material';
import axios from 'axios';

const StaffManagement = () => {
   const userRole = localStorage.getItem('userRole');
  const [staffList, setStaffList] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]); // New state for houses
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    role: 'Maid',
    phone: '',
    cnic: '',
    assignedHouse: '',
    username: '', // New
    password: ''  // New
  });

  const fetchData = async () => {
    try {
      // Fetch both staff and existing units from the database
      const [staffRes, unitsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/units')
      ]);
      setStaffList(staffRes.data);
      setAvailableUnits(unitsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = () => setOpen(true);
 const handleClose = () => {
  setOpen(false);
  setFormData({ 
    fullName: '', 
    role: 'Maid', 
    phone: '', 
    cnic: '', 
    assignedHouse: '',
    username: '', // Add this
    password: ''  // Add this
  });
};

  const handleRegister = async (e) => {
  if (e) e.preventDefault();
  
  // Update validation to allow Guards to pass
  if (formData.role !== 'Guard' && !formData.assignedHouse) {
    return alert("Please select a house number");
  }
  
  setLoading(true);
  try {
    // Log this to your browser console to see if username/password are actually there
    console.log("Data being sent to backend:", formData);

    const response = await axios.post('http://localhost:5000/api/staff/register', formData);
    
    alert("Staff Registered Successfully");
    handleClose();
    fetchData();
  } catch (err) {
    console.error("Error response:", err.response?.data);
    alert("Registration failed: " + (err.response?.data?.error || "Server Error"));
  } finally {
    setLoading(false);
  }
};

  const handleAttendance = async (staffId) => {
  try {
    // We use a single endpoint that toggles status automatically
    await axios.post(`http://localhost:5000/api/staff/attendance`, { staffId });
    fetchData(); // Refresh the table
  } catch (err) {
    alert("Could not update attendance");
  }
};

  const filteredStaff = staffList.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.assigned_house.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, width: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER SECTION */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
            Staff & Vendor Registry
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage daily attendance for domestic workers and service providers
          </Typography>
        </Box>
        {userRole === 'admin' && (
      <>
        <Button 
          variant="contained" 
          startIcon={<PersonAdd />} 
          onClick={handleOpen}
          sx={{ bgcolor: '#1e293b', px: 3, borderRadius: 2, height: 45 }}
        >
          Add New Member
        </Button>
        </>
        )}
      </Stack>

      {/* MAIN LIST SECTION */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Box sx={{ mb: 3 }}>
          <TextField 
            fullWidth
            placeholder="Search by name, house, or role..." 
            variant="outlined"
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ 
              startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
              sx: { borderRadius: 2, bgcolor: '#f8fafc' }
            }} 
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Staff Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>House</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Attendance Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.length > 0 ? filteredStaff.map((staff) => (
                <TableRow key={staff.staff_id} hover>
                  <TableCell>#{staff.staff_id}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#334155', width: 40, height: 40 }}>
                        {staff.full_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{staff.full_name}</Typography>
                        <Typography variant="caption" color="textSecondary">{staff.id_card_no}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip icon={<Engineering fontSize="small" />} label={staff.role} variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Home sx={{ fontSize: 16, mr: 0.5, color: 'gray' }} /> {staff.assigned_house}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={staff.status === 'In' ? 'Inside' : 'Outside'} 
                      color={staff.status === 'In' ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="center">
  <Button 
    variant="contained" 
    size="small"
    // If 'In', show red 'Exit' button. If 'Out', show blue 'Entry' button.
    color={staff.status === 'In' ? 'error' : 'primary'} 
    startIcon={staff.status === 'In' ? <Logout /> : <Login />}
    onClick={() => handleAttendance(staff.staff_id)}
    sx={{ 
      borderRadius: 2, 
      minWidth: 120,
      fontWeight: 'bold',
      textTransform: 'none' 
    }}
  >
    {staff.status === 'In' ? 'Mark Exit' : 'Mark Entry'}
  </Button>
</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    No registered staff found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* REGISTRATION MODAL WITH UNIT DROPDOWN */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
  <DialogTitle sx={{ fontWeight: 'bold' }}>Register Staff/Vendor</DialogTitle>
  <DialogContent dividers>
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField 
        label="Full Name" 
        fullWidth size="small" 
        value={formData.fullName} 
        onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
      />
      
      <TextField
        select
        label="Role"
        fullWidth
        size="small"
        value={formData.role}
        onChange={(e) => {
          const selectedRole = e.target.value;
          setFormData({
            ...formData,
            role: selectedRole,
            // Match the value "Guard" exactly here
            assignedHouse: selectedRole === 'Guard' ? 'N/A' : '' 
          });
        }}
      >
        {/* Fixed spelling from "Gaurd" to "Guard" */}
        <MenuItem value="Guard">Guard</MenuItem>
        <MenuItem value="Maid">Maid</MenuItem>
        <MenuItem value="Driver">Driver</MenuItem>
        <MenuItem value="Gardener">Gardener</MenuItem>
        <MenuItem value="Electrician">Electrician (Vendor)</MenuItem>
        <MenuItem value="Plumber">Plumber (Vendor)</MenuItem>
      </TextField>

      <TextField label="Phone Number" fullWidth size="small" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      <TextField label="CNIC / ID Number" fullWidth size="small" value={formData.cnic} onChange={(e) => setFormData({...formData, cnic: e.target.value})} />
      
      {/* CONDITION: Only show if NOT 'Guard'. 
          Note: This must match the <MenuItem value="..."> exactly.
      */}
      {formData.role !== 'Guard' && (
        <TextField 
          select 
          label="Assigned House" 
          fullWidth 
          size="small" 
          value={formData.assignedHouse} 
          onChange={(e) => setFormData({...formData, assignedHouse: e.target.value})}
        >
          {availableUnits.length > 0 ? availableUnits.map((unit) => (
            <MenuItem key={unit.unit_id} value={unit.unit_no}>
              {unit.unit_no}
            </MenuItem>
          )) : (
            <MenuItem disabled>No units available</MenuItem>
          )}
        </TextField>
      )}
    </Stack>

    {formData.role === 'Guard' && (
  <Stack spacing={2} sx={{ mt: 1, p: 1, bgcolor: '#f8fafc', borderRadius: 1 }}>
    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b' }}>
      LOGIN CREDENTIALS (GUARD ONLY)
    </Typography>
    
    <TextField 
      label="Username" 
      fullWidth 
      size="small" 
      value={formData.username} 
      onChange={(e) => setFormData({...formData, username: e.target.value})} 
    />
    
    <TextField 
      label="Password" 
      type="password" 
      fullWidth 
      size="small" 
      value={formData.password} 
      onChange={(e) => setFormData({...formData, password: e.target.value})} 
    />
  </Stack>
)}

  </DialogContent>
  <DialogActions sx={{ p: 2 }}>
    <Button onClick={handleClose} color="inherit">Cancel</Button>
    <Button variant="contained" onClick={handleRegister} disabled={loading} sx={{ bgcolor: '#1e293b' }}>
      {loading ? 'Registering...' : 'Confirm Registration'}
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default StaffManagement;