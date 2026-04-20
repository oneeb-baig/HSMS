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
    if (window.confirm("TRIGGER EMERGENCY SOS? This will alert security immediately.")) {
      try {
        // 1. Send the private alert to the backend (existing logic)
        await axios.post('http://localhost:5000/api/sos', { 
          house_no: 'H-101', 
          resident_name: 'Oneeb' 
        });

        // 2. Automatically create a PUBLIC Notice with category 'SOS'
        await axios.post('http://localhost:5000/api/notices', {
          title: "🚨 EMERGENCY SOS ALERT",
          content: `An emergency alert has been triggered from House H-101 (Oneeb). Security and medical teams have been notified.`,
          category: "SOS" // This sets the category you wanted
        });

        alert("EMERGENCY ALERT SENT AND POSTED TO NOTICE BOARD!");
        
        // 3. Refresh both lists to show the new complaint and the new notice
        fetchComplaints();
        fetchNotices(); 
      } catch (err) {
        console.error("SOS Trigger failed:", err);
        alert("Critical failure sending SOS. Please contact security manually.");
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
    try {
      await axios.post('http://localhost:5000/api/complaints', {
        ...newComp,
        house_no: 'H-101',
        resident_name: 'Oneeb'
      });
      setOpenComp(false); // Close the popup
      setNewComp({ subject: '', description: '' });
      fetchComplaints(); // Refresh list
    } catch (err) { console.error(err); }
  };

  // Filter complaints to EXCLUDE SOS for the "Recent Complaints" section
  const regularComplaints = complaints.filter(c => c.subject !== 'EMERGENCY SOS');

const fetchActivePolls = async () => {
  const res = await axios.get('http://localhost:5000/api/polls/active');
  setActivePolls(res.data || []);
};

const handleCreatePoll = async () => {
  const options = { [newPoll.option1]: 0, [newPoll.option2]: 0 };
  await axios.post('http://localhost:5000/api/polls', { 
    question: newPoll.question, 
    options: options 
  });
  setOpenPoll(false);
  setNewPoll({ question: '', option1: '', option2: '' });
  fetchActivePolls();
};

const handleVote = async () => {
  if (!selectedVote) return alert("Select an option!");
  await axios.post('http://localhost:5000/api/polls/vote', { 
    pollId: activePolls.id, 
    selectedOption: selectedVote 
  });
  alert("Vote recorded!");
  fetchActivePolls();
};

const handleDeletePoll = async (id) => {
  if (window.confirm("Delete this poll?")) {
    await axios.delete(`http://localhost:5000/api/polls/${id}`);
    fetchActivePolls();
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
        
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>{notice.content}</Typography>
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
            onClick={() => handleVote(poll.id)}
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