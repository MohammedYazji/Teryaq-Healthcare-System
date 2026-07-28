import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Chip, Avatar,
  CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Layout from '../../components/layout/Layout';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [openView, setOpenView] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/medical-record/my-history');
        setRecords(res.data.data?.history || []);
      } catch (err) {
        console.error('Failed to load records', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <Layout>
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.1rem' }, color: '#0F172A' }}>
              My Medical Records
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 15, mt: 0.5 }}>
              View your medical history and prescriptions
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress sx={{ color: brandColor }} /></Box>
          ) : records.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: 4, border: '1px solid #F1F5F9' }}>
              <DescriptionIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
              <Typography sx={{ fontSize: 15, color: '#94A3B8' }}>No medical records yet.</Typography>
            </Box>
          ) : (
            <Box>
              {records.map((r) => {
                const doctor = r.appointmentId?.doctorId;
                const doctorUser = doctor?.userId;
                const spec = doctor?.specialization;
                const date = r.appointmentId?.appointmentDate || r.createdAt;
                return (
                  <Card key={r._id} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', mb: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Avatar sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: brandColor, fontSize: 16 }}>
                          {doctorUser?.firstName?.[0] || 'D'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 180 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                            Dr. {doctorUser?.firstName || ''} {doctorUser?.lastName || ''}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 0.3 }}>
                            {spec && (
                              <Chip icon={<LocalHospitalIcon sx={{ fontSize: 12 }} />}
                                label={spec.name} size="small"
                                sx={{ background: '#F0FDF4', color: '#15803D', fontWeight: 600, fontSize: 11 }} />
                            )}
                            {date && (
                              <Chip icon={<CalendarMonthIcon sx={{ fontSize: 12 }} />}
                                label={new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                                size="small" sx={{ background: '#F8FAFC', color: '#64748B', fontWeight: 600, fontSize: 11 }} />
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="outlined"
                            onClick={() => { setSelected(r); setOpenView(true); }}
                            sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12, borderRadius: 2, borderColor: brandColor, color: brandColor }}>
                            View Details
                          </Button>
                          <Button size="small" variant="contained"
                            onClick={() => {
                              const w = window.open('', '_blank');
                              if (!w) return;
                              const doc = r.appointmentId?.doctorId?.userId;
                              const spec = r.appointmentId?.doctorId?.specialization;
                              w.document.write(`<!DOCTYPE html><html><head><title>Medical Record</title><style>
                                body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#333}
                                h1{color:#0d9488;border-bottom:2px solid #eee;padding-bottom:10px}
                                h3{color:#0d9488;margin-top:24px}
                                .label{font-weight:700;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}
                                .value{margin:4px 0 16px;font-size:15px}
                                table{width:100%;border-collapse:collapse;margin:12px 0}
                                th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #eee}
                                th{background:#f8fafc;font-weight:600}
                                @media print{body{margin:0}}
                              </style></head><body>
                                <h1>Medical Record</h1>
                                <div class="label">Doctor</div>
                                <div class="value">Dr. ${doc?.firstName || ''} ${doc?.lastName || ''}${spec?.name ? ` (${spec.name})` : ''}</div>
                                <div class="label">Date</div>
                                <div class="value">${r.appointmentId?.appointmentDate ? new Date(r.appointmentId.appointmentDate).toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric'}) : ''}</div>
                                <div class="label">Diagnosis</div>
                                <div class="value">${r.diagnosis || 'N/A'}</div>
                                <div class="label">Symptoms</div>
                                <div class="value">${r.symptoms || 'N/A'}</div>
                                ${(r.prescriptions?.length || 0) > 0 ? `<h3>Prescriptions</h3><table><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>${r.prescriptions.map(p => `<tr><td>${p.medicineName||''}</td><td>${p.dosage||''}</td><td>${p.frequency||''}</td><td>${p.duration||''}</td></tr>`).join('')}</table>` : ''}
                                ${r.notes ? `<div class="label">Notes</div><div class="value">${r.notes}</div>` : ''}
                                <p style="margin-top:40px;color:#999;font-size:12px;border-top:1px solid #eee;padding-top:12px">Generated from Teryaq Healthcare System</p>
                              </body></html>`);
                              w.document.close();
                              setTimeout(() => { w.print(); }, 500);
                            }}
                            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                            sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12, borderRadius: 2, bgcolor: brandColor, color: 'white', '&:hover': { bgcolor: '#0f766e' } }}>
                            PDF
                          </Button>
                        </Box>
                      </Box>
                      {r.diagnosis && (
                        <Typography sx={{ fontSize: 13, color: '#64748B', mt: 1.5, pl: 7 }}>
                          <strong>Diagnosis:</strong> {r.diagnosis}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Container>
      </Box>

      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Doctor</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                  Dr. {selected.appointmentId?.doctorId?.userId?.firstName || ''} {selected.appointmentId?.doctorId?.userId?.lastName || ''}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</Typography>
                <Typography sx={{ fontSize: 15 }}>
                  {selected.appointmentId?.appointmentDate
                    ? new Date(selected.appointmentId.appointmentDate).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })
                    : ''}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Diagnosis</Typography>
                <Typography sx={{ fontSize: 15 }}>{selected.diagnosis || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Symptoms</Typography>
                <Typography sx={{ fontSize: 15 }}>{selected.symptoms || 'N/A'}</Typography>
              </Box>
              {(selected.prescriptions?.length || 0) > 0 && (
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>Prescriptions</Typography>
                  {selected.prescriptions.map((p, i) => (
                    <Box key={i} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 1, border: '1px solid #F1F5F9' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{p.medicineName}</Typography>
                      <Typography sx={{ fontSize: 13, color: '#64748B' }}>{p.dosage} | {p.frequency} | {p.duration}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              {selected.notes && (
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</Typography>
                  <Typography sx={{ fontSize: 15 }}>{selected.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenView(false)} sx={{ borderRadius: 2, color: '#64748B' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default MedicalRecordsPage;
