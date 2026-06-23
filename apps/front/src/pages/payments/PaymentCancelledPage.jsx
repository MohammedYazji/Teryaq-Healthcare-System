import React from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';

const brandColor = '#0d9488';

const PaymentCancelledPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
        <CancelIcon sx={{ fontSize: 72, color: '#dc2626', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Payment Cancelled
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Your payment was cancelled. You can try booking again whenever you're ready.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/booking')}
          sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' }, mr: 2 }}
        >
          Try Again
        </Button>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ borderColor: brandColor, color: brandColor }}>
          Go Home
        </Button>
      </Paper>
    </Container>
  );
};

export default PaymentCancelledPage;
