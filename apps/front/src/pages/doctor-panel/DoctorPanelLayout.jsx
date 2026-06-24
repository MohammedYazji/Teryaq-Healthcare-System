import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Avatar, Divider, IconButton, useMediaQuery, useTheme, Menu, MenuItem,
  AppBar, Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const SIDEBAR_WIDTH = 256;
const TOP_BAR_HEIGHT = 64;

const navItems = [
  { path: '/doctor', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { path: '/doctor/appointments', label: 'Appointments', icon: <CalendarMonthIcon fontSize="small" /> },
  { path: '/doctor/availability', label: 'Availability', icon: <ScheduleIcon fontSize="small" /> },
  { path: '/doctor/patients', label: 'Patients', icon: <PersonIcon fontSize="small" /> },
  { path: '/doctor/medical-records', label: 'Medical Records', icon: <AssignmentIcon fontSize="small" /> },
  { path: '/doctor/profile', label: 'My Profile', icon: <MedicalServicesIcon fontSize="small" /> },
];

function SidebarContent({ onClose }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const items = navItems;

  const isActive = (path) => path === '/doctor'
    ? location.pathname === '/doctor'
    : location.pathname.startsWith(path);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0d9488' }}>
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            onClick={() => navigate('/')}
            sx={{
              width: 48, height: 48, borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          >
            <img src="/logo.png" alt="Home" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 17, fontFamily: "'Sora',sans-serif", lineHeight: 1 }}>Teryaq</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>Doctor Panel</Typography>
          </Box>
        </Box>
        {onClose && <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mx: 2 }} />

      <List sx={{ px: 2, pt: 2, flex: 1, overflow: 'auto' }}>
        {items.map(item => {
          const active = isActive(item.path);
          return (
            <ListItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={onClose}
              sx={{
                borderRadius: 2.5, mb: 0.5, py: 1.2,
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                '&:hover': { background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)' },
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }}
                sx={{ color: active ? '#fff' : 'rgba(255,255,255,0.8)' }}
              />
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mx: 2 }} />
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Avatar sx={{ width: 38, height: 38, background: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 700, color: '#fff' }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>Dr. {user?.firstName}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</Typography>
        </Box>
        <IconButton size="small" onClick={() => { dispatch(logout()); navigate('/'); }} sx={{ color: '#fff', '&:hover': { color: 'rgba(255,255,255,0.7)' }, flexShrink: 0 }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default function DoctorLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const location = useLocation();
  const items = navItems;

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    navigate('/');
  };

  const currentPage = items.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {!isMobile && (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
          <Box sx={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH, zIndex: 120 }}>
            <SidebarContent />
          </Box>
        </Box>
      )}

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: SIDEBAR_WIDTH, border: 'none' } }}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'white',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Toolbar sx={{ minHeight: `${TOP_BAR_HEIGHT}px !important`, px: { xs: 2, md: 3 } }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#0F172A', mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#0F172A', flex: 1 }}>
              {currentPage}
            </Typography>

            <IconButton onClick={() => navigate('/')} size="small"
              sx={{ color: '#64748B', mr: 1, '&:hover': { color: '#0d9488' } }}>
              <HomeIcon />
            </IconButton>

            <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{
                width: 34, height: 34,
                background: '#0d9488',
                fontSize: 13, fontWeight: 700,
              }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#64748B', ml: 0.3 }} />
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 3, mt: 1, minWidth: 180, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } }}>
              <MenuItem component={Link} to="/doctor/profile" onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1.5 }}>
                <PersonIcon sx={{ color: '#0d9488' }} /> My Profile
              </MenuItem>
              <MenuItem component={Link} to="/doctor" onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1.5 }}>
                <DashboardIcon sx={{ color: '#0d9488' }} /> Dashboard
              </MenuItem>
              <MenuItem onClick={() => { navigate('/'); setAnchorEl(null); }} sx={{ gap: 1.5, py: 1.5 }}>
                <HomeIcon sx={{ color: '#0d9488' }} /> Main Site
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.5, color: '#DC2626' }}>
                <LogoutIcon /> Sign Out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
