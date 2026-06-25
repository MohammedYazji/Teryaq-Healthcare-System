import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import axios from '../../api/axios';
import AdminLayout from './AdminPanelLayout';

const colors = {
  navy: '#0F172A',
  navyDeep: '#0B1220',
  brand: '#0d9488',
  primary: '#0EA5E9',
  slate: '#64748B',
  bg: '#F8FAFC',
};

const display = { fontFamily: '"Sora", "Helvetica Neue", Arial, sans-serif' };
const mono = { fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontVariantNumeric: 'tabular-nums' };

// Custom count-up hook: animates a number from 0 to `target` with ease-out.
// When `active` is false (loading, or prefers-reduced-motion), it just
// snaps straight to the target — no fetch logic involved, purely visual.
function useCountUp(target, duration, active) {
  const [val, setVal] = useState(0);
  const frameRef = useRef();
  useEffect(() => {
    if (!active) { setVal(target); return undefined; }
    let start = null;
    const tick = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, active]);
  return val;
}

const VitalReading = ({ label, value, dot, loading }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' }, py: { xs: 2, sm: 0 }, px: { sm: 3.5 }, flex: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dot }} />
      <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ ...mono, fontSize: { xs: 28, sm: 34 }, fontWeight: 700, color: 'white', lineHeight: 1 }}>
      {loading ? '—' : value}
    </Typography>
  </Box>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // --- unchanged data logic ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/admin/stats');
        setStats(res.data.data?.stats || res.data.stats || res.data);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Page-specific font load: Sora/Inter for type, JetBrains Mono for the
  // monitor-style digit readouts. Own id so it doesn't depend on load
  // order with other pages.
  useEffect(() => {
    const id = 'admin-dashboard-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&family=Sora:wght@400;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  const doctors = stats?.doctors?.total || 0;
  const patients = stats?.patients?.total || 0;
  const appts = stats?.appointments?.total || 0;
  const pending = stats?.doctors?.pending || 0;

  const animActive = !loading && !reducedMotion;
  const doctorsN = useCountUp(doctors, 1100, animActive);
  const patientsN = useCountUp(patients, 1150, animActive);
  const apptsN = useCountUp(appts, 1200, animActive);
  const pendingN = useCountUp(pending, 1300, animActive);

  const hasPending = !loading && pending > 0;
  const allClear = !loading && pending === 0;

  return (
    <AdminLayout>
      <style>{`
        @keyframes dashDraw { to { stroke-dashoffset: 0; } }
        @keyframes pulseLine { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.65; } }
        @keyframes pingRing {
          0% { transform: scale(0.85); opacity: 0.55; }
          75%, 100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .adm-ekg-path { stroke-dasharray: 1400; stroke-dashoffset: 1400; animation: dashDraw 1.6s ease-out forwards, pulseLine 2.6s ease-in-out 1.6s infinite; }
        .adm-fade-1 { animation: fadeUp 0.5s ease-out both; }
        .adm-fade-2 { animation: fadeUp 0.5s ease-out 0.1s both; }
        .adm-ring { animation: pingRing 2.2s ease-out infinite; }
        .adm-ring-delay { animation-delay: 0.9s; }
        @media (prefers-reduced-motion: reduce) {
          .adm-ekg-path { animation: none; stroke-dashoffset: 0; }
          .adm-fade-1, .adm-fade-2, .adm-ring { animation: none; }
        }
      `}</style>

      {/* ---- vitals monitor header ---- */}
      <Box sx={{ background: `linear-gradient(165deg, ${colors.navy} 0%, ${colors.navyDeep} 100%)`, color: 'white', pt: { xs: 4, md: 5 }, pb: { xs: 1, md: 1.5 } }}>
        <Container maxWidth="lg">
          <Box className="adm-fade-1" sx={{ mb: { xs: 3, md: 4 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.brand, mb: 1 }}>
              Admin Control
            </Typography>
            <Typography sx={{ ...display, fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' } }}>
              Admin Dashboard
            </Typography>
          </Box>

          {/* animated EKG trace */}
          <Box className="adm-fade-2" sx={{ width: '100%', height: { xs: 36, md: 44 }, mb: { xs: 1, md: 2 } }}>
            <svg viewBox="0 0 800 50" preserveAspectRatio="none" width="100%" height="100%">
              <path
                className="adm-ekg-path"
                d="M0,25 L120,25 L150,25 L168,4 L184,46 L200,12 L216,32 L232,25 L340,25 L370,25 L388,8 L404,42 L420,16 L436,30 L452,25 L800,25"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>

          {/* readout strip */}
          <Box
            sx={{
              display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Box sx={{ borderBottom: { xs: '1px solid rgba(255,255,255,0.1)', sm: 'none' }, borderRight: { sm: '1px solid rgba(255,255,255,0.1)' }, flex: 1, display: 'flex' }}>
              <VitalReading label="Doctors" value={doctorsN} dot={colors.brand} loading={loading} />
            </Box>
            <Box sx={{ borderBottom: { xs: '1px solid rgba(255,255,255,0.1)', sm: 'none' }, borderRight: { sm: '1px solid rgba(255,255,255,0.1)' }, flex: 1, display: 'flex' }}>
              <VitalReading label="Patients" value={patientsN} dot={colors.primary} loading={loading} />
            </Box>
            <Box sx={{ flex: 1, display: 'flex' }}>
              <VitalReading label="Appointments" value={apptsN} dot="#38BDF8" loading={loading} />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ---- spotlight: pending approvals ---- */}
      <Box sx={{ bgcolor: colors.bg, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap',
              bgcolor: 'white', borderRadius: 4, p: { xs: 3, sm: 4 },
              border: hasPending ? '1px solid #FDE68A' : '1px solid #EEF2F6',
              boxShadow: hasPending ? '0 8px 32px rgba(217,119,6,0.1)' : '0 4px 20px rgba(15,23,42,0.04)',
            }}
          >
            <Box sx={{ position: 'relative', width: 84, height: 84, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hasPending && (
                <>
                  <Box className="adm-ring" sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #F59E0B' }} />
                  <Box className="adm-ring adm-ring-delay" sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #F59E0B' }} />
                </>
              )}
              <Box
                sx={{
                  position: 'relative', width: 84, height: 84, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: hasPending
                    ? 'linear-gradient(135deg, #D97706, #F59E0B)'
                    : allClear
                      ? 'linear-gradient(135deg, #16A34A, #22C55E)'
                      : `linear-gradient(135deg, ${colors.slate}, #94A3B8)`,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                }}
              >
                {allClear ? (
                  <CheckCircleOutlinedIcon sx={{ fontSize: 34, color: 'white' }} />
                ) : (
                  <Typography sx={{ ...mono, fontSize: 26, fontWeight: 700, color: 'white' }}>
                    {loading ? '—' : pendingN}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: '1 1 220px' }}>
              <Typography sx={{ ...display, fontWeight: 700, fontSize: 18, color: colors.navy, mb: 0.4 }}>
                {loading ? 'Checking approvals…' : hasPending ? 'Pending Approvals' : 'All caught up'}
              </Typography>
              <Typography sx={{ fontSize: 14, color: colors.slate }}>
                {loading
                  ? 'Loading the latest queue.'
                  : hasPending
                    ? `${pending} ${pending === 1 ? 'item is' : 'items are'} awaiting your review.`
                    : 'No pending approvals right now.'}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default DashboardPage;