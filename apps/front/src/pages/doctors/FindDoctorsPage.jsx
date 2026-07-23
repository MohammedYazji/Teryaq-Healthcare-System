import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  InputAdornment,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DoctorCard from '../../components/common/DoctorCard';
import Layout from '../../components/layout/Layout';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const FindDoctorsPage = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.user);

  const [rawDoctors, setRawDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const specsRef = useRef([]);

  useEffect(() => {
    axios.get('/specializations')
      .then((res) => {
        const specs = res.data?.data?.specializations;
        const arr = Array.isArray(specs) ? specs : [];
        setSpecializations(arr);
        specsRef.current = arr;
      })
      .catch(() => {});
  }, []);

  const doctors = useMemo(() => {
    const currentId = currentUser?._id;
    return rawDoctors
      .filter((doc) => {
        const docUserId = doc.userId?._id || doc.userId;
        return docUserId !== currentId;
      })
      .map((doc) => ({
        ...doc,
        name: doc.userId
          ? `${doc.userId.firstName || ''} ${doc.userId.lastName || ''}`.trim()
          : 'Doctor',
        image: doc.userId?.photo || '',
        specialty: doc.specialization?.name || 'General',
        fee: doc.consultationFee,
        rating: doc.averageRating,
      }));
  }, [rawDoctors, currentUser]);

  const fetchDoctors = useCallback(async (q) => {
    setLoading(true);

    try {
      const params = {};

      if (q) {
        const matchedSpec = specsRef.current.find(
          (s) => s.name.toLowerCase() === q.trim().toLowerCase()
        );
        if (matchedSpec) {
          params.specialization = matchedSpec._id || matchedSpec.id;
        } else {
          params.search = q;
        }
      }

      const res = await axios.get('/doctors', { params });

      const raw = res.data.data?.doctors || [];

      setRawDoctors(raw);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, fetchDoctors]);

  return (
    <Layout>
      <Box
        sx={{
          bgcolor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        {/* Hero */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${brandColor} 0%, #14b8a6 100%)`,
            pt: { xs: 8, md: 12 },
            pb: { xs: 16, md: 20 },
            position: 'relative',
            overflow: 'hidden',

            '&::before': {
              content: '""',
              position: 'absolute',
              width: 320,
              height: 320,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.06)',
              top: -100,
              right: -80,
            },

            '&::after': {
              content: '""',
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.05)',
              bottom: -60,
              left: -40,
            },
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              fontWeight={800}
              color="white"
              sx={{
                fontSize: { xs: '2.2rem', md: '3.4rem' },
                mb: 2,
              }}
            >
              Find Your Doctor
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,.9)',
                fontSize: { xs: 16, md: 20 },
                mb: 6,
              }}
            >
              Browse our trusted healthcare professionals and book appointments
              with confidence.
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 4,
                bgcolor: 'white',
                maxWidth: 720,
                mx: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,.18)',
              }}
            >
              <TextField
                fullWidth
                placeholder="Search by doctor name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: brandColor }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    fontSize: '1rem',
                  },
                }}
              />
            </Paper>
          </Container>
        </Box>

        {/* Results */}
        <Container
          maxWidth="xl"
          sx={{
            mt: { xs: -8, md: -10 },
            pb: 8,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 5,
              p: { xs: 3, md: 5 },
              boxShadow: '0 10px 40px rgba(0,0,0,.08)',
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
                <CircularProgress
                  size={52}
                  sx={{
                    color: brandColor,
                  }}
                />

                <Typography
                  sx={{
                    mt: 3,
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  Finding the best doctors...
                </Typography>
              </Box>
            ) : doctors.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Typography variant="h5" fontWeight={700}>
                  No doctors found
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1,
                  }}
                >
                  Try searching with another name or specialty.
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 5,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                    >
                      Available Doctors
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Choose the healthcare professional that best fits your
                      needs.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius: 20,
                      bgcolor: '#ecfeff',
                    }}
                  >
                    <Typography
                      fontWeight={600}
                      sx={{ color: brandColor }}
                    >
                      {doctors.length} Doctor
                      {doctors.length !== 1 ? 's' : ''} Found
                    </Typography>
                  </Box>
                </Box>

                <Grid
                  container
                  spacing={{ xs: 3, md: 4 }}
                  justifyContent="center"
                >
                  {doctors.map((doc) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={doc._id}
                    >
                      <Box
                        sx={{
                          transition: '0.3s',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                          },
                        }}
                      >
                        <DoctorCard
                          doctor={doc}
                          navigate={navigate}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default FindDoctorsPage;