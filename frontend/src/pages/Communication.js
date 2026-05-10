import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, TextField, MenuItem, 
  Card, CardContent, Chip, Stack, Dialog, DialogTitle, DialogContent, 
  DialogActions, Divider, IconButton, Radio, RadioGroup, FormControlLabel 
} from '@mui/material';
import { Campaign, Warning, Add, Poll, RateReview, AssignmentLate } from '@mui/icons-material';
import axios from 'axios';
import { DeleteForever, Event, AccessTime } from '@mui/icons-material';

const pulseKeyframes = {
  '@keyframes pulse': {
    '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.7)' },
    '70%': { boxShadow: '0 0 0 10px rgba(211, 47, 47, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' },
  },
};

const Communication = () => {
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [openNotice, setOpenNotice] = useState(false);
  const [openComp, setOpenComp] = useState(false);
 const [openPoll, setOpenPoll] = useState(false);
const [newPoll, setNewPoll] = useState({ 
  question: '', 
  option1: '', 
  option2: '' 
});
const [selectedVote, setSelectedVote] = useState('');
const [activePolls, setActivePolls] = useState([]);
  
const [newNotice, setNewNotice] = useState({ 
  title: '', content: '', category: 'Update', scheduled_date: '', scheduled_time: '' 
})
  const [newComp, setNewComp] = useState({ subject: '', description: '' });
  
  const userRole = localStorage.getItem('userRole') || 'admin';

  useEffect(() => { 
    fetchNotices(); 
    fetchComplaints();
    fetchActivePolls();
  }, []);

  const fetchNotices = async () => {
    const res = await axios.get('http://localhost:5000/api/notices');
    setNotices(res.data);
  };

  const fetchComplaints = async () => {
    const res = await axios.get('http://localhost:5000/api/complaints');
    setComplaints(res.data);
  };

  const handleSOS = async () => {
  // 1. Get real data from localStorage
  const residentName = localStorage.getItem('fullName');
  const houseNo = localStorage.getItem('houseNo');
  const userRole = localStorage.getItem('userRole');

  // Check if data is missing BEFORE proceeding
  if (!residentName || !houseNo) {
    return alert("Error: User details not found. Please log out and log back in.");
  }

  if (window.confirm("TRIGGER EMERGENCY SOS? This will alert security immediately.")) {
    setLoading(true); // Optional: if you have a loading state
    try {
      // 2. Send the private alert with the CORRECT variables
      await axios.post('http://localhost:5000/api/sos', { 
        house_no: houseNo, 
        resident_name: residentName 
      });

      // 3. Create the PUBLIC Notice
      const sosContent = userRole === 'admin' 
        ? `SYSTEM ALERT: An emergency broadcast has been initiated by the Management Office.`
        : `An emergency alert has been triggered from House ${houseNo} (${residentName}). Security and medical teams have been notified.`;

      await axios.post('http://localhost:5000/api/notices', {
        title: userRole === 'admin' ? "⚠️ MANAGEMENT EMERGENCY ALERT" : "🚨 RESIDENT EMERGENCY SOS",
        content: sosContent,
        category: "SOS" 
      });

      alert("EMERGENCY ALERT SENT AND POSTED TO NOTICE BOARD!");
      
      // Refresh lists
      if (typeof fetchComplaints === 'function') fetchComplaints();
      if (typeof fetchNotices === 'function') fetchNotices(); 

    } catch (err) {
      console.error("SOS Trigger failed:", err);
      alert("Critical failure sending SOS. Please contact security manually.");
    } finally {
      setLoading(false);
    }
  }
};  

const handlePostNotice = async () => {
    if(!newNotice.title || !newNotice.content) return alert("Please fill all fields");
    try {
      await axios.post('http://localhost:5000/api/notices', newNotice);
      setOpenNotice(false); 
      setNewNotice({ title: '', content: '', category: 'Update' });
      fetchNotices(); 
    } catch (err) { console.error(err); }
  };

  const handleDeleteNotice = async (id) => {
  if (window.confirm("Delete this notice permanently?")) {
    await axios.delete(`http://localhost:5000/api/notices/${id}`);
    fetchNotices(); 
  }
};

 const handleSubmitComplaint = async () => {
  if(!newComp.subject || !newComp.description) return alert("Please fill all fields");
  
  // Get real data from localStorage
  const residentName = localStorage.getItem('fullName');
  const houseNo = localStorage.getItem('houseNo');

  try {
    const response = await axios.post('http://localhost:5000/api/complaints', {
      ...newComp,
      house_no: houseNo, // Dynamic value
      resident_name: residentName // Dynamic value
    });
    
    setOpenComp(false); 
    setNewComp({ subject: '', description: '' });
    
    // Add the new complaint to state immediately so the UI updates
    setComplaints([response.data, ...complaints]); 
  } catch (err) { 
    console.error(err); 
    alert("Failed to submit complaint.");
  }
};

  // Filter complaints to EXCLUDE SOS for the "Recent Complaints" section
  const regularComplaints = complaints.filter(c => c.subject !== 'EMERGENCY SOS');

const fetchActivePolls = async () => {
  const res = await axios.get('http://localhost:5000/api/polls/active');
  setActivePolls(res.data || []);
};

const handleCreatePoll = async () => {
  // Simple validation
  if (!newPoll.question || !newPoll.option1 || !newPoll.option2) {
    return alert("Please fill the question and both options.");
  }

    // Format the options into an object with 0 initial votes
    const options = { 
      [newPoll.option1]: 0, 
      [newPoll.option2]: 0 
    };

    try {
      // Ensure the URL matches your backend port (5000)
      await axios.post('http://localhost:5000/api/polls', { 
        question: newPoll.question, 
        options: options 
      });

      setOpenPoll(false); // Close dialog
      setNewPoll({ question: '', option1: '', option2: '' }); // Reset form
      fetchActivePolls(); // Refresh the list on the dashboard
      alert("Poll created successfully!");
    } catch (err) {
      console.error("Poll Creation Error:", err);
      alert("Failed to create poll. Check if the backend route is added.");
    }
  };

const handleVote = async (pollId) => {
  if (!selectedVote || selectedVote.id !== pollId) return alert("Select an option!");
  
  // Retrieve the name stored during login
  const residentName = localStorage.getItem('fullName'); 

  try {
    await axios.post('http://localhost:5000/api/polls/vote', { 
      pollId: pollId, 
      selectedOption: selectedVote.val,
      residentName: residentName 
    });
    alert("Vote updated successfully!");
    fetchActivePolls(); // Refresh counts from the server
  } catch (err) {
    console.error(err);
  }
};

const handleDeletePoll = async (id) => {
  if (window.confirm("Delete this poll?")) {
    await axios.delete(`http://localhost:5000/api/polls/${id}`);
    fetchActivePolls();
  }
};
  
// Complains

const handleResolve = async (id) => {
  try {
    await axios.put(`http://localhost:5000/api/complaints/${id}/resolve`);
    // Update the main complaints list state
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c)
    );
  } catch (err) {
    console.error("Error resolving complaint", err);
  }
};

const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this complaint?")) {
    try {
      await axios.delete(`http://localhost:5000/api/complaints/${id}`);
      // Remove from the main complaints list state
      setComplaints(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting complaint", err);
    }
  }
};
  
  return (
    <Box sx={{ p: 2, ...pulseKeyframes }}>
    
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Communication Hub</Typography>
          <Typography variant="body2" color="textSecondary">Manage announcements, complaints, and community voting</Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          {userRole === 'admin' && (
            <>
              <Button variant="outlined" startIcon={<Add />} onClick={() => setOpenNotice(true)}>Notice</Button>
              <Button variant="outlined" startIcon={<Poll />} onClick={() => setOpenPoll(true)}>Poll</Button>
            </>
          )}
          <Button variant="outlined" startIcon={<RateReview />} onClick={() => setOpenComp(true)}>Complaint</Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<Warning />} 
            onClick={handleSOS}
            sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite', borderRadius: 2 }}
          >
            SOS EMERGENCY
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
      
        {/*  NOTICE BOARD */}
<Grid item xs={12} md={7.5}>
  <Paper sx={{ p: 3, borderRadius: 3, minHeight: '70vh', bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
      <Campaign color="primary" />
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notice Board</Typography>
    </Stack>
    
    <Stack spacing={2.5}>
      {notices.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography color="textSecondary">No notices found. Try adding one!</Typography>
        </Box>
      ) : (
        notices.map((notice) => (
          <Card key={notice.id} sx={{ mb: 2, borderRadius: 3, border: '1px solid #e2e8f0' }}>
  <CardContent>
    <Stack direction="row" justifyContent="space-between">
      <Box>
        <Chip label={notice.category} size="small"color={notice.category === 'SOS' ? 'error' : 'primary'} sx={{ 
    mb: 1, 
    fontWeight: notice.category === 'SOS' ? 'bold' : 'normal',
    // Add a slight pulse effect if it's an SOS notice
    animation: notice.category === 'SOS' ? 'pulse 2s infinite' : 'none'
  }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{notice.title}</Typography>
        
        {(notice.category === 'Meeting' || notice.category === 'Event') && notice.scheduled_date && (
          <Stack direction="row" spacing={2} sx={{ mt: 1, color: '#1e40af', bgcolor: '#eff6ff', p: 1, borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption"><b>Date:</b> {new Date(notice.scheduled_date).toLocaleDateString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption"><b>Time:</b> {notice.scheduled_time}</Typography>
            </Box>
          </Stack>
        )}
        
       <Typography 
  variant="body2" 
  color="textSecondary" 
  sx={{ 
    wordBreak: 'break-word', 
    overflowWrap: 'break-word', // Forces breaks in long strings
    whiteSpace: 'pre-wrap',     // Preserves formatting but wraps text
    width: '100%', 
    mt: 1.5,
    display: 'block'            // Changed from inline-block to block
  }}
>
  {notice.content}
</Typography>
      </Box>

      {userRole === 'admin' && (
        <Box sx={{ alignSelf: 'flex-start', ml: 1 }}> 
    <IconButton 
      color="error" 
      onClick={() => handleDeleteNotice(notice.id)}
      sx={{ 
        bgcolor: '#fee2e2',
        '&:hover': { bgcolor: '#fecaca' }, 
        borderRadius: 2 
      }}
    >
      <DeleteForever fontSize="small" />
    </IconButton>
  </Box>
      )}
    </Stack>
  </CardContent>
</Card>
        ))
      )}
    </Stack>
  </Paper>
</Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={4.5}>
          <Stack spacing={3}>
            {/* POLLING SECTION */}
          
<Box sx={{ mb: 4 }}>
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
    <Poll color="secondary" />
    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Active Polls</Typography>
  </Stack>

  <Grid container spacing={2}>
    {activePolls.map((poll) => (
      <Grid item xs={12} sm={6} key={poll.id}>
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', position: 'relative' }}>
          
          {userRole === 'admin' && (
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => handleDeletePoll(poll.id)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteForever fontSize="small" />
            </IconButton>
          )}

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', pr: 4 }}>
            {poll.question}
          </Typography>

          <RadioGroup 
            onChange={(e) => setSelectedVote({ id: poll.id, val: e.target.value })}
          >
            {Object.keys(poll.options).map((opt) => (
              <FormControlLabel 
                key={opt} 
                value={opt} 
                control={<Radio size="small" />} 
                label={`${opt} (${poll.options[opt]})`} 
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
              />
            ))}
          </RadioGroup>

          <Button 
  variant="contained" 
  size="small" 
  fullWidth 
  sx={{ mt: 1, bgcolor: '#334155', textTransform: 'none' }}
  onClick={() => handleVote(poll.id)} // Pass the ID here
>
  Cast Vote
</Button>
        </Paper>
      </Grid>
    ))}
    {activePolls.length === 0 && (
      <Typography variant="body2" sx={{ ml: 2 }} color="textSecondary">No active polls.</Typography>
    )}
  </Grid>
</Box>

            {/* COMPLAINTS SECTION */}
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <AssignmentLate sx={{ color: '#f59e0b' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Complaints</Typography>
              </Stack>
              <Stack spacing={2}>
                {regularComplaints.length > 0 ? regularComplaints.slice(0, 4).map((comp) => (
                  <Box key={comp.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', borderLeft: '4px solid #3b82f6' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{comp.subject}</Typography>
                    <Typography variant="caption" color="textSecondary" display="block">{comp.description}</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                      <Chip label={comp.status} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                      <Typography variant="caption" color="textSecondary">House: {comp.house_no}</Typography>
                    </Stack>
<Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {userRole === 'admin' && (
          <>
            {comp.status !== 'Resolved' && (
              <Button 
                size="small" 
                variant="contained" 
                color="success"
                onClick={() => handleResolve(comp.id)}
                sx={{ fontSize: '0.65rem', py: 0 }}
              >
                Resolve
              </Button>
            )}
            <Button 
              size="small" 
              variant="outlined" 
              color="error"
              onClick={() => handleDelete(comp.id)}
              sx={{ fontSize: '0.65rem', py: 0 }}
            >
              Delete
            </Button>
          </>
        )}
      </Stack>

                  </Box>
                )) : <Typography variant="caption">No regular complaints yet.</Typography>}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
      
      {/* Notice Dialog */}
      <Dialog open={openNotice} onClose={() => setOpenNotice(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Post New Notice</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
  <TextField label="Title" fullWidth value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} />
  <TextField label="Category" select fullWidth value={newNotice.category} onChange={(e) => setNewNotice({...newNotice, category: e.target.value})}>
    <MenuItem value="Update">General Update</MenuItem>
    <MenuItem value="Meeting">Meeting</MenuItem>
    <MenuItem value="Event">Society Event</MenuItem>
  </TextField>

  {(newNotice.category === 'Meeting' || newNotice.category === 'Event') && (
    <Stack direction="row" spacing={2}>
      <TextField label="Event Date" type="date" fullWidth InputLabelProps={{ shrink: true }} 
        value={newNotice.scheduled_date} onChange={(e) => setNewNotice({...newNotice, scheduled_date: e.target.value})} />
      <TextField label="Event Time" type="time" fullWidth InputLabelProps={{ shrink: true }} 
        value={newNotice.scheduled_time} onChange={(e) => setNewNotice({...newNotice, scheduled_time: e.target.value})} />
    </Stack>
  )}

  <TextField label="Content" multiline rows={4} fullWidth value={newNotice.content} onChange={(e) => setNewNotice({...newNotice, content: e.target.value})} />
</Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNotice(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePostNotice}>Publish</Button>
        </DialogActions>
      </Dialog>

      {/* Complaint Dialog */}
      <Dialog open={openComp} onClose={() => setOpenComp(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Submit Complaint / Suggestion</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
               label="Subject" 
               fullWidth 
               value={newComp.subject} 
               onChange={(e) => setNewComp({...newComp, subject: e.target.value})} 
            />
            <TextField 
               label="Detailed Description" 
               multiline 
               rows={4} 
               fullWidth 
               value={newComp.description} 
               onChange={(e) => setNewComp({...newComp, description: e.target.value})} 
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenComp(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmitComplaint}>Submit</Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openPoll} onClose={() => setOpenPoll(false)} fullWidth maxWidth="xs">
  <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Poll</DialogTitle>
  <DialogContent dividers>
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField label="Poll Question" fullWidth value={newPoll.question} 
        onChange={(e) => setNewPoll({...newPoll, question: e.target.value})} />
      <TextField label="Option 1" fullWidth value={newPoll.option1} 
        onChange={(e) => setNewPoll({...newPoll, option1: e.target.value})} />
      <TextField label="Option 2" fullWidth value={newPoll.option2} 
        onChange={(e) => setNewPoll({...newPoll, option2: e.target.value})} />
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenPoll(false)}>Cancel</Button>
    <Button variant="contained" color="secondary" onClick={handleCreatePoll}>Start Poll</Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default Communication;