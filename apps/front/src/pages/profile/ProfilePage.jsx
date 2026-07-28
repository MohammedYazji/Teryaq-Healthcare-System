import React, { useState, useRef } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button, Avatar, Alert, CircularProgress, Divider, IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import axios from '../../api/axios';
import Layout from '../../components/layout/Layout';

const brandColor = '#0d9488';

const ProfilePage = () => {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const fileRef = useRef(null);

  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User';

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      fd.append('firstName', form.firstName);
      fd.append('lastName', form.lastName);
      fd.append('email', form.email);
      if (photoFile) fd.append('photo', photoFile);

      const res = await axios.patch('/users/updateMe', fd);
      dispatch(updateUser(res.data.data?.user || res.data.user));
      setSuccess('Profile updated successfully!');
      setPhotoFile(null);
      setPhotoPreview(null);
      setTimeout(() => setEditing(false), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '' });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditing(false);
    setError('');
  };

  const currentPhoto = photoPreview || user?.photo || '';

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5">Please sign in to view your profile</Typography>
      </Box>
    );
  }

  return (
    <Layout>
      <Box sx={{ bgcolor: brandColor, pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 8 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={currentPhoto || undefined}
              sx={{
                width: 100, height: 100, mx: 'auto', mb: 2,
                bgcolor: currentPhoto ? 'transparent' : 'rgba(255,255,255,0.2)',
                color: 'white', fontSize: 40, fontWeight: 700,
                border: '4px solid rgba(255,255,255,0.4)',
              }}
            >
              {!currentPhoto && (fullName[0]?.toUpperCase() || 'U')}
            </Avatar>
            {editing && (
              <IconButton
                onClick={() => fileRef.current?.click()}
                sx={{
                  position: 'absolute', bottom: 4, right: 4,
                  bgcolor: 'white', width: 32, height: 32,
                  '&:hover': { bgcolor: '#f1f5f9' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
                size="small"
              >
                <PhotoCameraIcon sx={{ fontSize: 18, color: brandColor }} />
              </IconButton>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />
          </Box>
          <Typography variant="h4" fontWeight={800} color="white">
            {fullName}
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)">
            {user?.email}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: { xs: -4, md: -6 }, pb: 6 }}>
        <Paper sx={{ borderRadius: 3, p: { xs: 3, md: 4 } }}>
          {!editing ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Profile Information</Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => { setEditing(true); setSuccess(''); }}
                  sx={{
                    borderColor: brandColor, color: brandColor,
                    textTransform: 'none', borderRadius: 2,
                    '&:hover': { borderColor: '#0f766e', bgcolor: 'rgba(13,148,136,0.04)' },
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Full Name</Typography>
                  <Typography variant="body1">{fullName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Email</Typography>
                  <Typography variant="body1">{user?.email || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Phone</Typography>
                  <Typography variant="body1">{user?.phone || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Role</Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{user?.role || '—'}</Typography>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <IconButton onClick={handleCancel} size="small"><ArrowBackIcon /></IconButton>
                <Typography variant="h6" fontWeight={700}>Edit Profile</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField fullWidth label="First Name" name="firstName" value={form.firstName} onChange={handleChange} sx={{ mb: 2.5 }} />
                <TextField fullWidth label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} sx={{ mb: 2.5 }} />
                <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} sx={{ mb: 2.5 }} />
                <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button type="submit" fullWidth variant="contained" disabled={saving} sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' }, py: 1.5, borderRadius: 2 }}>
                    {saving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Changes'}
                  </Button>
                  <Button fullWidth variant="outlined" onClick={handleCancel} disabled={saving} sx={{ borderRadius: 2, py: 1.5 }}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};

export default ProfilePage;
