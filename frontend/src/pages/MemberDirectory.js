import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, Box, Stack, IconButton, Tooltip, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  Button, MenuItem, Grid, Divider // <--- ADDED THESE TWO
} from '@mui/material';
import { Delete, Edit, Search, SwapHoriz, Visibility } from '@mui/icons-material';
import axios from 'axios';

const MemberDirectory = () => {
  // 1. STATES
  const [members, setMembers] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferData, setTransferData] = useState({ house_no: '', previous_owner: '', new_owner: '' });
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState({
    full_name: '',
    phone_no: '',
    house_no: '',
    ownership_status: ''
  });
const [viewOpen, setViewOpen] = useState(false);
const [currentMember, setCurrentMember] = useState(null);
  // 2. FETCH DATA FUNCTION
  const fetchAllData = async () => {
    try {
      const membersRes = await axios.get('http://localhost:5000/api/members');
      const unitsRes = await axios.get('http://localhost:5000/api/units');
      setMembers(membersRes.data);
      setAvailableUnits(unitsRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []); 

  // 3. HANDLER FUNCTIONS (MUST BE ABOVE RETURN)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resident?")) {
      try {
        await axios.delete(`http://localhost:5000/api/members/${id}`);
        fetchAllData(); // Refresh list
      } catch (error) {
        console.error("Error deleting member", error);
      }
    }
  };

  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/members/${selectedMember.id}`, selectedMember);
      fetchAllData();
      setOpen(false);
      alert("Resident updated successfully!");
    } catch (error) {
      console.error("Error updating member", error);
    }
  };

  const handleTransferClick = (member) => {
    setTransferData({
      house_no: member.house_no,
      previous_owner: member.full_name,
      new_owner: ''
    });
    setTransferOpen(true);
  };

  const submitTransfer = async () => {
    if (!transferData.new_owner) return alert("Please enter new owner name");
    try {
      await axios.post('http://localhost:5000/api/transfer-ownership', transferData);
      setTransferOpen(false);
      fetchAllData(); 
      alert("Ownership Transferred successfully!");
    } catch (err) {
      console.error(err);
      alert("Transfer failed.");
    }
  };
  

 const handleViewDetails = (member) => {
  console.log("Member Data from DB:", member); // <--- OPEN BROWSER CONSOLE (F12)
  setCurrentMember(member);
  setViewOpen(true);
};
  // 4. THE RETURN (THE UI)
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#334155' }}>
        Resident Directory
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, elevation: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>House No</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Block</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell align="center">{member.full_name}</TableCell>
                <TableCell align="center">{member.phone_no}</TableCell>
                <TableCell align="center">{member.house_no}</TableCell>
                <TableCell align="center">{member.block_name || 'N/A'}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={member.ownership_status} 
                    color={member.ownership_status === 'Owner' ? 'success' : 'info'} 
                    variant="outlined" 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpenEdit(member)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(member.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Transfer Ownership">
                      <IconButton onClick={() => handleTransferClick(member)} color="secondary">
                        <SwapHoriz />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Full Profile">
  <IconButton color="info" onClick={() => handleViewDetails(member)}>
    <Visibility />
  </IconButton>
</Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* EDIT DIALOG */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
  <DialogTitle sx={{ fontWeight: 'bold' }}>Update Resident Profile</DialogTitle>
  <DialogContent dividers>
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      
      {/* SECTION: Personal Details */}
      <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold' }}>Personal Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Full Name" fullWidth value={selectedMember.full_name} onChange={(e) => setSelectedMember({ ...selectedMember, full_name: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="CNIC" fullWidth value={selectedMember.cnic} onChange={(e) => setSelectedMember({ ...selectedMember, cnic: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Phone Number" fullWidth value={selectedMember.phone_no} onChange={(e) => setSelectedMember({ ...selectedMember, phone_no: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Email Address" fullWidth value={selectedMember.email || ''} onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })} />
        </Grid>
      </Grid>

      <Divider />

      {/* SECTION: Property Details */}
      <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold' }}>Property & Status</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField select label="House / Unit" fullWidth value={selectedMember.house_no || ''} onChange={(e) => setSelectedMember({ ...selectedMember, house_no: e.target.value })}>
            {availableUnits.map((unit) => (
              <MenuItem key={unit.unit_id} value={unit.unit_no}>{unit.unit_no}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField select label="Status" fullWidth value={selectedMember.ownership_status || ''} onChange={(e) => setSelectedMember({ ...selectedMember, ownership_status: e.target.value })}>
            <MenuItem value="Owner">Owner</MenuItem>
            <MenuItem value="Tenant">Tenant</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Divider />

      {/* SECTION: Vehicle Details */}
      <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold' }}>Vehicle Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Vehicle Number" fullWidth value={selectedMember.vehicle_no || ''} onChange={(e) => setSelectedMember({ ...selectedMember, vehicle_no: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Vehicle Type" fullWidth placeholder="e.g. Civic, Corolla, Bike" value={selectedMember.vehicle_type || ''} onChange={(e) => setSelectedMember({ ...selectedMember, vehicle_type: e.target.value })} />
        </Grid>
      </Grid>

      {/* SECTION: Tenant Specific Info (Shows only if status is Tenant) */}
      {selectedMember.ownership_status === 'Tenant' && (
        <>
          <Divider />
          <Typography variant="overline" color="error" sx={{ fontWeight: 'bold' }}>Property Owner Details (Required for Tenants)</Typography>
          <TextField label="Owner Name" fullWidth value={selectedMember.owner_name_if_tenant || ''} onChange={(e) => setSelectedMember({ ...selectedMember, owner_name_if_tenant: e.target.value })} />
          <Stack direction="row" spacing={2}>
            <TextField label="Owner Phone" fullWidth value={selectedMember.owner_phone_if_tenant || ''} onChange={(e) => setSelectedMember({ ...selectedMember, owner_phone_if_tenant: e.target.value })} />
            <TextField label="Owner CNIC" fullWidth value={selectedMember.owner_cnic_if_tenant || ''} onChange={(e) => setSelectedMember({ ...selectedMember, owner_cnic_if_tenant: e.target.value })} />
          </Stack>
        </>
      )}
    </Stack>
  </DialogContent>
  <DialogActions sx={{ p: 3 }}>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleUpdate} variant="contained" sx={{ bgcolor: '#334155' }}>Update Resident</Button>
  </DialogActions>
</Dialog>

      {/* TRANSFER DIALOG */}
      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)}>
        <DialogTitle>Transfer Ownership of {transferData.house_no}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'gray' }}>Current Owner: <b>{transferData.previous_owner}</b></Typography>
          <TextField autoFocus label="New Owner Full Name" fullWidth variant="outlined" value={transferData.new_owner} onChange={(e) => setTransferData({...transferData, new_owner: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)}>Cancel</Button>
          <Button onClick={submitTransfer} variant="contained" sx={{ bgcolor: '#334155' }}>Confirm Transfer</Button>
        </DialogActions>
      </Dialog>


      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
  <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#334155', color: 'white' }}>
    Resident Profile Details
  </DialogTitle>
  <DialogContent dividers>
    {currentMember && (
      <Stack spacing={3} sx={{ mt: 1 }}>
        {/* Section 1: Personal Info */}
       <Box>
  <Typography variant="subtitle2" color="primary" gutterBottom>Personal Information</Typography>
  <Typography variant="body1"><b>Full Name:</b> {currentMember.full_name}</Typography>
  {/* Make sure these names match the database exactly! */}
  <Typography variant="body1"><b>CNIC:</b> {currentMember.cnic}</Typography> 
  <Typography variant="body1"><b>Phone:</b> {currentMember.phone_no}</Typography>
  <Typography variant="body1"><b>Email:</b> {currentMember.email || 'N/A'}</Typography>
</Box>

        <hr />

        {/* Section 2: Vehicle Info */}
       <Box>
  <Typography variant="subtitle2" color="primary" gutterBottom>Vehicle Information</Typography>
  {/* Check if your DB uses vehicle_no or vehicleno */}
  <Typography variant="body1"><b>Vehicle No:</b> {currentMember.vehicle_no || 'N/A'}</Typography>
  <Typography variant="body1"><b>Vehicle Type:</b> {currentMember.vehicle_type || 'N/A'}</Typography>
</Box>

        {/* Section 3: Owner Info (Only for Tenants) */}
        {currentMember.ownership_status === 'Tenant' && (
  <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2, mt: 2 }}>
    <Typography variant="subtitle2" color="error" gutterBottom>Property Owner Details</Typography>
    <Typography variant="body1"><b>Owner Name:</b> {currentMember.owner_name_if_tenant}</Typography>
    <Typography variant="body1"><b>Owner Phone:</b> {currentMember.owner_phone_if_tenant}</Typography>
    <Typography variant="body1"><b>Owner CNIC:</b> {currentMember.owner_cnic_if_tenant}</Typography>
  </Box>
)}
      </Stack>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setViewOpen(false)} variant="contained" sx={{ bgcolor: '#334155' }}>
      Close Profile
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default MemberDirectory;