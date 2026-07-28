import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.patch(`/auth/resetPassword/${token}`, { newPassword: form.newPassword });
      setMessage(res.data.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', py: 4 }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ textAlign: 'center' }}>
            Reset Password
          </Typography>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!message && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField fullWidth label="New Password" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required sx={{ mb: 2 }} />
              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' }, py: 1.5 }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
