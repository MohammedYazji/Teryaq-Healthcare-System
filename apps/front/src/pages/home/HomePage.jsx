import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HearingIcon from '@mui/icons-material/Hearing';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HowItWorksSection from './HowItWorksSection';
import TestimonialsSection from './TestimonialsSection';
import DoctorCard from '../../components/common/DoctorCard';
import Layout from '../../components/layout/Layout';
import axios from '../../api/axios';

// ---- design tokens (your existing brand palette, nothing new introduced) ----
const colors = {
  brand: '#0d9488',
  brandDark: '#0f766e',
  primary: '#0EA5E9',
  secondary: '#14B8A6',
  navy: '#0F172A',
  slate: '#64748B',
  slateLight: '#94A3B8',
  bg: '#F8FAFC',
};

const display = { fontFamily: '"Sora", "Helvetica Neue", Arial, sans-serif' };
const body = { fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' };

// Presentational-only helper: maps a specialty name to a fitting icon.
// Pure function, no data fetching, doesn't touch any existing logic.
const specialtyIconRules = [
  { keywords: ['cardio', 'heart'], Icon: FavoriteIcon },
  { keywords: ['pediatric', 'child'], Icon: ChildCareIcon },
  { keywords: ['ortho', 'bone', 'joint'], Icon: AccessibilityNewIcon },
  { keywords: ['neuro', 'psych', 'mental'], Icon: PsychologyIcon },
  { keywords: ['eye', 'ophthal', 'vision', 'optom'], Icon: VisibilityIcon },
  { keywords: ['ent', 'ear', 'throat', 'hearing'], Icon: HearingIcon },
];
const getSpecialtyIcon = (name = '') => {
  const lower = name.toLowerCase();
  const rule = specialtyIconRules.find(({ keywords }) => keywords.some((k) => lower.includes(k)));
  return rule ? rule.Icon : LocalHospitalIcon;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- unchanged data logic ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, specRes] = await Promise.all([
          axios.get('/doctors?limit=3'),
          axios.get('/specializations'),
        ]);
        const raw = docRes.data.data?.doctors || [];
        setDoctors(raw.map((doc) => ({
          ...doc,
          name: doc.userId ? `${doc.userId.firstName || ''} ${doc.userId.lastName || ''}`.trim() : 'Doctor',
          image: doc.userId?.photo || '',
          specialty: doc.specialization?.name || 'General',
          fee: doc.consultationFee,
          rating: doc.averageRating,
        })));
        setSpecialties(specRes.data.data?.specializations || specRes.data.specializations || []);
      } catch (err) {
        console.error('Failed to fetch homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Loads the two display/body fonts once. Purely cosmetic side effect.
  useEffect(() => {
    const id = 'homepage-font-import';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@400;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <Layout>
      <Box sx={{ ...body, bgcolor: '#fff' }}>
      <style>{`
        @keyframes hpFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .hp-fade-1 { animation: hpFadeUp 0.6s ease-out both; }
        .hp-fade-2 { animation: hpFadeUp 0.6s ease-out 0.1s both; }
        .hp-fade-3 { animation: hpFadeUp 0.6s ease-out 0.2s both; }
        .hp-fade-4 { animation: hpFadeUp 0.7s ease-out 0.3s both; }
        @media (prefers-reduced-motion: reduce) {
          .hp-fade-1, .hp-fade-2, .hp-fade-3, .hp-fade-4 { animation: none; }
        }
      `}</style>

      {/* ---------------- HERO ---------------- */}
      <Box
        sx={{
          background: `linear-gradient(160deg, ${colors.brand} 0%, ${colors.brandDark} 60%, #0c5f59 100%)`,
          color: 'white',
          py: { xs: 7, md: 11 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs: 6, md: 4 } }}>
            {/* copy */}
            <Box sx={{ flex: '1 1 auto', textAlign: { xs: 'center', md: 'left' }, maxWidth: { md: 560 } }}>
              <Typography className="hp-fade-1" sx={{ ...display, fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.75, mb: 2 }}>
                Online Appointment Booking
              </Typography>
              <Typography className="hp-fade-2" sx={{ ...display, fontWeight: 800, lineHeight: 1.1, fontSize: { xs: '2.1rem', sm: '2.75rem', md: '3.5rem' }, mb: 2.5 }}>
                Your Health, Our Priority
              </Typography>
              <Typography className="hp-fade-3" sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, opacity: 0.88, lineHeight: 1.6, mb: 4, maxWidth: 460, mx: { xs: 'auto', md: 0 } }}>
                Book appointments with top doctors. Manage your health journey from anywhere.
              </Typography>
              <Box className="hp-fade-4" sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/doctors')}
                  sx={{ bgcolor: 'white', color: colors.brand, fontWeight: 700, px: 3.5, py: 1.4, borderRadius: 2.5, textTransform: 'none', fontSize: 15, '&:hover': { bgcolor: '#f0fdfa' } }}
                >
                  Find a Doctor
                </Button>
                {!isAuthenticated && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ borderColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, color: 'white', fontWeight: 700, px: 3.5, py: 1.4, borderRadius: 2.5, textTransform: 'none', fontSize: 15, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)', borderWidth: 1.5 } }}
                  >
                    Get Started
                  </Button>
                )}
              </Box>
            </Box>

            {/* signature: floating appointment-confirmation card */}
            <Box sx={{ position: 'relative', width: { xs: 230, sm: 260, md: 280 }, mx: 'auto', flexShrink: 0 }}>
              <Box
                sx={{
                  position: 'absolute', top: 14, left: 10, right: -10, bottom: -14,
                  borderRadius: 4, border: '1px solid rgba(255,255,255,0.25)',
                  transform: { xs: 'rotate(3deg)', md: 'rotate(5deg)' },
                  zIndex: 0,
                }}
              />
              <Box
                sx={{
                  position: 'relative', zIndex: 1,
                  bgcolor: 'white', borderRadius: 4, p: 3,
                  boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
                  transform: { xs: 'rotate(-2deg)', md: 'rotate(-3deg)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 19, color: '#16A34A' }} />
                  </Box>
                  <Typography sx={{ ...display, fontWeight: 700, fontSize: 13.5, color: colors.navy }}>
                    Appointment Confirmed
                  </Typography>
                </Box>
                <Box sx={{ height: '1px', bgcolor: '#EEF2F6', mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                  <MedicalServicesIcon sx={{ fontSize: 18, color: colors.brand }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.navy }}>Cardiology Consultation</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: colors.slate }} />
                  <Typography sx={{ fontSize: 13.5, color: colors.slate }}>Today &middot; 2:30 PM</Typography>
                </Box>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, bgcolor: '#ECFDF5', color: '#16A34A', px: 1.4, py: 0.5, borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                  <EventAvailableIcon sx={{ fontSize: 14 }} /> Confirmed
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ---------------- SPECIALTIES ---------------- */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography sx={{ ...display, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.brand, mb: 1.5 }}>
            Specialties
          </Typography>
          <Typography sx={{ ...display, fontWeight: 800, fontSize: { xs: '1.6rem', md: '2.1rem' }, color: colors.navy, mb: 1.5 }}>
            Browse by Specialty
          </Typography>
          <Typography sx={{ color: colors.slate, fontSize: 15.5 }}>
            Find the right specialist for your needs
          </Typography>
        </Box>

        {loading ? (
          <Typography textAlign="center" sx={{ color: colors.slate }}>Loading specialties...</Typography>
        ) : specialties.length === 0 ? (
          <Typography textAlign="center" sx={{ color: colors.slateLight }}>No specialties available yet.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2.5 }}>
            {specialties.map((spec, i) => {
              const Icon = getSpecialtyIcon(spec.name);
              const tints = [colors.brand, colors.primary, colors.secondary];
              const tint = tints[i % tints.length];
              return (
                <Box
                  key={spec._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/doctors?specialty=${spec.name}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/doctors?specialty=${spec.name}`); } }}
                  sx={{
                    width: { xs: '100%', sm: 'calc(50% - 10px)', md: 'calc(33.333% - 14px)' },
                    maxWidth: 340,
                    display: 'flex', alignItems: 'center', gap: 2,
                    p: 2.5, borderRadius: 3, bgcolor: '#fff',
                    border: '1px solid #EEF2F6',
                    cursor: 'pointer',
                    transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 28px rgba(15,23,42,0.08)', borderColor: 'transparent' },
                    '&:focus-visible': { outline: `2px solid ${colors.brand}`, outlineOffset: 2 },
                  }}
                >
                  <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: `${tint}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon sx={{ fontSize: 24, color: tint }} />
                  </Box>
                  <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: colors.navy }}>{spec.name}</Typography>
                    {spec.description && (
                      <Typography sx={{ fontSize: 13, color: colors.slate, mt: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {spec.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>

      {/* ---------------- DOCTORS ---------------- */}
      <Box sx={{ bgcolor: colors.bg, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{ ...display, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.brand, mb: 1.5 }}>
              Top Rated
            </Typography>
            <Typography sx={{ ...display, fontWeight: 800, fontSize: { xs: '1.6rem', md: '2.1rem' }, color: colors.navy, mb: 1.5 }}>
              Meet Our Top Doctors
            </Typography>
            <Typography sx={{ color: colors.slate, fontSize: 15.5 }}>
              Highly rated professionals ready to help you
            </Typography>
          </Box>

          {loading ? (
            <Typography textAlign="center" sx={{ color: colors.slate }}>Loading doctors...</Typography>
          ) : doctors.length === 0 ? (
            <Typography textAlign="center" sx={{ color: colors.slateLight }}>No doctors available yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
              {doctors.map((doc) => (
                <Box key={doc._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }, maxWidth: 360 }}>
                  <DoctorCard doctor={doc} navigate={navigate} />
                </Box>
              ))}
            </Box>
          )}

          <Box textAlign="center" sx={{ mt: 5 }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/doctors')}
              sx={{ bgcolor: colors.brand,color: 'white !important', fontWeight: 700, textTransform: 'none', px: 3.5, py: 1.2, borderRadius: 2.5, fontSize: 14.5, '&:hover': { bgcolor: colors.brandDark } }}
            >
              View All Doctors
            </Button>
          </Box>
        </Container>
      </Box>

      <HowItWorksSection />
      <TestimonialsSection />
    </Box>
    </Layout>
  );
};

export default HomePage;