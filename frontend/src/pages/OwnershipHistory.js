import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';
import axios from 'axios';

const OwnershipHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ownership-history');
        setHistory(response.data);
      } catch (error) {
        console.error("Error fetching history", error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#334155' }}>
        Property Transfer & Sales History
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>House No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Previous Owner</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>New Owner</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Transfer Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.house_no}</TableCell>
                <TableCell>{record.previous_owner}</TableCell>
                <TableCell>{record.new_owner}</TableCell>
                <TableCell>{new Date(record.transfer_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip label={record.transfer_type} size="small" color="secondary" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OwnershipHistory;
