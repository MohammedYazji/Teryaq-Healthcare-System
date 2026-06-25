import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Skeleton } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from '../../api/axios';
import AdminLayout from './AdminPanelLayout';

const colors = {
  navy: '#0F172A',
  brand: '#0d9488',
  slate: '#64748B',
  bg: '#F8FAFC',
};

const display = { fontFamily: '"Sora", "Helvetica Neue", Arial, sans-serif' };
const mono = { fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontVariantNumeric: 'tabular-nums' };

const StatCard = ({ label, value, icon, color }) => (
  <Box sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #EEF2F6', p: 3, flex: '1 1 200px' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}14` }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: colors.slate, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
    </Box>
    <Typography sx={{ ...mono, fontSize: 24, fontWeight: 700, color: colors.navy }}>{value}</Typography>
  </Box>
);

const FinancialReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/admin/financial-stats');
        setData(res.data.data || res.data);
      } catch (err) {
        console.error('Failed to fetch', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const id = 'financial-reports-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&family=Sora:wght@400;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const summary = data?.summary;
  const monthlyRevenue = data?.monthlyRevenue || [];
  const transactions = data?.transactions || [];

  const statusColor = (s) => {
    if (s === 'completed') return '#15803D';
    if (s === 'refunded') return '#B91C1C';
    if (s === 'unpaid' || s === 'failed') return '#B45309';
    return '#64748B';
  };

  const statusBg = (s) => {
    if (s === 'completed') return '#ECFDF5';
    if (s === 'refunded') return '#FEF2F2';
    if (s === 'unpaid' || s === 'failed') return '#FFFBEB';
    return '#F1F5F9';
  };

  return (
    <AdminLayout>
      <Box sx={{ bgcolor: colors.bg, minHeight: '100vh', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.brand, mb: 1 }}>
              Admin &middot; Finance
            </Typography>
            <Typography sx={{ ...display, fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.1rem' }, color: colors.navy }}>
              Financial Reports
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" sx={{ flex: '1 1 200px', height: 110 }} />
              ))}
            </Box>
          ) : !summary ? (
            <Box sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #EEF2F6', textAlign: 'center', py: 6 }}>
              <ReceiptLongIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1.5 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 15.5, color: colors.navy, mb: 0.5 }}>
                No financial data yet
              </Typography>
              <Typography sx={{ color: colors.slate, fontSize: 14 }}>
                Reports will appear here once activity is recorded.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <StatCard label="Total Revenue" value={`$${summary.totalRevenue?.toFixed(2) || '0.00'}`} icon={<AttachMoneyIcon sx={{ fontSize: 18, color: colors.brand }} />} color={colors.brand} />
                <StatCard label="Consultations" value={summary.totalConsultations?.toLocaleString() || '0'} icon={<CalendarMonthIcon sx={{ fontSize: 18, color: '#4338CA' }} />} color="#4338CA" />
                <StatCard label="Avg per Session" value={`$${summary.avgPerSession?.toFixed(2) || '0.00'}`} icon={<TrendingUpIcon sx={{ fontSize: 18, color: '#0369A1' }} />} color="#0369A1" />
                <StatCard label="Refunds Issued" value={`$${summary.refundsIssued?.toFixed(2) || '0.00'} (${summary.refundCount || 0})`} icon={<ReceiptLongIcon sx={{ fontSize: 18, color: '#B91C1C' }} />} color="#B91C1C" />
              </Box>

              {monthlyRevenue.length > 0 && (
                <Box sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #EEF2F6', p: 3, mb: 3 }}>
                  <Typography sx={{ ...display, fontWeight: 700, fontSize: 16, color: colors.navy, mb: 2 }}>
                    Monthly Revenue
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, minHeight: 140 }}>
                    {monthlyRevenue.map((m, i) => {
                      const maxRev = Math.max(...monthlyRevenue.map(x => x.revenue), 1);
                      const h = (m.revenue / maxRev) * 120;
                      return (
                        <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ ...mono, fontSize: 10.5, fontWeight: 600, color: colors.slate }}>${m.revenue}</Typography>
                          <Box sx={{ width: '100%', maxWidth: 48, height: Math.max(h, 4), bgcolor: colors.brand, borderRadius: '6px 6px 2px 2px', opacity: 0.8 }} />
                          <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: colors.slate }}>{m.month}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {transactions.length > 0 && (
                <Box sx={{ bgcolor: 'white', borderRadius: 3, border: '1px solid #EEF2F6', overflow: 'hidden' }}>
                  <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #EEF2F6' }}>
                    <Typography sx={{ ...display, fontWeight: 700, fontSize: 16, color: colors.navy }}>
                      Recent Transactions
                    </Typography>
                  </Box>
                  {transactions.map((t, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, borderBottom: i < transactions.length - 1 ? '1px solid #F8FAFC' : 'none', '&:hover': { bgcolor: '#FAFBFC' } }}>
                      <Box sx={{ flex: '1 1 180px', minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: colors.navy }}>{t.patient}</Typography>
                        <Typography sx={{ fontSize: 12, color: colors.slate }}>{t.doctor}</Typography>
                      </Box>
                      <Typography sx={{ ...mono, fontSize: 13.5, fontWeight: 600, color: colors.navy, whiteSpace: 'nowrap' }}>${t.amount?.toFixed(2)}</Typography>
                      <Box sx={{
                        display: 'inline-flex', fontSize: 11, fontWeight: 700, px: 1, py: 0.3, borderRadius: 99,
                        color: statusColor(t.status), bgcolor: statusBg(t.status), textTransform: 'capitalize', whiteSpace: 'nowrap',
                      }}>
                        {t.status}
                      </Box>
                      <Typography sx={{ fontSize: 12, color: colors.slate, whiteSpace: 'nowrap', minWidth: 90, textAlign: 'right' }}>{t.date}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default FinancialReportsPage;