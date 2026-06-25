import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Avatar, Divider, IconButton, useMediaQuery, useTheme, Menu, MenuItem,
  AppBar, Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VerifiedIcon from '@mui/icons-material/Verified';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const SIDEBAR_WIDTH = 256;
const TOP_BAR_HEIGHT = 64;

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { path: '/admin/doctors', label: 'Doctor Approvals', icon: <VerifiedIcon fontSize="small" /> },
  { path: '/admin/users', label: 'User Management', icon: <PeopleIcon fontSize="small" /> },
  { path: '/admin/specialties', label: 'Specialties', icon: <LocalHospitalIcon fontSize="small" /> },
  { path: '/admin/finance', label: 'Financial Reports', icon: <AttachMoneyIcon fontSize="small" /> },

];

function SidebarContent({ onClose }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const isActive = (path) => path === '/admin'
    ? location.pathname === '/admin'
    : location.pathname.startsWith(path);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '1px solid #E2E8F0' }}>
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box onClick={() => navigate('/')}
            sx={{ width: 40, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', bgcolor: '#0d9488' }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>T</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 17, fontFamily: "'Sora',sans-serif", lineHeight: 1 }}>Teryaq</Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>Admin Panel</Typography>
          </Box>
        </Box>
        {onClose && <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}><CloseIcon /></IconButton>}
      </Box>

      <Divider sx={{ mx: 2 }} />

      <List sx={{ px: 2, pt: 2, flex: 1, overflow: 'auto' }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} component={Link} to={item.path} onClick={onClose}
              sx={{
                borderRadius: 2.5, mb: 0.5, py: 1.2,
                background: active ? '#F0FDFA' : 'transparent',
                border: active ? '1px solid #CCFBF1' : '1px solid transparent',
                '&:hover': { background: active ? '#F0FDFA' : '#F8FAFC' },
                transition: 'all 0.15s', textDecoration: 'none',
              }}>
              <ListItemIcon sx={{ minWidth: 36, color: active ? '#0d9488' : '#94A3B8' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }}
                sx={{ color: active ? '#0d9488' : '#475569' }} />
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mx: 2 }} />
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#0d9488', fontSize: 14, fontWeight: 700, color: '#fff' }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: '#0F172A', fontWeight: 600, fontSize: 13 }}>{user?.firstName} {user?.lastName}</Typography>
          <Typography sx={{ color: '#94A3B8', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</Typography>
        </Box>
        <IconButton size="small" onClick={() => { dispatch(logout()); navigate('/'); }} sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626' }, flexShrink: 0 }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default function AdminLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    navigate('/');
  };

  const currentPage = navItems.find((n) => location.pathname.startsWith(n.path))?.label || 'Dashboard';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {!isMobile && (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
          <Box sx={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH, zIndex: 120 }}>
            <SidebarContent />
          </Box>
        </Box>
      )}

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: SIDEBAR_WIDTH, border: 'none' } }}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ background: 'white', borderBottom: '1px solid #F1F5F9' }}>
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
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 34, height: 34, background: '#0d9488', fontSize: 13, fontWeight: 700 }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#64748B', ml: 0.3 }} />
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 3, mt: 1, minWidth: 180, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } }}>
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
