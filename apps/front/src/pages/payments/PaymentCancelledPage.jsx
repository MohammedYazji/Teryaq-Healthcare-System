import React from 'react';
import { Container, Typography, Paper, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';

const PaymentCancelledPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
        <CancelIcon sx={{ fontSize: 80, color: '#dc2626', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Payment Cancelled
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Your payment was cancelled. No charges have been made.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          You can try booking again whenever you&apos;re ready, or browse other doctors.
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Button variant="contained" onClick={() => navigate('/booking')}
          sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' }, mr: 2 }}>
          Try Again
        </Button>
        <Button variant="outlined" onClick={() => navigate('/doctors')}
          sx={{ borderColor: '#0d9488', color: '#0d9488', mr: 2 }}>
          Browse Doctors
        </Button>
        <Button variant="text" onClick={() => navigate('/')}
          sx={{ color: '#64748b' }}>
          Go Home
        </Button>
      </Paper>
    </Container>
  );
};

export default PaymentCancelledPage;
