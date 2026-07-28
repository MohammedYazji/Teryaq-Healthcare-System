import React from 'react';
import {
  Box, Container, Typography, Paper, Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const brandColor = '#0d9488';

const SignupChoicePage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 5, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ textAlign: 'center' }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            How would you like to join Teryaq?
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
              component={Link}
              to="/register/patient"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                p: 3,
                borderRadius: 3,
                border: '2px solid #E2E8F0',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: brandColor,
                  bgcolor: '#F0FDFA',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(13,148,136,0.15)',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: '#F0FDFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PersonIcon sx={{ fontSize: 28, color: brandColor }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  I'm a Patient
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Book appointments, consult doctors, and manage your health
                </Typography>
              </Box>
            </Box>

            <Box
              component={Link}
              to="/register/doctor"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                p: 3,
                borderRadius: 3,
                border: '2px solid #E2E8F0',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: brandColor,
                  bgcolor: '#F0FDFA',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(13,148,136,0.15)',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: '#F0FDFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LocalHospitalIcon sx={{ fontSize: 28, color: brandColor }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  I'm a Doctor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join our platform, manage patients, and grow your practice
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            Already have an account?{' '}
            <Typography
              component={Link}
              to="/login"
              variant="body2"
              sx={{ color: brandColor, fontWeight: 600, textDecoration: 'none' }}
            >
              Sign In
            </Typography>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupChoicePage;
