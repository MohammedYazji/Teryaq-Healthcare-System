import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoctorLayout from './DoctorPanelLayout';
import axiosInstance from '../../api/axios';

const brandColor = '#0d9488';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function DoctorAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/availability/mySlots');
      setSlots(res.data?.data?.slots || res.data?.data || []);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlots = async () => {
    try {
      setSaving(true);
      await axiosInstance.patch('/availability/setBulk', {
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        durationMinutes: Number(form.slotDuration),
      });
      setSnackbar({ open: true, message: 'Slots created successfully', severity: 'success' });
      setOpenDialog(false);
      fetchSlots();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to create slots', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await axiosInstance.delete(`/availability/slots/${slotId}`);
      setSnackbar({ open: true, message: 'Slot deleted', severity: 'success' });
      fetchSlots();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to delete slot', severity: 'error' });
    }
  };

  const groupedSlots = {};
  DAYS.forEach(day => {
    const daySlots = slots.filter(s => s.dayOfWeek?.toLowerCase() === day);
    if (daySlots.length > 0) groupedSlots[day] = daySlots;
  });

  return (
    <DoctorLayout>
        <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#0F172A' }}>
              Availability Schedule
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 15 }}>
              Set and manage your weekly availability.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}
            sx={{
              borderRadius: 3, fontWeight: 700, px: 2.5,
              background: brandColor, color: 'white',
            }}>
              Add Slots
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: brandColor }} />
          </Box>
        ) : Object.keys(groupedSlots).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, background: 'white', borderRadius: 4, border: '1px solid #F1F5F9' }}>
            <AccessTimeIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ color: '#94A3B8', fontSize: 15, mb: 2 }}>No availability slots set yet.</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}
              sx={{ borderRadius: 3, background: brandColor, color: 'white' }}>
              Create Your First Slots
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {Object.entries(groupedSlots).map(([day, daySlots]) => (
              <Grid item xs={12} md={6} key={day}>
                <Card sx={{ borderRadius: 3, border: '1px solid #F1F5F9' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0F172A', textTransform: 'capitalize', mb: 2 }}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                      <Chip label={`${daySlots.length} slot${daySlots.length !== 1 ? 's' : ''}`} size="small"
                        sx={{ ml: 1, background: '#F0FDF4', color: '#15803D', fontWeight: 600, fontSize: 11 }} />
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {daySlots.map(slot => (
                        <Box key={slot._id} sx={{
                          display: 'flex', alignItems: 'center', gap: 0.5,
                          px: 1.5, py: 0.8, borderRadius: 2,
                          background: slot.isAvailable ? '#F0FDF4' : '#FEF2F2',
                          border: '1px solid',
                          borderColor: slot.isAvailable ? '#BBF7D0' : '#FECACA',
                        }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: slot.isAvailable ? '#15803D' : '#DC2626' }}>
                            {slot.startTime} - {slot.endTime}
                          </Typography>
                          {!slot.isAvailable && (
                            <Chip label='Booked' size="small"
                              sx={{ height: 18, fontSize: 10, fontWeight: 700, background: '#FEF2F2', color: '#DC2626' }} />
                          )}
                          {slot.isAvailable && (
                            <IconButton size="small" onClick={() => handleDeleteSlot(slot._id)}
                              sx={{ color: '#94A3B8', p: 0.3 }}>
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Availability Slots</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={form.dayOfWeek}
                label="Day of Week"
                onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                sx={{ borderRadius: 3 }}
              >
                  {DAYS.map(d => (
                  <MenuItem key={d} value={d} sx={{ textTransform: 'capitalize' }}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth label="Start Time" type="time"
              value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <TextField fullWidth label="End Time" type="time"
              value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <TextField fullWidth label="Slot Duration (minutes)" type="number"
              value={form.slotDuration}
              onChange={e => setForm(f => ({ ...f, slotDuration: e.target.value }))}
              slotProps={{ htmlInput: { min: 15, max: 120, step: 15 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2, color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={handleCreateSlots}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700, background: brandColor, color: 'white' }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Create Slots'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DoctorLayout>
  );
}
