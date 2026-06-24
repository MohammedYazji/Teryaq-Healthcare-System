import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Avatar, Chip,
  TextField, Button, CircularProgress, Alert, Snackbar, IconButton, Stack, Paper,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import DoctorLayout from './DoctorPanelLayout';
import axiosInstance from '../../api/axios';

const brand = '#0d9488';
const brandDark = '#0f766e';
const brandLight = 'rgba(13,148,136,0.08)';
const ink = '#0F172A';
const sub = '#64748B';
const muted = '#94A3B8';
const border = '#F1F5F9';

export default function DoctorProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const photoInputRef = useRef(null);
  const docsInputRef = useRef(null);

  const [form, setForm] = useState({
    degree: '',
    experienceYears: '',
    consultationFee: '',
    bio: '',
    qualifications: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/doctors/me');
      const data = res.data?.data?.profile || res.data?.data;
      setProfile(data);
      setForm({
        degree: data.degree || '',
        experienceYears: data.experienceYears || '',
        consultationFee: data.consultationFee || '',
        bio: data.bio || '',
        qualifications: data.qualifications?.join(', ') || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.patch('/doctors/updateMe', {
        degree: form.degree,
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
        bio: form.bio,
        qualifications: form.qualifications
          ? form.qualifications.split(',').map(q => q.trim()).filter(Boolean)
          : [],
      });
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to update profile', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('photo', file);
      const res = await axiosInstance.patch('/users/updateMe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = res.data?.data?.user;
      if (updatedUser) {
        dispatch(updateUser({ photo: updatedUser.photo }));
      }
      setSnackbar({ open: true, message: 'Profile photo updated!', severity: 'success' });
      fetchProfile();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to upload photo', severity: 'error' });
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDocsUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingDocs(true);
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('documents', f));
      await axiosInstance.patch('/doctors/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSnackbar({ open: true, message: 'Documents uploaded! Awaiting admin review.', severity: 'success' });
      fetchProfile();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to upload documents', severity: 'error' });
    } finally {
      setUploadingDocs(false);
      e.target.value = '';
    }
  };

  const userPhoto = user?.photo && user.photo !== 'default.jpg' ? user.photo : null;

  if (loading) {
    return (
      <DoctorLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress sx={{ color: brand }} />
        </Box>
      </DoctorLayout>
    );
  }

  const fieldLabelSx = { fontSize: 12, color: muted, fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.4 };
  const textFieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2.5 } };

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
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: ink, letterSpacing: '-0.02em' }}>
                My Profile
              </Typography>
              <Typography variant="body2" sx={{ color: sub }}>
                View and manage your professional information
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={editing ? (saving ? null : <SaveIcon />) : <EditIcon />}
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              sx={{
                bgcolor: editing ? brand : brand,
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
              {editing ? (saving ? <CircularProgress size={18} color="inherit" /> : 'Save changes') : 'Edit profile'}
            </Button>
          </Box>

          {/* MAIN BENTO GRID */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1.7fr' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {/* LEFT COLUMN */}
            <Stack spacing={2}>
              {/* Identity card */}
              <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, overflow: 'hidden' }}>
                <Box sx={{ height: 72, background: `linear-gradient(135deg, ${brand} 0%, #0891b2 100%)` }} />
                <Box sx={{ px: 3, pb: 3, mt: -5, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={userPhoto}
                      sx={{
                        width: 88, height: 88, mx: 'auto', mb: 1,
                        bgcolor: brand, fontSize: 30, fontWeight: 800,
                        border: '4px solid white', boxShadow: '0 4px 14px rgba(13,148,136,0.3)',
                        cursor: 'pointer',
                      }}
                      onClick={() => photoInputRef.current?.click()}
                    >
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Avatar>
                    <IconButton
                      onClick={() => photoInputRef.current?.click()}
                      sx={{
                        position: 'absolute', bottom: 8, right: -4,
                        width: 32, height: 32, bgcolor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: brandLight },
                      }}
                    >
                      {uploadingPhoto ? <CircularProgress size={16} /> : <CameraAltIcon sx={{ fontSize: 16, color: brand }} />}
                    </IconButton>
                    <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                  </Box>

                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: ink, mb: 0.5 }}>
                    Dr. {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography sx={{ color: brand, fontWeight: 600, fontSize: 13, mb: 2 }}>
                    {profile?.specialization?.name || 'Specialist'}
                  </Typography>

                  <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 2.5 }}>
                    <Chip
                      icon={<StarIcon sx={{ fontSize: 14 }} />}
                      label={profile?.averageRating?.toFixed(1) || '0.0'}
                      size="small"
                      sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700 }}
                    />
                    <Chip
                      label={`${profile?.numberOfReviews || 0} reviews`}
                      size="small"
                      sx={{ bgcolor: '#f1f5f9', color: sub, fontWeight: 600 }}
                    />
                  </Stack>

                  <Stack spacing={1.25} sx={{ textAlign: 'left', pt: 2, borderTop: `1px solid ${border}` }}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <EmailIcon sx={{ fontSize: 16, color: muted }} />
                      <Typography sx={{ fontSize: 13, color: sub }} noWrap>{user?.email}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <PhoneIcon sx={{ fontSize: 16, color: muted }} />
                      <Typography sx={{ fontSize: 13, color: sub }}>
                        {user?.phone || 'Not set'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Paper>

              {/* Verification documents */}
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${border}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, color: ink, mb: 1 }}>
                  Verification Documents
                </Typography>
                <Typography sx={{ fontSize: 13, color: sub, mb: 2 }}>
                  Upload your medical certificates and licenses for admin verification.
                </Typography>

                {profile?.documents?.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                    {profile.documents.map((doc, i) => (
                      <Chip
                        key={i}
                        icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                        label={`Doc ${i + 1}`}
                        size="small"
                        sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 600 }}
                      />
                    ))}
                  </Stack>
                )}

                <input ref={docsInputRef} type="file" accept="image/*" multiple hidden onChange={handleDocsUpload} />
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={uploadingDocs ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                  onClick={() => docsInputRef.current?.click()}
                  disabled={uploadingDocs}
                  sx={{
                    borderRadius: 2.5, py: 1.1, borderColor: brand,
                    color: brand, fontWeight: 600, textTransform: 'none',
                    '&:hover': { borderColor: brandDark, bgcolor: brandLight },
                  }}
                >
                  {uploadingDocs ? 'Uploading…' : 'Upload documents'}
                </Button>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${border}` }}
                >
                  <Chip
                    label={profile?.isVerified ? 'Verified' : 'Pending verification'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: profile?.isVerified ? '#F0FDF4' : '#FFFBEB',
                      color: profile?.isVerified ? '#15803D' : '#D97706',
                    }}
                  />
                  <Typography sx={{ fontSize: 12, color: sub, flex: 1 }}>
                    {profile?.isVerified
                      ? 'Your profile is visible to patients.'
                      : 'Upload documents above to get verified.'}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>

            {/* RIGHT COLUMN — professional information */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: `1px solid ${border}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: ink, mb: 2.5 }}>
                Professional Information
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                }}
              >
                <Box>
                  {editing ? (
                    <TextField
                      fullWidth label="Degree" value={form.degree}
                      onChange={e => setForm(f => ({ ...f, degree: e.target.value }))}
                      sx={textFieldSx}
                    />
                  ) : (
                    <Box>
                      <Typography sx={fieldLabelSx}>Degree</Typography>
                      <Typography sx={{ fontSize: 14, color: ink, fontWeight: 600 }}>{profile?.degree || 'Not set'}</Typography>
                    </Box>
                  )}
                </Box>

                <Box>
                  {editing ? (
                    <TextField
                      fullWidth label="Years of Experience" type="number" value={form.experienceYears}
                      onChange={e => setForm(f => ({ ...f, experienceYears: e.target.value }))}
                      inputProps={{ min: 0 }}
                      sx={textFieldSx}
                    />
                  ) : (
                    <Box>
                      <Typography sx={fieldLabelSx}>Experience</Typography>
                      <Typography sx={{ fontSize: 14, color: ink, fontWeight: 600 }}>{profile?.experienceYears || 0} years</Typography>
                    </Box>
                  )}
                </Box>

                <Box>
                  {editing ? (
                    <TextField
                      fullWidth label="Consultation Fee ($)" type="number" value={form.consultationFee}
                      onChange={e => setForm(f => ({ ...f, consultationFee: e.target.value }))}
                      inputProps={{ min: 0 }}
                      sx={textFieldSx}
                    />
                  ) : (
                    <Box>
                      <Typography sx={fieldLabelSx}>Consultation Fee</Typography>
                      <Typography sx={{ fontSize: 14, color: ink, fontWeight: 600 }}>${profile?.consultationFee || 0}</Typography>
                    </Box>
                  )}
                </Box>

                <Box>
                  {editing ? (
                    <TextField
                      fullWidth label="Qualifications (comma separated)" value={form.qualifications}
                      onChange={e => setForm(f => ({ ...f, qualifications: e.target.value }))}
                      helperText="Separate multiple qualifications with commas"
                      sx={textFieldSx}
                    />
                  ) : (
                    <Box>
                      <Typography sx={fieldLabelSx}>Qualifications</Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.6}>
                        {profile?.qualifications?.length > 0
                          ? profile.qualifications.map((q, i) => (
                            <Chip
                              key={i} label={q} size="small"
                              sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 600, fontSize: 11 }}
                            />
                          ))
                          : <Typography sx={{ fontSize: 14, color: muted }}>Not set</Typography>
                        }
                      </Stack>
                    </Box>
                  )}
                </Box>

                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  {editing ? (
                    <TextField
                      fullWidth label="Bio" multiline rows={4} value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      sx={textFieldSx}
                    />
                  ) : (
                    <Box>
                      <Typography sx={fieldLabelSx}>Bio</Typography>
                      <Typography sx={{ fontSize: 14, color: sub, lineHeight: 1.6 }}>
                        {profile?.bio || 'No bio provided.'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: 2.5, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DoctorLayout>
  );
}