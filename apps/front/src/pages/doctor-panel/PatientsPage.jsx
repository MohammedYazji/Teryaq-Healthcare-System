import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Chip,
  CircularProgress, TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DoctorLayout from './DoctorPanelLayout';
import axiosInstance from '../../api/axios';

const brandColor = '#0d9488';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/appointments/myAppointments');
      setAppointments(res.data?.data?.appointments || res.data?.data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const patients = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      const p = a.patientId;
      if (!p) return;
      const user = p.userId;
      if (!user) return;
      const id = p._id || user._id;
      if (!id) return;
      if (!map[id]) {
        map[id] = {
          id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          email: user.email || '',
          photo: user.photo || '',
          totalAppointments: 0,
          completedAppointments: 0,
          lastVisit: null,
        };
      }
      map[id].totalAppointments++;
      if (a.status === 'completed') map[id].completedAppointments++;
      const date = a.appointmentDate || a.date;
      if (date && (!map[id].lastVisit || new Date(date) > new Date(map[id].lastVisit))) {
        map[id].lastVisit = date;
      }
    });
    let list = Object.values(map);
    if (search) {
      list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }, [appointments, search]);

  return (
    <DoctorLayout>
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#0F172A' }}>
              Patients
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 15 }}>
              {patients.length} patient{patients.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        <TextField fullWidth placeholder="Search patients..." value={search}
          onChange={e => setSearch(e.target.value)}
          slotProps={{ input: {
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
          } }}
          sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: brandColor }} />
          </Box>
        ) : patients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, background: 'white', borderRadius: 4, border: '1px solid #F1F5F9' }}>
            <PeopleIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ color: '#94A3B8', fontSize: 15 }}>
              {search ? 'No patients match your search.' : 'No patients yet.'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {patients.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Card sx={{
                  borderRadius: 3, border: '1px solid #F1F5F9', cursor: 'pointer',
                  transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 15px rgba(13,148,136,0.10)' },
                }}
                  onClick={() => navigate(`/doctor/medical-records?patient=${p.id}`)}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={p.photo || undefined}
                        sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: brandColor, fontSize: 16, fontWeight: 700 }}>
                        {p.name[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{p.name}</Typography>
                        {p.email && <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>{p.email}</Typography>}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip icon={<CalendarMonthIcon sx={{ fontSize: 12 }} />}
                        label={`${p.totalAppointments} visit${p.totalAppointments !== 1 ? 's' : ''}`} size="small"
                        sx={{ background: '#F0FDF4', color: '#15803D', fontWeight: 600, fontSize: 11 }} />
                      {p.lastVisit && (
                        <Chip label={`Last: ${new Date(p.lastVisit).toLocaleDateString('en', { month: 'short', day: 'numeric' })}`}
                          size="small" sx={{ background: '#F8FAFC', color: '#64748B', fontWeight: 600, fontSize: 11 }} />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DoctorLayout>
  );
}
