import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, MenuItem } from '@mui/material';
import axios from 'axios';

const RegisterMember = () => {
  // FORM STATES
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [block, setBlock] = useState('Block 1');
  const [status, setStatus] = useState('Owner');
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  
  // TENANT-ONLY STATES
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerCnic, setOwnerCnic] = useState('');
  
  const [availableUnits, setAvailableUnits] = useState([]);

  const [loading, setLoading] = useState(false);
const [error, setError] = useState(null); // To store error messages

  // Fetch Units from Database for Dropdown
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
    // Validation Rules
    const phoneRegex = /^03\d{2}-\d{7}$/; 
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

    // Reset error state at the start of a new attempt
    setError(null);

    if (!fullName || !phone || !houseNo || !cnic) {
      setError("Please fill all required fields (Name, Phone, House, CNIC)");
      return;
    }

    if (!phoneRegex.test(phone)) {
      setError("Invalid Phone Format! Use: 03XX-XXXXXXX");
      return;
    }

    if (!cnicRegex.test(cnic)) {
      setError("Invalid CNIC Format! Use: XXXXX-XXXXXXX-X");
      return;
    }

    if (status === 'Tenant' && (!ownerName || !ownerPhone || !ownerCnic)) {
      setError("Please provide all Property Owner details for Tenant registration.");
      return;
    }

    // --- START LOADING ---
    setLoading(true);

    try {
      const memberData = { 
        fullName, phone, email, houseNo, block, status, cnic, 
        vehicleNo, vehicleType, 
        ownerName: status === 'Tenant' ? ownerName : null,
        ownerPhone: status === 'Tenant' ? ownerPhone : null,
        ownerCnic: status === 'Tenant' ? ownerCnic : null 
      };
      
      const response = await axios.post('http://localhost:5000/api/members', memberData);
      
      // If backend sends a success response
      alert("Resident registered successfully!");
      
      // RESET FORM
      setFullName(''); setPhone(''); setEmail(''); setCnic('');
      setHouseNo(''); setVehicleNo(''); setOwnerName('');
      setOwnerPhone(''); setOwnerCnic('');
      setVehicleType('');
      setError(null);

    } catch (err) {
      console.error("Registration Error:", err.response?.data || err.message);
      // Display the specific error from backend (e.g., "CNIC already exists")
      setError(err.response?.data?.error || "Error saving resident to database.");
    } finally {
      // --- STOP LOADING ---
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 500 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#334155' }}>
          New Resident Registration
        </Typography>

      {/* --- ERROR MESSAGE DISPLAY --- */}
        {error && (
          <Typography 
            variant="body2" 
            sx={{ color: 'white', bgcolor: '#ef4444', p: 1.5, borderRadius: 1, mb: 3, textAlign: 'center' }}
          >
            {error}
          </Typography>
        )}

        <Stack spacing={3}>
          <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />

          <TextField 
            label="Phone Number" 
            value={phone} 
            placeholder="0300-1234567" 
            onChange={(e) => setPhone(e.target.value)} 
            helperText="Format: 0300-1234567"
          />

          <TextField 
            label="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            helperText="Used for automated billing"
          />

          <TextField 
            label="CNIC" 
            value={cnic} 
            placeholder="35202-1234567-1"
            onChange={(e) => setCnic(e.target.value)} 
            helperText="Format: 35202-1234567-1"
          />

          <TextField 
            select label="House / Unit Number" 
            value={houseNo} 
            onChange={(e) => setHouseNo(e.target.value)}
          >
            {availableUnits.map((unit) => (
              <MenuItem key={unit.unit_id} value={unit.unit_no}>
                {unit.unit_no} ({unit.unit_type})
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2}>
            <TextField label="Vehicle Number" fullWidth value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
            <TextField 
              select label="Type" 
              sx={{ width: '150px' }} 
              value={vehicleType} 
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <MenuItem value="Car">Car</MenuItem>
              <MenuItem value="Bike">Bike</MenuItem>
              <MenuItem value="None">None</MenuItem>
            </TextField>
          </Stack>

          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="Owner">Owner</MenuItem>
            <MenuItem value="Tenant">Tenant</MenuItem>
          </TextField>

          {status === 'Tenant' && (
            <Stack spacing={2} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary">Property Owner Details</Typography>
              <TextField  label="Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              <TextField  label="Owner Contact" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
              <TextField  label="Owner CNIC" value={ownerCnic} onChange={(e) => setOwnerCnic(e.target.value)} />
            </Stack>
          )}

          <Button 
            variant="contained" 
            onClick={handleRegister} 
            disabled={loading}
            sx={{ bgcolor: '#334155', py: 1.5, '&:hover': { bgcolor: '#1e293b' } }}
          >
            {loading ? 'Processing...' : 'Register Resident'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default RegisterMember;