import React from 'react';
import {
  Box, Card, CardContent, CardMedia,
  Typography, Button, Stack, Chip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const DoctorCard = ({ doctor, navigate }) => {
  if (!doctor) return null;

  const doctorImage = doctor.image || doctor.profileImage || doctor.photo || '';
  const doctorId = doctor.id || doctor._id;
  const doctorName = doctor.name || 'Unknown';
  const doctorSpecialty = doctor.specialty || 'General';
  const doctorLocation = doctor.location || 'Available';
  const doctorAvailable = doctor.available ?? doctor.isAvailable ?? 'Available';
  const doctorFee = doctor.fee || doctor.consultationFee || 0;
  const doctorRating = doctor.rating || 0;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        position: 'relative',
        width: '100%',
        p: 3,
        transition: 'all 0.4s ease',
        textAlign: 'center',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: '0 15px 35px rgba(13,148,136,0.2)',
        },
      }}
    >
      <Box sx={{
        position: 'absolute', top: 15,
        right: 15,
        zIndex: 2,
      }}>
        <Chip
          icon={<StarIcon sx={{ color: '#FFB400 !important', fontSize: '14px' }} />}
          label={`${doctorRating}`}
          size="small"
          sx={{ bgcolor: 'white', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        />
      </Box>

      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        {doctorImage ? (
          <CardMedia
            component="img"
            image={doctorImage}
            alt={doctorName}
            sx={{
              width: 120, height: 120,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #f1f5f9',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 120, height: 120,
              borderRadius: '50%',
              bgcolor: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 40,
              fontWeight: 700,
              border: '4px solid #f1f5f9',
            }}
          >
            {doctorName[0]}
          </Box>
        )}
      </Box>

      <CardContent sx={{ px: 4, pb: 5, '&:last-child': { pb: 5 } }}>
        <Typography variant="h6" fontWeight="800" gutterBottom>
          {doctorName}
        </Typography>

        <Typography variant="subtitle2" color="#0d9488" sx={{
          mb: 2, fontWeight: 600, letterSpacing: 0.5,
        }}>
          {doctorSpecialty}
        </Typography>

        <Stack
          direction="row" spacing={2}
          alignItems="center"
          sx={{ color: 'text.secondary', mb: 3, justifyContent: 'center' }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LocationOnIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{doctorLocation}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <AccessTimeIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">
              {doctorAvailable}
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={2} alignItems="center">
          <Typography variant="h5" fontWeight="900" color="text.primary">
            ${doctorFee}
          </Typography>

          <Button
            variant="contained"
            fullWidth
            disableElevation
            onClick={() => navigate && navigate(`/doctors/${doctorId}`)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              color: 'white !important',
              fontWeight: 'bold',
              py: 1.2,
              background: '#0d9488',
              '&:hover': { background: '#0f766e' },
            }}
          >
            Book Appointment
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
