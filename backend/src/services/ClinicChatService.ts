import { getAppointments, createAppointment, getPatients, createPatient } from './imaginasoftApi';

// Função para verificar disponibilidade
export const checkAppointmentAvailability = async (medicId: string, date: string, time: string) => {
  const appointments = await getAppointments({ medicId, date, time });
  return { available: appointments.length === 0, appointments };
};

export const handleAppointmentRequest = async (patientInfo, medicId, date, time) => {
  // Primeiro, criar paciente na Imaginasoft (se ainda não existir)
  const patient = await createPatient(patientInfo);

  // Verificar disponibilidade utilizando método ajustado acima
  const availability = await checkAppointmentAvailability(medicId, date, time);

  if (availability.available) {
    // Realizar agendamento utilizando método existente createAppointment
    const appointment = await createAppointment({
      patientId: patient.id,
      medicId,
      date,
      time
    });
    return { success: true, appointment };
  } else {
    return { success: false, message: 'Horário indisponível', availability };
  }
};
