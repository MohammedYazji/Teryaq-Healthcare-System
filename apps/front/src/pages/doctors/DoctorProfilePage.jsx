import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Avatar, Button, Grid, Chip, CircularProgress, Paper, Rating,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`/doctors/${id}`);
        const raw = res.data.data?.doctor || res.data.doctor || res.data;
        if (raw) {
          raw.name = raw.userId ? `${raw.userId.firstName || ''} ${raw.userId.lastName || ''}`.trim() : 'Doctor';
          raw.image = raw.userId?.photo || '';
          raw.specialty = raw.specialization?.name || 'General';
          raw.rating = raw.averageRating || 0;
          raw.numReviews = raw.numberOfReviews || 0;
          raw.fee = raw.consultationFee || 0;
          raw.experience = raw.experienceYears || 0;
          raw.education = raw.degree || '';
        }
        setDoctor(raw);
      } catch (err) {
        console.error('Failed to fetch doctor', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <CircularProgress sx={{ color: brandColor }} />
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Doctor not found</Typography>
      </Container>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3} textAlign="center">
              <Avatar src={doctor.image} sx={{ width: 120, height: 120, mx: 'auto', bgcolor: brandColor }}>
                {doctor.name?.[0]}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="h4" fontWeight={700}>{doctor.name}</Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {doctor.specialty}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Rating value={doctor.rating || 0} readOnly />
                <Typography variant="body2">({doctor.numReviews || 0} reviews)</Typography>
              </Box>
              <Chip label={doctor.isVerified ? 'Verified' : 'Pending'} color={doctor.isVerified ? 'success' : 'warning'} />
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
            About
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {doctor.bio || 'No bio available.'}
          </Typography>

          {doctor.education && (
            <>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Education</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{doctor.education}</Typography>
            </>
          )}

          {doctor.experience && (
            <>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Experience</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{doctor.experience} years</Typography>
            </>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                if (!isAuthenticated) { navigate('/login'); return; }
                navigate(`/booking?doctor=${doctor._id}`);
              }}
              sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' } }}
            >
              Book Appointment
            </Button>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default DoctorProfilePage;
