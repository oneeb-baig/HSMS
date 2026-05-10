import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Button, Stack, Chip, 
  Divider, List, ListItem, ListItemText, ListItemIcon,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { 
  Lock, LockOpen, History, SecurityUpdateGood, 
  VerifiedUser, Replay 
} from '@mui/icons-material';
import axios from 'axios';

const GateAndPatrolling = () => {
  const userRole = localStorage.getItem('userRole');
  // 1. State Management
  const [gates, setGates] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');

  // 2. Fetching Functions
  const fetchGates = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/gates');
      setGates(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRoutes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/patrol/routes');
      setRoutes(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff');
      setStaffList(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchGates();
    fetchRoutes();
    fetchStaff();
  }, []);

  // 3. Action Handlers
  const toggleGate = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/gates/toggle/${id}`);
      const gateName = gates.find(g => g.gate_id === id)?.gate_name;
      const newStatus = currentStatus === 'Locked' ? 'Open' : 'Locked';
      
      setActivityLog(prev => [{
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        msg: `${gateName} - Switched to ${newStatus}`
      }, ...prev.slice(0, 4)]);
      fetchGates();
    } catch (err) { alert("Gate action failed"); }
  };

  const handleOpenAssignModal = (routeId) => {
    setSelectedRoute(routeId);
    setOpenModal(true);
  };

  const handleAssignGuard = async () => {
    try {
      await axios.put('http://localhost:5000/api/patrol/assign', {
        routeId: selectedRoute,
        staffId: selectedStaff
      });
      setOpenModal(false);
      setSelectedStaff('');
      fetchRoutes();
    } catch (err) { alert("Assignment failed"); }
  };


const handleUnassign = async (routeId) => {
  try {
    await axios.put(`http://localhost:5000/api/patrol/unassign/${routeId}`);
    fetchRoutes(); // Refresh the table
  } catch (err) {
    alert("Could not unassign guard");
  }
};

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      {/* SECTION 1: GATES */}
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>Gate Access Control</Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {gates.map((gate) => (
              <Grid item xs={12} sm={4} key={gate.gate_id}>
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, borderTop: `6px solid ${gate.current_status === 'Open' ? '#10b981' : '#ef4444'}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{gate.gate_name}</Typography>
                  <Chip label={gate.current_status} color={gate.current_status === 'Open' ? 'success' : 'error'} size="small" sx={{ mb: 2 }} />
                  <Box sx={{ my: 2 }}>
                    {gate.current_status === 'Open' ? <LockOpen sx={{ fontSize: 50, color: '#10b981' }} /> : <Lock sx={{ fontSize: 50, color: '#ef4444' }} />}
                  </Box>
                  <Button variant="contained" fullWidth size="small" color={gate.current_status === 'Open' ? 'error' : 'success'} onClick={() => toggleGate(gate.gate_id, gate.current_status)}>
                    {gate.current_status === 'Open' ? 'Close Barrier' : 'Open Barrier'}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}><History sx={{ mr: 1 }} /> Live Activity</Typography>
            <Divider />
            <List>
              {activityLog.map((log) => (
                <ListItem key={log.id} disableGutters><ListItemText primary={log.msg} secondary={log.time} /></ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 5 }} />

      {/* SECTION 2: PATROLLING ROUTES */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Security Patrol Routes</Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell><b>Route</b></TableCell>
                <TableCell><b>Start Point</b></TableCell>
                <TableCell><b>End Point</b></TableCell>
                <TableCell><b>Assigned Guard</b></TableCell>
                {userRole === 'admin' &&(<>
<TableCell align="center"><b>Action</b></TableCell>
</>
  )}
                
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.route_id}>
                  <TableCell>{route.route_name}</TableCell>
                  <TableCell>{route.start_point}</TableCell>
                  <TableCell>{route.end_point}</TableCell>
                 <TableCell>
  <Chip 
    label={route.guard_name || 'Vacant'} 
    color={route.guard_name ? 'success' : 'default'} // Green if assigned, grey if vacant
    variant={route.guard_name ? 'filled' : 'outlined'}
    size="small" 
  />
</TableCell>
                  {userRole === 'admin' &&(<>
                  <TableCell align="center">
  {route.guard_name ? (
    // If a guard is assigned, show the Unassign button
    <Button 
      variant="outlined" 
      size="small" 
      color="error" 
      onClick={() => handleUnassign(route.route_id)}
      sx={{ textTransform: 'none' }}
    >
      Unassign
    </Button>
  ) : (
    // If no guard is assigned, show the Assign button
    <Button 
      variant="contained" 
      size="small" 
      color="primary" 
      onClick={() => handleOpenAssignModal(route.route_id)}
      sx={{ textTransform: 'none' }}
    >
      Assign
    </Button>
  )}
</TableCell>
</>
  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ASSIGNMENT MODAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Assign Guard to Route</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Select Staff</InputLabel>
            <Select 
  value={selectedStaff} 
  label="Select Staff" 
  onChange={(e) => setSelectedStaff(e.target.value)}
>
  {/* Filter the list to show only guards */}
  {staffList
    .filter(staff => staff.role === "Guard") 
    .map((staff) => (
      <MenuItem key={staff.staff_id} value={staff.staff_id}>
        {staff.full_name} ({staff.role})
      </MenuItem>
    ))
  }
  {/* Show a message if no guards are registered */}
  {staffList.filter(staff => staff.role === "Guard").length === 0 && (
    <MenuItem disabled>No Guards available. Register one in Staff Management.</MenuItem>
  )}
</Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleAssignGuard} variant="contained">Confirm Assignment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GateAndPatrolling;