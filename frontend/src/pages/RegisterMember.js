import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, MenuItem } from '@mui/material';
import axios from 'axios';

const RegisterMember = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [block, setBlock] = useState('Block 1'); 
  const [status, setStatus] = useState('Owner');

  // REGEX for Phone: 03XX-XXXXXXX
  const phoneRegex = /^03\d{2}-\d{7}$/;

  const handleRegister = async () => {
  console.log("Button Clicked!"); // Step 1 check
  
  // Validation check
  if (!fullName || !phone || !houseNo) {
    alert("Please fill all fields");
    return;
  }

  console.log("Validation passed, sending data..."); // Step 2 check

  try {
    const memberData = { 
      fullName, 
      phone, 
      houseNo, 
      block,  // Make sure this matches your useState name
      status 
    };
    
    const res = await axios.post('http://localhost:5000/api/members', memberData);
    console.log("Server Response:", res.data);
    alert("Resident registered successfully!");
  } catch (error) {
    console.error("Axios Error:", error.response?.data || error.message);
    alert("Error saving resident. Check terminal.");
  }
};

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 500 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#334155' }}>
          New Resident Registration
        </Typography>

        <Stack spacing={3}>
          <TextField 
            label="Full Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)} 
          />

          <TextField 
            label="Phone Number (03XX-XXXXXXX)" 
            value={phone}
            placeholder="0309-4774254"
            onChange={(e) => setPhone(e.target.value)}
            helperText="Format: 0309-4774254"
          />

          <TextField 
            label="House Number" 
            type="number" // Only allows numbers
            value={houseNo}
            onChange={(e) => setHouseNo(e.target.value)} 
          />

          <TextField
            select
            label="Select Block"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
          >
            <MenuItem value="Block 1">Block 1</MenuItem>
            <MenuItem value="Block 2">Block 2</MenuItem>
            <MenuItem value="Block 3">Block 3</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="Owner">Owner</MenuItem>
            <MenuItem value="Tenant">Tenant</MenuItem>
          </TextField>

          <Button variant="contained" onClick={handleRegister} sx={{ bgcolor: '#334155', py: 1.5 }}>
            Register Resident
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default RegisterMember;