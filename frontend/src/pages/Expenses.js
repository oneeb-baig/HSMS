import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, MenuItem, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack 
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import axios from 'axios';


const Expenses = () => {
  const categories = ["Staff Salaries", "Repairs", "Administrative Costs", "Utility Bills", "Park Maintenance", "Other"];
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });

  const fetchExpenses = async () => {
    const res = await axios.get('http://localhost:5000/api/expenses');
    setExpenses(res.data);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/expenses', form);
    alert("Expense Recorded!");
    setForm({ description: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
    fetchExpenses();
  };

const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this expense record?")) {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`);
      fetchExpenses(); 
    } catch (err) {
      console.error(err);
      alert("Delete failed. Check terminal.");
    }
  }
};

const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);


  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Society Expenditure Tracking</Typography>
      

{/* SUMMARY CARDS */}
<Stack direction="row" spacing={3} sx={{ mb: 4 }}>
  <Paper sx={{ p: 2, flex: 1, bgcolor: '#fff1f2', borderLeft: '5px solid #e11d48', borderRadius: 2 }}>
    <Typography variant="subtitle2" color="textSecondary">Total Society Expenditure</Typography>
    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#be123c' }}>
      Rs. {totalSpent.toLocaleString()}
    </Typography>
  </Paper>

  <Paper sx={{ p: 2, flex: 1, bgcolor: '#f0f9ff', borderLeft: '5px solid #0ea5e9', borderRadius: 2 }}>
    <Typography variant="subtitle2" color="textSecondary">Active Records</Typography>
    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0369a1' }}>
      {expenses.length}
    </Typography>
  </Paper>
</Stack>

      {/* ADD EXPENSE FORM */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>

        
        <form onSubmit={handleSubmit}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField label="Description" size="small" fullWidth required
              value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            
            <TextField select label="Category" size="small" sx={{ width: 250 }} required
              value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </TextField>

            <TextField label="Amount" type="number" size="small" sx={{ width: 150 }} required
              value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} />

            <TextField type="date" size="small" 
              value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />

            <Button type="submit" variant="contained" color="primary">Record</Button>
          </Stack>
        </form>
      </Paper>

      {/* EXPENSE TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Description</b></TableCell>
              <TableCell><b>Category</b></TableCell>
              <TableCell align="right"><b>Amount (PKR)</b></TableCell>
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>{new Date(exp.expense_date).toLocaleDateString()}</TableCell>
                <TableCell>{exp.description}</TableCell>
                <TableCell>{exp.category}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                  -{exp.amount}
                </TableCell>
                <TableCell align="center">
      <Tooltip title="Delete Expense">
        <IconButton color="error" onClick={() => handleDelete(exp.id)}>
          <DeleteOutline />
        </IconButton>
      </Tooltip>
    </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Expenses;