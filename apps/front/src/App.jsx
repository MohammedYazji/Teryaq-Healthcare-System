import React, { useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import store from "./store";
import createAppTheme from "./theme";
import { fetchAppointments } from "./store/slices/appointmentsSlice";

// Patient pages
import Home from "./pages/home/HomePage";
import Login from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/ForgotPasswordPage";
import ActivateAccount from "./pages/auth/ActivateAccountPage";
import ResetPassword from "./pages/auth/ResetPasswordPage";
import Register from "./pages/auth/RegisterPage";
import FindDoctors from "./pages/doctors/FindDoctorsPage";
import DoctorProfile from "./pages/doctors/DoctorProfilePage";
import MyAppointments from "./pages/appointments/AppointmentsPage";
import Booking from "./pages/appointments/BookingPage";
import PatientDashboard from "./pages/patient/DashboardPage";
import Chat from "./pages/chat/ChatPage";
import VideoCall from "./pages/video-call/VideoCallPage";
import Profile from "./pages/profile/ProfilePage";
import MedicalRecords from "./pages/medical-records/MedicalRecordsPage";
import PaymentSuccess from "./pages/payments/PaymentSuccessPage";
import PaymentCancelled from "./pages/payments/PaymentCancelledPage";

// Admin pages
import AdminDashboard from "./pages/admin/DashboardPage";
import DoctorApprovals from "./pages/admin/DoctorApprovalsPage";
import UserManagement from "./pages/admin/UserManagementPage";
import Specialties from "./pages/admin/SpecialtiesPage";
import FinancialReports from "./pages/admin/FinancialReportsPage";

// Doctor pages
import DoctorDashboard from "./pages/doctor-panel/DashboardPage";
import DoctorAppointments from "./pages/doctor-panel/AppointmentsPage";
import DoctorAvailability from "./pages/doctor-panel/AvailabilityPage";
import DoctorProfilePage from "./pages/doctor-panel/ProfilePage";
import DoctorMedicalRecords from "./pages/doctor-panel/MedicalRecordsPage";
import DoctorPatients from "./pages/doctor-panel/PatientsPage";

function AppInit() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    const lang = localStorage.getItem("teryaq_lang") || "en";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.dir = lang === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAppointments());
    }
  }, [isAuthenticated, dispatch]);

  return null;
}

function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}

function AppInner() {
  const language = useSelector((s) => s.ui.language);
  const direction = language === "ar" ? "rtl" : "ltr";
  const theme = useMemo(() => createAppTheme(direction), [direction]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppInit />
          <Routes>
            {/* Public / Patient routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/activate/:token" element={<ActivateAccount />} />
            <Route path="/register" element={<Register />} />
            <Route path="/resetPassword/:token" element={<ResetPassword />} />
            <Route path="/doctors" element={<FindDoctors />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/appointments" element={<MyAppointments />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/patient" element={<PatientDashboard />} />

            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/video/:id" element={<VideoCall />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<DoctorApprovals />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/specialties" element={<Specialties />} />
            <Route path="/admin/finance" element={<FinancialReports />} />

            {/* Doctor routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route
              path="/doctor/appointments"
              element={<DoctorAppointments />}
            />
            <Route
              path="/doctor/availability"
              element={<DoctorAvailability />}
            />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route
              path="/doctor/medical-records"
              element={<DoctorMedicalRecords />}
            />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
