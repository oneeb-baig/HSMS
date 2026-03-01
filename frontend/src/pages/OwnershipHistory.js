import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, Box, Chip 
} from '@mui/material';
import axios from 'axios';

const OwnershipHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ownership-history');
        setHistory(response.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#334155' }}>
        Property Transfer & Sales History
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>House No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Previous Owner</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>New Owner</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Transfer Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Transfer Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length > 0 ? (
              history.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell sx={{ fontWeight: '500' }}>{record.house_no}</TableCell>
                  <TableCell>{record.previous_owner}</TableCell>
                  <TableCell>{record.new_owner}</TableCell>
                  <TableCell>
                    {new Date(record.transfer_date).toLocaleDateString('en-PK', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={record.transfer_type || 'Sale'} 
                      size="small" 
                      sx={{ 
                        bgcolor: '#fef3c7', 
                        color: '#92400e', 
                        fontWeight: 'bold',
                        fontSize: '0.7rem' 
                      }} 
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No ownership transfers recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OwnershipHistory;