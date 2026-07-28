import  { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, Chip, Avatar,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Snackbar, IconButton, Menu, MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import DoctorLayout from './DoctorPanelLayout';
import axiosInstance from '../../api/axios';

const brandColor = '#0d9488';

export default function DoctorMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);

  const [form, setForm] = useState({
    appointmentId: '',
    diagnosis: '',
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
    symptoms: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptRes, recordRes] = await Promise.all([
        axiosInstance.get('/appointments/myAppointments'),
        axiosInstance.get('/medical-record/'),
      ]);
      const appts = apptRes.data?.data?.appointments || apptRes.data?.data || [];
      const recordData = recordRes.data?.data?.records || recordRes.data?.data || [];
      setAppointments(appts);
      setRecords(recordData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async () => {
    try {
      setSaving(true);
      const medName = form.medicineName?.trim();
      await axiosInstance.post('/medical-record/', {
        appointmentId: form.appointmentId,
        diagnosis: form.diagnosis,
        symptoms: form.symptoms,
        prescriptions: medName ? [{ medicineName: medName, dosage: form.dosage?.trim() || '', frequency: form.frequency?.trim() || '', duration: form.duration?.trim() || '' }] : [],
        notes: form.notes,
      });
      setSnackbar({ open: true, message: 'Record created successfully', severity: 'success' });
      setOpenDialog(false);
      resetForm();
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to create record', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ appointmentId: '', diagnosis: '', medicineName: '', dosage: '', frequency: '', duration: '', notes: '', symptoms: '' });
  };

  const completedAppts = appointments.filter(a => a.status === 'completed' || a.status === 'in-progress');

  if (loading) {
    return (
      <DoctorLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <CircularProgress sx={{ color: brandColor }} />
          </Box>
        </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#0F172A' }}>
              Medical Records
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 15 }}>
              Manage patient medical records and prescriptions.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}
            sx={{ borderRadius: 3, fontWeight: 700, px: 2.5, background: brandColor, color: 'white' }}>
            New Record
          </Button>
        </Box>

        {records.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, background: 'white', borderRadius: 4, border: '1px solid #F1F5F9' }}>
            <DescriptionIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ color: '#94A3B8', fontSize: 15, mb: 2 }}>No medical records yet.</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}
              sx={{ borderRadius: 3, background: brandColor, color: 'white' }}>
              Create First Record
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
              {records.map((record, i) => {
                const patientName = record.patientId?.userId?.firstName || record.patientId?.firstName || 'Patient';
                const initials = (record.patientId?.userId?.firstName?.[0] || record.patientId?.firstName?.[0] || 'P').toUpperCase();
                const rxText = record.prescriptions?.[0]?.medicineName || '';
                return (
                <Grid size={12} key={record._id || i}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #F1F5F9' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Avatar sx={{ width: 44, height: 44, borderRadius: 2, background: brandColor, fontSize: 16 }}>
                          {initials}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 180 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                            {patientName} - {record.diagnosis || 'Diagnosis'}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: '#64748B' }}>
                            {record.createdAt && new Date(record.createdAt).toLocaleDateString('en', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {rxText && (
                            <Chip label={`Rx: ${rxText}`} size="small"
                              sx={{ background: '#F0FDF4', color: '#15803D', fontWeight: 600, fontSize: 11, maxWidth: 200 }} />
                          )}
                          <IconButton size="small" onClick={e => {
                            setSelectedRecord(record);
                            setAnchorEl(e.currentTarget);
                          }} sx={{ color: '#94A3B8' }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      {record.notes && (
                        <Typography sx={{ fontSize: 13, color: '#64748B', mt: 1.5, pl: 7 }}>
                          {record.notes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )})}
          </Grid>
        )}
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { borderRadius: 2.5, minWidth: 160 } } }}>
        <MenuItem onClick={() => { setOpenViewDialog(true); setAnchorEl(null); }} sx={{ fontSize: 14, gap: 1 }}>
          <AssignmentIcon sx={{ fontSize: 18, color: brandColor }} /> View Details
        </MenuItem>
        {selectedRecord?._id && (
          <MenuItem onClick={() => {
            setAnchorEl(null);
            const w = window.open('', '_blank');
            if (!w) return;
            w.document.write(`<!DOCTYPE html><html><head><title>Medical Record</title><style>
              body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#333}
              h1{color:#0d9488;border-bottom:2px solid #eee;padding-bottom:10px}
              h3{color:#0d9488;margin-top:24px}
              .label{font-weight:700;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}
              .value{margin:4px 0 16px;font-size:15px}
              table{width:100%;border-collapse:collapse;margin:12px 0}
              th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #eee}
              th{background:#f8fafc;font-weight:600}@media print{body{margin:0}}
            </style></head><body>
              <h1>Medical Record</h1>
              <div class="label">Patient</div>
              <div class="value">${selectedRecord.patientId?.userId?.firstName || selectedRecord.patientId?.firstName || ''} ${selectedRecord.patientId?.userId?.lastName || selectedRecord.patientId?.lastName || ''}</div>
              <div class="label">Date</div>
              <div class="value">${selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric'}) : ''}</div>
              <div class="label">Diagnosis</div>
              <div class="value">${selectedRecord.diagnosis || 'N/A'}</div>
              <div class="label">Symptoms</div>
              <div class="value">${selectedRecord.symptoms || 'N/A'}</div>
              ${(selectedRecord.prescriptions?.length || 0) > 0 ? `<h3>Prescriptions</h3><table><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>${selectedRecord.prescriptions.map(p => `<tr><td>${p.medicineName||''}</td><td>${p.dosage||''}</td><td>${p.frequency||''}</td><td>${p.duration||''}</td></tr>`).join('')}</table>` : ''}
              ${selectedRecord.notes ? `<div class="label">Notes</div><div class="value">${selectedRecord.notes}</div>` : ''}
              <p style="margin-top:40px;color:#999;font-size:12px;border-top:1px solid #eee;padding-top:12px">Generated from Teryaq Healthcare System</p>
            </body></html>`);
            w.document.close();
            setTimeout(() => { w.print(); }, 500);
          }} sx={{ fontSize: 14, gap: 1 }}>
            <DownloadIcon sx={{ fontSize: 18, color: brandColor }} /> Print / PDF
          </MenuItem>
        )}
      </Menu>

      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Medical Record</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField fullWidth select label="Appointment"  value={form.appointmentId}
              onChange={e => setForm(f => ({ ...f, appointmentId: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true }, select: { native: true } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
              <option value="">Select an appointment</option>
              {completedAppts.map(a => {
                const apptId = a.id || a._id;
                const patientName = a.patientId?.userId?.firstName || a.patientId?.firstName || 'Patient';
                const apptDate = a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : '';
                return (
                  <option key={apptId} value={apptId}>
                    {patientName}{apptDate ? ` - ${apptDate}` : ''}
                  </option>
                );
              })}
            </TextField>
            <TextField fullWidth label="Diagnosis" value={form.diagnosis}
              onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth label="Symptoms" value={form.symptoms} multiline rows={2}
              onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0F172A', mt: 1 }}>Prescription</Typography>
            <TextField fullWidth label="Medicine Name" value={form.medicineName}
              onChange={e => setForm(f => ({ ...f, medicineName: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <Grid container spacing={1.5}>
              <Grid size={4}>
                <TextField fullWidth label="Dosage" value={form.dosage} placeholder="e.g. 500mg"
                  onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
              <Grid size={4}>
                <TextField fullWidth label="Frequency" value={form.frequency} placeholder="e.g. 3x daily"
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
              <Grid size={4}>
                <TextField fullWidth label="Duration" value={form.duration} placeholder="e.g. 7 days"
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
            </Grid>
            <TextField fullWidth label="Additional Notes" value={form.notes} multiline rows={2}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }} sx={{ borderRadius: 2, color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" disabled={saving || !form.appointmentId || !form.diagnosis}
            onClick={handleCreateRecord}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700, background: brandColor, color: 'white' }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Create Record'}
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

      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Patient</Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{selectedRecord?.patientId?.userId?.firstName || selectedRecord?.patientId?.firstName || ''} {selectedRecord?.patientId?.userId?.lastName || selectedRecord?.patientId?.lastName || ''}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</Typography>
              <Typography sx={{ fontSize: 15 }}>{selectedRecord?.createdAt ? new Date(selectedRecord.createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Diagnosis</Typography>
              <Typography sx={{ fontSize: 15 }}>{selectedRecord?.diagnosis || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Symptoms</Typography>
              <Typography sx={{ fontSize: 15 }}>{selectedRecord?.symptoms || 'N/A'}</Typography>
            </Box>
            {(selectedRecord?.prescriptions?.length || 0) > 0 && (
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>Prescriptions</Typography>
                {selectedRecord.prescriptions.map((p, i) => (
                  <Box key={i} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 1, border: '1px solid #F1F5F9' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{p.medicineName}</Typography>
                    <Typography sx={{ fontSize: 13, color: '#64748B' }}>{p.dosage} | {p.frequency} | {p.duration}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            {selectedRecord?.notes && (
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</Typography>
                <Typography sx={{ fontSize: 15 }}>{selectedRecord.notes}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenViewDialog(false)} sx={{ borderRadius: 2, color: '#64748B' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </DoctorLayout>
  );
}
