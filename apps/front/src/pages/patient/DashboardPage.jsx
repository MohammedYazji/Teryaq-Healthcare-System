import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, CircularProgress,
  Paper, Avatar, Chip, Stack,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Layout from '../../components/layout/Layout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const brand = '#0d9488';
const brandDark = '#0f766e';
const brandLight = 'rgba(13,148,136,0.08)';
const ink = '#0f172a';
const sub = '#64748b';
const border = '#eef1f5';

const statConfig = [
  { label: 'Total', iconComp: CalendarMonthIcon, bg: '#e0f2fe', color: '#0369a1' },
  { label: 'Upcoming', iconComp: TrendingUpIcon, bg: '#ccfbf1', color: brand },
  { label: 'Completed', iconComp: CheckCircleIcon, bg: '#dcfce7', color: '#16a34a' },
  { label: 'Cancelled', iconComp: CancelIcon, bg: '#fee2e2', color: '#dc2626' },
];

const actionConfig = [
  { label: 'Find Doctors', desc: 'Browse specialists', route: '/doctors', Icon: LocalHospitalIcon },
  { label: 'Appointments', desc: 'View all bookings', route: '/appointments', Icon: EventNoteIcon },
  { label: 'Profile', desc: 'Manage your details', route: '/profile', Icon: PersonIcon },
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return setLoading(false);
    const fetchData = async () => {
      try {
        const res = await axios.get('/appointments/myAppointments');
        setAppointments(
          Array.isArray(res.data.data?.appointments) ? res.data.data.appointments : []
        );
      } catch (err) {
        console.error('Dashboard appointments fetch failed:', err?.response?.data || err.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
          <CircularProgress sx={{ color: brand }} />
        </Box>
      </Layout>
    );
  }

  const upcoming = appointments.filter((a) => a.status === 'pending' || a.status === 'scheduled');
  const completed = appointments.filter((a) => a.status === 'completed');
  const cancelled = appointments.filter((a) => a.status === 'cancelled');
  const next = upcoming[0];
  const followingUp = upcoming.slice(1, 4);

  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User';
  const initials = fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const statValues = [appointments.length, upcoming.length, completed.length, cancelled.length];

  const getDoctorName = (apt) => apt?.doctorId?.userId
    ? `Dr. ${apt.doctorId.userId.firstName || ''} ${apt.doctorId.userId.lastName || ''}`.trim()
    : 'Doctor TBD';

  const doctorName = next ? getDoctorName(next) : null;

  return (
    <Layout>
      <Box
        sx={{
          minHeight: '100vh',
          background: '#f8fafc',
          backgroundImage:
            'radial-gradient(circle at 100% 0%, rgba(13,148,136,0.07) 0%, transparent 45%)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, sm: 4 },
          }}
        >
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
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: brand,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: ink, letterSpacing: '-0.02em' }}>
                  Welcome back, {user?.firstName || fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: sub }}>
                  Here's what's happening with your appointments
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              onClick={() => navigate('/doctors')}
              startIcon={<LocalHospitalIcon />}
              sx={{
                bgcolor: brand,
                textTransform: 'none',
                fontWeight: 600,
                color: '#fff',
                borderRadius: 2.5,
                px: 2.5,
                py: 1.1,
                boxShadow: 'none',
                alignSelf: { xs: 'stretch', sm: 'auto' },
                '&:hover': { bgcolor: brandDark, boxShadow: 'none' },
              }}
            >
              Book appointment
            </Button>
          </Box>

          {/* STATS — full-width row, evenly distributed, no leftover space */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 2,
            }}
          >
            {statConfig.map((stat, i) => {
              const Icon = stat.iconComp;
              return (
                <Paper
                  key={stat.label}
                  elevation={0}
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    border: `1px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.75,
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                    '&:hover': { borderColor: stat.color, transform: 'translateY(-2px)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      borderRadius: 2,
                      bgcolor: stat.bg,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, color: ink }}>
                      {statValues[i]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: sub, fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          {/* MAIN BENTO GRID — hero card + sidebar that actually fills the width */}
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
              {/* Next appointment — hero card */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${border}`,
                  overflow: 'hidden',
                }}
              >
                {next ? (
                  <Box
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      background: `linear-gradient(135deg, ${brand} 0%, #0891b2 100%)`,
                      color: '#fff',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        position: 'absolute',
                        right: -50,
                        top: -60,
                        width: 220,
                        height: 220,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                      }}
                    />
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      sx={{ position: 'relative', mb: 2.5, justifyContent: 'space-between' }}
                    >
                      <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: 1 }}>
                        Next appointment
                      </Typography>
                      <Chip
                        label={next.status}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          border: '1px solid rgba(255,255,255,0.3)',
                        }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative' }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'rgba(255,255,255,0.18)',
                          border: '2px solid rgba(255,255,255,0.4)',
                        }}
                      >
                        <LocalHospitalIcon />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }} noWrap>
                          {doctorName}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                          <Stack direction="row" spacing={0.6} alignItems="center">
                            <CalendarTodayIcon sx={{ fontSize: 16, opacity: 0.85 }} />
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {next.date ? new Date(next.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                            </Typography>
                          </Stack>
                          {next.time && (
                            <Stack direction="row" spacing={0.6} alignItems="center">
                              <AccessTimeIcon sx={{ fontSize: 16, opacity: 0.85 }} />
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {next.time}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    </Stack>

                    <Button
                      onClick={() => navigate('/appointments')}
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                      sx={{
                        mt: 2.5,
                        position: 'relative',
                        color: '#fff',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                      }}
                    >
                      View details
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'left' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: brandLight,
                        color: brand,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <CalendarMonthIcon />
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: ink, mb: 0.5 }}>
                      No upcoming appointments
                    </Typography>
                    <Typography variant="body2" sx={{ color: sub, mb: 2.5 }}>
                      Book a visit with a doctor to see it here.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/doctors')}
                      sx={{
                        bgcolor: brand,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2.5,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: brandDark, boxShadow: 'none' },
                      }}
                    >
                      Book an appointment
                    </Button>
                  </Box>
                )}
              </Paper>

              {/* Upcoming after next — keeps the left column full-height, no dead space below hero */}
              {followingUp.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 3,
                    border: `1px solid ${border}`,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ink, mb: 1.75 }}>
                    Also coming up
                  </Typography>
                  <Stack divider={<Box sx={{ borderTop: `1px solid ${border}` }} />} spacing={1.5}>
                    {followingUp.map((apt) => (
                      <Stack
                        key={apt._id || apt.id}
                        direction="row"
                        alignItems="center"
                        sx={{ pt: 1.5, justifyContent: 'space-between', '&:first-of-type': { pt: 0 } }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: brandLight, color: brand }}>
                            <LocalHospitalIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: ink }} noWrap>
                              {getDoctorName(apt)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: sub }}>
                              {apt.date ? new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Date TBD'}
                              {apt.time ? ` · ${apt.time}` : ''}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={apt.status}
                          size="small"
                          sx={{
                            bgcolor: brandLight,
                            color: brand,
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            flexShrink: 0,
                          }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>

            {/* RIGHT COLUMN — quick actions, fills the space that used to be empty */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                border: `1px solid ${border}`,
                height: '100%',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ink, mb: 2 }}>
                Quick actions
              </Typography>
              <Stack spacing={1.25}>
                {actionConfig.map(({ label, desc, route, Icon }) => (
                  <Box
                    key={label}
                    onClick={() => navigate(route)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.75,
                      p: 1.5,
                      borderRadius: 2.5,
                      border: `1px solid ${border}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: brandLight,
                        borderColor: brand,
                        transform: 'translateX(2px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        flexShrink: 0,
                        borderRadius: 2,
                        bgcolor: brandLight,
                        color: brand,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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

              {/* Summary strip — uses the remaining vertical space instead of leaving it blank */}
              <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${border}` }}>
                <Typography variant="caption" sx={{ color: sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  This month
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
                      {upcoming.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: sub }}>Upcoming</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#dc2626', fontSize: '1.25rem', lineHeight: 1 }}>
                      {cancelled.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: sub }}>Cancelled</Typography>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
