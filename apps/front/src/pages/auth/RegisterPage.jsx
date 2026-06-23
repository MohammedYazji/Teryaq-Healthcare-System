import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Alert, Paper, Link as MuiLink,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, setLoading } from '../../store/slices/authSlice';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    setError('');
    try {
      const res = await axios.post('/auth/signup', form);
      const { token, data } = res.data;
      localStorage.setItem('teryaq_token', token);
      dispatch(login(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

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
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Join us and start your health journey
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} required sx={{ mb: 2 }} />
            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' }, py: 1.5 }}>
              {loading ? 'Creating account...' : 'Sign Up'}
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

export default RegisterPage;
