import  { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Paper, Button, TextField, Alert, CircularProgress, Chip,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const nextDayDate = (dayName) => {
  const now = new Date();
  const days = dayNames.map((d) => d.toLowerCase());
  const target = days.indexOf(dayName.toLowerCase());
  if (target === -1) return null;
  const diff = (target + 7 - now.getDay()) % 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d.toISOString().split('T')[0];
};

const BookingPage = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctor = searchParams.get('doctor');

  const [doctor, setDoctor] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!preselectedDoctor) { setLoadingDoctor(false); return; }
    const fetchDoctor = async () => {
      try {
        const [docRes, slotRes] = await Promise.all([
          axios.get(`/doctors/${preselectedDoctor}`),
          axios.get(`/availability/doctor/${preselectedDoctor}`),
        ]);
        setDoctor(docRes.data.data?.doctor || docRes.data.doctor);
        setAllSlots(slotRes.data.data?.slots || []);
      } catch (err) {
        setError('Could not load doctor details');
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [isAuthenticated, navigate, preselectedDoctor]);

  const availableDays = useMemo(() => {
    const days = new Set();
    allSlots.forEach((s) => { if (s.dayOfWeek) days.add(s.dayOfWeek.toLowerCase()); });
    return dayNames.filter((d) => days.has(d.toLowerCase()));
  }, [allSlots]);

  const daySlots = useMemo(() => {
    if (!date) return [];
    const dayOfWeek = dayNames[new Date(date).getDay()].toLowerCase();
    return allSlots.filter((s) => s.dayOfWeek?.toLowerCase() === dayOfWeek && s.isAvailable && s.status === 'available');
  }, [allSlots, date]);

  const handleDayClick = (dayName) => {
    const d = nextDayDate(dayName);
    if (d) setDate(d);
    setSlotId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slotId) { setError('Please select a time slot'); return; }
    if (reason.trim().length < 5) { setError('Please provide a reason (min 5 characters)'); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const bookRes = await axios.post('/appointments/book', { slotId, reason, appointmentDate: date });
      const appointmentId = bookRes.data?.data?.appointment?._id;
      if (!appointmentId) {
        setError('Booking succeeded but no appointment ID returned');
        setSubmitting(false);
        return;
      }
      const payRes = await axios.post(`/payment/checkout-session/${appointmentId}`);
      const sessionUrl = payRes.data?.session_url;
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        navigate('/appointments');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const doctorName = doctor?.userId
    ? `Dr. ${doctor.userId.firstName || ''} ${doctor.userId.lastName || ''}`.trim()
    : 'Doctor';
  const doctorSpecialty = doctor?.specialization?.name || '';

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>Book Appointment</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {!preselectedDoctor ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please select a doctor first from the <Button size="small" onClick={() => navigate('/doctors')} sx={{ textTransform: 'none', fontWeight: 600 }}>Find Doctors</Button> page.
            </Alert>
          ) : loadingDoctor ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: brandColor }} /></Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ mb: 2.5, p: 2, bgcolor: '#F0FDFA', borderRadius: 2, border: '1px solid #CCFBF1' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Doctor</Typography>
                <Typography fontWeight={700} fontSize={16}>{doctorName}</Typography>
                {doctorSpecialty && <Typography variant="body2" color="text.secondary">{doctorSpecialty}</Typography>}
              </Box>

              {/* Available Days */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                  Available Days
                </Typography>
                {availableDays.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    No availability set yet.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {availableDays.map((day) => (
                      <Chip
                        key={day}
                        label={day}
                        onClick={() => handleDayClick(day)}
                        variant={date && dayNames[new Date(date).getDay()] === day ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 600, fontSize: 12, borderRadius: 2, px: 0.5,
                          borderColor: brandColor,
                          bgcolor: date && dayNames[new Date(date).getDay()] === day ? brandColor : 'transparent',
                          color: date && dayNames[new Date(date).getDay()] === day ? 'white' : brandColor,
                          '&:hover': { bgcolor: brandColor + '20' },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setSlotId(''); }}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: new Date().toISOString().split('T')[0] } }}
                sx={{ mb: 2.5 }}
              />

              {date && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                    Available Time Slots
                  </Typography>
                  {daySlots.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      No available slots for this date.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {daySlots.map((s) => (
                        <Chip
                          key={s._id}
                          label={s.startTime}
                          onClick={() => setSlotId(s._id)}
                          variant={slotId === s._id ? 'filled' : 'outlined'}
                          sx={{
                            px: 1.5, py: 2.5, fontWeight: 600, fontSize: 13, borderRadius: 2,
                            borderColor: brandColor,
                            bgcolor: slotId === s._id ? brandColor : 'transparent',
                            color: slotId === s._id ? 'white' : brandColor,
                            '&:hover': { bgcolor: brandColor + '15' },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              <TextField
                label="Reason for visit"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                required
                multiline
                rows={2}
                placeholder="e.g. Regular checkup, consultation..."
                sx={{ mb: 3 }}
              />

              <Button type="submit" fullWidth variant="contained" disabled={submitting || !slotId}
                sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' }, py: 1.5 }}>
                {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Confirm Booking'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};

export default BookingPage;
