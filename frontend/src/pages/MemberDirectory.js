import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, Box, Stack, IconButton, Tooltip, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import axios from 'axios';

const MemberDirectory = () => {

    
  const [members, setMembers] = useState([]);

  // 1. Fetch data from the Backend when the page loads
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/members');
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members", error);
      }
    };
    fetchMembers();
  }, []); // The empty [] means "run this only once when the page opens"

  // THE DELETE FUNCTION
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resident?")) {
      try {
        await axios.delete(`http://localhost:5000/api/members/${id}`);
        // Refresh the list by filtering out the deleted member
        setMembers(members.filter(member => member.id !== id));
      } catch (error) {
        console.error("Error deleting member", error);
      }
    }
  };
  
// 1. To track if the pop-up is open or closed
const [open, setOpen] = useState(false);

// 2. To hold the data of the person we are currently editing
const [selectedMember, setSelectedMember] = useState({
  full_name: '',
  phone_no: '',
  house_no: '',
  ownership_status: ''
});

// 3. THE MISSING FUNCTION: This opens the pop-up and fills it with data
const handleOpenEdit = (member) => {
  setSelectedMember(member); // Load the clicked member's data
  setOpen(true);              // Open the modal
};

const handleClose = () => setOpen(false); // Close the modal

const handleUpdate = async () => {
  try {
    // This calls the app.put route you just wrote in server.js
    const response = await axios.put(
      `http://localhost:5000/api/members/${selectedMember.id}`, 
      selectedMember
    );

    // This updates the table locally so you see the changes immediately
    setMembers(members.map(m => m.id === selectedMember.id ? response.data : m));
    
    setOpen(false); // Closes the pop-up
    alert("Resident updated successfully!");
  } catch (error) {
    console.error("Error updating member", error);
    alert("Failed to update resident.");
  }
};

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#334155' }}>
        Resident Directory
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, elevation: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>House No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Block</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {members.map((member) => (
    <TableRow key={member.id}>
      <TableCell>{member.full_name}</TableCell>
      <TableCell>{member.phone_no}</TableCell>
      <TableCell>{member.house_no}</TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#64748b' }}>
          {member.block_name || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip 
          label={member.ownership_status} 
          color={member.ownership_status === 'Owner' ? 'success' : 'info'} 
          variant="outlined" 
          size="small" 
        />
      </TableCell>

      {/* NEW SEPARATE COLUMN FOR BUTTONS */}
      <TableCell>
        <Stack direction="row" spacing={1}>
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
        </Stack>
      </TableCell>
    </TableRow>
  ))}
</TableBody>


        </Table>
      </TableContainer>

{/* EDIT DIALOG (Pop-up Form) */}
<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
  <DialogTitle>Edit Resident Details</DialogTitle>
  <DialogContent>
    <Stack spacing={3} sx={{ mt: 2 }}>
      <TextField
        label="Full Name"
        fullWidth
        value={selectedMember.full_name}
        onChange={(e) => setSelectedMember({ ...selectedMember, full_name: e.target.value })}
      />
      <TextField
        label="Phone Number"
        fullWidth
        value={selectedMember.phone_no}
        onChange={(e) => setSelectedMember({ ...selectedMember, phone_no: e.target.value })}
      />
      <TextField
        label="House Number"
        fullWidth
        value={selectedMember.house_no}
        onChange={(e) => setSelectedMember({ ...selectedMember, house_no: e.target.value })}
      />

      <TextField
  select
  label="Block"
  fullWidth
  value={selectedMember.block_name || ''}
  onChange={(e) => setSelectedMember({ ...selectedMember, block_name: e.target.value })}
>
  <MenuItem value="Block 1">Block 1</MenuItem>
  <MenuItem value="Block 2">Block 2</MenuItem>
  <MenuItem value="Block 3">Block 3</MenuItem>
</TextField>
      <TextField
        select
        label="Status"
        fullWidth
        value={selectedMember.ownership_status}
        onChange={(e) => setSelectedMember({ ...selectedMember, ownership_status: e.target.value })}
      >
        <MenuItem value="Owner">Owner</MenuItem>
        <MenuItem value="Tenant">Tenant</MenuItem>
      </TextField>
    </Stack>
  </DialogContent>
  <DialogActions sx={{ p: 3 }}>
    <Button onClick={handleClose} color="inherit">Cancel</Button>
    <Button onClick={handleUpdate} variant="contained" sx={{ bgcolor: '#334155' }}>
      Save Changes
    </Button>
  </DialogActions>
</Dialog>


    </Box>
  );
};

export default MemberDirectory;