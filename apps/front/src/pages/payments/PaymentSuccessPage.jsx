import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setVerifying(false);
      setError('No session ID found.');
      return;
    }
    axios.post('/payment/verify-session', { session_id: sessionId })
      .then(() => setVerifying(false))
      .catch((err) => {
        setError(err?.response?.data?.message || 'Verification failed.');
        setVerifying(false);
      });
  }, [searchParams]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
        {verifying ? (
          <>
            <CircularProgress size={64} sx={{ color: brandColor, mb: 2 }} />
            <Typography variant="h5" fontWeight={700}>Verifying payment...</Typography>
          </>
        ) : error ? (
          <>
            <CancelIcon sx={{ fontSize: 72, color: '#DC2626', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>Verification Failed</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{error}</Typography>
            <Button variant="contained" onClick={() => navigate('/appointments')}
              sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' } }}>
              View Appointments
            </Button>
          </>
        ) : (
          <>
            <CheckCircleIcon sx={{ fontSize: 72, color: '#16a34a', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Your appointment has been confirmed.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/appointments')}
              sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' }, mr: 2 }}
            >
              View Appointments
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')} sx={{ borderColor: brandColor, color: brandColor }}>
              Go Home
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;
