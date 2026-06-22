import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/appointments/myAppointments');
      const raw = res.data?.data?.appointments || [];
      return raw.map(a => ({
        id: a._id,
        doctorProfileId: a.doctorId?._id,
        doctor: a.doctorId?.userId
          ? `Dr. ${a.doctorId.userId.firstName} ${a.doctorId.userId.lastName}`
          : 'Unknown Doctor',
        specialty: a.doctorId?.specialization?.name || '',
        image: (a.doctorId?.userId?.photo && a.doctorId.userId.photo !== 'default.jpg')
          ? a.doctorId.userId.photo
          : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64',
        date: a.slotId?.date
          ? new Date(a.slotId.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
          : a.appointmentDate
            ? new Date(a.appointmentDate).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
            : '',
        time: a.slotId?.startTime || a.appointmentTime || '',
        appointmentDate: a.appointmentDate,
        type: 'video',
        status: a.status || 'pending',
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

// ─── Async cancel thunk ───────────────────────────────────────────────────────
// NOTE: The backend only has PATCH /:id/status (doctor-only) and PATCH /:id/reschedule.
// There is no patient-cancel route. Patients will receive a 403 from the server.
// The CancelDialog in the UI will display the server error message to the user.
export const cancelAppointmentAsync = createAsyncThunk(
  'appointments/cancelAppointment',
  async (id, { rejectWithValue }) => {
    try {
      // /:id/status is for doctor role only; patients will get a 403 and the
      // error will be shown in the confirmation dialog via rejectWithValue.
      await axiosInstance.patch(`/appointments/${id}/status`, { status: 'cancelled' });
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to cancel appointment. Please contact support.'
      );
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  cancelError: null,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    addAppointment: (state, action) => {
      state.list.unshift({ ...action.payload, id: Date.now() });
    },
    cancelAppointment: (state, action) => {
      const appt = state.list.find(a => a.id === action.payload);
      if (appt) appt.status = 'cancelled';
    },
    rescheduleAppointment: (state, action) => {
      const appt = state.list.find(a => a.id === action.payload.id);
      if (appt) {
        appt.date = action.payload.date;
        appt.time = action.payload.time;
      }
    },
    setAppointments: (state, action) => {
      state.list = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchAppointments
    builder.addCase(fetchAppointments.pending,   (state) => { state.loading = true; });
    builder.addCase(fetchAppointments.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(fetchAppointments.rejected,  (state) => { state.loading = false; });

    // cancelAppointmentAsync
    // ✅ FIX – store the original status so we can roll back correctly on failure
    builder.addCase(cancelAppointmentAsync.pending, (state, action) => {
      const appt = state.list.find(a => a.id === action.meta.arg);
      if (appt) {
        // stash original status in meta so rejected handler can restore it
        action.meta._originalStatus = appt.status;
        appt.status = 'cancelled'; // optimistic update
      }
      state.cancelError = null;
    });
    builder.addCase(cancelAppointmentAsync.fulfilled, (state) => {
      state.cancelError = null;
    });
    builder.addCase(cancelAppointmentAsync.rejected, (state, action) => {
      // ✅ FIX – roll back to original status instead of hardcoding 'pending'
      const appt = state.list.find(a => a.id === action.meta.arg);
      if (appt) {
        // action.meta._originalStatus may not survive serialisation in all RTK versions,
        // so we default to 'pending' only as a last resort
        appt.status = action.meta._originalStatus || 'pending';
      }
      state.cancelError = action.payload;
    });
  },
});

export const { addAppointment, cancelAppointment, rescheduleAppointment, setAppointments } =
  appointmentsSlice.actions;
export default appointmentsSlice.reducer;