import React, { useState, useEffect } from 'react'; // Added useEffect here
import { Box, Paper, Typography, TextField, Button, Stack, MenuItem } from '@mui/material';
import axios from 'axios';

const RegisterMember = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
const [vehicleNo, setVehicleNo] = useState('');
const [vehicleType, setVehicleType] = useState('Car');
const [ownerName, setOwnerName] = useState('');
const [ownerPhone, setOwnerPhone] = useState('');
const [ownerCnic, setOwnerCnic] = useState('');
  // 1. ADDED HOUSE NO STATE (This fixes your error)
  const [houseNo, setHouseNo] = useState(''); 
  
  const [availableUnits, setAvailableUnits] = useState([]);
  const [block, setBlock] = useState('Block 1'); 
  const [status, setStatus] = useState('Owner');

  // 2. FETCH UNITS FOR DROPDOWN
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/units');
        setAvailableUnits(response.data);
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    };
    fetchUnits();
  }, []);

  const handleRegister = async () => {
 // 1. Define the Regex Rules
  const phoneRegex = /^03\d{2}-\d{7}$/;        // Format: 0300-1234567
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;   // Format: 35202-1234567-1

  // 2. Basic Empty Check
  if (!fullName || !phone || !houseNo || !cnic) {
    alert("Please fill all required fields (Name, Phone, House, CNIC)");
    return;
  }

  // 3. Phone Validation
  if (!phoneRegex.test(phone)) {
    alert("Invalid Phone Number! Please use format: 03XX-XXXXXXX (e.g., 0309-4774254)");
    return;
  }

  // 4. Resident CNIC Validation
  if (!cnicRegex.test(cnic)) {
    alert("Invalid Resident CNIC! Please use format: XXXXX-XXXXXXX-X");
    return;
  }

  // 5. Tenant-Specific Validation
  if (status === 'Tenant') {
    if (!ownerName || !ownerPhone || !ownerCnic) {
      alert("Please provide all Owner details for a Tenant registration.");
      return;
    }
    if (!phoneRegex.test(ownerPhone)) {
      alert("Invalid Owner Phone format!");
      return;
    }
    if (!cnicRegex.test(ownerCnic)) {
      alert("Invalid Owner CNIC format!");
      return;
    }
  }

    try {
      const memberData = { 
  fullName, 
  phone, 
  houseNo, 
  block, 
  status,
  cnic,               // Added
  vehicleNo,          // Added
  vehicleType,        // Added
  ownerName: status === 'Tenant' ? ownerName : null,   // Logic added
  ownerPhone: status === 'Tenant' ? ownerPhone : null, // Logic added
  ownerCnic: status === 'Tenant' ? ownerCnic : null    // Logic added
};
      
      const res = await axios.post('http://localhost:5000/api/members', memberData);
      alert("Resident registered successfully!");
      
      // Clear form after success
      setFullName('');
      setPhone('');
      setHouseNo('');
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
  label="CNIC (e.g. 35202-1234567-1)" 
  fullWidth 
  value={cnic} 
  onChange={(e) => setCnic(e.target.value)} 
/>

          <TextField 
            select 
            label="House / Unit Number" 
            value={houseNo} 
            onChange={(e) => setHouseNo(e.target.value)} 
            fullWidth
          >
            {availableUnits.length === 0 ? (
              <MenuItem disabled>No Units available. Add them in Unit Management first.</MenuItem>
            ) : (
              availableUnits.map((unit) => (
                <MenuItem key={unit.unit_id} value={unit.unit_no}>
                  {unit.unit_no} ({unit.unit_type})
                </MenuItem>
              ))
            )}
          </TextField>

<Stack direction="row" spacing={2}>
  <TextField 
    label="Vehicle Number" 
    fullWidth 
    placeholder="LEA-1234"
    value={vehicleNo} 
    onChange={(e) => setVehicleNo(e.target.value)} 
  />
  <TextField 
    select 
    label="Vehicle Type" 
    sx={{ width: '150px' }}
    value={vehicleType} 
    onChange={(e) => setVehicleType(e.target.value)}
  >
    <MenuItem value="Car">Car</MenuItem>
    <MenuItem value="Bike">Bike</MenuItem>
    <MenuItem value="Other">Other</MenuItem>
    <MenuItem value="None">None</MenuItem>
  </TextField>
</Stack>


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

          {status === 'Tenant' && (
  <Stack spacing={3}>
    <Typography variant="subtitle2" sx={{ color: 'primary.main', mt: 1 }}>
      Actual Property Owner Details
    </Typography>
    <TextField 
      label="Owner Full Name" 
      value={ownerName} 
      onChange={(e) => setOwnerName(e.target.value)} 
    />
    <TextField 
      label="Owner Contact Number" 
      value={ownerPhone} 
      onChange={(e) => setOwnerPhone(e.target.value)} 
    />
    <TextField 
        label="Actual Owner CNIC" 
       
        placeholder="35698-98788544"
        value={ownerCnic} 
        onChange={(e) => setOwnerCnic(e.target.value)} 
        helperText="Format: 35698-98788544"
      />
  </Stack>
)}

          <Button variant="contained" onClick={handleRegister} sx={{ bgcolor: '#334155', py: 1.5 }}>
            Register Resident
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default RegisterMember;