import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Button, Stack 
} from '@mui/material';
import { Print, SaveAlt, AccountBalance, ListAlt, ErrorOutline } from '@mui/icons-material';
import axios from 'axios';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({ income: [], expenses: [], defaulters: [] });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/reports/detailed');
        setData(res.data);
      } catch (err) {
        console.error("Error fetching report data", err);
      }
    };
    fetchReport();
  }, []);

  // --- CALCULATIONS FOR BALANCE SHEET ---
  const totalIncome = data.income.reduce((sum, row) => sum + parseFloat(row.total_amount || 0), 0);
  const totalExpenses = data.expenses.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
  const totalDefaulterAmount = data.defaulters.reduce((sum, row) => sum + parseFloat(row.total_amount || 0), 0);
  const netCash = totalIncome - totalExpenses;

  // --- EXCEL DOWNLOAD LOGIC ---
  const handleDownloadExcel = () => {
    let exportData = [];
    let fileName = "";

    if (tab === 0) {
      exportData = [
        { Description: "Cash in Hand (Total Income - Total Expenses)", Amount: netCash },
        { Description: "Accounts Receivable (Defaulters)", Amount: totalDefaulterAmount },
        { Description: "TOTAL ASSETS", Amount: netCash + totalDefaulterAmount }
      ];
      fileName = "Balance_Sheet.xlsx";
    } else if (tab === 1) {
      exportData = data.income.concat(data.expenses); // Combined Report
      fileName = "Income_Expense_Report.xlsx";
    } else {
      exportData = data.defaulters;
      fileName = "Defaulter_List.xlsx";
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
          Financial Accounts & Transparency Reports
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="success" startIcon={<SaveAlt />} onClick={handleDownloadExcel}>
            Export Excel
          </Button>
          <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>
            Print
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs 
          value={tab} 
          onChange={(e, newVal) => setTab(newVal)} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ bgcolor: '#f8fafc' }}
        >
          <Tab icon={<AccountBalance />} label="Balance Sheet" />
          <Tab icon={<ListAlt />} label="Income/Expense Report" />
          <Tab icon={<ErrorOutline />} label="Defaulter List" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* TAB 0: BALANCE SHEET */}
          {tab === 0 && (
            <TableContainer>
              <Typography variant="h6" gutterBottom color="primary">Society Financial Snapshot</Typography>
              <Table sx={{ border: '1px solid #e2e8f0' }}>
                <TableBody>
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}><TableCell colSpan={2}><b>ASSETS</b></TableCell></TableRow>
                  <TableRow><TableCell>Cash in Hand (Net Income)</TableCell><TableCell align="right">Rs. {netCash.toLocaleString()}</TableCell></TableRow>
                  <TableRow><TableCell>Accounts Receivable (Defaulters)</TableCell><TableCell align="right">Rs. {totalDefaulterAmount.toLocaleString()}</TableCell></TableRow>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell><b>TOTAL ASSETS</b></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Rs. {(netCash + totalDefaulterAmount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 1: INCOME/EXPENSE LEDGER */}
          {tab === 1 && (
             <ReportTable data={[...data.income, ...data.expenses]} type="Combined" />
          )}

          {/* TAB 2: DEFAULTERS */}
          {tab === 2 && (
             <ReportTable data={data.defaulters} type="Defaulter" />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// --- SUB-COMPONENT FOR TABLES ---
const ReportTable = ({ data, type }) => {
    // Calculate Net Flow: Income (+) and Expenses (-)
    const netFlow = data.reduce((sum, row) => {
        if (row.total_amount) return sum + parseFloat(row.total_amount); // Income
        if (row.amount) return sum - parseFloat(row.amount); // Expense
        return sum;
    }, 0);

    return (
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                    <TableRow>
                        <TableCell><b>Type</b></TableCell>
                        <TableCell><b>Ref/Date</b></TableCell>
                        <TableCell><b>Description/Resident</b></TableCell>
                        <TableCell align="right"><b>Amount (PKR)</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* SUMMARY ROW: Now shows the Net Profit/Loss of this view */}
                    <TableRow sx={{ bgcolor: netFlow >= 0 ? '#f0fdf4' : '#fef2f2', borderBottom: '2px solid #cbd5e1' }}>
                        <TableCell colSpan={3}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {netFlow >= 0 ? "NET SURPLUS (Income - Expenses)" : "NET DEFICIT (Loss)"}
                            </Typography>
                        </TableCell>
                        <TableCell align="right">
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: netFlow >= 0 ? '#166534' : '#991b1b' }}>
                                Rs. {netFlow.toLocaleString()}
                            </Typography>
                        </TableCell>
                    </TableRow>

                    {data.map((row, i) => {
                        const isIncome = !!row.total_amount;
                        return (
                            <TableRow key={i} sx={{ bgcolor: isIncome ? 'inherit' : '#fffafb' }}>
                                <TableCell>
                                    <Typography variant="caption" sx={{ 
                                        px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold',
                                        bgcolor: isIncome ? '#dcfce7' : '#fee2e2',
                                        color: isIncome ? '#166534' : '#991b1b'
                                    }}>
                                        {isIncome ? 'INCOME' : 'EXPENSE'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {isIncome ? row.billing_month : new Date(row.expense_date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {isIncome ? `House ${row.house_no} - ${row.resident_name}` : row.description}
                                </TableCell>
                                <TableCell align="right" sx={{ 
                                    fontWeight: '500', 
                                    color: isIncome ? '#166534' : '#991b1b' 
                                }}>
                                    {isIncome ? `+${parseFloat(row.total_amount).toLocaleString()}` : `-${parseFloat(row.amount).toLocaleString()}`}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default Reports;