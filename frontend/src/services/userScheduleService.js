import api from "./api";

export const listUserSchedules = async (params = {}) => {
  const { data } = await api.get("/user-schedules", { params });
  return data;
};

export const getUserSchedule = async (id) => {
  const { data } = await api.get(`/user-schedules/${id}`);
  return data;
};

export const createUserSchedule = async (scheduleData) => {
  const { data } = await api.post("/user-schedules", scheduleData);
  return data;
};

export const updateUserSchedule = async (id, scheduleData) => {
  const { data } = await api.put(`/user-schedules/${id}`, scheduleData);
  return data;
};

export const deleteUserSchedule = async (id) => {
  const { data } = await api.delete(`/user-schedules/${id}`);
  return data;
};

export const listAppointments = async (params = {}) => {
  const { data } = await api.get("/appointments", { params });
  return data;
};

export const getAppointment = async (id) => {
  const { data } = await api.get(`/appointments/${id}`);
  return data;
};

export const createAppointment = async (appointmentData) => {
  const { data } = await api.post("/appointments", appointmentData);
  return data;
};

export const updateAppointment = async (id, appointmentData) => {
  const { data } = await api.put(`/appointments/${id}`, appointmentData);
  return data;
};

export const deleteAppointment = async (id) => {
  const { data } = await api.delete(`/appointments/${id}`);
  return data;
};
