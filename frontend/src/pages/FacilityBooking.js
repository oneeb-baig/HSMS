import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, TextField, Stack, DialogActions, Divider } from '@mui/material';
import { EventAvailable, Pool, SportsSoccer } from '@mui/icons-material';
import axios from 'axios';

const FacilityBooking = () => {
  const [facilities, setFacilities] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  
  // Use fullName from localStorage for convenience
  const [bookingData, setBookingData] = useState({
    resident_name: localStorage.getItem('fullName') || '',
    booking_date: '',
    start_time: '',
    end_time: ''
  });

  const [allBookings, setAllBookings] = useState([]);

  // Helper: Convert 24h (HH:mm:ss) to 12h (hh:mm AM/PM)
  const format12Hour = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  // Helper: Format Date to DD/MM/YYYY
  const formatDateDMY = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // en-GB uses dd/mm/yyyy
  };

  const fetchFacilities = async () => {
    const res = await axios.get('http://localhost:5000/api/facilities');
    setFacilities(res.data);
  };

  const fetchAllBookings = async () => {
    const res = await axios.get('http://localhost:5000/api/facilities/bookings/all');
    setAllBookings(res.data);
  };

  useEffect(() => { 
    fetchFacilities(); 
    fetchAllBookings(); 
  }, []);

  const handleBookClick = (facility) => {
    setSelectedFacility(facility);
    setOpen(true);
  };

  const handleConfirmBooking = async () => {
    // Basic Frontend Validation
    if (bookingData.start_time >= bookingData.end_time) {
      return alert("End time must be after start time");
    }

    try {
      await axios.post('http://localhost:5000/api/facilities/book', {
        ...bookingData,
        facility_id: selectedFacility.facility_id
      });
      alert("Booking Confirmed!");
      setOpen(false);
      fetchAllBookings(); // Refresh list to show new booking
    } catch (err) {
      // Backend should return "Slot already booked" error for all facility types
      alert(err.response?.data?.error || "Booking failed");
    }
  };

  const getIcon = (name) => {
    if (name.includes('Pool')) return <Pool sx={{ fontSize: 40, color: '#0ea5e9' }} />;
    if (name.includes('Hall')) return <EventAvailable sx={{ fontSize: 40, color: '#8b5cf6' }} />;
    return <SportsSoccer sx={{ fontSize: 40, color: '#10b981' }} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Facility Booking</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        Reserve common areas for your private events or sports activities.
      </Typography>

      <Grid container spacing={3}>
        {facilities.map((f) => (
          <Grid item xs={12} md={4} key={f.facility_id}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {getIcon(f.name)}
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>{f.name}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>{f.description}</Typography>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="textSecondary">Upcoming Schedule</Typography>
              </Divider>

              <Box sx={{ textAlign: 'left', mb: 2, maxHeight: 150, overflowY: 'auto', flexGrow: 1 }}>
                {allBookings.filter(b => b.facility_id === f.facility_id).length > 0 ? (
                  allBookings
                    .filter(b => b.facility_id === f.facility_id)
                    .map((booking) => (
                      <Typography key={booking.booking_id} variant="caption" display="block" sx={{ bgcolor: '#f1f5f9', p: 1, mb: 0.5, borderRadius: 1 }}>
                        📅 <b>{formatDateDMY(booking.booking_date)}</b><br/>
                        🕒 {format12Hour(booking.start_time)} - {format12Hour(booking.end_time)}
                      </Typography>
                    ))
                ) : (
                  <Typography variant="caption" color="textSecondary">No bookings yet. Slot is open!</Typography>
                )}
              </Box>

              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => handleBookClick(f)}
                sx={{ mt: 2 }}
              >
                Book a Slot
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* BOOKING MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Book {selectedFacility?.name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Your Name" fullWidth value={bookingData.resident_name} readOnly disabled />
            <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} fullWidth onChange={(e) => setBookingData({...bookingData, booking_date: e.target.value})} />
            <Stack direction="row" spacing={2}>
              <TextField type="time" label="From" InputLabelProps={{ shrink: true }} fullWidth onChange={(e) => setBookingData({...bookingData, start_time: e.target.value})} />
              <TextField type="time" label="To" InputLabelProps={{ shrink: true }} fullWidth onChange={(e) => setBookingData({...bookingData, end_time: e.target.value})} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmBooking}>Confirm Booking</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityBooking;