import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const steps = [
  { number: '01', title: 'Search for a Doctor', desc: 'Browse by specialty, location, or rating to find your ideal match.' },
  { number: '02', title: 'Book an Appointment', desc: 'Choose a convenient time slot and book instantly with no hassle.' },
  { number: '03', title: 'Get Care', desc: 'Visit your doctor in person or via video call and receive quality care.' },
];

const HowItWorksSection = () => (
  <Container maxWidth="lg" sx={{ py: 8 }}>
    <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
      How It Works
    </Typography>
    <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
      Getting started is easy
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
      {steps.map((step) => (
        <Box
          key={step.number}
          sx={{
            flex: '1 1 280px',
            maxWidth: 340,
            textAlign: 'center',
            p: 3,
          }}
        >
          <Typography
            variant="h3"
            sx={{ color: '#0d9488', fontWeight: 800, mb: 2 }}
          >
            {step.number}
          </Typography>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {step.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {step.desc}
          </Typography>
        </Box>
      ))}
    </Box>
  </Container>
);

export default HowItWorksSection;
