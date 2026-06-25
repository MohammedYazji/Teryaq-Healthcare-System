import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import axios from '../../api/axios';
import AdminLayout from './AdminPanelLayout';

const colors = {
  navy: '#0F172A',
  brand: '#0d9488',
  brandDark: '#0f766e',
  slate: '#64748B',
  slateLight: '#94A3B8',
  bg: '#F8FAFC',
};

const display = { fontFamily: '"Sora", "Helvetica Neue", Arial, sans-serif' };

// Presentational only: brand-aligned status colors instead of MUI's
// default success/warning chip palette. Doesn't touch doc.isVerified.
const statusStyles = {
  verified: { bg: '#ECFDF5', fg: '#15803D', dot: '#16A34A' },
  pending: { bg: '#FEF9C3', fg: '#A16207', dot: '#CA8A04' },
};

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'DR';

const StatusChip = ({ verified }) => {
  const s = verified ? statusStyles.verified : statusStyles.pending;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.7, bgcolor: s.bg, color: s.fg, px: 1.2, py: 0.45, borderRadius: 99, fontSize: 11.5, fontWeight: 700, textTransform: 'capitalize' }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot }} />
      {verified ? 'Verified' : 'Pending'}
    </Box>
  );
};

const DoctorRow = ({ doc, onApprove, onReject, busy }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap',
      bgcolor: 'white', borderRadius: 3, p: { xs: 2.5, sm: 3 }, mb: 2,
      border: '1px solid #EEF2F6',
      boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
      opacity: busy ? 0.6 : 1,
      pointerEvents: busy ? 'none' : 'auto',
      transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.15s',
      '&:hover': busy ? {} : { transform: 'translateY(-2px)', boxShadow: '0 10px 26px rgba(15,23,42,0.07)' },
    }}
  >
    <Box sx={{
      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
      bgcolor: '#F0FDFA', color: colors.brand, fontWeight: 700, fontSize: 15,
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...display,
    }}>
      {initials(doc.name)}
    </Box>

    <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', mb: 0.3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15.5, color: colors.navy }}>{doc.name}</Typography>
        <StatusChip verified={doc.isVerified} />
      </Box>
      <Typography sx={{ fontSize: 13, color: colors.slate, mb: 0.6 }}>{doc.email}</Typography>
      {doc.specialty && (
        <Box sx={{ display: 'inline-flex', bgcolor: '#F1F5F9', color: colors.slate, fontSize: 11.5, fontWeight: 600, px: 1, py: 0.35, borderRadius: 1.5 }}>
          {doc.specialty}
        </Box>
      )}
    </Box>

    {!doc.isVerified && (
      <Box sx={{ display: 'flex', gap: 1.2, flexShrink: 0, ml: { sm: 'auto' } }}>
        {busy ? (
          <CircularProgress size={22} sx={{ color: colors.brand, mx: 2 }} />
        ) : (
          <>
            <Button
              size="small"
              variant="contained"
              onClick={() => onApprove(doc._id)}
              sx={{ bgcolor: colors.brand, fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 2.2, '&:hover': { bgcolor: colors.brandDark } }}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onReject(doc._id)}
              sx={{ borderColor: '#E2E8F0', color: colors.slate, fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 2.2, '&:hover': { borderColor: '#DC2626', color: '#DC2626', bgcolor: '#FEF2F2' } }}
            >
              Reject
            </Button>
          </>
        )}
      </Box>
    )}
  </Box>
);

const DoctorApprovalsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // --- unchanged data logic ---
  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/admin/pending-doctors');
      setDoctors(res.data.data?.doctors || res.data.doctors || []);
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleApproval = async (id, isVerified) => {
    setProcessingId(id);
    try {
      await axios.patch(`/admin/verify-doctor/${id}`, { isVerified });
      await fetchDoctors();
    } catch (err) {
      console.error('Failed to update', err);
    } finally {
      setProcessingId(null);
    }
  };

  // Same shared font-loading pattern used across the redesigned pages.
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

  const pendingCount = doctors.filter((d) => !d.isVerified).length;

  return (
    <AdminLayout>
      <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.brand, mb: 1 }}>
              Admin &middot; Review Queue
            </Typography>
            <Typography sx={{ ...display, fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.1rem' }, color: colors.navy, mb: 0.5 }}>
              Doctor Approvals
            </Typography>
            {!loading && (
              <Typography sx={{ color: colors.slate, fontSize: 14.5 }}>
                {pendingCount === 0 ? 'Nothing waiting on you right now.' : `${pendingCount} ${pendingCount === 1 ? 'doctor needs' : 'doctors need'} your review.`}
              </Typography>
            )}
          </Box>

          {loading ? (
            <Box textAlign="center" py={8}>
              <CircularProgress sx={{ color: colors.brand }} />
            </Box>
          ) : doctors.length === 0 ? (
            <Box sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #EEF2F6', p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 30, color: '#16A34A' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: colors.navy, mb: 0.5 }}>
                All caught up
              </Typography>
              <Typography sx={{ color: colors.slate, fontSize: 14 }}>
                No doctor applications are waiting on review.
              </Typography>
            </Box>
          ) : (
            <Box>
              {doctors.map((doc) => (
                <DoctorRow
                  key={doc._id}
                  doc={doc}
                  busy={processingId === doc._id}
                  onApprove={(id) => handleApproval(id, true)}
                  onReject={(id) => handleApproval(id, false)}
                />
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default DoctorApprovalsPage;