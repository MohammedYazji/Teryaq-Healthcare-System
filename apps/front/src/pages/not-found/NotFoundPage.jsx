import React from 'react';
import { Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
      <Paper sx={{ p: 6, borderRadius: 3 }}>
        <Typography variant="h1" fontWeight={800} sx={{ fontSize: 80, color: '#CBD5E1' }}>404</Typography>
        <Typography variant="h5" fontWeight={700} gutterBottom>Page Not Found</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}
          sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}>
          Go Home
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;
