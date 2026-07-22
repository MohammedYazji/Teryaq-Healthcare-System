import  { useState, useEffect } from 'react';
import {
  Box, Container, Typography, TextField, Button, Alert, Paper, Link as MuiLink,
  IconButton, InputAdornment, MenuItem, Chip,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, setLoading } from '../../store/slices/authSlice';
import axios from '../../api/axios';

const brandColor = '#0d9488';

const DoctorSignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  });
  const [doctorInfo, setDoctorInfo] = useState({
    specialization: '',
    degree: '',
    experienceYears: '',
    bio: '',
    consultationFee: '',
  });
  const [qualifications, setQualifications] = useState([]);
  const [qualInput, setQualInput] = useState('');

  const [specializations, setSpecializations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    axios.get('/specializations')
      .then((res) => {
        const specs = res.data?.data?.specializations;
        setSpecializations(Array.isArray(specs) ? specs : []);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleDoctorInfoChange = (e) => {
    setDoctorInfo({ ...doctorInfo, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const addQualification = () => {
    const q = qualInput.trim();
    if (q && !qualifications.includes(q)) {
      setQualifications([...qualifications, q]);
      setQualInput('');
      if (errors.qualifications) setErrors({ ...errors, qualifications: '' });
    }
  };

  const removeQualification = (q) => {
    setQualifications(qualifications.filter((item) => item !== q));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    else if (form.firstName.trim().length < 2) errs.firstName = 'First name is too short';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    else if (form.lastName.trim().length < 2) errs.lastName = 'Last name is too short';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.passwordConfirm) errs.passwordConfirm = 'Please confirm your password';
    else if (form.password !== form.passwordConfirm) errs.passwordConfirm = 'Passwords do not match';
    if (!doctorInfo.specialization) errs.specialization = 'Specialization is required';
    if (!doctorInfo.degree.trim()) errs.degree = 'Degree is required';
    else if (doctorInfo.degree.trim().length < 2) errs.degree = 'Degree is too short';
    if (doctorInfo.experienceYears === '' || doctorInfo.experienceYears === null) errs.experienceYears = 'Experience is required';
    else if (Number(doctorInfo.experienceYears) < 0) errs.experienceYears = 'Experience cannot be negative';
    if (!doctorInfo.bio.trim()) errs.bio = 'Bio is required';
    else if (doctorInfo.bio.trim().length < 10) errs.bio = 'Bio must be at least 10 characters';
    if (doctorInfo.consultationFee === '' || doctorInfo.consultationFee === null) errs.consultationFee = 'Consultation fee is required';
    else if (Number(doctorInfo.consultationFee) < 0) errs.consultationFee = 'Fee cannot be negative';
    if (qualifications.length === 0) errs.qualifications = 'Add at least one qualification';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(setLoading(true));
    setApiError('');
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        role: 'doctor',
        doctorInfo: {
          specialization: doctorInfo.specialization,
          degree: doctorInfo.degree.trim(),
          experienceYears: Number(doctorInfo.experienceYears),
          bio: doctorInfo.bio.trim(),
          consultationFee: Number(doctorInfo.consultationFee),
          qualifications,
        },
      };
      const res = await axios.post('/auth/signup', payload);
      const { token, data } = res.data;
      localStorage.setItem('teryaq_token', token);
      dispatch(login(data.user));
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const inputSx = { mb: 2 };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <MuiLink component={Link} to="/register" sx={{ color: brandColor, textDecoration: 'none', fontWeight: 500 }}>
              &larr; Back
            </MuiLink>
          </Typography>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            Doctor Sign Up
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Join Teryaq as a healthcare professional
          </Typography>

          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#334155' }}>
              Personal Information
            </Typography>

            <TextField
              fullWidth label="First Name" name="firstName"
              value={form.firstName} onChange={handleChange} required
              error={!!errors.firstName} helperText={errors.firstName}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Last Name" name="lastName"
              value={form.lastName} onChange={handleChange} required
              error={!!errors.lastName} helperText={errors.lastName}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Email" name="email" type="email"
              value={form.email} onChange={handleChange} required
              error={!!errors.email} helperText={errors.email}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Phone (optional)" name="phone"
              value={form.phone} onChange={handleChange}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Password" name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={handleChange} required
              error={!!errors.password} helperText={errors.password}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Confirm Password" name="passwordConfirm"
              type={showConfirm ? 'text' : 'password'}
              value={form.passwordConfirm} onChange={handleChange} required
              error={!!errors.passwordConfirm} helperText={errors.passwordConfirm}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />

            <Box sx={{ borderTop: '1px solid #E2E8F0', my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#334155' }}>
              Professional Information
            </Typography>

            <TextField
              fullWidth select label="Specialization" name="specialization"
              value={doctorInfo.specialization} onChange={handleDoctorInfoChange} required
              error={!!errors.specialization} helperText={errors.specialization}
              sx={inputSx}
            >
              <MenuItem value="">
                <em>Select specialization</em>
              </MenuItem>
              {specializations.map((spec) => (
                <MenuItem key={spec._id || spec.id} value={spec._id || spec.id}>
                  {spec.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="Degree" name="degree" placeholder="e.g. MBBS, MD"
              value={doctorInfo.degree} onChange={handleDoctorInfoChange} required
              error={!!errors.degree} helperText={errors.degree}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Years of Experience" name="experienceYears" type="number"
              value={doctorInfo.experienceYears} onChange={handleDoctorInfoChange} required
              error={!!errors.experienceYears} helperText={errors.experienceYears}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Consultation Fee" name="consultationFee" type="number"
              value={doctorInfo.consultationFee} onChange={handleDoctorInfoChange} required
              error={!!errors.consultationFee} helperText={errors.consultationFee}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={inputSx}
            />
            <TextField
              fullWidth label="Bio" name="bio" multiline rows={3}
              placeholder="Tell patients about yourself and your expertise..."
              value={doctorInfo.bio} onChange={handleDoctorInfoChange} required
              error={!!errors.bio} helperText={errors.bio}
              sx={inputSx}
            />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                Qualifications
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth size="small"
                  placeholder="e.g. Board Certified in Internal Medicine"
                  value={qualInput}
                  onChange={(e) => setQualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addQualification();
                    }
                  }}
                  error={!!errors.qualifications}
                />
                <Button
                  variant="outlined" onClick={addQualification}
                  sx={{ minWidth: 40, borderColor: brandColor, color: brandColor }}
                >
                  <AddIcon />
                </Button>
              </Box>
              {errors.qualifications && (
                <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                  {errors.qualifications}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {qualifications.map((q) => (
                  <Chip
                    key={q} label={q} onDelete={() => removeQualification(q)}
                    sx={{ bgcolor: '#F0FDFA', color: '#065F46' }}
                  />
                ))}
              </Box>
            </Box>

            <Button
              type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#0f766e' }, py: 1.5, mt: 1 }}
            >
              {loading ? 'Creating account...' : 'Create Doctor Account'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" sx={{ color: brandColor, fontWeight: 600 }}>
              Sign In
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default DoctorSignupPage;
