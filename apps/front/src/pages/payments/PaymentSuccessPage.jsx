import React from 'react';
import { Container, Typography, Paper, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#DC2626' }}>
            Invalid Payment Link
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            No session ID found. Please contact support.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/appointments')}
            sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, mr: 2 }}>
            View Appointments
          </Button>
          <Button variant="outlined" onClick={() => navigate('/')}
            sx={{ borderColor: '#0d9488', color: '#0d9488' }}>
            Go Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
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
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;
