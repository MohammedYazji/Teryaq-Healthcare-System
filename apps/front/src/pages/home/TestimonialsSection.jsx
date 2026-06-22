import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Avatar, Rating } from '@mui/material';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get('/reviews/public');
        setReviews(res.data.reviews || res.data.data?.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  if (!reviews.length) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
        What Our Patients Say
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
        Real feedback from real patients
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          justifyContent: 'center',
        }}
      >
        {reviews.slice(0, 3).map((review) => (
          <Box
            key={review._id}
            sx={{
              flex: '1 1 300px',
              maxWidth: 360,
              p: 3,
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              bgcolor: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: brandColor }}>
                {(review.patientId?.name?.[0] || 'P')}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {review.patientId?.name || 'Anonymous'}
                </Typography>
                <Rating value={review.rating} readOnly size="small" />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {review.comment}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default TestimonialsSection;
