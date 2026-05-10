import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, MenuItem, Paper, 
  Stack, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Divider 
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';


const UnitManagement = () => {
  const userRole = localStorage.getItem('userRole');
  const [searchTerm, setSearchTerm] = useState("");
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState({ 
    unit_no: '', 
    unit_type: 'Apartment', 
    floor_no: '',
    marla: '', 
    base_charges: '' 
  });

  useEffect(() => {
    fetchUnits();
  }, []);
  const [editOpen, setEditOpen] = useState(false);
const [selectedUnit, setSelectedUnit] = useState(null);

  const fetchUnits = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/units');
      setUnits(res.data);
    } catch (err) {
      console.error("Error fetching units", err);
    }
  };

  const handleAddUnit = async () => {
    if (!newUnit.unit_no || !newUnit.unit_type) {
      alert("Please fill Unit Number and Charges");
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/units', newUnit);
      alert("Unit Registered Successfully!");
      setNewUnit({ unit_no: '', unit_type: 'Apartment', floor_no: '', base_charges: '' }); // Reset form
      fetchUnits();
    } catch (err) {
      console.error(err);
      alert("Error adding unit. Make sure Unit No is unique.");
    }
  };


const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this unit?")) {
    try {
      await axios.delete(`http://localhost:5000/api/units/${id}`);
      fetchUnits();
    } catch (err) {
      console.error(err);
    }
  }
};

const handleEditClick = (unit) => {
  setSelectedUnit(unit);
  setEditOpen(true);
};

const handleUpdateUnit = async () => {

  try {
    await axios.put(`http://localhost:5000/api/units/${selectedUnit.unit_id}`, selectedUnit);
    setEditOpen(false);
    fetchUnits();
  } catch (err) {
    console.error(err);
  }
};

const filteredUnits = units.filter((unit) =>
    unit.unit_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (unit.unit_type && unit.unit_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#334155' }}>
        Unit & Property Management
      </Typography>


      {/* SECTION 1: ADD NEW UNIT FORM */}
      {userRole === 'admin' && (
      <>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem' }}>Add New Unit</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField 
            label="Unit / Plot No" 
            size="small" 
            value={newUnit.unit_no}
            onChange={(e) => setNewUnit({...newUnit, unit_no: e.target.value})} 
          />
          <TextField 
            select 
            label="Type" 
            size="small" 
            sx={{ width: 150 }} 
            value={newUnit.unit_type} 
            onChange={(e) => setNewUnit({...newUnit, unit_type: e.target.value})}
          >
            <MenuItem value="Apartment">Apartment</MenuItem>
            <MenuItem value="House">House</MenuItem>
            <MenuItem value="Plot">Plot</MenuItem>
          </TextField>
          <TextField 
            label="Floor" 
            type="number" 
            size="small" 
            value={newUnit.floor_no}
            onChange={(e) => setNewUnit({...newUnit, floor_no: e.target.value})} 
          />
<TextField 
  label="Size (Marla)" 
  type="number" 
  size="small" 
  value={newUnit.marla}
  onChange={(e) => setNewUnit({...newUnit, marla: e.target.value})}   
/>
          <TextField 
            label="Monthly Charges" 
            type="number" 
            size="small" 
            value={newUnit.base_charges}
            onChange={(e) => setNewUnit({...newUnit, base_charges: e.target.value})} 
          />
          <Button variant="contained" onClick={handleAddUnit} sx={{ bgcolor: '#334155' }}>
            Add Unit
          </Button>
        </Stack>
      </Paper>
</>
)}

{/* NEW SECTION: SEARCH BAR */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          placeholder="Search by Unit No or Type..."
          size="small"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', md: 300 }, bgcolor: 'white' }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: 'gray', mr: 1, fontSize: 20 }} />
            ),
          }}
        />
      </Box>

      {/* SECTION 2: UNIT LIST TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Unit No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Floor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Size (Marla)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Base Charges (Rs)</TableCell>
              {userRole === 'admin' && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* CHANGED: Mapping over filteredUnits instead of units */}
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => (
                <TableRow key={unit.unit_id}>
                  <TableCell>{unit.unit_no}</TableCell>
                  <TableCell>{unit.unit_type}</TableCell>
                  <TableCell>{(unit.floor_no !== null && unit.floor_no !== '') ? unit.floor_no : '-'}</TableCell>
                  <TableCell>{unit.marla ? `${unit.marla} Marla` : '-'}</TableCell>
                  <TableCell>{unit.base_charges}</TableCell>
                  
                  {userRole === 'admin' && (
                    <TableCell>          
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditClick(unit)} color="primary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(unit.unit_id)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )} 
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No units found matching "{searchTerm}"</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
  <DialogTitle>Edit Unit Details</DialogTitle>
  <DialogContent>
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField label="Unit No" fullWidth value={selectedUnit?.unit_no || ''} onChange={(e) => setSelectedUnit({...selectedUnit, unit_no: e.target.value})} />
      <TextField select label="Type" fullWidth value={selectedUnit?.unit_type || ''} onChange={(e) => setSelectedUnit({...selectedUnit, unit_type: e.target.value})}>
        <MenuItem value="House">House</MenuItem>
        <MenuItem value="Apartment">Apartment</MenuItem>
        <MenuItem value="Plot">Plot</MenuItem>
      </TextField>
      <TextField label="Floor" type="number" fullWidth value={selectedUnit?.floor_no || ''} onChange={(e) => setSelectedUnit({...selectedUnit, floor_no: e.target.value})} />
      <TextField label="Size (Marla)" type="number" fullWidth value={selectedUnit?.marla || ''} onChange={(e) => setSelectedUnit({...selectedUnit, marla: e.target.value})} />
      <TextField label="Charges" type="number" fullWidth value={selectedUnit?.base_charges || ''} onChange={(e) => setSelectedUnit({...selectedUnit, base_charges: e.target.value})} />
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
    <Button onClick={handleUpdateUnit} variant="contained" sx={{ bgcolor: '#334155' }}>Update Unit</Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default UnitManagement;