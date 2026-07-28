import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Chip,
  Button, CircularProgress, Rating, Stack, Paper,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import PersonIcon from '@mui/icons-material/Person';
import { useSelector } from 'react-redux';
import DoctorLayout from './DoctorPanelLayout';
import axiosInstance from '../../api/axios';

const brand = '#0d9488';
const brandDark = '#0f766e';
const brandLight = 'rgba(13,148,136,0.08)';
const ink = '#0F172A';
const sub = '#64748B';
const border = '#F1F5F9';

const statusColors = {
  scheduled: { bg: '#F0FDF4', color: '#15803D' },
  pending: { bg: '#FFFBEB', color: '#D97706' },
  completed: { bg: '#F8FAFC', color: '#64748B' },
  cancelled: { bg: '#FEF2F2', color: '#DC2626' },
  'in-progress': { bg: '#EFF6FF', color: '#2563EB' },
};

const quickActions = [
  { label: 'Manage Availability', desc: 'Set your working hours', path: '/doctor/availability', Icon: ScheduleIcon },
  { label: 'View Appointments', desc: 'See your full schedule', path: '/doctor/appointments', Icon: CalendarMonthIcon },
  { label: 'Medical Records', desc: 'Access patient history', path: '/doctor/medical-records', Icon: FolderSharedIcon },
  { label: 'Edit Profile', desc: 'Update your details', path: '/doctor/profile', Icon: PersonIcon },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, apptRes] = await Promise.all([
          axiosInstance.get('/doctors/me'),
          axiosInstance.get('/appointments/myAppointments'),
        ]);
        const p = profileRes.data?.data?.doctor || profileRes.data?.data?.profile || profileRes.data?.data;
        setProfile(p);
        setAppointments(apptRes.data?.data?.appointments || apptRes.data?.data || []);
        const doctorId = p?._id || p?.id;
        if (doctorId) {
          axiosInstance.get(`/reviews/doctor/${doctorId}`).then(r => {
            const fetched = r.data?.data?.reviews || r.data?.data || [];
            console.log('DoctorDashboard: reviews fetched', fetched.length, fetched);
            setReviews(fetched);
          }).catch(err => console.error('DoctorDashboard: reviews fetch failed', err));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcoming = appointments.filter(a => ['scheduled', 'confirmed', 'pending', 'in-progress'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');
  const pending = appointments.filter(a => a.status === 'pending');
  const today = upcoming.filter(a => {
    const d = a.appointmentDate ? new Date(a.appointmentDate) : null;
    return d && d.toDateString() === new Date().toDateString();
  });

  const stats = [
    { icon: CalendarMonthIcon, bg: '#e0f2fe', color: '#0369a1', value: upcoming.length, label: 'Upcoming' },
    { icon: PeopleIcon, bg: '#ccfbf1', color: brand, value: profile?.numberOfPatients || completed.length, label: 'Patients' },
    { icon: StarIcon, bg: '#fef3c7', color: '#d97706', value: profile?.averageRating?.toFixed(1) || '0.0', label: `${profile?.numberOfReviews || 0} reviews` },
    { icon: AttachMoneyIcon, bg: '#dcfce7', color: '#16a34a', value: `$${profile?.consultationFee || 0}`, label: 'Per consultation' },
  ];

  if (loading) {
    return (
      <DoctorLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress sx={{ color: brand }} />
        </Box>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <Box
        sx={{
          minHeight: '100vh',
          background: '#f8fafc',
          backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(13,148,136,0.07) 0%, transparent 45%)',
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, sm: 4 } }}>

          {/* HEADER */}
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mb: 4,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{ width: 52, height: 52, bgcolor: brand, color: '#fff', fontWeight: 700, fontSize: 18 }}
              >
                {(user?.firstName?.[0] || 'D')}{(user?.lastName?.[0] || '')}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: ink, letterSpacing: '-0.02em' }}>
                  Welcome back, Dr. {user?.firstName}
                </Typography>
                <Typography variant="body2" sx={{ color: sub }}>
                  Here's your practice overview
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              onClick={() => navigate('/doctor/availability')}
              startIcon={<ScheduleIcon />}
              sx={{
                bgcolor: brand,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2.5,
                px: 2.5,
                py: 1.1,
                boxShadow: 'none',
                alignSelf: { xs: 'stretch', sm: 'auto' },
                '&:hover': { bgcolor: brandDark, boxShadow: 'none' },
              }}
            >
              Manage availability
            </Button>
          </Box>

          {/* STATS */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 2,
            }}
          >
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <Paper
                  key={s.label}
                  elevation={0}
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    border: `1px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.75,
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                    '&:hover': { borderColor: s.color, transform: 'translateY(-2px)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      borderRadius: 2,
                      bgcolor: s.bg,
                      color: s.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, color: ink }} noWrap>
                      {s.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: sub, fontWeight: 500 }} noWrap>
                      {s.label}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          {/* MAIN BENTO GRID */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.7fr 1fr' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {/* LEFT COLUMN */}
            <Stack spacing={2}>
              {/* Pending requests */}
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${border}` }}>
                <Stack direction="row" alignItems="center" sx={{ mb: 2, justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: ink }}>Pending Requests</Typography>
                  <Button
                    size="small"
                    onClick={() => navigate('/doctor/appointments')}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                    sx={{ color: brand, fontWeight: 700, fontSize: 13, textTransform: 'none' }}
                  >
                    View all
                  </Button>
                </Stack>

                {pending.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                      sx={{
                        width: 48, height: 48, borderRadius: '50%', bgcolor: brandLight, color: brand,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5,
                      }}
                    >
                      <ScheduleIcon />
                    </Box>
                    <Typography sx={{ color: sub, fontSize: 14 }}>No pending requests.</Typography>
                  </Box>
                ) : (
                  <Stack divider={<Box sx={{ borderTop: `1px solid ${border}` }} />} spacing={1.5}>
                    {pending.slice(0, 5).map((appt, i) => (
                      <Stack
                        key={appt.id || i}
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ pt: 1.5, '&:first-of-type': { pt: 0 } }}
                      >
                        <Avatar sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: brand, fontSize: 14 }}>
                          {appt.patient?.firstName?.[0] || appt.patientName?.[0] || 'P'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: 14, color: ink }} noWrap>
                            {appt.patientName || `${appt.patient?.firstName || ''} ${appt.patient?.lastName || ''}` || 'Patient'}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: sub }}>
                            {appt.date || (appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : 'Date TBD')} · {appt.time || appt.startTime}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => navigate('/doctor/appointments')}
                          sx={{
                            borderRadius: 2, color: brand, fontWeight: 600, fontSize: 12,
                            textTransform: 'none', bgcolor: brandLight, px: 1.5,
                            '&:hover': { bgcolor: brandLight, opacity: 0.8 },
                          }}
                        >
                          Review
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Paper>

              {/* Today's schedule */}
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${border}` }}>
                <Stack direction="row" alignItems="center" sx={{ mb: 2, justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: ink }}>Today's Schedule</Typography>
                  <Chip
                    label={`${today.length} ${today.length === 1 ? 'visit' : 'visits'}`}
                    size="small"
                    sx={{ bgcolor: brandLight, color: brand, fontWeight: 600 }}
                  />
                </Stack>

                {today.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                      sx={{
                        width: 48, height: 48, borderRadius: '50%', bgcolor: brandLight, color: brand,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5,
                      }}
                    >
                      <CalendarMonthIcon />
                    </Box>
                    <Typography sx={{ color: sub, fontSize: 14 }}>No appointments today.</Typography>
                  </Box>
                ) : (
                  <Stack divider={<Box sx={{ borderTop: `1px solid ${border}` }} />} spacing={1.5}>
                    {today.slice(0, 5).map((appt, i) => (
                      <Stack
                        key={appt.id || i}
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ pt: 1.5, '&:first-of-type': { pt: 0 } }}
                      >
                        <Box
                          sx={{
                            width: 42, height: 42, borderRadius: 2, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', bgcolor: brandLight, flexShrink: 0,
                          }}
                        >
                          <CalendarMonthIcon sx={{ color: brand, fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: 13, color: ink }} noWrap>
                            {appt.patientName || 'Patient'}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: sub }}>{appt.time || appt.startTime}</Typography>
                        </Box>
                        <Chip
                          label={appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                          size="small"
                          sx={{
                            background: statusColors[appt.status]?.bg || '#F1F5F9',
                            color: statusColors[appt.status]?.color || sub,
                            fontWeight: 600, fontSize: 11, height: 22, borderRadius: 1.5, flexShrink: 0,
                          }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Stack>

            {/* RIGHT COLUMN */}
            <Stack spacing={2}>
              {/* Quick actions */}
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${border}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ink, mb: 2 }}>
                  Quick actions
                </Typography>
                <Stack spacing={1.25}>
                  {quickActions.map(({ label, desc, path, Icon }) => (
                    <Box
                      key={label}
                      onClick={() => navigate(path)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.75,
                        p: 1.5,
                        borderRadius: 2.5,
                        border: `1px solid ${border}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': { bgcolor: brandLight, borderColor: brand, transform: 'translateX(2px)' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 38, height: 38, flexShrink: 0, borderRadius: 2,
                          bgcolor: brandLight, color: brand, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Icon fontSize="small" />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: ink }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: sub }}>
                          {desc}
                        </Typography>
                      </Box>
                      <ArrowForwardIcon sx={{ fontSize: 18, color: sub }} />
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Recent reviews — only renders if there are any, same as before */}
              {reviews.length > 0 && (
                <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${border}` }}>
                  <Stack direction="row" alignItems="center" sx={{ mb: 1.5, justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: ink }}>Recent Reviews</Typography>
                    <StarIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                  </Stack>
                  <Stack divider={<Box sx={{ borderTop: `1px solid ${border}` }} />} spacing={1.5}>
                    {reviews.slice(0, 3).map((r, i) => (
                      <Box key={r._id || i} sx={{ pt: 1.5, '&:first-of-type': { pt: 0 } }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Avatar
                            src={r.patientId?.userId?.photo}
                            sx={{ width: 28, height: 28, borderRadius: 2, fontSize: 12, bgcolor: brandLight, color: brand }}
                          >
                            {(r.patientId?.userId?.firstName || r.patientId?.firstName)?.[0] || 'P'}
                          </Avatar>
                          <Typography sx={{ fontWeight: 600, fontSize: 13, color: ink, flex: 1 }} noWrap>
                            {r.patientId?.userId?.firstName || r.patientId?.firstName || 'Patient'}
                          </Typography>
                          <Rating
                            value={r.rating}
                            readOnly
                            size="small"
                            icon={<StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />}
                          />
                        </Stack>
                        <Typography sx={{ fontSize: 13, color: sub, fontStyle: 'italic' }}>
                          "{r.comment}"
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}

              {/* Summary strip — fills remaining space instead of leaving it blank */}
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${border}` }}>
                <Typography variant="caption" sx={{ color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Overview
                </Typography>
                <Stack direction="row" sx={{ mt: 1.5, justifyContent: 'space-between' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: brand, fontSize: '1.25rem', lineHeight: 1 }}>
                      {completed.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: sub }}>Completed</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: ink, fontSize: '1.25rem', lineHeight: 1 }}>
                      {pending.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: sub }}>Pending</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#0369a1', fontSize: '1.25rem', lineHeight: 1 }}>
                      {upcoming.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: sub }}>Upcoming</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Box>
    </DoctorLayout>
  );
}
