import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import { Print } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { SaveAlt } from '@mui/icons-material'; // Icon for download
import axios from 'axios';

const Reports = () => {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({ income: [], expenses: [], defaulters: [] });

  useEffect(() => {
    const fetchReport = async () => {
      const res = await axios.get('http://localhost:5000/api/reports/detailed');
      setData(res.data);
    };
    fetchReport();
  }, []);

  const handlePrint = () => window.print();
  

  const handleDownloadExcel = () => {
  // 1. Define the variable locally inside the function
  let exportData = [];
  let fileName = "";

  if (tab === 0) {
    exportData = data.income;
    fileName = "Income_Report.xlsx";
  } else if (tab === 1) {
    exportData = data.expenses;
    fileName = "Expense_Ledger.xlsx";
  } else {
    exportData = data.defaulters;
    fileName = "Defaulter_List.xlsx";
  }

  // 2. Check if there is actually data to export
  if (exportData.length === 0) {
    alert("No data available to export");
    return;
  }

  // 3. Convert and Download
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
};




  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Financial Reports & Accounts</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
  <Button 
    variant="contained" 
    color="success" 
    startIcon={<SaveAlt />} 
    onClick={handleDownloadExcel}
  >
    Download Excel
  </Button>
</Box>
      
      </Box>

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Income Report" />
          <Tab label="Expense Ledger" />
          <Tab label="Defaulter List" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <TableContainer data={data.income} type="Income" />
          )}
          {tab === 1 && (
            <TableContainer data={data.expenses} type="Expense" />
          )}
          {tab === 2 && (
            <TableContainer data={data.defaulters} type="Defaulter" />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

const TableContainer = ({ data, type }) => {
  // 1. Calculate the grand total before rendering
  const grandTotal = data.reduce((sum, row) => {
    const value = type === 'Expense' ? row.amount : row.total_amount;
    return sum + parseFloat(value || 0);
  }, 0);

  return (
    <Table>
      <TableHead>
        <TableRow sx={{ bgcolor: '#f8fafc' }}>
          {type === 'Expense' ? (
            <>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Category</b></TableCell>
              <TableCell><b>Description</b></TableCell>
              <TableCell align="right"><b>Amount</b></TableCell>
            </>
          ) : (
            <>
              <TableCell><b>House No</b></TableCell>
              <TableCell><b>Resident Name</b></TableCell>
              <TableCell><b>Month</b></TableCell>
              <TableCell align="right"><b>Amount</b></TableCell>
            </>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {/* 2. THE TOTAL ROW (NOW AT THE TOP) */}
        <TableRow sx={{ bgcolor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
          <TableCell colSpan={3} align="right">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              GRAND TOTAL ({type}):
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                color: type === 'Expense' ? '#be123c' : (type === 'Defaulter' ? '#9f1239' : '#059669') 
              }}
            >
              Rs. {grandTotal.toLocaleString()}
            </Typography>
          </TableCell>
        </TableRow>

        {/* 3. INDIVIDUAL DATA ROWS */}
        {data.map((row, i) => (
          <TableRow key={i}>
            {type === 'Expense' ? (
              <>
                <TableCell>{new Date(row.expense_date).toLocaleDateString()}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell align="right" sx={{ color: '#64748b' }}>Rs. {row.amount}</TableCell>
              </>
            ) : (
              <>
                <TableCell>{row.house_no}</TableCell>
                <TableCell>{row.resident_name}</TableCell>
                <TableCell>{row.billing_month}</TableCell>
                <TableCell align="right" sx={{ color: '#64748b' }}>Rs. {row.total_amount}</TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Reports;