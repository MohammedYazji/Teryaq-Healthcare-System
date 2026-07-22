import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Alert, Paper, Link as MuiLink,
  IconButton, InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, setLoading } from '../../store/slices/authSlice';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const PatientSignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    emergencyContact: '',
    emergencyContactPhone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    else if (form.firstName.trim().length < 2) errs.firstName = 'First name is too short';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    else if (form.lastName.trim().length < 2) errs.lastName = 'Last name is too short';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.passwordConfirm) errs.passwordConfirm = 'Please confirm your password';
    else if (form.password !== form.passwordConfirm) errs.passwordConfirm = 'Passwords do not match';
    if (!form.emergencyContact.trim()) errs.emergencyContact = 'Emergency contact email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emergencyContact)) errs.emergencyContact = 'Invalid email format';
    if (!form.emergencyContactPhone.trim()) errs.emergencyContactPhone = 'Emergency contact phone is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(setLoading(true));
    setApiError('');
    try {
      const res = await axios.post('/auth/signup', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        role: 'patient',
        patientInfo: {
          emergencyContact: form.emergencyContact.trim(),
          emergencyContactPhone: form.emergencyContactPhone.trim(),
        },
      });
      const { token, data } = res.data;
      localStorage.setItem('teryaq_token', token);
      dispatch(login(data.user));
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const inputSx = { mb: 2 };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <MuiLink component={Link} to="/register" sx={{ color: brandColor, textDecoration: 'none', fontWeight: 500 }}>
              &larr; Back
            </MuiLink>
          </Typography>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            Patient Sign Up
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Create your patient account
          </Typography>

          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="First Name" name="firstName"
              value={form.firstName} onChange={handleChange} required
              error={!!errors.firstName} helperText={errors.firstName}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Last Name" name="lastName"
              value={form.lastName} onChange={handleChange} required
              error={!!errors.lastName} helperText={errors.lastName}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Email" name="email" type="email"
              value={form.email} onChange={handleChange} required
              error={!!errors.email} helperText={errors.email}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Phone (optional)" name="phone"
              value={form.phone} onChange={handleChange}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Password" name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={handleChange} required
              error={!!errors.password} helperText={errors.password}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Confirm Password" name="passwordConfirm"
              type={showConfirm ? 'text' : 'password'}
              value={form.passwordConfirm} onChange={handleChange} required
              error={!!errors.passwordConfirm} helperText={errors.passwordConfirm}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />

            <Box sx={{ borderTop: '1px solid #E2E8F0', my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#334155' }}>
              Emergency Contact
            </Typography>

            <TextField
              fullWidth label="Emergency Contact Email" name="emergencyContact" type="email"
              value={form.emergencyContact} onChange={handleChange} required
              error={!!errors.emergencyContact} helperText={errors.emergencyContact}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Emergency Contact Phone" name="emergencyContactPhone"
              value={form.emergencyContactPhone} onChange={handleChange} required
              error={!!errors.emergencyContactPhone} helperText={errors.emergencyContactPhone}
              sx={inputSx}
            />
            <Button
              type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' }, py: 1.5 }}
            >
              {loading ? 'Creating account...' : 'Create Patient Account'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" sx={{ color: brandColor, fontWeight: 600 }}>
              Sign In
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PatientSignupPage;
