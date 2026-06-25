import React, { useState } from 'react';
import { Container, Typography, Paper, Box, TextField, IconButton, Avatar, Badge, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const brandColor = '#0d9488';

const ChatPage = () => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', minHeight: '70vh', display: 'flex' }}>
        <Box sx={{ width: 320, borderRight: '1px solid', borderColor: 'divider', display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700}>Messages</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              No conversations yet.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton sx={{ display: { md: 'none' } }}><ArrowBackIcon /></IconButton>
            <Avatar sx={{ bgcolor: brandColor }}>D</Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Doctor Name</Typography>
              <Typography variant="caption" color="text.secondary">Online</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Select a conversation to start messaging.
            </Typography>
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
            <TextField fullWidth size="small" placeholder="Type a message..."
              value={message} onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
            <IconButton onClick={handleSend} sx={{ bgcolor: brandColor, color: '#fff', '&:hover': { bgcolor: '#0f766e' } }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatPage;
