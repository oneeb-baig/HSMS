import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, 
  DialogContent, TextField, Stack, MenuItem, DialogActions, IconButton, Tooltip 
} from '@mui/material';
import { Add, Inventory, Engineering, Warning, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { formatDate } from '../utils/formatters'; // Using your new utility!

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'Maintenance',
    quantity: 1,
    status: 'Functional'
  });


  const fetchInventory = async () => {
    const res = await axios.get('http://localhost:5000/api/inventory');
    setItems(res.data);
  };

  useEffect(() => { fetchInventory(); }, []);

 

  // Quick Stats Logic
  const stats = {
    total: items.length,
    repair: items.filter(i => i.status === 'Repairing').length,
    low: items.filter(i => i.quantity < 5).length
  };

const [editId, setEditId] = useState(null);
const handleEditClick = (item) => {
  setEditId(item.item_id);
  setFormData({
    item_name: item.item_name,
    category: item.category,
    quantity: item.quantity,
    status: item.status
  });
  setOpen(true);
};

// Handle Delete
const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to remove this item?")) {
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${id}`);
      fetchInventory();
    } catch (err) { alert("Delete failed"); }
  }
};

const handleSave = async () => {
  try {
    if (editId) {
      await axios.put(`http://localhost:5000/api/inventory/${editId}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/inventory/add', formData);
    }
    setOpen(false);
    setEditId(null);
    setFormData({ item_name: '', category: 'Maintenance', quantity: 1, status: 'Functional' });
    fetchInventory();
  } catch (err) { alert("Action failed"); }
};


  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Society Inventory & Assets</Typography>
        {/* Top Button */}
<Button 
  variant="contained" 
  startIcon={<Add />} 
  onClick={() => {
    setEditId(null); // Ensure we aren't in edit mode
    setFormData({ item_name: '', category: 'Maintenance', quantity: 1, status: 'Functional' }); // Clear form
    setOpen(true);
  }} 
  sx={{ bgcolor: '#1e293b' }}
>
  Add New Asset
</Button> 
      </Stack>

      {/* STAT CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#eff6ff' }}>
            <Inventory sx={{ fontSize: 40, mr: 2, color: '#3b82f6' }} />
            <Box><Typography variant="h6">{stats.total}</Typography><Typography variant="body2">Total Assets</Typography></Box>
          </Paper> 
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#fff7ed' }}>
            <Engineering sx={{ fontSize: 40, mr: 2, color: '#f97316' }} />
            <Box><Typography variant="h6">{stats.repair}</Typography><Typography variant="body2">Under Repair</Typography></Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#fef2f2' }}>
            <Warning sx={{ fontSize: 40, mr: 2, color: '#ef4444' }} />
            <Box><Typography variant="h6">{stats.low}</Typography><Typography variant="body2">Low Stock Items</Typography></Box>
          </Paper>
        </Grid>
      </Grid>

      {/* INVENTORY TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><b>Item Name</b></TableCell>
              <TableCell><b>Category</b></TableCell>
              <TableCell><b>Qty</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Last Inspection</b></TableCell>
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.item_id}>
                <TableCell sx={{ fontWeight: 500 }}>{item.item_name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Chip 
                    label={item.status} 
                    size="small" 
                    color={item.status === 'Functional' ? 'success' : item.status === 'Repairing' ? 'warning' : 'error'} 
                  />
                </TableCell>
                <TableCell>{formatDate(item.last_inspected)}</TableCell>
                <TableCell align="center">
  <Stack direction="row" spacing={1} justifyContent="center">
    <Tooltip title="Edit">
      <IconButton size="small" color="primary" onClick={() => handleEditClick(item)}>
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Delete">
      <IconButton size="small" color="error" onClick={() => handleDelete(item.item_id)}>
        <Delete fontSize="small" />
      </IconButton>
    </Tooltip>
  </Stack>
</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ADD ITEM DIALOG */}
{/* ADD / EDIT ITEM DIALOG */}
<Dialog 
  open={open} 
  onClose={() => { setOpen(false); setEditId(null); }} 
  fullWidth 
  maxWidth="xs"
>
  {/* FIX 1: Dynamic Title */}
  <DialogTitle sx={{ fontWeight: 'bold' }}>
    {editId ? 'Edit Asset Details' : 'Add New Asset'}
  </DialogTitle>

  <DialogContent dividers>
    <Stack spacing={2} sx={{ mt: 1 }}>
      {/* FIX 2: Add 'value' props to all TextFields */}
      <TextField 
        label="Item Name" 
        fullWidth 
        size="small" 
        value={formData.item_name} 
        onChange={(e) => setFormData({...formData, item_name: e.target.value})} 
      />
      
      <TextField 
        select 
        label="Category" 
        fullWidth 
        size="small" 
        value={formData.category} 
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      >
        <MenuItem value="Maintenance">Maintenance</MenuItem>
        <MenuItem value="Security">Security</MenuItem>
        <MenuItem value="Gardening">Gardening</MenuItem>
        <MenuItem value="Electrical">Electrical</MenuItem>
      </TextField>

      <TextField 
        label="Quantity" 
        type="number" 
        fullWidth 
        size="small" 
        value={formData.quantity} 
        onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
      />

      <TextField 
        select 
        label="Status" 
        fullWidth 
        size="small" 
        value={formData.status} 
        onChange={(e) => setFormData({...formData, status: e.target.value})}
      >
        <MenuItem value="Functional">Functional</MenuItem>
        <MenuItem value="Repairing">Repairing</MenuItem>
        <MenuItem value="Broken">Broken</MenuItem>
      </TextField>
    </Stack>
  </DialogContent>

  <DialogActions>
    {/* FIX 3: Ensure 'Cancel' clears the edit state */}
    <Button onClick={() => { setOpen(false); setEditId(null); }}>
      Cancel
    </Button>
    <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#1e293b' }}>
      {editId ? 'Update Item' : 'Add Item'}
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default InventoryPage;