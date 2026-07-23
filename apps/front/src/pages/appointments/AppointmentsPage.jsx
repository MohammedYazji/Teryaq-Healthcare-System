import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Chip, Button, Skeleton, Alert,
  Rating, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Layout from '../../components/layout/Layout';
import axios from '../../api/axios';

const colors = {
  brand: '#0d9488',
  brandDark: '#0f766e',
  primary: '#0EA5E9',
  navy: '#0F172A',
  slate: '#64748B',
  slateLight: '#94A3B8',
  bg: '#F8FAFC',
};

const display = { fontFamily: '"Sora", "Helvetica Neue", Arial, sans-serif' };

const statusStyles = {
  pending: { bg: '#FEF9C3', fg: '#A16207', dot: '#CA8A04' },
  scheduled: { bg: '#E0F2FE', fg: '#0369A1', dot: colors.primary },
  completed: { bg: '#ECFDF5', fg: '#15803D', dot: '#16A34A' },
  cancelled: { bg: '#FEF2F2', fg: '#DC2626', dot: '#DC2626' },
};
const fallbackStatus = { bg: '#F1F5F9', fg: colors.slate, dot: colors.slateLight };

const StatusChip = ({ status }) => {
  const s = statusStyles[status] || fallbackStatus;
  return (
    <Chip
      size="small"
      label={status}
      sx={{
        bgcolor: s.bg, color: s.fg, fontWeight: 700, fontSize: 11.5,
        textTransform: 'capitalize', px: 0.5,
        '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.7 },
      }}
      icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot, ml: 1.2 }} />}
    />
  );
};

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
};

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'DR';

const isToday = (isoDate) => {
  if (!isoDate) return false;
  const appt = new Date(isoDate);
  const now = new Date();
  return appt.getFullYear() === now.getFullYear() &&
    appt.getMonth() === now.getMonth() &&
    appt.getDate() === now.getDate();
};

const isTimeToJoin = (appt) => {
  if (!appt.appointmentDate || !appt.appointmentTime) return false;
  const now = new Date();
  const apptDate = new Date(appt.appointmentDate);
  const isSameDay =
    apptDate.getFullYear() === now.getFullYear() &&
    apptDate.getMonth() === now.getMonth() &&
    apptDate.getDate() === now.getDate();
  if (!isSameDay) return false;
  const [hours, minutes] = appt.appointmentTime.split(':').map(Number);
  const apptMinutes = hours * 60 + minutes;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= apptMinutes;
};

const doctorDisplayName = (appt) => {
  if (appt.doctorId?.userId) {
    const f = appt.doctorId.userId.firstName || '';
    const l = appt.doctorId.userId.lastName || '';
    return `Dr. ${f} ${l}`.trim();
  }
  return 'Doctor';
};

const AppointmentCard = ({ appt, reviewed, onReview, navigate }) => {
  const s = statusStyles[appt.status] || fallbackStatus;
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await axios.post(`/payment/checkout-session/${appt._id}`);
      const url = res.data?.session_url;
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Payment failed', err);
    } finally {
      setPaying(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap',
        bgcolor: 'white', borderRadius: 3, p: { xs: 2.5, sm: 3 }, mb: 2,
        border: '1px solid #EEF2F6', borderLeft: `4px solid ${s.dot}`,
        boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(15,23,42,0.08)' },
      }}
    >
      <Box sx={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        bgcolor: '#F0FDFA', color: colors.brand, fontWeight: 700, fontSize: 15,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...display,
      }}>
        {initials(appt.doctorId?.userId ? `${appt.doctorId.userId.firstName || ''} ${appt.doctorId.userId.lastName || ''}` : '')}
      </Box>

      <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15.5, color: colors.navy, mb: 0.4 }}>
          {doctorDisplayName(appt)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <CalendarMonthIcon sx={{ fontSize: 15, color: colors.slateLight }} />
            <Typography sx={{ fontSize: 13, color: colors.slate }}>{formatDate(appt.appointmentDate)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <AccessTimeIcon sx={{ fontSize: 15, color: colors.slateLight }} />
            <Typography sx={{ fontSize: 13, color: colors.slate }}>{appt.appointmentTime}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <StatusChip status={appt.status} />
        {appt.paymentStatus && appt.paymentStatus !== 'paid' && (
          <Chip size="small" label="Unpaid"
            sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 700, fontSize: 11, textTransform: 'capitalize', px: 0.5 }} />
        )}
        {appt.paymentStatus === 'paid' && (
          <Chip size="small" label="Paid"
            sx={{ bgcolor: '#ECFDF5', color: '#15803D', fontWeight: 700, fontSize: 11, textTransform: 'capitalize', px: 0.5 }} />
        )}
        {appt.status === 'scheduled' && appt.paymentStatus !== 'paid' && (
          <Button
            size="small"
            variant="contained"
            disabled={paying}
            onClick={handlePay}
            sx={{
              textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2,
              bgcolor: '#f59e0b', color: 'white', whiteSpace: 'nowrap', px: 1.5,
              '&:hover': { bgcolor: '#d97706' },
            }}
          >
            {paying ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Pay Now'}
          </Button>
        )}
        {['scheduled'].includes(appt.status) && isTimeToJoin(appt) && (
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate(`/video/${appt._id || appt.id}`)}
            sx={{
              textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2,
              bgcolor: colors.brand, color: 'white', whiteSpace: 'nowrap', px: 1.5,
              '&:hover': { bgcolor: colors.brandDark },
            }}
          >
            Join Call
          </Button>
        )}
        {appt.status === 'completed' && !reviewed && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onReview(appt)}
            sx={{
              textTransform: 'none', fontWeight: 600, fontSize: 12, borderRadius: 2,
              borderColor: colors.brand, color: colors.brand, whiteSpace: 'nowrap',
              '&:hover': { borderColor: colors.brandDark, bgcolor: 'rgba(13,148,136,0.04)' },
            }}
          >
            Write Review
          </Button>
        )}
        {appt.status === 'completed' && (
          <Button
            size="small"
            variant="text"
            onClick={() => navigate('/medical-records')}
            sx={{
              textTransform: 'none', fontWeight: 600, fontSize: 12, borderRadius: 2,
              color: colors.slate, whiteSpace: 'nowrap',
              '&:hover': { color: colors.brand },
            }}
          >
            View Records
          </Button>
        )}
      </Box>
    </Box>
  );
};

const SectionLabel = ({ children }) => (
  <Typography sx={{ ...display, fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.slate, mb: 2, mt: 4, '&:first-of-type': { mt: 0 } }}>
    {children}
  </Typography>
);

const AppointmentsPage = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [reviewDialog, setReviewDialog] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    const fetch = async () => {
      try {
        const [apptRes, reviewRes] = await Promise.all([
          axios.get('/appointments/myAppointments'),
          axios.get('/reviews/mine').catch(() => ({ data: { data: { reviews: [] } } })),
        ]);
        setAppointments(apptRes.data.data?.appointments || []);
        const ids = (reviewRes.data.data?.reviews || []).map((r) => r.appointmentId?.toString()).filter(Boolean);
        setReviewedIds(new Set(ids));
      } catch (err) {
        console.error('Failed to fetch appointments', err);
        setFetchError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isAuthenticated]);

  useEffect(() => {
    const id = 'app-display-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@400;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const handleSubmitReview = async () => {
    if (!reviewDialog || !rating) return;
    setSubmitting(true);
    try {
      await axios.post('/reviews', {
        appointmentId: reviewDialog._id,
        rating,
        comment,
      });
      setReviewedIds((prev) => new Set(prev).add(reviewDialog._id));
      setReviewDialog(null);
      setRating(5);
      setComment('');
    } catch (err) {
      console.error('Review submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <LockOutlinedIcon sx={{ fontSize: 30, color: colors.brand }} />
          </Box>
          <Typography sx={{ ...display, fontWeight: 700, fontSize: 22, color: colors.navy, mb: 1 }}>
            Please sign in to view your appointments
          </Typography>
          <Typography sx={{ color: colors.slate, fontSize: 14.5, mb: 4 }}>
            Your appointment history is saved to your account.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ bgcolor: colors.brand, fontWeight: 700, textTransform: 'none', px: 4, py: 1.2, borderRadius: 2.5, '&:hover': { bgcolor: colors.brandDark } }}
          >
            Sign In
          </Button>
        </Container>
      </Layout>
    );
  }

  const upcoming = appointments.filter((a) => a.status === 'pending' || a.status === 'scheduled');
  const past = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled');

  return (
    <Layout>
      <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ ...display, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.brand, mb: 1 }}>
              My Care
            </Typography>
            <Typography sx={{ ...display, fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.1rem' }, color: colors.navy }}>
              My Appointments
            </Typography>
          </Box>

          {fetchError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{fetchError}</Alert>}

          {loading ? (
            <Box>
              {Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2.5, bgcolor: 'white', borderRadius: 3, p: 3, mb: 2, border: '1px solid #EEF2F6' }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="40%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton width="60%" height={16} />
                  </Box>
                  <Skeleton variant="rounded" width={80} height={24} />
                </Box>
              ))}
            </Box>
          ) : appointments.length === 0 ? (
            <Box sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #EEF2F6', p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <EventBusyIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
              <Typography sx={{ fontWeight: 600, fontSize: 16, color: colors.navy, mb: 0.5 }}>
                No appointments yet
              </Typography>
              <Typography sx={{ color: colors.slate, fontSize: 14, mb: 3 }}>
                When you book a visit, it'll show up here.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/doctors')}
                sx={{ bgcolor: colors.brand, fontWeight: 700, textTransform: 'none', px: 3.5, py: 1.1, borderRadius: 2.5, '&:hover': { bgcolor: colors.brandDark } }}
              >
                Book a Doctor
              </Button>
            </Box>
          ) : (
            <Box>
              {upcoming.length > 0 && (
                <Box>
                  <SectionLabel>Upcoming &middot; {upcoming.length}</SectionLabel>
                  {upcoming.map((appt) => <AppointmentCard key={appt._id} appt={appt} reviewed={reviewedIds.has(appt._id)} onReview={setReviewDialog} navigate={navigate} />)}
                </Box>
              )}
              {past.length > 0 && (
                <Box>
                  <SectionLabel>Past &middot; {past.length}</SectionLabel>
                  {past.map((appt) => <AppointmentCard key={appt._id} appt={appt} reviewed={reviewedIds.has(appt._id)} onReview={setReviewDialog} navigate={navigate} />)}
                </Box>
              )}
            </Box>
          )}
        </Container>
      </Box>

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onClose={() => setReviewDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, color: colors.navy }}>
          Write a Review
        </DialogTitle>
        <DialogContent>
          {reviewDialog && (
            <>
              <Typography sx={{ fontSize: 14, color: colors.slate, mb: 2 }}>
                {doctorDisplayName(reviewDialog)}
              </Typography>
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.navy, mb: 0.5 }}>Rating</Typography>
                <Rating
                  value={rating}
                  onChange={(_, v) => setRating(v || 5)}
                  size="large"
                  sx={{ color: '#f59e0b' }}
                />
              </Box>
              <TextField
                label="Comment (optional)"
                multiline
                rows={3}
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReviewDialog(null)} sx={{ textTransform: 'none', color: colors.slate }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={submitting}
            sx={{ bgcolor: colors.brand, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: colors.brandDark } }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AppointmentsPage;
