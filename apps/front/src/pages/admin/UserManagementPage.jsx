import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Typography, TextField, InputAdornment, Skeleton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
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

// Presentational only: brand-aligned status colors instead of MUI's
// default success/error chip palette. Doesn't touch u.active.
const statusStyles = {
  active: { bg: '#ECFDF5', fg: '#15803D', dot: '#16A34A' },
  inactive: { bg: '#FEF2F2', fg: '#B91C1C', dot: '#DC2626' },
  suspended: { bg: '#FEF2F2', fg: '#B91C1C', dot: '#DC2626' },
  pending: { bg: '#FFFBEB', fg: '#B45309', dot: '#D97706' },
};

// Presentational only: maps known roles to a color so the directory is
// scannable at a glance. Unknown roles fall back to neutral slate —
// nothing here assumes a role value that might not exist.
const roleStyles = {
  admin: { bg: '#EEF2FF', fg: '#4338CA' },
  doctor: { bg: '#F0FDFA', fg: colors.brandDark },
  patient: { bg: '#E0F2FE', fg: '#0369A1' },
};
const fallbackRole = { bg: '#F1F5F9', fg: colors.slate };

const initials = (first, last) => ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || '?';

const StatusDot = ({ status }) => {
  const key = status === 'active' ? 'active' : status === 'pending' ? 'pending' : 'inactive';
  const s = statusStyles[key] || statusStyles.inactive;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Inactive';
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.7, bgcolor: s.bg, color: s.fg, px: 1.1, py: 0.4, borderRadius: 99, fontSize: 11.5, fontWeight: 700 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot }} />
      {label}
    </Box>
  );
};

const RoleTag = ({ role }) => {
  const s = roleStyles[(role || '').toLowerCase()] || fallbackRole;
  return (
    <Box sx={{ display: 'inline-flex', bgcolor: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 700, px: 1.1, py: 0.4, borderRadius: 99, textTransform: 'capitalize' }}>
      {role || 'Unknown'}
    </Box>
  );
};

const UserRow = ({ u }) => {
  const roleColor = (roleStyles[(u.role || '').toLowerCase()] || fallbackRole).fg;
  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown';
  const photoUrl = u.photo ? (u.photo.startsWith('http') ? u.photo : `http://localhost:5000/${u.photo.replace(/\\/g, '/')}`) : null;
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap',
        bgcolor: 'white', borderRadius: 3, p: { xs: 2.2, sm: 2.5 }, mb: 1.5,
        border: '1px solid #EEF2F6',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 22px rgba(15,23,42,0.06)' },
      }}
    >
      {photoUrl ? (
        <Box sx={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
          <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
      ) : (
        <Box sx={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
          bgcolor: `${roleColor}14`, color: roleColor, fontWeight: 700, fontSize: 13.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', ...display,
        }}>
          {initials(u.firstName, u.lastName)}
        </Box>
      )}

      <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: colors.navy }}>{fullName}</Typography>
        <Typography sx={{ fontSize: 13, color: colors.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {u.email}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, ml: { sm: 'auto' } }}>
        <RoleTag role={u.role} />
        <StatusDot status={u.status} />
      </Box>
    </Box>
  );
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // --- unchanged data logic ---
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/admin/users');
        setUsers(res.data.data?.users || res.data.users || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

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

  // Client-side filter over the already-fetched list — no new API calls.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <AdminLayout>
      <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.brand, mb: 1 }}>
              Admin &middot; Directory
            </Typography>
            <Typography sx={{ ...display, fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.1rem' }, color: colors.navy, mb: 0.5 }}>
              User Management
            </Typography>
            {!loading && (
              <Typography sx={{ color: colors.slate, fontSize: 14.5 }}>
                {users.length} total {users.length === 1 ? 'user' : 'users'}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 3 }}>
            <TextField
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              sx={{ bgcolor: 'white', ...inputSx }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 19, color: colors.slateLight }} />
                  </InputAdornment>
                ),
              }}
            />
            {search && (
              <Button
                onClick={() => setSearch('')}
                sx={{ color: colors.slate, fontWeight: 600, textTransform: 'none', fontSize: 13.5, flexShrink: 0, '&:hover': { color: colors.brand, bgcolor: 'transparent' } }}
              >
                Clear
              </Button>
            )}
          </Box>

          {loading ? (
            <Box>
              {Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2.5, bgcolor: 'white', borderRadius: 3, p: 2.5, mb: 1.5, border: '1px solid #EEF2F6' }}>
                  <Skeleton variant="circular" width={42} height={42} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="35%" height={18} sx={{ mb: 0.4 }} />
                    <Skeleton width="55%" height={14} />
                  </Box>
                  <Skeleton variant="rounded" width={70} height={22} />
                  <Skeleton variant="rounded" width={70} height={22} />
                </Box>
              ))}
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #EEF2F6', p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <SearchOffIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1.5 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 15.5, color: colors.navy, mb: 0.5 }}>
                {users.length === 0 ? 'No users yet' : 'No matches found'}
              </Typography>
              <Typography sx={{ color: colors.slate, fontSize: 14 }}>
                {users.length === 0 ? 'Users will appear here once registered.' : 'Try a different name or email.'}
              </Typography>
            </Box>
          ) : (
            <Box>
              {filtered.map((u) => <UserRow key={u._id} u={u} />)}
            </Box>
          )}
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default UserManagementPage;