import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Button, IconButton, Tooltip,
  Stack, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Payment, ReceiptLong, Search } from '@mui/icons-material';
import axios from 'axios';




const Billing = () => {

  const monthList = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const yearOptions = ["2025", "2026"];
const fullMonthOptions = yearOptions.flatMap(year => 
  monthList.map(month => `${month} ${year}`)
);

  const getCurrentMonthString = () => {
    const date = new Date();
    return `${monthList[date.getMonth()]} ${date.getFullYear()}`;
  };

  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  
  const [genOpen, setGenOpen] = useState(false);
  const [billingMonth, setBillingMonth] = useState(getCurrentMonthString());
  const [dueDate, setDueDate] = useState('');
const [customAmount, setCustomAmount] = useState('');
  const fetchBills = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bills');
      setBills(res.data);
    } catch (err) {
      console.error("Error fetching bills", err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

 const handleGenerateBills = async () => {
  if (!dueDate) return alert("Please select a due date");
  try {
    await axios.post('http://localhost:5000/api/generate-bills', {
      billingMonth,
      dueDate,
      amount: customAmount 
    });
    alert(`Charges applied for ${billingMonth}!`);
    setGenOpen(false);
    fetchBills(); 
  } catch (err) {
    alert("Automation failed.");
  }
};

  const filteredBills = bills.filter(bill => {
    const billMonth = (bill.billing_month || "").trim().toLowerCase();
    const filterMonth = monthFilter.trim().toLowerCase();
    
    const matchesMonth = monthFilter === '' || billMonth === filterMonth;
    
    // 2. Handle Search Filter
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      bill.house_no.toLowerCase().includes(search) || 
      (bill.resident_name && bill.resident_name.toLowerCase().includes(search));
    
    return matchesMonth && matchesSearch;
  });


const [payOpen, setPayOpen] = useState(false);
const [selectedBill, setSelectedBill] = useState(null);
const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });

const handleConfirmPayment = async () => {
  
  const billId = selectedBill?.bill_id || selectedBill?.id;

  if (!billId) {
    console.error("No Bill ID found!", selectedBill);
    return alert("Error: Payment could not find the Bill ID.");
  }

  try {
    await axios.put(`http://localhost:5000/api/bills/pay/${billId}`);
    alert("Payment Successful!");
    setPayOpen(false);
    fetchBills(); 
  } catch (err) {
    console.error("Payment failed", err);
    alert("Payment failed. Check terminal.");
  }
};

const formatCardNumber = (value) => {
  return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value) => {
  return value.replace(/\W/gi, '').replace(/(.{2})/g, '$1/').substring(0, 5);
};


  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#334155' }}>
          Financial Management
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => setGenOpen(true)}
          startIcon={<ReceiptLong />}
        >
          Generate Monthly Maintenance Bill
        </Button>
      </Stack>

       {/* SEARCH AND FILTER BAR  */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField 
          label="Search House / Name" 
          size="small" 
          sx={{ width: 300 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ endAdornment: <Search /> }}
        />
        <TextField
          select
          label="Filter by Month"
          size="small"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value=""><em>All Months</em></MenuItem>
          {fullMonthOptions.map((m) => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell align="center"><b>Resident Name</b></TableCell>
              <TableCell align="center"><b>House No</b></TableCell>
              <TableCell align="center"><b>Month</b></TableCell>
              <TableCell align="center"><b>Base Charges</b></TableCell>
              <TableCell align="center"><b>Maintenance (PKR)</b></TableCell>
              <TableCell align="center"><b>Total Amount</b></TableCell>
              <TableCell align="center"><b>Status</b></TableCell>
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.map((bill) => {
 
  const totalAmount = parseFloat(bill.base_charges || 0) + parseFloat(bill.maintenance_charges || 0);

  return (
    <TableRow key={bill.id || bill.house_no}>
      <TableCell align="center">{bill.resident_name}</TableCell>
      <TableCell align="center">{bill.house_no}</TableCell>
      <TableCell align="center">{bill.billing_month || 'N/A'}</TableCell>
      <TableCell align="center">{bill.base_charges} PKR</TableCell>
      <TableCell align="center">{bill.maintenance_charges} PKR</TableCell>
      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
        {totalAmount} PKR
      </TableCell>
      <TableCell align="center">
        <Chip 
          label={bill.status === 'Paid' ? 'Paid' : 'Unpaid'} 
          color={bill.status === 'Paid' ? 'success' : 'error'} 
          size="small" 
        />
      </TableCell>
      <TableCell align="center">
        {bill.status !== 'Paid' && (
          <Button 
  variant="outlined" 
  size="small" 
  startIcon={<Payment />}
  onClick={() => {
    setSelectedBill(bill);
    setPayOpen(true);
  }}
>
  Pay Now
</Button>
        )}
      </TableCell>
    </TableRow>
  );
})}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generate Bills Pop up */}
      <Dialog open={genOpen} onClose={() => setGenOpen(false)}>
  <DialogTitle>Apply Monthly Maintenance Charges</DialogTitle>
  <DialogContent>
    <Stack spacing={3} sx={{ mt: 1 }}>
      <TextField 
        label="Amount to Charge (PKR)" 
        type="number" 
        fullWidth 
        value={customAmount} 
        onChange={(e) => setCustomAmount(e.target.value)} 
      />
      <TextField select label="Select Month" fullWidth value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)}>
        {fullMonthOptions.map(m => (
          <MenuItem key={m} value={m}>{m}</MenuItem>
        ))}
      </TextField>
      <TextField label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setGenOpen(false)}>Cancel</Button>
    <Button onClick={handleGenerateBills} variant="contained" color="secondary">Apply Charges & Notify</Button>
  </DialogActions>
</Dialog>


{/* Payment Pop up */}
<Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' }}>
    Secure Payment Gateway
  </DialogTitle>
  <DialogContent sx={{ pt: 3 }}>
    <Typography variant="subtitle1" gutterBottom><b>Card Payment</b></Typography>
    <Stack spacing={2}>
      <TextField 
  label="Card Number" 
  placeholder="1234 5678 9101 1121"
  fullWidth 
  value={cardData.number}
  inputProps={{ maxLength: 19 }}
  onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
/>
      <Stack direction="row" spacing={2}>
  <TextField 
    label="Expiry" 
    placeholder="MM/YY" 
    value={cardData.expiry}
    sx={{ flex: 1 }} 
    inputProps={{ maxLength: 5 }}
    onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
  />
  <TextField 
    label="CVC" 
    placeholder="123" 
    sx={{ flex: 1 }} 
    inputProps={{ maxLength: 3 }}
    onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')})}
  />
</Stack>
    </Stack>

    <Box sx={{ mt: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
      <Typography variant="subtitle2" color="primary" gutterBottom><b>Mobile Wallets & Bank Transfer</b></Typography>
      
      <Typography variant="body2"><b>JazzCash/EasyPaisa:</b> 0300-1234567 (Oneeb Baig)</Typography>
      <Typography variant="body2"><b>Bank:</b> Habib Bank Limited (HBL)</Typography>
      <Typography variant="body2"><b>Account No:</b> 1234567890123</Typography>
      <Typography variant="body2" sx={{ mt: 1, color: '#64748b', fontStyle: 'italic' }}>
        *Note: If using JazzCash or Bank, please send a screenshot to Admin with your House No as reference.
      </Typography>
    </Box>
  </DialogContent>
  <DialogActions sx={{ p: 3 }}>
    <Button onClick={() => setPayOpen(false)}>Cancel</Button>
   <Button 
  variant="contained" 
  color="success" 
  disabled={cardData.number.length < 19 || cardData.expiry.length < 5 || cardData.cvc.length < 3}
  onClick={() => handleConfirmPayment(selectedBill.id)}
  sx={{ bgcolor: '#334155' }}
>
  Confirm Payment (Rs. {selectedBill?.maintenance_charges})
</Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default Billing;