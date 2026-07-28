import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('/auth/forgotPassword', { email });
      setMessage(res.data.message || 'Check your email for reset instructions.');
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
            Forgot Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Enter your email and we'll send you reset instructions.
          </Typography>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }} />
            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' }, py: 1.5 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/login" style={{ color: brandColor }}>Back to Sign In</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
