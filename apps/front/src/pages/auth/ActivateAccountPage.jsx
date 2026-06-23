import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const ActivateAccountPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activate = async () => {
      try {
        const res = await axios.get(`/auth/activate/${token}`);
        setMessage(res.data.message || 'Account activated successfully!');
        setStatus('success');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Activation failed.');
        setStatus('error');
      }
    };
    if (token) activate();
  }, [token]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', py: 4 }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Account Activation
          </Typography>
          {status === 'loading' && <CircularProgress sx={{ color: brandColor, my: 2 }} />}
          {status !== 'loading' && (
            <Alert severity={status === 'success' ? 'success' : 'error'} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          {status === 'success' && (
            <Typography variant="body2">
              <Link to="/login" style={{ color: brandColor }}>Go to Sign In</Link>
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ActivateAccountPage;
