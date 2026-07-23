import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar, Toolbar, Box, Button, IconButton, Avatar, Menu, MenuItem,
  Drawer, List, ListItem, ListItemText, Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { logout } from '../../store/slices/authSlice';

import LoginIcon from '@mui/icons-material/Login';

import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LogoutIcon from '@mui/icons-material/Logout';

const TeryaqLogo = () => (
  <Box
    sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
    component={Link}
    to="/"
  >
    <img
      src="/logo.png"
      alt="Teryaq"
      style={{ height: 40, width: 25, objectFit: 'cover', display: 'block' }}
    />
    <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 22, color: '#188', marginLeft: 6 }}>
      Teryaq
    </span>
  </Box>
);

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Find Doctors', path: '/doctors' },
    ...(user?.role === 'patient' ? [{ label: 'Dashboard', path: '/patient' }] : []),
    ...(user?.role === 'doctor' ? [{ label: 'Dashboard', path: '/doctor' }] : []),
    ...(user?.role === 'admin' ? [{ label: 'Admin Panel', path: '/admin' }] : []),
    ...(user?.role === 'patient' ? [{ label: 'My Appointments', path: '/appointments' }] : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Toolbar sx={{ width: '100%', px: { xs: 2, md: 4 }, minHeight: '68px !important' }}>
          <TeryaqLogo />

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mx: 'auto' }}>
            {navLinks.map(link => (
              <Button
                key={link.path}
                component={Link}
                to={link.path}
                sx={{
                  color: isActive(link.path) ? '#0e7e78' : '#64748B',
                  fontWeight: isActive(link.path) ? 600 : 500,
                  fontSize: 15,
                  px: 2,
                  borderRadius: 2,
                  position: 'relative',
                  transition:"all 0.3s ease",
                  '&:hover': { color: '#0e7e78', background: '#F0F9FF' },
                  '&::after': isActive(link.path) ? {
                    content: '""', position: 'absolute', bottom: 4,
                    left: '50%', transform: 'translateX(-50%)',
                    width: 20, height: 2, borderRadius: 1,
                      background: '#0d9488',
                    } : {},
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Right side */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                  <Avatar sx={{ width: 36, height: 36, background: "#0d9488", fontSize: 14, fontWeight: 700 }}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#64748B', ml: 0.5 }} />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx: { borderRadius: 3, mt: 1, minWidth: 180, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } }}>
                  {user?.role === 'patient' && (
                    <MenuItem component={Link} to="/patient" onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1.5 }}>
                      <CalendarMonthIcon sx={{color:"#188"}}/> Dashboard
                    </MenuItem>
                  )}
                  {user?.role === 'doctor' && (
                    <MenuItem component={Link} to="/doctor" onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1.5 }}>
                      <CalendarMonthIcon sx={{color:"#188"}}/> Dashboard
                    </MenuItem>
                  )}
                  {user?.role === 'admin' && (
                    <MenuItem component={Link} to="/admin" onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1.5 }}>
                      <CalendarMonthIcon sx={{color:"#188"}}/> Admin Panel
                    </MenuItem>
                  )}
                  {(!user || user?.role === 'patient') && (
                    <MenuItem component={Link} to="/appointments" onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1.5 }}>
                      <CalendarMonthIcon sx={{color:"#188"}}/> My Appointments
                    </MenuItem>
                  )}
                  <MenuItem component={Link} to="/profile" onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1.5 }}>
                   <PersonIcon sx={{color:"#188"}}/>  Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.5, color: '#188' }}>
                    <LogoutIcon/> Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {/* sign in */}
                <Button component={Link} to="/login"
                startIcon={<LoginIcon />}
                  sx={{ color: '#64748B', fontWeight: 500,
                    transition:"all 0.3s ease",
                   '&:hover': { color: '#0e7e78' } }}>
                  Sign In
                </Button>

                <Button component={Link} to="/register" variant="contained"
                  sx={{
                    borderRadius: 2.5, px: 2.5, py: 1, fontSize: 14,
                    background: '#0d9488',
                    color:"white",
                    boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
                    transition:"all 0.3s ease",
                    '&:hover': {
                      background: '#0f766e',
                      transform: 'translateY(-1px)',
                    },
                  }}>
                  Get Started
                </Button>
              </>
            )}
          </Box>

          {/* Mobile menu icon */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto', gap: 1 }}>

            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#188' }}>

              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="top" open={mobileOpen} onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { borderRadius: '0 0 20px 20px', pt: 1, pb: 3 } }}>
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TeryaqLogo />
          <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ my: 1 }} />
        <List sx={{ px: 2 }}>
          {navLinks.map(link => (
            <ListItem key={link.path} component={Link} to={link.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2, mb: 0.5,
                background: isActive(link.path) ? '#F0F9FF' : 'transparent',
                color: isActive(link.path) ? '#188' : '#0F172A',
              }}>
              <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: isActive(link.path) ? 600 : 400 }} />
            </ListItem>
          ))}
          {isAuthenticated && user?.role === 'patient' && (
            <ListItem component={Link} to="/patient" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Dashboard" />
            </ListItem>
          )}
          {isAuthenticated && user?.role === 'doctor' && (
            <ListItem component={Link} to="/doctor" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Dashboard" />
            </ListItem>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <ListItem component={Link} to="/admin" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Admin Panel" />
            </ListItem>
          )}
          {isAuthenticated && (
            <ListItem component={Link} to="/profile" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Profile" />
            </ListItem>
          )}
        </List>
        <Box sx={{ px: 2, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {isAuthenticated ? (
            <Button onClick={() => { handleLogout(); setMobileOpen(false); }}
              variant="outlined" color="error" fullWidth sx={{ borderRadius: 2 }}>
              Sign Out
            </Button>
          ) : (
            <>

             <Button
  startIcon={<LoginIcon sx={{ color: "#188" }} />}
  component={Link}
  to="/login"
  fullWidth
  onClick={() => setMobileOpen(false)}
  sx={{
    borderRadius: 2,
    color: '#0d9488',
    border: '2px solid #0d9488',
    transition: 'all 0.3s ease',
    '&:hover': {
      border: '2px solid #0f766e',
      color: '#0f766e',
    },
  }}
>
  Sign In
</Button>

              <Button component={Link} to="/register" variant="contained" fullWidth
                onClick={() => setMobileOpen(false)} sx={{ 
                  borderRadius: 2,
                  transition:"all 0.4s ease",
                   background: '#0d9488',
                   color:"white",
                   '&:hover': { background: '#0f766e' } }}>
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Spacer */}
      <Toolbar sx={{ minHeight: '68px !important' }} />
    </>
  );
}