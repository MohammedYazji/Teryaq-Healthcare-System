import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Chip, Avatar, IconButton,
  Menu, MenuItem, Tabs, Tab, CircularProgress, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useSelector } from 'react-redux';
import DoctorLayout from './DoctorPanelLayout';
import axiosInstance from '../../api/axios';

const brandColor = '#0d9488';

const statusColors = {
  scheduled: { bg: '#F0FDF4', color: '#15803D' },
  confirmed: { bg: '#F0FDF4', color: '#15803D' },
  pending: { bg: '#FFFBEB', color: '#D97706' },
  completed: { bg: '#F8FAFC', color: '#64748B' },
  cancelled: { bg: '#FEF2F2', color: '#DC2626' },
  'in-progress': { bg: '#EFF6FF', color: '#2563EB' },
  'no-show': { bg: '#FEF2F2', color: '#DC2626' },
};

function isToday(isoDate) {
  if (!isoDate) return false;
  const appt = new Date(isoDate);
  const now = new Date();
  return appt.getFullYear() === now.getFullYear() &&
    appt.getMonth() === now.getMonth() &&
    appt.getDate() === now.getDate();
}

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/appointments/myAppointments');
      const raw = res.data?.data?.appointments || res.data?.data || [];
      setAppointments(raw.map(a => ({
        id: a._id,
        patientName: a.patientId?.userId
          ? `${a.patientId.userId.firstName || ''} ${a.patientId.userId.lastName || ''}`.trim()
          : 'Patient',
        appointmentDate: a.appointmentDate,
        date: a.appointmentDate
          ? new Date(a.appointmentDate).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
          : '',
        time: a.appointmentTime || a.slotId?.startTime || '',
        status: a.status || 'pending',
        type: 'Video',
        paymentStatus: a.paymentStatus,
      })));
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (apptId, status) => {
    try {
      await axiosInstance.patch(`/appointments/${apptId}/status`, { status });
      setSnackbar({ open: true, message: `Appointment ${status}`, severity: 'success' });
      fetchAppointments();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to update status', severity: 'error' });
    }
  };

  const upcoming = appointments.filter(a => ['scheduled', 'confirmed', 'pending', 'in-progress'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => ['cancelled', 'no-show'].includes(a.status));

  const tabs = [
    { label: 'Upcoming', count: upcoming.length, items: upcoming },
    { label: 'Completed', count: completed.length, items: completed },
    { label: 'Cancelled', count: cancelled.length, items: cancelled },
  ];

  return (
    <DoctorLayout>
        <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#0F172A' }}>
              Appointments
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 15 }}>
              Manage your patient appointments.
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: brandColor }} />
          </Box>
        ) : (
          <>
            <Box sx={{ background: 'white', borderRadius: 4, border: '1px solid #F1F5F9', overflow: 'hidden', mb: 3 }}>
              <Tabs
                value={tab} onChange={(_, v) => setTab(v)}
                TabIndicatorProps={{ style: { background: brandColor } }}
                sx={{
                  px: 2, borderBottom: '1px solid #F1F5F9',
                  '& .MuiTab-root': {
                    fontWeight: 600, textTransform: 'none', fontSize: 14, color: '#64748B',
                    '&.Mui-selected': { color: brandColor },
                  },
                }}
              >
                {tabs.map((t, i) => (
                  <Tab key={i} label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {t.label}
                      <Chip label={t.count} size="small"
                        sx={{
                          height: 20, fontSize: 11, fontWeight: 700,
                          background: tab === i ? '#0d948820' : '#F1F5F9',
                          color: tab === i ? brandColor : '#64748B',
                        }} />
                    </Box>
                  } />
                ))}
              </Tabs>
            </Box>

            {tabs[tab].items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, background: 'white', borderRadius: 4, border: '1px solid #F1F5F9' }}>
                <CalendarMonthIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                <Typography sx={{ color: '#94A3B8', fontSize: 15 }}>No {tabs[tab].label.toLowerCase()} appointments.</Typography>
              </Box>
            ) : (
              tabs[tab].items.map((appt, i) => {
                const st = statusColors[appt.status] || statusColors.pending;
                const apptDate = appt.appointmentDate || appt.scheduledAt || appt.date;
                const canAccept = appt.status === 'pending';
                const canCancel = ['pending', 'scheduled', 'confirmed'].includes(appt.status);
                const canJoin = ['scheduled', 'confirmed'].includes(appt.status) && isToday(apptDate);
                const canAddRecord = appt.status === 'completed' || appt.status === 'in-progress';
                const patientName = appt.patientName || 'Patient';

                return (
                  <Box key={appt.id || i} sx={{
                    p: { xs: 2.5, md: 3 }, borderRadius: 3, background: 'white',
                    border: '1px solid #E2F0F0', mb: 2,
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: '0 4px 15px rgba(13,148,136,0.10)', borderColor: '#99F6E4' },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
                      <Avatar sx={{ width: 50, height: 50, borderRadius: 2.5, background: brandColor, fontSize: 18, fontWeight: 700 }}>
                        {patientName[0]}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 180 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                            {patientName}
                          </Typography>
                          <Chip label={appt.status.charAt(0).toUpperCase() + appt.status.slice(1)} size="small"
                            sx={{ background: st.bg, color: st.color, fontWeight: 600, fontSize: 11, height: 22, borderRadius: 1 }} />
                          {appt.paymentStatus ? (
                            <Chip label={appt.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'} size="small"
                              sx={{
                                background: appt.paymentStatus === 'paid' ? '#ECFDF5' : '#FFFBEB',
                                color: appt.paymentStatus === 'paid' ? '#15803D' : '#B45309',
                                fontWeight: 600, fontSize: 11, height: 22, borderRadius: 1,
                              }} />
                          ) : (
                            <Chip label="Unpaid" size="small"
                              sx={{ background: '#FFFBEB', color: '#B45309', fontWeight: 600, fontSize: 11, height: 22, borderRadius: 1 }} />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                          {apptDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: 13 }}>
                              <CalendarMonthIcon sx={{ fontSize: 14 }} />
                              {new Date(apptDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Box>
                          )}
                          {appt.time && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: 13 }}>
                              <AccessTimeIcon sx={{ fontSize: 14 }} />{appt.time}
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: 13 }}>
                            <VideoCallIcon sx={{ fontSize: 14 }} /> {appt.type || 'Video'} Consultation
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                          {apptDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: 13 }}>
                              <CalendarMonthIcon sx={{ fontSize: 14 }} />
                              {new Date(apptDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Box>
                          )}
                          {appt.time && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: 13 }}>
                              <AccessTimeIcon sx={{ fontSize: 14 }} />{appt.time}
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: 13 }}>
                            <VideoCallIcon sx={{ fontSize: 14 }} /> {appt.type || 'Video'} Consultation
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        {canAccept && (
                          <Button size="small" startIcon={<CheckCircleIcon />}
                            onClick={() => handleStatusUpdate(appt.id, 'scheduled')}
                            sx={{
                              borderRadius: 2, fontWeight: 700, fontSize: 12,
                              background: '#F0FDF4', color: '#15803D',
                              '&:hover': { background: '#DCFCE7' },
                            }}>
                            Accept
                          </Button>
                        )}
                        {canCancel && (
                          <Button size="small" startIcon={<CancelIcon />}
                            onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                            sx={{
                              borderRadius: 2, fontWeight: 700, fontSize: 12,
                              background: '#FEF2F2', color: '#DC2626',
                              '&:hover': { background: '#FEE2E2' },
                            }}>
                            Cancel
                          </Button>
                        )}
                        {canJoin && (
                          <Button size="small" startIcon={<VideoCallIcon />}
                            onClick={() => navigate(`/video/${appt.id}`)}
                            sx={{
                              borderRadius: 2, fontWeight: 700, fontSize: 12,
                              background: brandColor, color: 'white',
                            }}>
                            Join Call
                          </Button>
                        )}
                        {canAddRecord && (
                          <Button size="small" startIcon={<AssignmentIcon />}
                            onClick={() => navigate('/doctor/medical-records')}
                            sx={{
                              borderRadius: 2, fontWeight: 700, fontSize: 12,
                              background: '#EFF6FF', color: '#2563EB',
                              '&:hover': { background: '#DBEAFE' },
                            }}>
                            Record
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })
            )}
          </>
        )}
      </Box>

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
