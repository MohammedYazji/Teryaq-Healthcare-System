import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

const ChatPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Chat
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chat functionality will be available soon.
        </Typography>
      </Paper>
    </Container>
  );
};

export default ChatPage;
