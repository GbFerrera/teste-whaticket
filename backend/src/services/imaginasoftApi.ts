import axios from 'axios';

const api = axios.create({
  baseURL: process.env.IMAGINASOFT_BASE_URL,
  auth: {
    username: process.env.IMAGINASOFT_USER || '',
    password: process.env.IMAGINASOFT_PASSWORD || ''
  }
});

// --- Appointments ---
export const getAppointments = async (params: Record<string, any> = {}) => {
  const response = await api.get('/Appointments', { params });
  return response.data;
};

export const getAppointmentById = async (appointmentId: string) => {
  const response = await api.get(`/Appointments/${appointmentId}`);
  return response.data;
};

export const createAppointment = async (appointmentData: Record<string, any>) => {
  const response = await api.post('/Appointments', appointmentData);
  return response.data;
};

export const updateAppointment = async (appointmentId: string, appointmentData: Record<string, any>) => {
  const response = await api.put(`/Appointments/${appointmentId}`, appointmentData);
  return response.data;
};

// --- Clinic ---
export const getClinics = async () => {
  const response = await api.get('/Clinic');
  return response.data;
};

export const getClinicById = async (clinicId: string) => {
  const response = await api.get(`/Clinic/${clinicId}`);
  return response.data;
};

// --- Patients ---
export const getPatients = async (params: Record<string, any> = {}) => {
  const response = await api.get('/Patients', { params });
  return response.data;
};

export const getPatientById = async (patientId: string) => {
  const response = await api.get(`/Patients/${patientId}`);
  return response.data;
};

export const createPatient = async (patientData: Record<string, any>) => {
  const response = await api.post('/Patients', patientData);
  return response.data;
};

export const updatePatient = async (patientId: string, patientData: Record<string, any>) => {
  const response = await api.put(`/Patients/${patientId}`, patientData);
  return response.data;
};
