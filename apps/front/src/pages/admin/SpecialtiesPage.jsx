import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, TextField, CircularProgress, IconButton, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import CategoryIcon from '@mui/icons-material/Category';
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

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: colors.brand },
    '&.Mui-focused fieldset': { borderColor: colors.brand },
  },
};

const SpecialtyChip = ({ s, confirming, deleting, onRequestDelete, onConfirmDelete, onCancel }) => (
  <Box
    sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      bgcolor: confirming ? '#FEF2F2' : 'white',
      border: confirming ? '1px solid #FCA5A5' : '1px solid #EEF2F6',
      borderRadius: 99, pl: 2, pr: 0.6, py: 0.6,
      transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
      opacity: deleting ? 0.6 : 1,
      '&:hover': confirming || deleting ? {} : { borderColor: colors.brand, transform: 'translateY(-1px)' },
    }}
  >
    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: confirming ? '#B91C1C' : colors.navy, whiteSpace: 'nowrap' }}>
      {confirming ? `Remove ${s.name}?` : s.name}
    </Typography>

    {deleting ? (
      <CircularProgress size={15} sx={{ color: '#DC2626', mx: 1 }} />
    ) : confirming ? (
      <Box sx={{ display: 'flex' }}>
        <IconButton size="small" onClick={() => onConfirmDelete(s._id)} sx={{ color: '#DC2626' }}>
          <CheckIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton size="small" onClick={onCancel} sx={{ color: colors.slate }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    ) : (
      <IconButton size="small" onClick={() => onRequestDelete(s._id)} sx={{ color: colors.slateLight, '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}>
        <CloseIcon sx={{ fontSize: 15 }} />
      </IconButton>
    )}
  </Box>
);

const SpecialtiesPage = () => {
  const [specialties, setSpecialties] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // --- unchanged data logic ---
  const fetchSpecialties = async () => {
    try {
      const res = await axios.get('/specializations');
      setSpecialties(res.data.data?.specializations || res.data.specializations || []);
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpecialties(); }, []);

  const handleAdd = async (e) => {
    e?.preventDefault?.();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await axios.post('/specializations', { name: name.trim() });
      setName('');
      await fetchSpecialties();
    } catch (err) {
      console.error('Failed to add', err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`/specializations/${id}`);
      await fetchSpecialties();
    } catch (err) {
      console.error('Failed to delete', err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
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

  return (
    <AdminLayout>
      <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.brand, mb: 1 }}>
              Admin &middot; Catalog
            </Typography>
            <Typography sx={{ ...display, fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.1rem' }, color: colors.navy, mb: 0.5 }}>
              Specialties
            </Typography>
            {!loading && (
              <Typography sx={{ color: colors.slate, fontSize: 14.5 }}>
                {specialties.length} {specialties.length === 1 ? 'specialty' : 'specialties'} available
              </Typography>
            )}
          </Box>

          <Box
            component="form"
            onSubmit={handleAdd}
            sx={{
              display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center',
              bgcolor: 'white', border: '1px solid #EEF2F6', borderRadius: 3,
              p: 2, mb: 4, boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
            }}
          >
            <TextField
              placeholder="e.g. Cardiology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              sx={{ flex: '1 1 220px', ...inputSx }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={adding || !name.trim()}
              sx={{ bgcolor: colors.brand, fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 3, py: 1, '&:hover': { bgcolor: colors.brandDark }, '&.Mui-disabled': { bgcolor: '#E2E8F0' } }}
            >
              {adding ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Add Specialty'}
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" width={90 + (i % 3) * 20} height={34} sx={{ borderRadius: 99 }} />
              ))}
            </Box>
          ) : specialties.length === 0 ? (
            <Box sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #EEF2F6', p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <CategoryIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1.5 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 15.5, color: colors.navy, mb: 0.5 }}>
                No specialties yet
              </Typography>
              <Typography sx={{ color: colors.slate, fontSize: 14 }}>
                Add one using the form above.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
              {specialties.map((s) => (
                <SpecialtyChip
                  key={s._id}
                  s={s}
                  confirming={confirmDeleteId === s._id}
                  deleting={deletingId === s._id}
                  onRequestDelete={setConfirmDeleteId}
                  onConfirmDelete={handleDelete}
                  onCancel={() => setConfirmDeleteId(null)}
                />
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default SpecialtiesPage;