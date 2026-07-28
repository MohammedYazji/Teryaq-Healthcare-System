import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Divider } from '@mui/material';

const TeryaqLogo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ width: 32, height: 32, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <img
      src="/logo.png"
      alt="Teryaq"
      style={{ height: 40, width: 25, objectFit: 'cover', display: 'block' }}
    />
    </Box>
    <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, color: 'white' }}>Teryaq</span>
  </Box>
);

export default function Footer() {

  const linkStyle = {
    color: '#94A3B8', fontSize: 14, textDecoration: 'none', display: 'block', mb: 1.5,
    transition: 'color 0.2s',
    '&:hover': { color: '#38BDF8' },
  };

  return (
    <Box component="footer" sx={{ background: '#0F172A', color: 'white', pt: 6, pb: 3, mt: 'auto' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 4 } }}>
        <Grid container spacing={4} sx={{ mb: 4, justifyContent: 'space-between' }}>
          <Grid size={{ xs: 12, md: 4 }}>

            <TeryaqLogo />
            
            <Typography sx={{ color: '#94A3B8', fontSize: 14, mt: 2, lineHeight: 1.7, maxWidth: 280 }}>
              Your trusted healthcare platform. Connect with top doctors, book appointments, and manage your health journey.
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography sx={{ color: 'white', fontWeight: 600, mb: 2, fontSize: 15 }}>
              Platform
            </Typography>
            <Box component={Link} to="/doctors" sx={linkStyle}>Find Doctors</Box>
            <Box component={Link} to="/appointments" sx={linkStyle}>Appointments</Box>
            <Box component={Link} to="/" sx={linkStyle}>Pricing</Box>
          </Grid>

          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography sx={{ color: 'white', fontWeight: 600, mb: 2, fontSize: 15 }}>
              Support
            </Typography>
            <Box component="a" href="#" sx={linkStyle}>Help Center</Box>
            <Box component="a" href="#" sx={linkStyle}>Privacy Policy</Box>
            <Box component="a" href="#" sx={linkStyle}>Terms of Service</Box>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography sx={{ color: 'white', fontWeight: 600, mb: 2, fontSize: 15 }}>
              Contact
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: 14, mb: 1 }}>support@teryaq.com</Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: 14 }}>+1 (555) 123-4567</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: '#1E293B', mb: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography sx={{ color: '#64748B', fontSize: 13 }}>
            © 2026 Teryaq. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
