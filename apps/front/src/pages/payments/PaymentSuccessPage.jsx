import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from '../../api/axios';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [appointmentId, setAppointmentId] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setVerifying(false);
      setError('No session ID provided. Please contact support.');
      return;
    }
    axios.post('/payment/verify-session', { session_id: sessionId })
      .then((res) => {
        setAppointmentId(res.data?.appointment?._id || res.data?.appointment);
        setVerifying(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Could not verify payment. Please contact support.');
        setVerifying(false);
      });
  }, [searchParams]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
        {verifying ? (
          <>
            <CircularProgress size={64} sx={{ color: '#0d9488', mb: 2 }} />
            <Typography variant="h5" fontWeight={700}>Verifying payment...</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please wait while we confirm your transaction.
            </Typography>
          </>
        ) : error ? (
          <>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#DC2626' }}>
              Verification Failed
            </Typography>
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              {error}
            </Alert>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Your payment may still have gone through. Check your appointments to confirm.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/appointments')}
              sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, mr: 2 }}>
              View Appointments
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}
              sx={{ borderColor: '#0d9488', color: '#0d9488' }}>
              Go Home
            </Button>
          </>
        ) : (
          <>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#16a34a', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Your appointment has been confirmed and your payment was processed.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              You will receive a confirmation email with the appointment details.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/appointments')}
              sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, mr: 2 }}>
              View Appointments
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}
              sx={{ borderColor: '#0d9488', color: '#0d9488' }}>
              Go Home
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;
